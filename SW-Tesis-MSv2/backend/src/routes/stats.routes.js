import { Router } from 'express';
import authenticationMiddleware from '../middlewares/authentication.middleware.js';
import * as statsCtrl from '../controllers/stats.controller.js';

const router = Router();
router.use(authenticationMiddleware);

router.get('/course/:id', statsCtrl.courseRevisionStats);

export default router;
