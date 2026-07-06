"""
Kaggle Dataset Downloader
==========================
Attempts to download predefined datasets from Kaggle if API credentials are available.
Falls back silently - the synthetic generator will be used instead.

Required: A `kaggle.json` API credentials file placed at ~/.kaggle/kaggle.json

Predefined datasets:
  - Gas Sensor:   uciml/gas-sensor-array-under-dynamic-gas-mixtures
  - Predictive:   stephanmatzka/predictive-maintenance-dataset-ai4i-2020
"""

import os
import subprocess

DATASETS = [
    {"name": "Gas Sensor Monitoring",     "slug": "uciml/gas-sensor-array-under-dynamic-gas-mixtures"},
    {"name": "Equipment Monitoring",      "slug": "stephanmatzka/predictive-maintenance-dataset-ai4i-2020"},
]

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "raw")


def try_download():
    kaggle_credentials = os.path.expanduser("~/.kaggle/kaggle.json")

    if not os.path.exists(kaggle_credentials):
        print("Kaggle credentials not found (~/.kaggle/kaggle.json). Skipping download.")
        print("Synthetic datasets will be used instead.\n")
        return False

    print("Kaggle credentials found. Attempting to download predefined datasets...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    success_count = 0

    for ds in DATASETS:
        print(f"  Downloading: {ds['name']} ({ds['slug']})...")
        result = subprocess.run(
            ["kaggle", "datasets", "download", "-d", ds["slug"], "--unzip", "-p", OUTPUT_DIR],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            print(f"  [OK] {ds['name']} downloaded successfully.")
            success_count += 1
        else:
            print(f"  [FAILED] {ds['name']}: {result.stderr.strip()}")

    print(f"\n{success_count}/{len(DATASETS)} datasets downloaded.\n")
    return success_count > 0


if __name__ == "__main__":
    try_download()
