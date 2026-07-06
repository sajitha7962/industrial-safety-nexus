"""
Synthetic industrial data generator.
Produces realistic time-series data mimicking industrial environments
with normal baselines, correlated anomalies, and scripted hazard scenarios.
"""
from __future__ import annotations
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any


# ─── ZONES ───────────────────────────────────────────────────
ZONES = ["Zone-A", "Zone-B", "Zone-C", "Zone-D", "Control-Room"]

ZONE_BASELINE = {
    "Zone-A": {"ch4": 5.0,  "co": 8.0,  "h2s": 1.0, "temp": 28.0},
    "Zone-B": {"ch4": 8.0,  "co": 12.0, "h2s": 2.0, "temp": 31.0},
    "Zone-C": {"ch4": 3.0,  "co": 6.0,  "h2s": 0.5, "temp": 25.0},
    "Zone-D": {"ch4": 12.0, "co": 15.0, "h2s": 3.0, "temp": 35.0},
    "Control-Room": {"ch4": 1.0, "co": 3.0, "h2s": 0.2, "temp": 22.0},
}

SUPERVISORS  = ["Ahmed Al-Rashid", "Carlos Mendes", "Priya Nair", "James O'Brien"]
PERMIT_TYPES = ["hot_work", "confined_space", "electrical", "excavation"]
SHIFT_TYPES  = ["morning", "afternoon", "night"]

SHIFT_SCHEDULE = {
    "morning":   (6,  14),
    "afternoon": (14, 22),
    "night":     (22, 6),
}

EQUIPMENT_CATALOG = [
    {"id": "PUMP-01",    "name": "Feed Pump A",        "type": "pump",    "zone": "Zone-A"},
    {"id": "PUMP-02",    "name": "Feed Pump B",        "type": "pump",    "zone": "Zone-B"},
    {"id": "COMP-01",    "name": "Air Compressor",     "type": "compressor", "zone": "Zone-B"},
    {"id": "FAN-01",     "name": "Exhaust Fan Zone-D", "type": "fan",     "zone": "Zone-D"},
    {"id": "HEAT-01",    "name": "Heat Exchanger A",   "type": "heat_exchanger", "zone": "Zone-C"},
    {"id": "VALVE-01",   "name": "Safety Valve SV-01", "type": "valve",   "zone": "Zone-D"},
]


def _add_noise(value: float, noise_pct: float = 0.05) -> float:
    return max(0.0, value * (1.0 + random.gauss(0, noise_pct)))


def generate_sensor_history(hours: int = 72, interval_minutes: int = 5) -> pd.DataFrame:
    """Generate sensor time-series for anomaly model training."""
    records = []
    now = datetime.utcnow()
    start = now - timedelta(hours=hours)
    ts = start

    while ts <= now:
        hour = ts.hour
        # Time-of-day multiplier: higher readings during peak shift
        tod_factor = 1.3 if 8 <= hour <= 18 else 1.0

        for zone, baselines in ZONE_BASELINE.items():
            for gas in ["ch4", "co", "h2s"]:
                val = _add_noise(baselines[gas] * tod_factor)
                records.append({
                    "timestamp": ts,
                    "zone": zone,
                    "sensor_type": f"gas_{gas}",
                    "value": round(val, 2),
                    "unit": "ppm",
                })
            # Temperature
            temp = _add_noise(baselines["temp"] * tod_factor)
            records.append({
                "timestamp": ts,
                "zone": zone,
                "sensor_type": "temp",
                "value": round(temp, 1),
                "unit": "°C",
            })
        ts += timedelta(minutes=interval_minutes)

    return pd.DataFrame(records)


def generate_equipment_history(hours: int = 72) -> pd.DataFrame:
    """Generate equipment telemetry history."""
    records = []
    now = datetime.utcnow()
    start = now - timedelta(hours=hours)
    ts = start

    while ts <= now:
        for eq in EQUIPMENT_CATALOG:
            records.append({
                "timestamp":    ts,
                "equipment_id": eq["id"],
                "name":         eq["name"],
                "type":         eq["type"],
                "zone":         eq["zone"],
                "status":       "online",
                "temperature":  round(_add_noise(65.0), 1),
                "vibration":    round(_add_noise(0.8), 3),
                "rpm":          round(_add_noise(1450.0), 0),
            })
        ts += timedelta(minutes=10)

    return pd.DataFrame(records)


def generate_current_sensor_reading(zone: str, scenario: str = "normal") -> Dict[str, Any]:
    """Generate a single sensor reading snapshot for a zone."""
    baselines = ZONE_BASELINE.get(zone, ZONE_BASELINE["Zone-A"])
    multiplier = {
        "normal":   1.0,
        "elevated": 2.5,
        "critical": 5.0,
    }.get(scenario, 1.0)

    return {
        "zone": zone,
        "gas_ch4":  round(_add_noise(baselines["ch4"]  * multiplier), 2),
        "gas_co":   round(_add_noise(baselines["co"]   * multiplier), 2),
        "gas_h2s":  round(_add_noise(baselines["h2s"]  * multiplier), 2),
        "temp":     round(_add_noise(baselines["temp"] * (1 + 0.3 * (multiplier - 1))), 1),
        "humidity": round(random.uniform(40, 75), 1),
    }


