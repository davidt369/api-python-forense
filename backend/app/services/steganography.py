from pathlib import Path
import gc


def analyze_steganography(filepath: Path) -> dict:
    """
    Analiza una imagen buscando mensajes ocultos mediante esteganografía LSB.
    Retorna el mensaje si lo encuentra, y una explicación humana.
    """
    try:
        from stegano import lsb

        # Intentar revelar el mensaje oculto
        # Nota: Stegano funciona mejor con PNGs o BMPs, en JPG los LSB se destruyen por la compresión.
        hidden_message = lsb.reveal(str(filepath))

        if hidden_message:
            return {
                "success": True,
                "hidden_data_found": True,
                "message": hidden_message,
                "summary": f"¡ALERTA! Se ha encontrado texto oculto en la imagen usando técnicas de esteganografía LSB. El mensaje extraído es: '{hidden_message}'"
            }
        else:
            return {
                "success": True,
                "hidden_data_found": False,
                "summary": "No se encontraron mensajes de texto ocultos en los bits menos significativos (LSB) de esta imagen."
            }

    except IndexError:
        # Ocurre cuando la imagen no tiene datos ocultos estructurados para stegano
        return {
            "success": True,
            "hidden_data_found": False,
            "summary": "No se detectó información oculta (Esteganografía LSB negativa)."
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error al analizar esteganografía: {str(e)}"
        }
    finally:
        gc.collect()
