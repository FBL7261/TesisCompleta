from __future__ import annotations
from typing import Iterable, Tuple
import cv2
import numpy as np

def _estimate_deskew_angle(binary_mask: np.ndarray) -> float:
    coords = np.column_stack(np.where(binary_mask > 0))
    if coords.size == 0:
        return 0.0
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    return float(angle)

def _rotation_matrix(w: int, h: int, angle: float) -> np.ndarray:
    center = (w // 2, h // 2)
    return cv2.getRotationMatrix2D(center, angle, 1.0)  # 2x3

def clean_and_binarize(
    image: np.ndarray,
    block_sizes: Iterable[int] = (35,),
    c_values: Iterable[int] = (11,),
    return_transform: bool = False,
) -> Tuple[np.ndarray, np.ndarray] | np.ndarray:
    """
    Limpia y binariza una imagen. Rota SOLO la binaria para deskew.
    Si return_transform=True, devuelve (binaria_rotada, matriz_afín_2x3).
    """
    # Gris + limpieza
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    gray = cv2.equalizeHist(gray)

    # Mejor par (blockSize, C) por contraste
    best_bw, best_std = None, -1.0
    for block in block_sizes:
        block = block | 1  # impar
        for c in c_values:
            cand = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY_INV, block, c
            )
            std = cv2.meanStdDev(cand)[1][0][0]
            if std > best_std:
                best_std, best_bw = std, cand
    bw = best_bw

    # Morfología suave
    k = np.ones((2, 2), np.uint8)
    bw = cv2.erode(bw, k, iterations=1)
    bw = cv2.dilate(bw, k, iterations=1)
    bw = cv2.morphologyEx(bw, cv2.MORPH_CLOSE, k, iterations=1)
    bw = cv2.morphologyEx(bw, cv2.MORPH_OPEN, k, iterations=1)

    # Estimar ángulo y ROTAR SOLO la binaria
    h, w = bw.shape[:2]
    angle = _estimate_deskew_angle(bw)
    M = _rotation_matrix(w, h, angle)               # 2x3
    bw_rot = cv2.warpAffine(
        bw, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
    )

    # Asegurar binarización tras rotación
    _, bw_rot = cv2.threshold(bw_rot, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

    return (bw_rot, M) if return_transform else bw_rot
