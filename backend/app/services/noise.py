from pathlib import Path
import cv2
import numpy as np
import gc

# Límite máximo para no procesar imágenes enormes en RAM
MAX_DIMENSION = 1920


def analyze_noise(filepath: Path) -> dict:
    """
    Analiza el ruido de la imagen.

    Retorna:
    - Nivel de ruido
    - Varianza Laplaciana (nitidez)
    - Desviación estándar
    - Media
    """
    image = None
    gray = None
    blur = None
    noise = None
    laplacian = None

    try:
        image = cv2.imread(str(filepath))

        if image is None:
            raise Exception("No fue posible abrir la imagen con OpenCV.")

        # Redimensionar si es muy grande para ahorrar RAM
        h, w = image.shape[:2]
        if max(h, w) > MAX_DIMENSION:
            scale = MAX_DIMENSION / max(h, w)
            image = cv2.resize(image, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Liberar imagen a color
        del image
        image = None

        # -----------------------------
        # Ruido estimado
        # -----------------------------
        blur = cv2.GaussianBlur(gray, (3, 3), 0)
        noise = cv2.absdiff(gray, blur)

        noise_mean = float(np.mean(noise))
        noise_std = float(np.std(noise))
        noise_max = int(np.max(noise))
        noise_min = int(np.min(noise))

        # Liberar blur y noise
        del blur, noise
        blur = noise = None

        # -----------------------------
        # Nitidez
        # -----------------------------
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        laplacian_variance = float(laplacian.var())

        # -----------------------------
        # Clasificación simple
        # -----------------------------
        if laplacian_variance < 80:
            sharpness = "Muy baja"
        elif laplacian_variance < 150:
            sharpness = "Baja"
        elif laplacian_variance < 350:
            sharpness = "Media"
        else:
            sharpness = "Alta"

        return {
            "success": True,
            "noise": {
                "mean": round(noise_mean, 2),
                "std": round(noise_std, 2),
                "min": noise_min,
                "max": noise_max,
            },
            "sharpness": {
                "laplacian_variance": round(laplacian_variance, 2),
                "classification": sharpness,
            },
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error al analizar ruido: {str(e)}"
        }
    finally:
        # Liberar todos los arrays
        for arr in [laplacian, noise, blur, gray, image]:
            if arr is not None:
                del arr
        gc.collect()
