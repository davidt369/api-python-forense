from pathlib import Path
import os
import gc

os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

import torch

# Limitar hilos de PyTorch para ahorrar RAM en producción (Render)
torch.set_num_threads(1)

# El modelo NO se carga en arranque — se carga bajo demanda y se libera
_model = None
_MODEL_PATH = "yolov8n.pt"


def _get_model():
    """Carga el modelo solo si aún no está en memoria."""
    global _model
    if _model is None:
        from ultralytics import YOLO
        _model = YOLO(_MODEL_PATH)
    return _model


def _release_model():
    """Libera el modelo de memoria después de usarlo."""
    global _model
    if _model is not None:
        del _model
        _model = None
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()


def analyze_objects(filepath: Path) -> dict:
    """
    Analiza una imagen utilizando YOLOv8 para detectar objetos y personas.
    Carga el modelo bajo demanda y lo libera inmediatamente después.
    """
    try:
        model = _get_model()

        # Ejecutar inferencia con tamaño reducido para ahorrar RAM
        results = model(str(filepath), imgsz=416, verbose=False)

        detected_items = []
        counts = {}

        for result in results:
            boxes = result.boxes
            for box in boxes:
                cls_id = int(box.cls[0])
                class_name = model.names[cls_id]
                conf = float(box.conf[0])

                if conf > 0.30:
                    detected_items.append({
                        "object": class_name,
                        "confidence": round(conf * 100, 2)
                    })
                    counts[class_name] = counts.get(class_name, 0) + 1

        # Liberar resultados de YOLO
        del results

        if not detected_items:
            summary = "No se detectaron objetos reconocibles con alta confianza en la imagen."
            return {
                "success": True,
                "detected": [],
                "summary": summary
            }

        summary_parts = []
        for obj, count in counts.items():
            if count == 1:
                summary_parts.append(f"1 {obj}")
            else:
                summary_parts.append(f"{count} {obj}s")

        summary = f"Se detectaron los siguientes elementos en la escena: {', '.join(summary_parts)}."

        return {
            "success": True,
            "detected": detected_items,
            "summary": summary
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Error en la detección de objetos: {str(e)}"
        }
    finally:
        # Siempre liberar modelo y hacer GC al terminar
        _release_model()
        gc.collect()
