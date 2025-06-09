import torch
from torch.utils.data import DataLoader
from torch.optim import Adam
from model import AudioClassifier
from audio_dataset import AudioDataset

# Dataset i DataLoader
train_dataset = AudioDataset("train.csv", "mels")
val_dataset = AudioDataset("val.csv", "mels", label_list=train_dataset.labels)

train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=16)

# Model
input_shape = (1, 128, 1024)
model = AudioClassifier(input_shape=input_shape, num_classes=len(train_dataset.labels))
optimizer = Adam(model.parameters(), lr=0.001)
criterion = torch.nn.CrossEntropyLoss()

# Trening
for epoch in range(15):
    model.train()
    for xb, yb in train_loader:
        optimizer.zero_grad()
        pred = model(xb)
        loss = criterion(pred, yb)
        loss.backward()
        optimizer.step()

    # Walidacja
    model.eval()
    correct, total = 0, 0
    with torch.no_grad():
        for xb, yb in val_loader:
            pred = model(xb)
            correct += (pred.argmax(1) == yb).sum().item()
            total += yb.size(0)

    acc = correct / total
    print(f"📘 Epoch {epoch+1} - Val Accuracy: {acc:.2%}")

    torch.save(model.state_dict(), "model.pth")

