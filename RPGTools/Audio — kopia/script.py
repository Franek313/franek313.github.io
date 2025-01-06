import os
from pydub import AudioSegment

# Konfiguracja
ROOT_DIR = fr"E:\franek313.github.io\RPGTools\Audio — kopia"  # Ścieżka startowa, np. "/home/user/music"
DURATION_MS = 10 * 1000  # 1 minuta w milisekundach

def trim_audio(file_path):
    try:
        # Wczytaj plik audio
        audio = AudioSegment.from_file(file_path)
        
        # Przytnij do 1 minuty
        trimmed_audio = audio[:DURATION_MS]
        
        # Nadpisz oryginalny plik
        trimmed_audio.export(file_path, format=os.path.splitext(file_path)[-1][1:])
        print(f"Przycięto: {file_path}")
    
    except Exception as e:
        print(f"Błąd podczas przetwarzania {file_path}: {e}")

def process_audio_files(root_dir):
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.lower().endswith((".mp3", ".wav")):
                file_path = os.path.join(root, file)
                trim_audio(file_path)

if __name__ == "__main__":
    process_audio_files(ROOT_DIR)
    print("\n✅ Wszystkie pliki zostały przetworzone!")
