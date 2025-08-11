"use strict";

import { Router } from "express";
import revisionController from "../controllers/revision.controller.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import authenticationMiddleware from "../middlewares/authentication.middleware.js";
import path from "path";
import fs from "fs";
import multer from "multer";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads", "revisions");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });


router.use(authenticationMiddleware);

router.get("/", revisionController.getRevisions);

router.post(
  "/", 
  upload.single("image"), 
  revisionController.createRevision
);
router.get("/:id", revisionController.getRevisionById);
router.delete("/:id", isAdmin, revisionController.deleteRevision);


export default router;