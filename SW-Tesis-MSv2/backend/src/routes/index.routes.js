"use strict";
// Importa el modulo 'express' para crear las rutas
import { Router } from "express";

/** Enrutador de usuarios  */
import userRoutes from "./user.routes.js";

/** Enrutador de autenticación */
import authRoutes from "./auth.routes.js";

/** Enrutador de Estudiantes **/
import studentRoutes from "./student.routes.js";

/** Enrutador de Cursos */
import courseRoutes from "./course.routes.js";

/**Enrutador de revisiones**/
import reviewRoutes from "./revision.routes.js";

/** Enrutador de estadísticas   **/
import statsRoutes    from './stats.routes.js';


/** Middleware de autenticación */
import authenticationMiddleware from "../middlewares/authentication.middleware.js";

/** Instancia del enrutador */
const router = Router();

// Define las rutas para los usuarios /api/usuarios
router.use("/users", authenticationMiddleware, userRoutes);
// Define las rutas para la autenticación /api/auth
router.use("/auth", authRoutes);
// Define las rutas para los estudiantes /api/students
router.use("/students", authenticationMiddleware, studentRoutes);
// Define las rutas para los cursos /api/courses
router.use("/courses", authenticationMiddleware, courseRoutes);
// Define las rutas para las revisiones /api/reviews
router.use("/reviews", authenticationMiddleware, reviewRoutes);
// Define las rutas para las estadísticas /api/stats
router.use("/stats", authenticationMiddleware, statsRoutes);

// Exporta el enrutador
export default router;
