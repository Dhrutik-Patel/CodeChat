import asyncHandler from 'express-async-handler';
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';
import Chat from '../models/chatModel.js';

// @desc	Get all messages
// @route	GET /api/messages/:chatID
// @access	Private
const getMessages = asyncHandler(async (req, res) => {
    const chatID = req.params.chatID;

    if (!chatID) {
        res.status(400);
        throw new Error('Invalid data');
    }

    const messages = await Message.find({ chat: req.params.chatId })
        .populate('sender', 'name pic email')
        .populate('chat');
    res.json(messages);
});

// @desc	Send a message
// @route	POST /api/messages
// @access	Private
const sendMessage = asyncHandler(async (req, res) => {
    const { chatID, content } = req.body;

    if (!chatID || !content) {
        res.status(400);
        throw new Error('Invalid data');
    }

    let newMessage = {
        chatID,
        content,
        sender: req.user._id
    };

    let message = await Message.create(newMessage);
    message = await message.populate('sender', 'name avatar');
    message = await message.populate('chat');
    message = await User.populate(message, { path: 'chat.users', select: 'name avatar' });

    await Chat.findByIdAndUpdate(chatID, {
        latestMessage: message._id
    });

    res.json(message);
});

export { getMessages, sendMessage };
