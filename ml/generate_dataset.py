"""
SmartBus AI - Dataset Generator
Generates realistic synthetic passenger occupancy data for Mysuru City Transit.
Features realistic morning/evening peaks, weekend shifts, and route variations.
"""

import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Seed for reproducibility
np.random.seed(42)
random.seed(42)

# Mysuru Sample Routes
ROUTES = [
    {"id": 101, "name": "City Bus Stand to Infosys Mysuru (Hebbal)", "base_demand": 1.4, "commuter_route": True},
    {"id": 102, "name": "Suburban Bus Stand to Chamundi Hill", "base_demand": 1.2, "tourist_route": True},
    {"id": 103, "name": "Vijayanagar to Kuvempunagar", "base_demand": 1.1, "commuter_route": True},
    {"id": 104, "name": "Hebbal Industrial Area to Mysuru Palace", "base_demand": 1.3, "commuter_route": True},
    {"id": 105, "name": "University of Mysore to City Bus Stand", "base_demand": 1.2, "student_route": True},
    {"id": 106, "name": "Jayalakshmipuram to Suburban Bus Stand", "base_demand": 0.95, "residential_route": True},
    {"id": 107, "name": "Chamundi Hill to Vijayanagar", "base_demand": 1.0, "tourist_route": True},
    {"id": 108, "name": "Infosys Mysuru to Kuvempunagar", "base_demand": 1.25, "commuter_route": True},
    {"id": 109, "name": "Hebbal to University of Mysore", "base_demand": 1.05, "student_route": True},
    {"id": 110, "name": "City Bus Stand to Suburban Bus Stand (Express)", "base_demand": 1.5, "intercity_hub": True},
]

BUS_FLEET = [
    {"bus_id": 1, "bus_number": "KA-09-F-1201", "capacity": 50},
    {"bus_id": 2, "bus_number": "KA-09-F-1202", "capacity": 50},
    {"bus_id": 3, "bus_number": "KA-09-F-1203", "capacity": 60},
    {"bus_id": 4, "bus_number": "KA-09-F-1204", "capacity": 40},
    {"bus_id": 5, "bus_number": "KA-09-F-1205", "capacity": 50},
    {"bus_id": 6, "bus_number": "KA-09-F-1206", "capacity": 30},
    {"bus_id": 7, "bus_number": "KA-09-F-1207", "capacity": 60},
    {"bus_id": 8, "bus_number": "KA-09-F-1208", "capacity": 50},
    {"bus_id": 9, "bus_number": "KA-09-F-1209", "capacity": 70},
    {"bus_id": 10, "bus_number": "KA-09-F-1210", "capacity": 50},
    {"bus_id": 11, "bus_number": "KA-09-F-1211", "capacity": 40},
    {"bus_id": 12, "bus_number": "KA-09-F-1212", "capacity": 50},
    {"bus_id": 13, "bus_number": "KA-09-F-1213", "capacity": 60},
    {"bus_id": 14, "bus_number": "KA-09-F-1214", "capacity": 30},
    {"bus_id": 15, "bus_number": "KA-09-F-1215", "capacity": 50},
    {"bus_id": 16, "bus_number": "KA-09-F-1216", "capacity": 70},
    {"bus_id": 17, "bus_number": "KA-09-F-1217", "capacity": 40},
    {"bus_id": 18, "bus_number": "KA-09-F-1218", "capacity": 50},
    {"bus_id": 19, "bus_number": "KA-09-F-1219", "capacity": 60},
    {"bus_id": 20, "bus_number": "KA-09-F-1220", "capacity": 50},
]


