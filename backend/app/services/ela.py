from pathlib import Path
from PIL import Image, ImageChops, ImageEnhance
import numpy as np
import tempfile
import os
import gc

JPEG_QUALITY = 90
ELA_BRIGHTNESS = 15

# Límite de tamaño máximo para evitar imágenes enormes en RAM
MAX_DIMENSION = 1920


def analyze_ela(filepath: Path, temp_dir: Path) -> dict:
    """
    Realiza Error Level Analysis (ELA).

    Retorna:
        - estadísticas
        - score (porcentaje)
        - imagen ela temporal
    """
    image = None
    compressed = None
    ela_image = None
    ela_array = None

    try:
        image = Image.open(filepath)

        # Redimensionar si es muy grande para ahorrar RAM
        if max(image.size) > MAX_DIMENSION:
            image.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)

        # Handle transparency
        if image.mode in ('RGBA', 'LA') or (image.mode == 'P' and 'transparency' in image.info):
            alpha = image.convert('RGBA').split()[-1]
            bg = Image.new("RGB", image.size, (255, 255, 255))
            bg.paste(image, mask=alpha)
            image = bg
        else:
            image = image.convert("RGB")

        temp_file = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
        temp_path = temp_file.name
        temp_file.close()

        image.save(temp_path, "JPEG", quality=JPEG_QUALITY)

        compressed = Image.open(temp_path)
        compressed.load()  # Forzar carga para poder cerrar el archivo

        ela_image = ImageChops.difference(image, compressed)

        # Liberar compressed de memoria
        compressed.close()
        del compressed
        compressed = None

        extrema = ela_image.getextrema()
        max_difference = max(value[1] for value in extrema)

        if max_difference == 0:
            max_difference = 1

        scale = 255.0 / max_difference
        ela_image = ImageEnhance.Brightness(ela_image).enhance(scale * ELA_BRIGHTNESS)

        ela_array = np.asarray(ela_image)

        mean_value = float(np.mean(ela_array))
        std_value = float(np.std(ela_array))
        min_value = int(np.min(ela_array))
        max_value = int(np.max(ela_array))

        score = round((mean_value / 255.0) * 100, 2)
        std_score = round((std_value / 255.0) * 100, 2)

        suspicious = False
        if std_score > 35.0:
            suspicious = True
        elif score > 65.0:
            suspicious = True

        ela_filename = filepath.stem + "_ela.png"
        ela_path = temp_dir / ela_filename
        ela_image.save(ela_path)

        os.remove(temp_path)

        return {
            "success": True,
            "settings": {"jpeg_quality": JPEG_QUALITY, "brightness_factor": ELA_BRIGHTNESS},
            "statistics": {
                "min": min_value,
                "max": max_value,
                "mean": round(mean_value, 2),
                "std": round(std_value, 2),
            },
            "score": score,
            "possible_manipulation": suspicious,
            "ela_image": str(ela_path),
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error al procesar ELA: {str(e)}"
        }
    finally:
        # Liberar toda la memoria usada
        if ela_array is not None:
            del ela_array
        if ela_image is not None:
            ela_image.close()
            del ela_image
        if compressed is not None:
            compressed.close()
            del compressed
        if image is not None:
            image.close()
            del image
        gc.collect()
