#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
import time
from datetime import datetime, timezone

import numpy as np
from gnuradio import blocks
from gnuradio import gr
from gnuradio import uhd


class SpectrumStream(gr.top_block):
    def __init__(
        self,
        center_freq_hz: float,
        sample_rate_hz: float,
        gain_db: float,
        antenna: str,
        device_addr: str,
    ):
        gr.top_block.__init__(self, "Spectrum Stream", catch_exceptions=True)
        self.source = uhd.usrp_source(
            ",".join((device_addr, "")),
            uhd.stream_args(cpu_format="fc32", args="", channels=[0]),
        )
        self.source.set_samp_rate(float(sample_rate_hz))
        self.source.set_time_unknown_pps(uhd.time_spec(0))
        self.source.set_center_freq(float(center_freq_hz), 0)
        self.source.set_antenna(str(antenna), 0)
        try:
            self.source.set_gain(float(gain_db), 0)
        except TypeError:
            self.source.set_gain(float(gain_db))

        self.sink = blocks.vector_sink_c()
        self.connect((self.source, 0), (self.sink, 0))


def build_frame(samples: np.ndarray, center_freq_hz: float, sample_rate_hz: float, fft_size: int) -> dict:
    samples = samples[-fft_size:]
    window = np.hanning(fft_size).astype(np.float32)
    spectrum = np.fft.fftshift(np.fft.fft(samples * window, n=fft_size))
    magnitudes = np.abs(spectrum) / max(float(np.sum(window)), 1.0)
    levels_db = 20.0 * np.log10(magnitudes + 1e-12)
    freqs = center_freq_hz + np.fft.fftshift(np.fft.fftfreq(fft_size, d=1.0 / sample_rate_hz))
    return {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "center_frequency_hz": center_freq_hz,
        "span_hz": sample_rate_hz,
        "start_frequency_hz": float(freqs[0]),
        "stop_frequency_hz": float(freqs[-1]),
        "sample_rate_hz": sample_rate_hz,
        "frequencies_hz": freqs.astype(float).tolist(),
        "levels_db": levels_db.astype(float).tolist(),
        "points": fft_size,
        "source": "uhd_gnuradio_live",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Persistent UHD spectrum stream worker.")
    parser.add_argument("--freq", type=float, required=True, help="Center frequency in MHz")
    parser.add_argument("--sample-rate", type=float, default=2e6)
    parser.add_argument("--gain", type=float, default=20.0)
    parser.add_argument("--antenna", type=str, default="RX2")
    parser.add_argument("--device-addr", type=str, default="")
    parser.add_argument("--fft-size", type=int, default=4096)
    parser.add_argument("--fps", type=float, default=5.0)
    args = parser.parse_args()

    center_freq_hz = float(args.freq) * 1e6
    sample_rate_hz = float(args.sample_rate)
    fft_size = int(args.fft_size)
    interval = 1.0 / max(float(args.fps), 0.1)

    tb = SpectrumStream(
        center_freq_hz=center_freq_hz,
        sample_rate_hz=sample_rate_hz,
        gain_db=float(args.gain),
        antenna=args.antenna,
        device_addr=args.device_addr,
    )

    tb.start()
    try:
        while True:
            time.sleep(interval)
            samples = np.asarray(tb.sink.data(), dtype=np.complex64)
            if samples.size < fft_size:
                continue

            frame = build_frame(samples, center_freq_hz, sample_rate_hz, fft_size)
            print(json.dumps(frame), flush=True)

            reset = getattr(tb.sink, "reset", None)
            if callable(reset):
                reset()
    except KeyboardInterrupt:
        pass
    except Exception as exc:
        print(json.dumps({"source": "real_sdr_error", "error": str(exc)}), flush=True)
        raise
    finally:
        tb.stop()
        tb.wait()


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"spectrum_stream_worker failed: {exc}", file=sys.stderr, flush=True)
        raise
