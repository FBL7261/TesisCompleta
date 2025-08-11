"use strict";

import revisionService from "../services/revision.service.js";
import { respondSuccess, respondError } from "../utils/resHandler.js";
import { handleError } from "../utils/errorHandler.js";

import Revision from '../models/revision.model.js';
import path from 'path';

function normalizeImagePath(imagePath) {
  const filename = path.basename(imagePath);
  return `uploads/revisions/${filename}`;
}

async function createRevision(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Falta la imagen de la revisión.' });
    }

    const { estudiante, isCorrect } = req.body;
    if (!estudiante || typeof isCorrect === 'undefined') {
      return res.status(400).json({ message: 'Faltan datos: estudiante o isCorrect.' });
    }


    const filename = req.file.filename;
    const relativePath = path.posix.join('uploads', 'revisions', filename);

    const revision = new Revision({
      estudiante,
      isCorrect: Boolean(Number(isCorrect)),
      imagePath: relativePath
    });

    const saved = await revision.save();
    const savedObj = saved.toObject();
    savedObj.imagePath = normalizeImagePath(savedObj.imagePath);
    return res.status(201).json(savedObj);
  } catch (err) {
    console.error('Error creando revisión:', err);
    return res.status(500).json({ message: 'Error del servidor.' });
  }
}

async function getRevisions(req, res) {
  try {
    const [revisions, error] = await revisionService.getRevisions();
    if (error) return respondError(req, res, 404, error);

    const normalized = revisions.map(r => {
      const rev = r.toObject ? r.toObject() : { ...r };
      rev.imagePath = normalizeImagePath(rev.imagePath);
      return rev;
    });

    return respondSuccess(req, res, 200, normalized);
  } catch (error) {
    handleError(error, "revision.controller -> getRevisions");
    return respondError(req, res, 500, "No se pudieron obtener las revisiones");
  }
}

async function getRevisionById(req, res) {
  try {
    const { id } = req.params;
    const [revision, error] = await revisionService.getRevisionById(id);
    if (error) return respondError(req, res, 404, error);

    const revObj = revision.toObject ? revision.toObject() : { ...revision };
    revObj.imagePath = normalizeImagePath(revObj.imagePath);

    return respondSuccess(req, res, 200, revObj);
  } catch (error) {
    handleError(error, "revision.controller -> getRevisionById");
    return respondError(req, res, 500, "No se pudo obtener la revisión");
  }
}

async function deleteRevision(req, res) {
  try {
    const { id } = req.params;
    const [revisionDeleted, error] = await revisionService.deleteRevision(id);
    if (error) return respondError(req, res, 404, error);

    return respondSuccess(req, res, 200, {
      message: "Revisión eliminada correctamente",
      revision: revisionDeleted
    });
  } catch (error) {
    handleError(error, "revision.controller -> deleteRevision");
    return respondError(req, res, 500, "No se pudo eliminar la revisión");
  }
}

export default {
  createRevision,
  getRevisions,
  getRevisionById,
  deleteRevision
};
