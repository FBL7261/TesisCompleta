"use strict";

import studentService from "../services/student.service.js";
import { respondSuccess, respondError } from "../utils/resHandler.js";
import { handleError } from "../utils/errorHandler.js";

async function getStudents(req, res) {
  try {
    const [students, error] = await studentService.getStudents();
    if (error) return respondError(req, res, 404, error);

    respondSuccess(req, res, 200, students);
  } catch (error) {
    handleError(error, "student.controller -> getStudents");
    respondError(req, res, 500, "No se pudieron obtener los estudiantes");
  }
}

async function createStudent(req, res) {
  try {
    const [newStudent, error] = await studentService.createStudent(req.body);
    if (error) return respondError(req, res, 400, error);

    respondSuccess(req, res, 201, newStudent);
  } catch (error) {
    handleError(error, "student.controller -> createStudent");
    respondError(req, res, 500, "No se pudo crear el estudiante");
  }
}

async function getStudentById(req, res) {
  try {
    const { id } = req.params;
    const [student, error] = await studentService.getStudentById(id);
    if (error) return respondError(req, res, 404, error);

    respondSuccess(req, res, 200, student);
  } catch (error) {
    handleError(error, "student.controller -> getStudentById");
    respondError(req, res, 500, "No se pudo obtener el estudiante");
  }
}

async function updateStudent(req, res) {
  try {
    const { id } = req.params;
    const [studentUpdated, error] = await studentService.updateStudent(id, req.body);
    if (error) return respondError(req, res, 404, error);

    respondSuccess(req, res, 200, studentUpdated);
  } catch (error) {
    handleError(error, "student.controller -> updateStudent");
    respondError(req, res, 500, "No se pudo actualizar el estudiante");
  }
}

async function deleteStudent(req, res) {
  try {
    const { id } = req.params;
    const [studentDeleted, error] = await studentService.deleteStudent(id);
    if (error) return respondError(req, res, 404, error);

    respondSuccess(req, res, 200, { message: "Estudiante eliminado correctamente", student: studentDeleted });
  } catch (error) {
    handleError(error, "student.controller -> deleteStudent");
    respondError(req, res, 500, "No se pudo eliminar el estudiante");
  }
}

export default {
  getStudents,
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
};