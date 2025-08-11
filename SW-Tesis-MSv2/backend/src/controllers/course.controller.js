"use strict";

import courseService from "../services/course.service.js";
import { respondSuccess, respondError } from "../utils/resHandler.js";
import { handleError } from "../utils/errorHandler.js";

/**
 * Obtiene todos los cursos.
 * @param {object} req - Objeto de petición.
 * @param {object} res - Objeto de respuesta.
 */

async function getCourses(req, res) {
  try {
    const [courses, error] = await courseService.getCourses();
    if (error) return respondError(req, res, 404, error);

    respondSuccess(req, res, 200, courses);
  } catch (error) {
    handleError(error, "course.controller -> getCourses");
    respondError(req, res, 500, "No se pudieron obtener los cursos");
  }
}

/**
 * Crea un nuevo curso.
 * @param {object} req - Objeto de petición.
 * @param {object} res - Objeto de respuesta.
 */
async function createCourse(req, res) {
  try {
    const [newCourse, error] = await courseService.createCourse(req.body);
    if (error) return respondError(req, res, 400, error);

    respondSuccess(req, res, 201, newCourse);
  } catch (error) {
    handleError(error, "course.controller -> createCourse");
    respondError(req, res, 500, "No se pudo crear el curso");
  }
}

/**
 * Obtiene un curso por su ID.
 * @param {object} req - Objeto de petición.
 * @param {object} res - Objeto de respuesta.
 */
async function getCourseById(req, res) {
  try {
    const { id } = req.params;
    const [course, error] = await courseService.getCourseById(id);
    if (error) return respondError(req, res, 404, error);

    respondSuccess(req, res, 200, course);
  } catch (error) {
    handleError(error, "course.controller -> getCourseById");
    respondError(req, res, 500, "No se pudo obtener el curso");
  }
}

/**
 * Actualiza un curso por su ID.
 * @param {object} req - Objeto de petición.
 * @param {object} res - Objeto de respuesta.
 */
async function updateCourse(req, res) {
  try {
    const { id } = req.params;
    const [courseUpdated, error] = await courseService.updateCourse(id, req.body);
    if (error) return respondError(req, res, 404, error);

    respondSuccess(req, res, 200, courseUpdated);
  } catch (error) {
    handleError(error, "course.controller -> updateCourse");
    respondError(req, res, 500, "No se pudo actualizar el curso");
  }
}

/**
 * Elimina un curso por su ID.
 * @param {object} req - Objeto de petición.
 * @param {object} res - Objeto de respuesta.
 */
async function deleteCourse(req, res) {
  try {
    const { id } = req.params;
    const [courseDeleted, error] = await courseService.deleteCourse(id);
    if (error) return respondError(req, res, 404, error);

    respondSuccess(req, res, 200, { message: "Curso eliminado correctamente", course: courseDeleted });
  } catch (error) {
    handleError(error, "course.controller -> deleteCourse");
    respondError(req, res, 500, "No se pudo eliminar el curso");
  }
}

export default {
  getCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
};