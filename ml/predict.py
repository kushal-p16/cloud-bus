"""
SmartBus AI - ML Predictor Service
Loads trained model and serves predictions for passenger counts and occupancy levels.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional

from ml.preprocess import FEATURE_COLUMNS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "artifacts", "rf_occupancy_model.joblib")


class OccupancyPredictor:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or MODEL_PATH
        self.model = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
            except Exception as e:
                print(f"Error loading model from {self.model_path}: {e}")
                self.model = None
        else:
            print(f"Model file not found at {self.model_path}. Will train on first demand.")

    def ensure_trained(self):
        if self.model is None:
            from ml.train_model import train_and_evaluate
            train_and_evaluate(artifacts_dir=os.path.join(BASE_DIR, "artifacts"))
            self._load_model()

    def predict(
        self,
        bus_id: int,
        route_id: int,
        hour: int,
        day_of_week: int,
        bus_capacity: int,
        historical_route_demand: float = 1.2,
        previous_passenger_count: Optional[int] = None,
        previous_stop_passenger_count: Optional[int] = None,
        is_weekend: Optional[int] = None,
        is_peak_hour: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Executes prediction using the trained Random Forest model.
        """
        self.ensure_trained()

        if is_weekend is None:
            is_weekend = 1 if day_of_week in [5, 6] else 0

        if is_peak_hour is None:
            is_peak = 1 if (8 <= hour <= 10 or 17 <= hour <= 20) else 0
        else:
            is_peak = is_peak_hour

        # Default heuristic estimates for lags if not supplied
        if previous_passenger_count is None:
            previous_passenger_count = int(bus_capacity * 0.45)
        if previous_stop_passenger_count is None:
            previous_stop_passenger_count = int(bus_capacity * 0.40)

        input_data = pd.DataFrame([
            {
                "bus_id": bus_id,
                "route_id": route_id,
                "hour": hour,
                "day_of_week": day_of_week,
                "is_weekend": is_weekend,
                "is_peak_hour": is_peak,
                "previous_passenger_count": previous_passenger_count,
                "previous_stop_passenger_count": previous_stop_passenger_count,
                "bus_capacity": bus_capacity,
                "historical_route_demand": historical_route_demand,
            }
        ])

        # Enforce column order
        X = input_data[FEATURE_COLUMNS]

        # Raw prediction
        raw_pred = self.model.predict(X)[0]

        # Passenger count cannot be negative and is rounded to nearest integer
        predicted_passengers = max(0, int(round(raw_pred)))

        # Occupancy percentage: (predicted / capacity) * 100
        occupancy_percentage = round((predicted_passengers / max(1, bus_capacity)) * 100, 1)

        # Categorization as requested
        if occupancy_percentage <= 40:
            category = "LOW"
            badge_color = "green"
            crowd_level_text = "Low Crowding (Seats Available)"
        elif occupancy_percentage <= 70:
            category = "MODERATE"
            badge_color = "blue"
            crowd_level_text = "Moderate Crowding (Few Seats)"
        elif occupancy_percentage <= 90:
            category = "HIGH"
            badge_color = "orange"
            crowd_level_text = "High Crowding (Standing Room Only)"
        elif occupancy_percentage <= 100:
            category = "NEAR_FULL"
            badge_color = "red"
            crowd_level_text = "Near Full (Tight Capacity)"
        else:
            category = "OVERCROWDED"
            badge_color = "dark_red"
            crowd_level_text = "Overcrowded (Consider Alternative)"

        return {
            "predicted_passenger_count": predicted_passengers,
            "bus_capacity": bus_capacity,
            "occupancy_percentage": occupancy_percentage,
            "occupancy_category": category,
            "badge_color": badge_color,
            "crowd_level_text": crowd_level_text,
            "is_peak_hour": bool(is_peak),
            "features_used": {
                "bus_id": bus_id,
                "route_id": route_id,
                "hour": hour,
                "day_of_week": day_of_week,
                "is_weekend": is_weekend,
            },
        }


# Global singleton instance
predictor = OccupancyPredictor()
