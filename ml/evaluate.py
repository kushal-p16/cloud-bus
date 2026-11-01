"""
SmartBus AI - ML Model Evaluation
Generates detailed metrics, error distribution, and subgroup evaluation (peak vs off-peak).
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from ml.preprocess import prepare_features, FEATURE_COLUMNS


def evaluate_saved_model(
    model_path: str = "ml/artifacts/rf_occupancy_model.joblib",
    data_path: str = "ml/artifacts/occupancy_data.csv",
    output_report_path: str = "ml/artifacts/evaluation_report.json",
):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model artifact not found at {model_path}. Train the model first.")
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}.")

    model = joblib.load(model_path)
    df = pd.read_csv(data_path)

    # Use test partition (last 20%)
    split_idx = int(len(df) * 0.8)
    test_df = df.iloc[split_idx:].copy()

    X_test, y_test = prepare_features(test_df)
    y_pred = model.predict(X_test)
    y_pred = np.maximum(0, y_pred)

    overall_mae = mean_absolute_error(y_test, y_pred)
    overall_rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    overall_r2 = r2_score(y_test, y_pred)

    # Subgroup: Peak vs Non-Peak
    peak_mask = test_df["is_peak_hour"] == 1
    peak_mae = mean_absolute_error(y_test[peak_mask], y_pred[peak_mask])
    non_peak_mae = mean_absolute_error(y_test[~peak_mask], y_pred[~peak_mask])

    # Route-wise MAE
    route_metrics = []
    for route_id, group in test_df.groupby("route_id"):
        indices = group.index - split_idx
        r_actual = y_test.iloc[indices]
        r_pred = y_pred[indices]
        route_metrics.append({
            "route_id": int(route_id),
            "sample_count": len(group),
            "mae": round(float(mean_absolute_error(r_actual, r_pred)), 2),
            "r2_score": round(float(r2_score(r_actual, r_pred)), 4),
        })

    report = {
        "model": "RandomForestRegressor",
        "dataset_size": len(df),
        "test_size": len(test_df),
        "metrics": {
            "overall_mae": round(float(overall_mae), 2),
            "overall_rmse": round(float(overall_rmse), 2),
            "overall_r2": round(float(overall_r2), 4),
            "peak_hour_mae": round(float(peak_mae), 2),
            "off_peak_mae": round(float(non_peak_mae), 2),
        },
        "route_breakdown": route_metrics,
    }

    with open(output_report_path, "w") as f:
        json.dump(report, f, indent=2)

    print("Evaluation completed successfully.")
    print(json.dumps(report["metrics"], indent=2))
    return report


if __name__ == "__main__":
    evaluate_saved_model()
