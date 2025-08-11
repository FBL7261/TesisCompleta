"use strict";

import Course from "../models/course.model.js";
import Student from "../models/student.model.js";
import Revision from "../models/revision.model.js";
import { handleError } from "../utils/errorHandler.js";

/**
 * Obtiene todos los cursos con la información de sus estudiantes.
 */
async function getCourses() {
  try {
    const courses = await Course.find().populate("estudiantes").exec();
    if (!courses || courses.length === 0) return [null, "No hay cursos"];

    return [courses, null];
  } catch (error) {
    handleError(error, "course.service -> getCourses");
    return [null, "Error al obtener los cursos"];
  }
}

/**
 * Crea un nuevo curso.
 * @param {object} course - Objeto con { nombre }
 */
async function createCourse(course) {
  try {
    const { nombre } = course;

    const courseFound = await Course.findOne({ nombre }).exec();
    if (courseFound) return [null, "El curso ya existe"];

    const newCourse = new Course({ nombre });
    await newCourse.save();

    return [newCourse, null];
  } catch (error) {
    handleError(error, "course.service -> createCourse");
    return [null, "Error al crear el curso"];
  }
}

/**
 * Obtiene un curso por su ID.
 * @param {string} id - El ID del curso.
 */
async function getCourseById(id) {
  try {
    const course = await Course.findById(id).populate("estudiantes").exec();
    if (!course) return [null, "El curso no existe"];

    return [course, null];
  } catch (error) {
    handleError(error, "course.service -> getCourseById");
    return [null, "Error al obtener el curso"];
  }
}

/**
 * Actualiza un curso por su ID.
 * @param {string} id - El ID del curso.
 * @param {object} course - Los datos a actualizar.
 */
async function updateCourse(id, course) {
  try {
    const courseUpdated = await Course.findByIdAndUpdate(id, course, { new: true }).exec();
    if (!courseUpdated) return [null, "El curso no existe"];

    return [courseUpdated, null];
  } catch (error) {
    handleError(error, "course.service -> updateCourse");
    return [null, "Error al actualizar el curso"];
  }
}

/**
 * Elimina un curso y todos sus estudiantes y revisiones asociadas.
 * @param {string} id - El ID del curso a eliminar.
 */
async function deleteCourse(id) {
  try {
    const courseFound = await Course.findById(id).exec();
    if (!courseFound) return [null, "El curso no existe"];

    const students = await Student.find({ curso: id }).exec();
    const studentIds = students.map((s) => s._id);

    await Revision.deleteMany({ estudiante: { $in: studentIds } }).exec();

    await Student.deleteMany({ curso: id }).exec();

    await Course.findByIdAndDelete(id).exec();

    return [courseFound, null];
  } catch (error) {
    handleError(error, "course.service -> deleteCourse");
    return [null, "Error al eliminar el curso"];
  }
}

export default {
  getCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
};