def generate_work_permit(zone: str, permit_type: str = None) -> Dict[str, Any]:
    """Generate a realistic work permit."""
    ptype = permit_type or random.choice(PERMIT_TYPES)
    now   = datetime.utcnow()
    return {
        "permit_type":  ptype,
        "location":     f"{zone} Sub-station {random.randint(1,4)}",
        "zone":         zone,
        "issued_by":    random.choice(SUPERVISORS),
        "worker_names": [f"Worker-{random.randint(100, 999)}" for _ in range(random.randint(1, 4))],
        "expires_at":   (now + timedelta(hours=random.randint(2, 8))).isoformat(),
        "notes":        f"Routine {ptype.replace('_', ' ')} maintenance",
    }


def generate_shift_log() -> Dict[str, Any]:
    """Generate a current shift log entry."""
    now  = datetime.utcnow()
    hour = now.hour
    if 6 <= hour < 14:
        shift = "morning"
    elif 14 <= hour < 22:
        shift = "afternoon"
    else:
        shift = "night"
    s, e = SHIFT_SCHEDULE[shift]
    start = now.replace(hour=s, minute=0, second=0, microsecond=0)
    return {
        "shift_type":   shift,
        "supervisor":   random.choice(SUPERVISORS),
        "worker_count": random.randint(12, 45),
        "zones_active": random.sample(ZONES, k=random.randint(2, 4)),
        "start_time":   start.isoformat(),
    }


# ─── SCRIPTED DEMO SCENARIOS ─────────────────────────────────

DEMO_STEPS = [
    {
        "step": 1,
        "label": "Normal operations",
        "zone":  "Zone-D",
        "gas_ch4": 12.0, "gas_co": 15.0, "gas_h2s": 3.0,
        "equipment_status": "online",
        "permit_type": None,
        "fan_on": True,
        "description": "All systems nominal. Baseline readings within safe limits.",
    },
    {
        "step": 2,
        "label": "CH4 begins to rise",
        "zone":  "Zone-D",
        "gas_ch4": 22.0, "gas_co": 18.0, "gas_h2s": 4.5,
        "equipment_status": "online",
        "permit_type": None,
        "fan_on": True,
        "description": "Gas sensors detect rising CH4 concentration in Zone-D.",
    },
    {
        "step": 3,
        "label": "Hot-work permit issued",
        "zone":  "Zone-D",
        "gas_ch4": 26.0, "gas_co": 22.0, "gas_h2s": 5.0,
        "equipment_status": "online",
        "permit_type": "hot_work",
        "fan_on": True,
        "description": "Hot-work permit issued for Zone-D despite rising gas levels — RULE: GAS_HOT_WORK triggered.",
    },
    {
        "step": 4,
        "label": "Exhaust fan shuts off",
        "zone":  "Zone-D",
        "gas_ch4": 30.0, "gas_co": 28.0, "gas_h2s": 6.0,
        "equipment_status": "fault",
        "permit_type": "hot_work",
        "fan_on": False,
        "description": "FAN-01 reports fault. Ventilation lost. Gas accumulating — RULE: GAS_FAN_OFF triggered.",
    },
    {
        "step": 5,
        "label": "Shift change during hazard",
        "zone":  "Zone-D",
        "gas_ch4": 35.0, "gas_co": 32.0, "gas_h2s": 7.5,
        "equipment_status": "fault",
        "permit_type": "hot_work",
        "fan_on": False,
        "description": "Shift handover occurs mid-incident. New team enters Zone-D without briefing — RULE: SHIFT_FAULT_GAS triggered.",
    },
    {
        "step": 6,
        "label": "PPE violation detected",
        "zone":  "Zone-D",
        "gas_ch4": 38.0, "gas_co": 35.0, "gas_h2s": 8.0,
        "equipment_status": "fault",
        "permit_type": "hot_work",
        "fan_on": False,
        "description": "CCTV detects worker without hardhat in Zone-D — RULE: PPE_ZONE triggered.",
    },
    {
        "step": 7,
        "label": "CRITICAL - compound hazard",
        "zone":  "Zone-D",
        "gas_ch4": 45.0, "gas_co": 50.0, "gas_h2s": 10.0,
        "equipment_status": "fault",
        "permit_type": "hot_work",
        "fan_on": False,
        "description": "CO exceeds 50 ppm threshold. Multiple rules active simultaneously. Risk score matches CRITICAL.",
    },
    {
        "step": 8,
        "label": "Auto incident report generated",
        "zone":  "Zone-D",
        "gas_ch4": 45.0, "gas_co": 50.0, "gas_h2s": 10.0,
        "equipment_status": "fault",
        "permit_type": "hot_work",
        "fan_on": False,
        "description": "LLM generates incident report with root-cause analysis and recommended actions.",
    },
    {
        "step": 9,
        "label": "Alert acknowledged - remediation",
        "zone":  "Zone-D",
        "gas_ch4": 18.0, "gas_co": 20.0, "gas_h2s": 3.5,
        "equipment_status": "maintenance",
        "permit_type": None,
        "fan_on": True,
        "description": "Permit revoked, fan restored, workers evacuated. Risk score normalizing.",
    },
]
