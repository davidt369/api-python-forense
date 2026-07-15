from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil
import uuid
import os
from fastapi.staticfiles import StaticFiles

from app.services.exif import analyze_exif
from app.services.hashes import analyze_hashes
from app.services.ela import analyze_ela
from app.services.histogram import analyze_histogram
from app.services.noise import analyze_noise
from app.services.compression import analyze_compression

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


ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}


@app.get("/")
def root():
    return {"message": "Image Forensic API", "status": "running"}


@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):

    print("📥 Imagen recibida:", file.filename)

    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Formato de imagen no soportado.")

    filename = f"{uuid.uuid4()}{extension}"
    filepath = UPLOAD_DIR / filename

    print("💾 Guardando temporalmente:", filepath)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:

        print("🔍 Iniciando análisis forense...")

        exif = analyze_exif(filepath)
        print("✅ EXIF:", exif)

        hashes = analyze_hashes(filepath)
        print("✅ Hashes:", hashes)

        ela = analyze_ela(filepath, TEMP_DIR)
        print("✅ ELA:", ela)

        histogram = analyze_histogram(filepath)
        print("✅ Histograma:", histogram)

        noise = analyze_noise(filepath)
        print("✅ Ruido:", noise)

        compression = analyze_compression(filepath)
        print("✅ Compresión:", compression)

        result = {
            "file": {
                "original_name": file.filename,
                "saved_name": filename,
                "path": str(filepath),
            },
            "exif": exif,
            "hashes": hashes,
            "ela": ela,
            "histogram": histogram,
            "noise": noise,
            "compression": compression,
        }

        print("📊 Resultado final:")
        print(result)

        return JSONResponse(result)

    finally:

        if os.path.exists(filepath):
            os.remove(filepath)
            print("🗑️ Archivo temporal eliminado")
