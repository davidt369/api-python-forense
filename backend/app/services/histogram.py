from pathlib import Path
import cv2
import numpy as np
import gc

# Límite máximo para no procesar imágenes enormes en RAM
MAX_DIMENSION = 1920


def _channel_statistics(channel: np.ndarray) -> dict:
    return {
        "min": int(channel.min()),
        "max": int(channel.max()),
        "mean": round(float(channel.mean()), 2),
        "std": round(float(channel.std()), 2),
    }


def analyze_histogram(filepath: Path) -> dict:
    image = None
    rgb = None
    r = g = b = gray = None

    try:
        image = cv2.imread(str(filepath))

        if image is None:
            raise Exception("No fue posible abrir la imagen con OpenCV.")

        # Redimensionar si es muy grande
        h, w = image.shape[:2]
        if max(h, w) > MAX_DIMENSION:
            scale = MAX_DIMENSION / max(h, w)
            image = cv2.resize(image, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Liberar imagen original
        del image
        image = None

        r = rgb[:, :, 0]
        g = rgb[:, :, 1]
        b = rgb[:, :, 2]

        gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)

        brightness = float(gray.mean())
        contrast = float(gray.std())

        result = {
            "success": True,
            "image": {
                "width": int(rgb.shape[1]),
                "height": int(rgb.shape[0]),
                "pixels": int(rgb.shape[0] * rgb.shape[1]),
            },
            "brightness": round(brightness, 2),
            "contrast": round(contrast, 2),
            "channels": {
                "red": {"statistics": _channel_statistics(r)},
                "green": {"statistics": _channel_statistics(g)},
                "blue": {"statistics": _channel_statistics(b)},
            },
        }

        return result

    except Exception as e:
        return {
            "success": False,
            "error": f"Error al procesar histograma: {str(e)}"
        }
    finally:
        # Liberar todos los arrays numpy
        for arr in [r, g, b, gray, rgb, image]:
            if arr is not None:
                del arr
        gc.collect()
