import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

def show_class_examples(csv_file, mels_dir, class_name, max_examples=16):
    df = pd.read_csv(csv_file)
    class_df = df[df["label"] == class_name]

    fig_cols = 4
    fig_rows = (min(len(class_df), max_examples) + fig_cols - 1) // fig_cols

    fig, axes = plt.subplots(fig_rows, fig_cols, figsize=(fig_cols * 4, fig_rows * 3))
    axes = axes.flatten()

    for i, (_, row) in enumerate(class_df.sample(n=min(max_examples, len(class_df))).iterrows()):
        mel_path = os.path.join(mels_dir, row["npy_path"])
        mel = np.load(mel_path)

        ax = axes[i]
        img = ax.imshow(mel, aspect='auto', origin='lower')
        ax.set_title(row["original_filename"], fontsize=8)
        ax.axis('off')

    for j in range(i+1, len(axes)):
        axes[j].axis('off')

    plt.suptitle(f"Przykłady z klasy: {class_name}", fontsize=16)
    plt.tight_layout()
    plt.show()

# Użycie:
show_class_examples("train.csv", "mels", class_name="Mystic")
