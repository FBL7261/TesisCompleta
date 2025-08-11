"use strict";

import Revision from "../models/revision.model.js";
import Student from "../models/student.model.js";
import Course from "../models/course.model.js";
import { handleError } from "../utils/errorHandler.js";

/**
 * Obtiene todas las revisiones, populando la información del estudiante.
 */
async function getRevisions() {
  try {
    const revisions = await Revision.find().populate("estudiante").exec();
    if (!revisions || revisions.length === 0) return [null, "No hay revisiones"];

    return [revisions, null];
  } catch (error) {
    handleError(error, "revision.service -> getRevisions");
    return [null, "Error al obtener las revisiones"];
  }
}

/**
 * Crea una nueva revisión a partir de los datos de la app.
 * Orquesta la creación de curso y estudiante si no existen.
 * @param {object} revisionData - { nombreEstudiante, nombreCurso, correctas, totales, imagenes }
 */
async function createRevision(revisionData) {
  try {
    const { nombreEstudiante, nombreCurso, correctas, totales, imagenes } = revisionData;

    let course = await Course.findOne({ nombre: nombreCurso }).exec();
    if (!course) {
      course = new Course({ nombre: nombreCurso });
      await course.save();
    }

    let student = await Student.findOne({ nombre: nombreEstudiante, curso: course._id }).exec();
    if (!student) {
      student = new Student({ nombre: nombreEstudiante, curso: course._id });
      await student.save();
      await Course.findByIdAndUpdate(course._id, { $push: { estudiantes: student._id } }).exec();
    }

    const newRevision = new Revision({
      estudiante: student._id,
      correctas,
      totales,
      imagenes,
    });
    await newRevision.save();

    await Student.findByIdAndUpdate(student._id, { $push: { revisiones: newRevision._id } }).exec();

    return [newRevision, null];
  } catch (error) {
    handleError(error, "revision.service -> createRevision");
    return [null, "Error al crear la revisión"];
  }
}

/**
 * Obtiene una revisión por su ID.
 * @param {string} id - El ID de la revisión.
 */
async function getRevisionById(id) {
  try {
    const revision = await Revision.findById(id).populate("estudiante").exec();
    if (!revision) return [null, "La revisión no existe"];

    return [revision, null];
  } catch (error) {
    handleError(error, "revision.service -> getRevisionById");
    return [null, "Error al obtener la revisión"];
  }
}

/**
 * Elimina una revisión por su ID y la quita de la lista del estudiante.
 * @param {string} id - El ID de la revisión a eliminar.
 */
async function deleteRevision(id) {
  try {
    const revisionFound = await Revision.findById(id).exec();
    if (!revisionFound) return [null, "La revisión no existe"];

    await Revision.findByIdAndDelete(id).exec();

    await Student.findByIdAndUpdate(revisionFound.estudiante, { $pull: { revisiones: id } }).exec();

    return [revisionFound, null];
  } catch (error) {
    handleError(error, "revision.service -> deleteRevision");
    return [null, "Error al eliminar la revisión"];
  }
}

export default {
  getRevisions,
  createRevision,
  getRevisionById,
  deleteRevision,
};