import express from 'express';
import { registerUser, authUser, getUsers } from '../controllers/userController.js';
import protectMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protectMiddleware, getUsers);
router.route('/register').post(registerUser);
router.route('/login').post(authUser);

export default router;
