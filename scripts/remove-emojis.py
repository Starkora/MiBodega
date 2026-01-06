import os
import re

# Patrón regex para emojis
emoji_pattern = re.compile(
    "["
    "\U0001F1E0-\U0001F1FF"  # flags (iOS)
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F680-\U0001F6FF"  # transport & map symbols
    "\U0001F700-\U0001F77F"  # alchemical symbols
    "\U0001F780-\U0001F7FF"  # Geometric Shapes Extended
    "\U0001F800-\U0001F8FF"  # Supplemental Arrows-C
    "\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
    "\U0001FA00-\U0001FA6F"  # Chess Symbols
    "\U0001FA70-\U0001FAFF"  # Symbols and Pictographs Extended-A
    "\U00002702-\U000027B0"  # Dingbats
    "\U000024C2-\U0001F251" 
    "]+",
    flags=re.UNICODE
)

def remove_emojis_from_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = emoji_pattern.sub('', content)
        
        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✓ Emojis eliminados de: {os.path.basename(filepath)}")
            return True
        return False
    except Exception as e:
        print(f"✗ Error en {filepath}: {e}")
        return False

def main():
    # Archivos .md en la raíz del proyecto
    md_files = [
        'README.md',
        'TIDB_SETUP.md',
        'PANTALLA_CLIENTE.md',
        'SISTEMA_PEDIDOS.md',
        'INICIO_RAPIDO.md',
        'DATABASE.md',
        'CLOUDINARY_SETUP.md'
    ]
    
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    print("Eliminando emojis de archivos markdown...")
    print("=" * 50)
    
    count = 0
    for filename in md_files:
        filepath = os.path.join(base_path, filename)
        if os.path.exists(filepath):
            if remove_emojis_from_file(filepath):
                count += 1
    
    print("=" * 50)
    print(f"Proceso completado. {count} archivos modificados.")

if __name__ == "__main__":
    main()
