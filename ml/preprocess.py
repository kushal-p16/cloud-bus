"""
SmartBus AI - Preprocessing Pipeline
Handles feature preparation, column alignment, and transformations.
"""

import pandas as pd
import numpy as np
from typing import Tuple, List

FEATURE_COLUMNS = [
    "bus_id",
    "route_id",
    "hour",
    "day_of_week",
    "is_weekend",
    "is_peak_hour",
    "previous_passenger_count",
    "previous_stop_passenger_count",
    "bus_capacity",
    "historical_route_demand",
]

TARGET_COLUMN = "passenger_count"


def prepare_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Extracts features and target from dataset.
    """
    # Ensure all required features are present
    for col in FEATURE_COLUMNS:
        if col not in df.columns:
            raise ValueError(f"Missing required feature column: {col}")

    X = df[FEATURE_COLUMNS].copy()
    y = df[TARGET_COLUMN].copy() if TARGET_COLUMN in df.columns else None

    # Handle missing values if any
    X = X.fillna(0)

    return X, y


def chronological_split(
    df: pd.DataFrame, test_size: float = 0.2
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Splits the data chronologically to prevent temporal data leakage.
    """
    if "timestamp" in df.columns:
        df = df.sort_values(by="timestamp").reset_index(drop=True)

    split_idx = int(len(df) * (1 - test_size))
    train_df = df.iloc[:split_idx].copy()
    test_df = df.iloc[split_idx:].copy()

    return train_df, test_df
