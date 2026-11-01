"""
SmartBus AI - Model Training Pipeline
Trains a Random Forest Regressor to predict bus passenger count.
Saves model artifacts, metrics (MAE, RMSE, R²), and feature importances.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from ml.generate_dataset import generate_occupancy_dataset
from ml.preprocess import prepare_features, chronological_split, FEATURE_COLUMNS


def train_and_evaluate(
    data_path: str = "ml/artifacts/occupancy_data.csv",
    artifacts_dir: str = "ml/artifacts",
) -> dict:
    os.makedirs(artifacts_dir, exist_ok=True)

    # 1. Load or generate data
    if not os.path.exists(data_path):
        print(f"Data not found at {data_path}. Generating dataset...")
        df = generate_occupancy_dataset(days=60, output_path=data_path)
    else:
        print(f"Loading dataset from {data_path}...")
        df = pd.read_csv(data_path)

    # 2. Chronological Split (prevents future leakage)
    train_df, test_df = chronological_split(df, test_size=0.2)
    print(f"Train samples: {len(train_df)}, Test samples: {len(test_df)}")

    X_train, y_train = prepare_features(train_df)
    X_test, y_test = prepare_features(test_df)

    # 3. Train Random Forest Model
    print("Training Random Forest Regressor...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=16,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # 4. Predict & Evaluate
    y_pred = model.predict(X_test)
    # Ensure passenger count cannot be negative
    y_pred = np.maximum(0, y_pred)

    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))

    # Feature Importances
    importances = model.feature_importances_
    feature_importance_list = [
        {"feature": feature, "importance": round(float(imp), 4)}
        for feature, imp in sorted(
            zip(FEATURE_COLUMNS, importances), key=lambda x: x[1], reverse=True
        )
    ]

    print("\n--- Model Evaluation Results ---")
    print(f"Mean Absolute Error (MAE): {mae:.2f} passengers")
    print(f"Root Mean Squared Error (RMSE): {rmse:.2f} passengers")
    print(f"R² Score: {r2:.4f}")
    print("\nTop 5 Feature Importances:")
    for f in feature_importance_list[:5]:
        print(f"  {f['feature']}: {f['importance']}")

    # 5. Save Artifacts
    model_path = os.path.join(artifacts_dir, "rf_occupancy_model.joblib")
    joblib.dump(model, model_path)
    print(f"\nTrained model saved to {model_path}")

    metrics = {
        "model_name": "Random Forest Regressor",
        "algorithm": "RandomForestRegressor(n_estimators=100, max_depth=16)",
        "trained_at": datetime.now().isoformat(),
        "train_samples": len(train_df),
        "test_samples": len(test_df),
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "r2_score": round(r2, 4),
        "feature_importances": feature_importance_list,
        "features": FEATURE_COLUMNS,
    }

    metrics_path = os.path.join(artifacts_dir, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Metrics saved to {metrics_path}")

    # 6. Save a sample of actual vs predicted for evaluation/visualizations
    test_sample = test_df.tail(100).copy()
    test_sample["predicted_passenger_count"] = np.round(
        model.predict(test_sample[FEATURE_COLUMNS])
    ).astype(int)
    test_sample["predicted_passenger_count"] = test_sample["predicted_passenger_count"].clip(lower=0)
    test_sample["predicted_occupancy_percentage"] = np.round(
        (test_sample["predicted_passenger_count"] / test_sample["bus_capacity"]) * 100, 1
    )

    sample_path = os.path.join(artifacts_dir, "test_predictions_sample.json")
    test_sample.to_json(sample_path, orient="records", date_format="iso")
    print(f"Sample test predictions saved to {sample_path}")

    return metrics


if __name__ == "__main__":
    train_and_evaluate()
