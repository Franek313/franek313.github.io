import os
import json

def generate_json(folder_path):
    result = {}
    for item in os.listdir(folder_path):
        item_path = os.path.join(folder_path, item)
        if os.path.isdir(item_path):
            result[item] = [i.split(os.sep)[-1] for i in os.listdir(item_path)]
        else:
            result[item] = "file"
    return result

folder_path = 'Audio'
json_data = generate_json(folder_path)

output_path = 'folder_structure.json'
with open(output_path, 'w') as f:
    json.dump(json_data, f, indent=4)

print(f"Struktura plików i folderów katalogu '{folder_path}' została zapisana w pliku '{output_path}'.")
