import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

def preview_spectrograms(csv_file, mels_dir, num_classes=5):
    df = pd.read_csv(csv_file)
    labels = sorted(df["label"].unique())

    fig, axes = plt.subplots(1, num_classes, figsize=(4*num_classes, 4))

    for i, label in enumerate(labels):
        # losowy przykład z danej klasy
        sample = df[df["label"] == label].sample(1).iloc[0]
        npy_path = os.path.join(mels_dir, sample["npy_path"])
        mel = np.load(npy_path)

        ax = axes[i]
        img = ax.imshow(mel, aspect='auto', origin='lower')
        ax.set_title(label)
        ax.axis('off')
        fig.colorbar(img, ax=ax)

    plt.tight_layout()
    plt.show()

# Użycie:
preview_spectrograms("train.csv", "mels", num_classes=5)
