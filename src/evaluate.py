
import json
import os
import joblib
import matplotlib.pyplot as plt

from sklearn.metrics import ConfusionMatrixDisplay


def main():
    with open("reports/metrics.json", "r") as f:
        results = json.load(f)

    print("Selected model:", results["selected_model"])
    print("\nValidation results:")

    for name, metrics in results["validation"].items():
        print(f"\n{name}")
        for metric, value in metrics.items():
            print(f"{metric}: {value}")

    print("\nFinal test metrics:")
    for metric, value in results["test"].items():
        print(f"{metric}: {value}")

    artifact = joblib.load("models/best_model.pkl")
    print("\nSaved model:", artifact["model_name"])
    print("Features:", artifact["features"])


if __name__ == "__main__":
    main()

