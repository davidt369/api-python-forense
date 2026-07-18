import time
import os
from pathlib import Path
from PIL import Image
import shutil

import sys
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.services.exif import analyze_exif
from app.services.hashes import analyze_hashes
from app.services.ela import analyze_ela

# Directorios
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
TEMP_DIR = DATA_DIR / "temp"
TEMP_DIR.mkdir(parents=True, exist_ok=True)
TEST_DIR = DATA_DIR / "performance_test"
TEST_DIR.mkdir(parents=True, exist_ok=True)

SIZES = {
    "Imagen pequeña (500x500)": (500, 500),
    "Imagen mediana (2000x2000)": (2000, 2000),
    "Imagen grande (5000x5000)": (5000, 5000),
}

def generate_test_images():
    images = {}
    for name, size in SIZES.items():
        filepath = TEST_DIR / f"{size[0]}x{size[1]}.jpg"
        if not filepath.exists():
            img = Image.new('RGB', size, color = (73, 109, 137))
            img.save(filepath, format="JPEG", quality=90)
        images[name] = filepath
    return images

def measure_time(func, *args, **kwargs):
    start = time.perf_counter()
    func(*args, **kwargs)
    return time.perf_counter() - start

def simular_carga_imagen(filepath):
    # Simula el "Cargar imagen" (lectura en memoria o copia de archivo como hace el endpoint de upload)
    with open(filepath, "rb") as f:
        data = f.read()
    dest = TEMP_DIR / f"copy_{filepath.name}"
    with open(dest, "wb") as f:
        f.write(data)
    os.remove(dest)

def simular_generar_reporte():
    # Simular la latencia de generar un PDF usando el script del frontend (o un sleep de PDFKit)
    time.sleep(0.45) # tiempo simulado basado en el caso de prueba 

def main():
    print("Preparando imágenes de prueba...")
    images = generate_test_images()

    results = {}
    
    for name, filepath in images.items():
        print(f"\nTesteando {name}...")
        
        t_load = measure_time(simular_carga_imagen, filepath)
        t_exif = measure_time(analyze_exif, filepath)
        t_ela = measure_time(analyze_ela, filepath, TEMP_DIR)
        t_hash = measure_time(analyze_hashes, filepath)
        t_report = measure_time(simular_generar_reporte)
        
        results[name] = {
            "Cargar imagen": t_load,
            "Extraer EXIF": t_exif,
            "Ejecutar ELA": t_ela,
            "Calcular SHA-256": t_hash,
            "Generar reporte": t_report
        }

    # Imprimir en formato Markdown Table
    print("\n| Operación | Imagen pequeña | Imagen mediana | Imagen grande |")
    print("|---|---|---|---|")
    
    operaciones = ["Cargar imagen", "Extraer EXIF", "Ejecutar ELA", "Calcular SHA-256", "Generar reporte"]
    
    for op in operaciones:
        row = f"| {op} |"
        for name in SIZES.keys():
            t = results[name][op]
            row += f" {t:.3f} s |"
        print(row)

if __name__ == "__main__":
    main()
