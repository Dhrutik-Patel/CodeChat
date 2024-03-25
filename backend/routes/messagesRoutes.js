import express from 'express';
import protectMiddleware from '../middleware/authMiddleware.js';
import { getMessages, sendMessage } from '../controllers/messagesController.js';

const router = express.Router();

router.route('/:chatID').get(protectMiddleware, getMessages);
router.route('/').post(protectMiddleware, sendMessage);

export default router;
