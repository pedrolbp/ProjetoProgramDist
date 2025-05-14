import express from 'express';
import {
  registerUserController,
  loginController,
  forgotPasswordController,
} from '../controllers/userController.js';

import { confirmTokenController } from '../controllers/emailController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUserController);
router.post('/login', loginController);
router.get('/confirm-email', confirmTokenController);
router.post('/forgot-password', forgotPasswordController);


export default router;
