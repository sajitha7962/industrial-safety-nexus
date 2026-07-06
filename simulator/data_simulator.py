"""
MQTT Data Simulator — publishes synthetic sensor readings at configurable intervals.
Run standalone: python data_simulator.py
"""
from __future__ import annotations
import asyncio
import json
import logging
import os
import random
import sys
import time
from datetime import datetime, timezone

import paho.mqtt.client as mqtt

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from data.synthetic.generator import (
    generate_current_sensor_reading, generate_work_permit,
    generate_shift_log, ZONES, EQUIPMENT_CATALOG
)

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT   = int(os.getenv("MQTT_PORT", "1883"))
INTERVAL    = float(os.getenv("SIM_INTERVAL", "5.0"))  # seconds between readings


def connect_mqtt() -> mqtt.Client:
    client = mqtt.Client(client_id="safety-simulator")
    retries = 0
    while retries < 10:
        try:
            client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
            client.loop_start()
            logger.info(f"Simulator connected to MQTT at {MQTT_BROKER}:{MQTT_PORT}")
            return client
        except Exception as e:
            logger.warning(f"MQTT connect failed ({e}), retry {retries+1}/10 …")
            time.sleep(5)
            retries += 1
    raise RuntimeError("Could not connect to MQTT broker")


def publish(client: mqtt.Client, topic: str, payload: dict) -> None:
    client.publish(topic, json.dumps(payload), qos=1)
    logger.debug(f"→ {topic}: {payload}")


def run_simulator():
    client = connect_mqtt()
    tick   = 0

    logger.info(f"Simulator running — interval={INTERVAL}s")

    while True:
        try:
            # ── Sensor readings ──────────────────────────────
            for zone in ZONES:
                reading = generate_current_sensor_reading(zone)
                for gas in ["gas_ch4", "gas_co", "gas_h2s"]:
                    publish(client, f"safety/sensors/gas/{zone.lower().replace(' ', '-')}", {
                        "sensor_id":   f"{gas.upper()}-{zone}",
                        "sensor_type": gas,
                        "location":    f"{zone} Sensor Array",
                        "zone":        zone,
                        "value":       reading[gas],
                        "unit":        "ppm",
                        "timestamp":   datetime.now(timezone.utc).isoformat(),
                    })
                publish(client, f"safety/sensors/temp/{zone.lower().replace(' ', '-')}", {
                    "sensor_id":   f"TEMP-{zone}",
                    "sensor_type": "temp",
                    "location":    f"{zone} Temperature",
                    "zone":        zone,
                    "value":       reading["temp"],
                    "unit":        "°C",
                    "timestamp":   datetime.now(timezone.utc).isoformat(),
                })

            # ── Equipment telemetry (every 3 ticks) ──────────
            if tick % 3 == 0:
                for eq in EQUIPMENT_CATALOG:
                    publish(client, f"safety/equipment/{eq['id'].lower()}", {
                        **eq,
                        "status":      "online",
                        "temperature": round(random.uniform(60, 75), 1),
                        "vibration":   round(random.uniform(0.5, 1.2), 3),
                        "rpm":         round(random.uniform(1400, 1500), 0),
                        "timestamp":   datetime.now(timezone.utc).isoformat(),
                    })

            # ── Shift log (every 60 ticks ≈ 5 min) ──────────
            if tick % 60 == 0:
                shift = generate_shift_log()
                publish(client, "safety/shifts/change", {
                    **shift,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })

            # ── Random permit (every 120 ticks ≈ 10 min) ────
            if tick % 120 == 0 and random.random() < 0.3:
                zone   = random.choice(ZONES[:3])
                permit = generate_work_permit(zone)
                publish(client, "safety/permits/new", {
                    **permit,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })

            tick += 1
            time.sleep(INTERVAL)

        except KeyboardInterrupt:
            break
        except Exception as e:
            logger.error(f"Simulator error: {e}")
            time.sleep(2)

    client.loop_stop()
    client.disconnect()
    logger.info("Simulator stopped.")


if __name__ == "__main__":
    run_simulator()
