from __future__ import annotations
import base64
import os
import posixpath
import tempfile
from datetime import datetime
from typing import Dict, Optional, Tuple

import cv2
import numpy as np

# Carpeta donde se guardarán las imágenes procesadas
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
IMAGES_DIR = os.path.abspath(
    os.path.join(BASE_DIR, "..", "SW-Tesis-MSv2", "backend", "uploads", "revisions")
)
RELATIVE_IMAGES_DIR = posixpath.join("uploads", "revisions")

from .image_processor import process_equation_image

LABEL_MAP = {"add": "+", "sub": "-", "eq": "="}

def process_and_store_image(
    image_bytes: bytes, alumno: Optional[str], collection
) -> Tuple[Dict[str, str], Optional[str]]:
    # Asegura que la carpeta donde se guardarán las imágenes exista
    os.makedirs(IMAGES_DIR, exist_ok=True)

    np_arr = np.frombuffer(image_bytes, np.uint8)
    imagen = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if imagen is None:
        return {}, "No se pudo decodificar la imagen"

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(image_bytes)
        temp_path = tmp.name

    try:
        (
            original_image,
            recognitions,
            equation_str,
            veredicto,
        ) = process_equation_image(temp_path)
    finally:
        os.remove(temp_path)

    if original_image is None:
        return {}, "Error al procesar imagen"

    for (x, y, w, h, label) in recognitions:
        symbol = LABEL_MAP.get(label, label)
        cv2.rectangle(original_image, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.putText(
            original_image,
            symbol,
            (x, y - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 0),
            2,
        )

    h, w, _ = original_image.shape
    color = (0, 255, 0) if "Correcto" in veredicto else (0, 0, 255)
    cv2.putText(
        original_image,
        f"Veredicto: {veredicto}",
        (10, h - 20),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.9,
        color,
        2,
    )

    # Guarda la imagen procesada en disco
    filename = f"{(alumno or 'alumno')}_{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}.jpg"
    absolute_path = os.path.join(IMAGES_DIR, filename)
    cv2.imwrite(absolute_path, original_image)
    relative_path = posixpath.join(RELATIVE_IMAGES_DIR, filename)

    _, buffer = cv2.imencode(".jpg", original_image)
    base64_img = base64.b64encode(buffer).decode("utf-8")

    documento = {
        "alumno": alumno,
        "fecha": datetime.utcnow(),
        "ecuacion": equation_str,
        "veredicto": veredicto,
        "imagen": base64_img,
        "ruta_local": relative_path,
    }
    result = collection.insert_one(documento)

    return (
        {
            "ecuacion": equation_str,
            "veredicto": veredicto,
            "imagen_base64": base64_img,
            "ruta_local": relative_path,
            "id": str(result.inserted_id),
        },
        None,
    )
