from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil
import uuid
import os
import gc
import tempfile
from fastapi.staticfiles import StaticFiles

from app.services.exif import analyze_exif
from app.services.hashes import analyze_hashes
from app.services.ela import analyze_ela
from app.services.histogram import analyze_histogram
from app.services.noise import analyze_noise
from app.services.compression import analyze_compression
from app.services.object_detection import analyze_objects
from app.services.steganography import analyze_steganography

app = FastAPI(
    title="Image Forensic API",
    description="API de análisis forense de imágenes",
    version="1.0.0",
)


# ==========================
# CORS CONFIGURATION
# ==========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://agencia-forense-digital.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"

UPLOAD_DIR = DATA_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR = DATA_DIR / "temp"
TEMP_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/temp", StaticFiles(directory=str(TEMP_DIR)), name="temp")
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}


def _cleanup_temp_dir():
    """Elimina archivos ELA temporales anteriores al arrancar."""
    try:
        for f in TEMP_DIR.glob("*_ela.png"):
            f.unlink(missing_ok=True)
    except Exception:
        pass


_cleanup_temp_dir()


def _run_analysis(filepath: Path, original_name: str, saved_name: str) -> dict:
    """Ejecuta todos los módulos de análisis forense sobre un archivo."""
    exif = analyze_exif(filepath)
    hashes = analyze_hashes(filepath)
    ela = analyze_ela(filepath, TEMP_DIR)
    histogram = analyze_histogram(filepath)
    noise = analyze_noise(filepath)
    compression = analyze_compression(filepath)
    objects = analyze_objects(filepath)
    gc.collect()
    steganography = analyze_steganography(filepath)

    return {
        "file": {
            "original_name": original_name,
            "saved_name": saved_name,
            "path": str(filepath),
        },
        "exif": exif,
        "hashes": hashes,
        "ela": ela,
        "histogram": histogram,
        "noise": noise,
        "compression": compression,
        "objects": objects,
        "steganography": steganography,
        "executive_summary": {
            "objects_found": objects.get("summary", ""),
            "hidden_data": steganography.get("summary", ""),
            "manipulation_alert": (
                "ALERTA: Posible manipulación detectada en el análisis ELA."
                if isinstance(ela, dict) and ela.get("possible_manipulation")
                else "No se detectaron signos evidentes de manipulación estructural a nivel de ruido (ELA)."
            )
        }
    }


@app.get("/")
def root():
    return {"message": "Image Forensic API", "status": "running"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...), folder: str = Form("evidencias")):
    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Formato de imagen no soportado.")

    filename = f"{uuid.uuid4()}{extension}"
    target_dir = UPLOAD_DIR / folder
    target_dir.mkdir(parents=True, exist_ok=True)
    filepath = target_dir / filename

    print(f"[SAVE] Guardando archivo: {filepath}")

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "url": f"/uploads/{folder}/{filename}",
        "filename": f"{folder}/{filename}"
    }


@app.post("/analyze")
async def analyze_image(filename: str = Form(...), original_name: str = Form(...)):
    """
    Analiza una imagen que ya fue subida con /upload.
    Si el archivo ya no existe (reinicio del servidor / instancia efímera),
    devuelve un error claro para que el frontend use /analyze-file en su lugar.
    """
    print(f"[REQ] Análisis para: {filename}")
    filepath = UPLOAD_DIR / filename

    if not filepath.exists():
        raise HTTPException(
            status_code=404,
            detail=(
                "El archivo no existe en el servidor. El servidor puede haberse reiniciado "
                "(almacenamiento efímero). Por favor usa /analyze-file para subir y analizar "
                "la imagen en una sola petición."
            )
        )

    try:
        result = _run_analysis(filepath, original_name, filename)
        print("[DONE] Análisis completado.")
        return JSONResponse(result)
    except Exception as e:
        print(f"[ERR] {e}")
        raise HTTPException(status_code=500, detail=f"Error interno en análisis: {str(e)}")
    finally:
        gc.collect()


@app.post("/analyze-file")
async def analyze_file_direct(
    file: UploadFile = File(...),
    original_name: str = Form(None)
):
    """
    Sube y analiza la imagen en una sola petición.
    Resuelve el problema de almacenamiento efímero en Render Free Tier:
    el archivo se analiza y luego se elimina, sin depender de persistencia.
    """
    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Formato de imagen no soportado.")

    name = original_name or file.filename
    tmp_path = None

    try:
        # Guardar en archivo temporal (se borra al terminar)
        with tempfile.NamedTemporaryFile(
            suffix=extension,
            dir=str(TEMP_DIR),
            delete=False
        ) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = Path(tmp.name)

        print(f"[REQ] Análisis directo: {name}")
        result = _run_analysis(tmp_path, name, tmp_path.name)
        print("[DONE] Análisis directo completado.")
        return JSONResponse(result)

    except Exception as e:
        print(f"[ERR] {e}")
        raise HTTPException(status_code=500, detail=f"Error interno en análisis: {str(e)}")
    finally:
        # Eliminar el archivo temporal siempre
        if tmp_path and tmp_path.exists():
            try:
                tmp_path.unlink()
            except Exception:
                pass
        gc.collect()
