"use strict";

import Student from "../models/student.model.js";
import Course from "../models/course.model.js";
import Revision from "../models/revision.model.js";
import { handleError } from "../utils/errorHandler.js";

/**
 * Obtiene todos los estudiantes, populando la información de su curso.
 */
async function getStudents() {
  try {
    const students = await Student.find().populate("curso").exec();
    if (!students || students.length === 0) return [null, "No hay estudiantes"];

    return [students, null];
  } catch (error) {
    handleError(error, "student.service -> getStudents");
    return [null, "Error al obtener los estudiantes"];
  }
}

/**
 * Crea un nuevo estudiante y lo asocia a su curso.
 * @param {object} student - Objeto con { nombre, curso: cursoId }
 */
async function createStudent(student) {
  try {
    const { nombre, curso } = student;


    const courseFound = await Course.findById(curso).exec();
    if (!courseFound) return [null, "El curso especificado no existe"];

    const studentFound = await Student.findOne({ nombre, curso }).exec();
    if (studentFound) return [null, "El estudiante ya existe en este curso"];

    const newStudent = new Student({
      nombre,
      curso,
    });
    await newStudent.save();

    await Course.findByIdAndUpdate(curso, { $push: { estudiantes: newStudent._id } }).exec();

    return [newStudent, null];
  } catch (error) {
    handleError(error, "student.service -> createStudent");
    return [null, "Error al crear el estudiante"];
  }
}

/**
 * Obtiene un estudiante por su ID, populando curso y revisiones.
 * @param {string} id - El ID del estudiante.
 */
async function getStudentById(id) {
  try {
    const student = await Student.findById(id)
      .populate("curso")
      .populate("revisiones")
      .exec();
    if (!student) return [null, "El estudiante no existe"];

    return [student, null];
  } catch (error) {
    handleError(error, "student.service -> getStudentById");
    return [null, "Error al obtener el estudiante"];
  }
}

/**
 * Actualiza un estudiante por su ID.
 * Nota: La lógica para cambiar de curso no está implementada aquí.
 * @param {string} id - El ID del estudiante a actualizar.
 * @param {object} student - Los datos a actualizar.
 */
async function updateStudent(id, student) {
  try {
    const studentUpdated = await Student.findByIdAndUpdate(id, student, { new: true }).exec();
    if (!studentUpdated) return [null, "El estudiante no existe"];

    return [studentUpdated, null];
  } catch (error) {
    handleError(error, "student.service -> updateStudent");
    return [null, "Error al actualizar el estudiante"];
  }
}

/**
 * Elimina un estudiante, sus revisiones y su referencia en el curso.
 * @param {string} id - El ID del estudiante a eliminar.
 */
async function deleteStudent(id) {
  try {
    const studentFound = await Student.findById(id).exec();
    if (!studentFound) return [null, "El estudiante no existe"];

    await Student.findByIdAndDelete(id).exec();

    await Course.findByIdAndUpdate(studentFound.curso, { $pull: { estudiantes: studentFound._id } }).exec();

    await Revision.deleteMany({ estudiante: id }).exec();

    return [studentFound, null];
  } catch (error) {
    handleError(error, "student.service -> deleteStudent");
    return [null, "Error al eliminar el estudiante"];
  }
}

export default {
  getStudents,
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
};