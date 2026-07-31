FROM python:3.12-slim

WORKDIR /app

# Instalamos las dependencias del sistema que OpenCV necesita sí o sí
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libxcb1 \
    libxcb-shm0 \
    libxcb-xfixes0 \
    && rm -rf /var/lib/apt/lists/*

# Copiamos las dependencias de Python y las instalamos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código del backend
COPY . .

# Comando para iniciar la aplicación (Railway inyecta la variable $PORT)
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
