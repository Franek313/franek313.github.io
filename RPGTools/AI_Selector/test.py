import torch
from torch.utils.data import DataLoader
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

from model import AudioClassifier
from audio_dataset import AudioDataset

# ======= PARAMETRY =======
model_path = "model.pth"
test_csv = "test.csv"
mels_dir = "mels"
fixed_length = 1024
batch_size = 16
num_classes = 8  # ustaw zgodnie z liczbą klas

# ======= DANE TESTOWE =======
# Wczytaj dataset z tą samą kolejnością etykiet jak przy treningu
train_dataset = AudioDataset("train.csv", mels_dir, fixed_length=fixed_length)
test_dataset = AudioDataset(test_csv, mels_dir, label_list=train_dataset.labels, fixed_length=fixed_length)
test_loader = DataLoader(test_dataset, batch_size=batch_size)

# ======= WCZYTAJ MODEL =======
input_shape = (1, 128, 1024)
model = AudioClassifier(input_shape=input_shape, num_classes=num_classes)
model.load_state_dict(torch.load(model_path))
model.eval()

# ======= TESTOWANIE =======
all_preds = []
all_labels = []

with torch.no_grad():
    for xb, yb in test_loader:
        preds = model(xb)
        pred_labels = preds.argmax(dim=1)
        all_preds.extend(pred_labels.tolist())
        all_labels.extend(yb.tolist())

# ======= RAPORT =======
acc = accuracy_score(all_labels, all_preds)
print(f"\n🎯 Test accuracy: {acc:.2%}\n")

print("📊 Classification report:")
print(classification_report(all_labels, all_preds, target_names=test_dataset.labels))

print("🧩 Confusion matrix:")
print(confusion_matrix(all_labels, all_preds))
