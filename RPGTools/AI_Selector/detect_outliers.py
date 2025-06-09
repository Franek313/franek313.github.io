import os
import numpy as np
import pandas as pd
from sklearn.metrics import mean_squared_error
import matplotlib.pyplot as plt

def detect_outliers(csv_file, mels_dir, class_name, top_n=5):
    df = pd.read_csv(csv_file)
    class_df = df[df["label"] == class_name]

    # Wczytaj wszystkie spektrogramy
    spectrograms = []
    paths = []
    for _, row in class_df.iterrows():
        path = os.path.join(mels_dir, row["npy_path"])
        mel = np.load(path)
        spectrograms.append(mel)
        paths.append((path, row["original_filename"]))

    # Zamień na tablicę: shape (N, mel_bins, time)
    spectrograms = np.stack(spectrograms)
    
    # Wylicz średni spektrogram
    mean_spec = np.mean(spectrograms, axis=0)

    # Oblicz MSE między każdym spektrogramem a średnim
    scores = []
    for i, spec in enumerate(spectrograms):
        mse = mean_squared_error(mean_spec.flatten(), spec.flatten())
        scores.append((mse, *paths[i]))

    # Posortuj po największym odchyleniu
    scores.sort(reverse=True)

    print(f"\n📛 Top {top_n} najbardziej odstających spektrogramów w klasie '{class_name}':\n")
    for i in range(top_n):
        mse, path, name = scores[i]
        print(f"{i+1}. {name} — MSE: {mse:.4f} — {path}")

    # Pokaż 3 najbardziej odstające spektrogramy
    fig, axes = plt.subplots(1, min(top_n, 3), figsize=(5*top_n, 4))
    for i in range(min(top_n, 3)):
        _, path, name = scores[i]
        mel = np.load(path)
        ax = axes[i]
        img = ax.imshow(mel, aspect='auto', origin='lower')
        ax.set_title(f"{name}\nMSE: {scores[i][0]:.2f}", fontsize=10)
        ax.axis('off')
        fig.colorbar(img, ax=ax)
    plt.tight_layout()
    plt.show()

# Przykład użycia:
detect_outliers("train.csv", "mels", class_name="Peaceful", top_n=5)
