from pathlib import Path
from ultralytics import YOLO

# Cargar el modelo preentrenado (se descargará la primera vez)
model = YOLO('yolov8n.pt') 

def analyze_objects(filepath: Path) -> dict:
    """
    Analiza una imagen utilizando YOLOv8 para detectar objetos y personas.
    Retorna una lista de objetos encontrados y una explicación humana.
    """
    try:
        # Ejecutar inferencia
        results = model(str(filepath))
        
        detected_items = []
        counts = {}
        
        # Procesar los resultados
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Obtener el nombre de la clase
                cls_id = int(box.cls[0])
                class_name = model.names[cls_id]
                
                # Obtener la confianza
                conf = float(box.conf[0])
                
                # Si la confianza es mayor al 30%
                if conf > 0.30:
                    detected_items.append({
                        "object": class_name,
                        "confidence": round(conf * 100, 2)
                    })
                    counts[class_name] = counts.get(class_name, 0) + 1

        if not detected_items:
            summary = "No se detectaron objetos reconocibles con alta confianza en la imagen."
            return {
                "success": True,
                "detected": [],
                "summary": summary
            }

        # Generar un resumen humano (transparente)
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
