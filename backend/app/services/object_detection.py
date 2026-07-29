"""
Detección de objetos ligera usando OpenCV Haar Cascades.
No requiere torch, ultralytics ni descarga de modelos.
Footprint en RAM: ~5MB (vs ~400MB con YOLO+torch).
"""
from pathlib import Path
import cv2
import gc

# Límite máximo para no procesar imágenes enormes en RAM
MAX_DIMENSION = 1024


def analyze_objects(filepath: Path) -> dict:
    """
    Detecta rostros y ojos en la imagen usando Haar Cascades de OpenCV.
    Los archivos XML están incluidos con opencv-python-headless, sin descarga adicional.
    """
    image = None
    gray = None

    try:
        image = cv2.imread(str(filepath))

        if image is None:
            raise Exception("No se pudo abrir la imagen.")

        # Redimensionar si es muy grande
        h, w = image.shape[:2]
        if max(h, w) > MAX_DIMENSION:
            scale = MAX_DIMENSION / max(h, w)
            image = cv2.resize(
                image,
                (int(w * scale), int(h * scale)),
                interpolation=cv2.INTER_AREA
            )

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        detected_items = []
        counts = {}

        # --- Detección de rostros ---
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        faces = face_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
        )
        face_count = len(faces) if hasattr(faces, "__len__") else 0
        if face_count > 0:
            for _ in range(face_count):
                detected_items.append({"object": "rostro/persona", "confidence": None})
            counts["rostro/persona"] = face_count

        # --- Detección de perfiles (cara lateral) ---
        profile_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_profileface.xml"
        )
        profiles = profile_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
        )
        profile_count = len(profiles) if hasattr(profiles, "__len__") else 0
        if profile_count > 0:
            for _ in range(profile_count):
                detected_items.append({"object": "perfil/cara lateral", "confidence": None})
            counts["perfil/cara lateral"] = profile_count

        # --- Detección de ojos ---
        eye_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_eye.xml"
        )
        eyes = eye_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=5, minSize=(20, 20)
        )
        eye_count = len(eyes) if hasattr(eyes, "__len__") else 0
        if eye_count > 0:
            for _ in range(eye_count):
                detected_items.append({"object": "ojo", "confidence": None})
            counts["ojo"] = eye_count

        if not detected_items:
            return {
                "success": True,
                "detected": [],
                "summary": "No se detectaron rostros, perfiles ni ojos en la imagen.",
                "engine": "opencv-haar"
            }

        summary_parts = [
            f"{count} {obj}" + ("s" if count > 1 else "")
            for obj, count in counts.items()
        ]
        summary = f"Se detectaron los siguientes elementos en la escena: {', '.join(summary_parts)}."

        return {
            "success": True,
            "detected": detected_items,
            "summary": summary,
            "engine": "opencv-haar"
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Error en la detección de objetos: {str(e)}"
        }
    finally:
        for arr in [gray, image]:
            if arr is not None:
                del arr
        gc.collect()