def generate_occupancy_dataset(days: int = 60, output_path: str = "ml/artifacts/occupancy_data.csv") -> pd.DataFrame:
    """
    Generates realistic synthetic passenger occupancy data.
    """
    records = []
    start_date = datetime.now() - timedelta(days=days)

    # Route demand lookup
    route_map = {r["id"]: r for r in ROUTES}

    for day_offset in range(days):
        current_date = start_date + timedelta(days=day_offset)
        day_of_week = current_date.weekday()  # 0=Monday, 6=Sunday
        is_weekend = 1 if day_of_week in [5, 6] else 0

        # Hourly simulation from 6 AM to 10 PM
        for hour in range(6, 23):
            # Check peak hour
            # Morning peak: 8:00 - 10:30 (hours 8, 9, 10)
            # Evening peak: 17:00 - 20:30 (hours 17, 18, 19, 20)
            is_morning_peak = 1 if (8 <= hour <= 10) else 0
            is_evening_peak = 1 if (17 <= hour <= 20) else 0
            is_peak_hour = 1 if (is_morning_peak or is_evening_peak) else 0

            # Iterate through assigned buses
            for bus in BUS_FLEET:
                # Assign bus to a route cyclically
                route_id = ROUTES[(bus["bus_id"] + day_offset) % len(ROUTES)]["id"]
                route_info = route_map[route_id]
                capacity = bus["capacity"]
                base_demand = route_info["base_demand"]

                # Base multiplier based on time and route type
                if is_weekend:
                    if route_info.get("tourist_route"):
                        # Tourist routes peak on weekends between 10 AM - 5 PM
                        time_factor = 1.35 if (10 <= hour <= 17) else 0.8
                    else:
                        time_factor = 0.65 if (11 <= hour <= 18) else 0.45
                else:
                    if is_morning_peak:
                        time_factor = 1.45 if route_info.get("commuter_route") else 1.2
                    elif is_evening_peak:
                        time_factor = 1.55 if route_info.get("commuter_route") else 1.15
                    elif 12 <= hour <= 15:
                        time_factor = 0.85
                    else:
                        time_factor = 0.55

                # Calculate expected occupancy ratio (mean between 0.2 and 1.15)
                expected_ratio = base_demand * 0.52 * time_factor
                # Add natural noise
                noise = np.random.normal(0, 0.08)
                ratio = max(0.05, expected_ratio + noise)

                # Actual passenger count
                passenger_count = int(round(capacity * ratio))
                # Capacity occasional surge (standing passengers up to 125% of capacity)
                passenger_count = max(2, min(passenger_count, int(capacity * 1.3)))

                # Simulate lagged features (previous stop passenger count & previous hour count)
                lag_noise = np.random.normal(0, 4)
                prev_passenger_count = max(0, int(passenger_count * 0.92 + lag_noise))
                prev_stop_count = max(0, int(passenger_count * 0.85 + np.random.normal(0, 3)))

                # Occupancy calculations
                occupancy_percentage = round((passenger_count / capacity) * 100, 2)

                if occupancy_percentage <= 40:
                    category = "LOW"
                elif occupancy_percentage <= 70:
                    category = "MODERATE"
                elif occupancy_percentage <= 90:
                    category = "HIGH"
                elif occupancy_percentage <= 100:
                    category = "NEAR_FULL"
                else:
                    category = "OVERCROWDED"

                timestamp = current_date.replace(hour=hour, minute=random.randint(0, 59), second=0)

                records.append({
                    "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                    "bus_id": bus["bus_id"],
                    "bus_number": bus["bus_number"],
                    "route_id": route_id,
                    "hour": hour,
                    "day_of_week": day_of_week,
                    "is_weekend": is_weekend,
                    "is_peak_hour": is_peak_hour,
                    "previous_passenger_count": prev_passenger_count,
                    "previous_stop_passenger_count": prev_stop_count,
                    "bus_capacity": capacity,
                    "historical_route_demand": base_demand,
                    "passenger_count": passenger_count,
                    "occupancy_percentage": occupancy_percentage,
                    "occupancy_category": category,
                })

    df = pd.DataFrame(records)
    # Sort chronologically for safe split
    df = df.sort_values(by="timestamp").reset_index(drop=True)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} records across {days} days saved to {output_path}")
    return df


if __name__ == "__main__":
    generate_occupancy_dataset(days=60)
