import torch
import librosa
import numpy as np
import os
from model import AudioClassifier

# ====== PARAMETRY ======
model_path = "model.pth"
mels_dir = "mels"
input_shape = (1, 128, 1024)
num_classes = 5
labels = ['Action', 'Fear', 'Mysterious', 'Mystic', 'Peaceful']

# ====== PRZETWARZANIE MP3 ======
def mp3_to_mel_tensor(mp3_path, sr=22050, n_mels=128, fixed_length=1024):
    y, _ = librosa.load(mp3_path, sr=sr, duration=30)
    mel = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=n_mels)
    mel_db = librosa.power_to_db(mel, ref=np.max)

    # Przycinanie/padding do fixed_length
    if mel_db.shape[1] > fixed_length:
        mel_db = mel_db[:, :fixed_length]
    elif mel_db.shape[1] < fixed_length:
        pad_width = fixed_length - mel_db.shape[1]
        mel_db = np.pad(mel_db, ((0, 0), (0, pad_width)), mode='constant')

    mel_tensor = torch.tensor(mel_db, dtype=torch.float32).unsqueeze(0).unsqueeze(0)  # (1, 1, 128, 1024)
    return mel_tensor

# ====== KLASA MODEL ======
def load_model():
    model = AudioClassifier(input_shape=input_shape, num_classes=num_classes)
    model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
    model.eval()
    return model

# ====== KLASA MAIN ======
def classify_mp3(mp3_path):
    model = load_model()
    mel_tensor = mp3_to_mel_tensor(mp3_path)
    with torch.no_grad():
        output = model(mel_tensor)
        pred_idx = output.argmax(dim=1).item()
        return labels[pred_idx]

# ====== URUCHOMIENIE ======
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Klasyfikuj plik MP3 według stylu brzmienia")
    parser.add_argument("mp3_path", type=str, help="Ścieżka do pliku MP3")
    args = parser.parse_args()

    if not os.path.isfile(args.mp3_path):
        print("❌ Plik nie istnieje!")
        exit(1)

    label = classify_mp3(args.mp3_path)
    print(f"🎵 Utwór sklasyfikowany jako: {label}")
