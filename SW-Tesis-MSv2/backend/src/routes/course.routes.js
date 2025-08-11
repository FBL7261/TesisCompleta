"use strict";

import { Router } from "express";
import courseController from "../controllers/course.controller.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import authenticationMiddleware from "../middlewares/authentication.middleware.js";

const router = Router();


router.use(authenticationMiddleware);


router.get("/", courseController.getCourses);
router.post("/", courseController.createCourse);
router.get("/:id", courseController.getCourseById);
router.put("/:id", courseController.updateCourse);
router.delete("/:id", courseController.deleteCourse);

export default router;