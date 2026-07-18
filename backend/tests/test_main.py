import pytest
from fastapi.testclient import TestClient
from pathlib import Path
from PIL import Image
import io
import os

from app.main import app, UPLOAD_DIR, TEMP_DIR

client = TestClient(app)

def create_dummy_image():
    """Crea una imagen pequeña en memoria para pruebas."""
    file = io.BytesIO()
    image = Image.new('RGB', size=(100, 100), color=(255, 0, 0))
    image.save(file, 'jpeg')
    file.name = 'test_image.jpg'
    file.seek(0)
    return file

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Image Forensic API", "status": "running"}

def test_upload_valid_image():
    img = create_dummy_image()
    files = {'file': ('test_image.jpg', img, 'image/jpeg')}
    data = {'folder': 'pruebas_funcionales'}
    
    response = client.post("/upload", files=files, data=data)
    assert response.status_code == 200
    json_resp = response.json()
    assert "url" in json_resp
    assert "filename" in json_resp
    assert json_resp["filename"].startswith("pruebas_funcionales/")
    
    # Limpiar
    uploaded_file = UPLOAD_DIR / json_resp["filename"]
    if uploaded_file.exists():
        os.remove(uploaded_file)

def test_upload_invalid_extension():
    file = io.BytesIO(b"not an image")
    file.name = "test.txt"
    files = {'file': ('test.txt', file, 'text/plain')}
    data = {'folder': 'pruebas_funcionales'}
    
    response = client.post("/upload", files=files, data=data)
    assert response.status_code == 400
    assert response.json()["detail"] == "Formato de imagen no soportado."

def test_analyze_image():
    # Primero subimos una imagen real simulada
    img = create_dummy_image()
    # Guardarla físicamente para que analyze la encuentre
    test_filename = "test_analysis.jpg"
    test_path = UPLOAD_DIR / test_filename
    
    with open(test_path, "wb") as f:
        f.write(img.read())
        
    try:
        data = {
            'filename': test_filename,
            'original_name': 'test_image.jpg'
        }
        response = client.post("/analyze", data=data)
        
        # Debe retornar 200 y contener los resultados
        assert response.status_code == 200
        json_resp = response.json()
        assert "exif" in json_resp
        assert "hashes" in json_resp
        assert "histogram" in json_resp
        assert "file" in json_resp
        assert json_resp["file"]["saved_name"] == test_filename
    finally:
        # Limpiar
        if test_path.exists():
            os.remove(test_path)

