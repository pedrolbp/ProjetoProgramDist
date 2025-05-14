import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getInfoUserController);
router.get('/admin', isAdmin, getAdminPanelController);


export default router;
