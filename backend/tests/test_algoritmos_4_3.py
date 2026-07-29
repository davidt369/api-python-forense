import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import json
import shutil

# Agregar ruta para importar los servicios
import sys
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.services.ela import analyze_ela
from app.services.hashes import analyze_hashes
from app.services.exif import analyze_exif

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
TEST_DIR = DATA_DIR / "algoritmos_test"
TEST_DIR.mkdir(parents=True, exist_ok=True)

def generate_test_images():
    # 1. Imagen Original (Auténtica)
    original_path = TEST_DIR / "original.jpg"
    img = Image.new('RGB', (800, 600), color=(73, 109, 137))
    draw = ImageDraw.Draw(img)
    draw.rectangle([100, 100, 700, 500], fill=(200, 100, 100))
    # Guardamos con calidad 90
    img.save(original_path, "JPEG", quality=90)
    
    # 2. Imagen Manipulada (Falsificada)
    # Simulamos que alguien abrió la imagen original, pegó algo y la volvió a guardar (Doble compresión)
    forged_path = TEST_DIR / "forged.jpg"
    img_forged = Image.open(original_path)
    draw_forged = ImageDraw.Draw(img_forged)
    # Pegamos un bloque negro (representa el fotomontaje)
    draw_forged.rectangle([300, 200, 500, 400], fill=(0, 0, 0))
    # La guardamos nuevamente (el bloque negro sufre 1 compresión, el resto sufre 2 compresiones)
    img_forged.save(forged_path, "JPEG", quality=90)

    # 3. Imagen Modificada levemente (1 píxel) para probar HASH criptográfico
    pixel_path = TEST_DIR / "mod_pixel.jpg"
    img_pixel = Image.open(original_path)
    # Cambiamos 1 solo píxel
    img_pixel.putpixel((10, 10), (0, 0, 0))
    img_pixel.save(pixel_path, "JPEG", quality=90)

    # 4. Imagen Redimensionada para probar HASH Perceptual
    resized_path = TEST_DIR / "resized.jpg"
    img_resized = Image.open(original_path)
    img_resized = img_resized.resize((400, 300))
    img_resized.save(resized_path, "JPEG", quality=90)

    return original_path, forged_path, pixel_path, resized_path

def run_validations():
    print("Generando dataset forense controlado...")
    original, forged, pixel_mod, resized = generate_test_images()
    
    print("\n--- VALIDACIÓN 1: ALGORITMO ELA (Error Level Analysis) ---")
    ela_orig = analyze_ela(original, TEST_DIR)
    ela_forged = analyze_ela(forged, TEST_DIR)
    
    score_orig = ela_orig["score"]
    score_forged = ela_forged["score"]
    print(f"Original ELA Score (Max Diff): {score_orig}")
    print(f"Manipulada ELA Score (Max Diff): {score_forged}")
    if score_forged > score_orig:
        print("[OK] VALIDADO: ELA detectó correctamente la anomalía de compresión en el fotomontaje.")
    else:
        print("[X] FALLO: ELA no detectó diferencia.")

    print("\n--- VALIDACIÓN 2: ALGORITMOS DE HASHING (Integridad y Percepción) ---")
    hashes_orig = analyze_hashes(original)
    hashes_pixel = analyze_hashes(pixel_mod)
    hashes_resized = analyze_hashes(resized)
    
    # Criptográfico (SHA-256)
    sha_orig = hashes_orig["cryptographic"]["sha256"]
    sha_pixel = hashes_pixel["cryptographic"]["sha256"]
    if sha_orig != sha_pixel:
        print(f"[OK] VALIDADO (Criptográfico): Modificar 1 píxel cambió drásticamente el SHA-256.")
    else:
        print("[X] FALLO: SHA-256 idéntico.")
        
    # Perceptual (pHash)
    phash_orig = hashes_orig["perceptual"]["phash"]
    phash_resized = hashes_resized["perceptual"]["phash"]
    
    # Calcular distancia de Hamming de phash
    distancia_perceptual = sum(c1 != c2 for c1, c2 in zip(phash_orig, phash_resized))
    print(f"Distancia perceptual entre original y redimensionada: {distancia_perceptual}")
    if distancia_perceptual <= 10: # Tolerancia para imágenes redimensionadas
        print("[OK] VALIDADO (Perceptual): pHash detectó que visualmente son la misma imagen a pesar del cambio de tamaño.")
    else:
        print("[X] FALLO: pHash varió demasiado.")

    print("\n--- VALIDACIÓN 3: METADATOS EXIF ---")
    exif_data = analyze_exif(original)
    if "error" in exif_data or len(exif_data) == 0 or (len(exif_data)==1 and "error" in exif_data):
        print("[OK] VALIDADO: El algoritmo parsea correctamente y controla el caso de imágenes sin EXIF sin romper el sistema.")
    else:
        print("[X] FALLO: Comportamiento inesperado de EXIF.")

if __name__ == "__main__":
    run_validations()
