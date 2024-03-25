import express from 'express';
import protectMiddleware from '../middleware/authMiddleware.js';
import {
    getAllChatsForUser,
    createOrGetOneOnOneChat,
    createGroupChat,
    renameGroupChat,
    addMembersToGroup,
    removeUsersFromGroup
} from '../controllers/chatController.js';

const router = express.Router();

router.route('/').get(protectMiddleware, getAllChatsForUser);
router.route('/').post(protectMiddleware, createOrGetOneOnOneChat);

router.route('/group').post(protectMiddleware, createGroupChat);
router.route('/rename-group').put(protectMiddleware, renameGroupChat);
router.route('/add-members').put(protectMiddleware, addMembersToGroup);
router.route('/remove-members').put(protectMiddleware, removeUsersFromGroup);

export default router;
