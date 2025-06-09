import librosa
import numpy as np
import os
import pandas as pd

def save_melspectrogram(mp3_path, out_path, sr=22050, duration=30):
    y, _ = librosa.load(mp3_path, sr=sr, duration=duration)
    mel = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    mel_db = librosa.power_to_db(mel, ref=np.max)
    np.save(out_path, mel_db)

def convert_dataset_to_npy(input_dir, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    for label in os.listdir(input_dir):
        label_path = os.path.join(input_dir, label)
        if not os.path.isdir(label_path):
            continue
        out_label_dir = os.path.join(output_dir, label)
        os.makedirs(out_label_dir, exist_ok=True)

        for fname in os.listdir(label_path):
            if not fname.endswith(".mp3"):
                continue
            name = os.path.splitext(fname)[0]
            mp3_path = os.path.join(label_path, fname)
            npy_path = os.path.join(out_label_dir, name + ".npy")
            print(f"Konwertuję: {mp3_path} → {npy_path}")
            try:
                save_melspectrogram(mp3_path, npy_path)
            except Exception as e:
                print(f"❌ Błąd przy pliku {mp3_path}: {e}")

def generate_etiquettes_csv(mels_dir, output_csv):
    rows = []
    for label in sorted(os.listdir(mels_dir)):
        class_dir = os.path.join(mels_dir, label)
        if not os.path.isdir(class_dir):
            continue
        for fname in os.listdir(class_dir):
            if not fname.endswith(".npy"):
                continue
            base_name = os.path.splitext(fname)[0]
            row = {
                "npy_path": f"{label}/{fname}",
                "label": label,
                "original_filename": base_name + ".mp3"
            }
            rows.append(row)

    df = pd.DataFrame(rows)
    df.to_csv(output_csv, index=False)
    print(f"✔️ Zapisano {len(df)} wierszy do {output_csv}")


convert_dataset_to_npy("dataset", "mels")
generate_etiquettes_csv("mels", "etiquettes.csv")