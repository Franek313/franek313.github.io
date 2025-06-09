import torch
from torch.utils.data import Dataset
import pandas as pd
import numpy as np
import os

class AudioDataset(Dataset):
    def __init__(self, csv_file, mels_dir, label_list=None, fixed_length=1024):
        self.data = pd.read_csv(csv_file)
        self.mels_dir = mels_dir
        self.fixed_length = fixed_length

        if label_list is None:
            self.labels = sorted(self.data["label"].unique())
        else:
            self.labels = label_list

        self.label_to_index = {label: idx for idx, label in enumerate(self.labels)}

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        row = self.data.iloc[idx]
        mel_path = os.path.join(self.mels_dir, row["npy_path"])
        mel = np.load(mel_path)  # (mel_bins, time)
        
        # Przycinanie / padding
        if mel.shape[1] > self.fixed_length:
            mel = mel[:, :self.fixed_length]
        elif mel.shape[1] < self.fixed_length:
            pad_width = self.fixed_length - mel.shape[1]
            mel = np.pad(mel, ((0, 0), (0, pad_width)), mode='constant')

        mel_tensor = torch.tensor(mel, dtype=torch.float32).unsqueeze(0)
        label_tensor = torch.tensor(self.label_to_index[row["label"]], dtype=torch.long)
        return mel_tensor, label_tensor