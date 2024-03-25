import asyncHandler from 'express-async-handler';

import Chat from '../models/chatModel.js';
import User from '../models/userModel.js';

// @desc    Get all chats for the current user
// @route   GET /api/chats
// @access  Private
const getAllChatsForUser = asyncHandler(async (req, res) => {
    // Find all chats where the current user is present
    const chats = await Chat.find({
        users: req.user._id
    })
        .populate('users', '-password') // Attach the users to the chat
        .populate('groupAdmin', '-password') // Attach the group admin to the chat
        .populate('latestMessage') // Attach the last message to the chat
        .sort({ updatedAt: -1 }); // Sort the chats by the latest message (descending order)

    // Populate the sender of the latest message
    const populatedChats = await User.populate(chats, {
        path: 'latestMessage.sender',
        select: '-password'
    });

    res.status(200); // OK
    res.json(populatedChats);
});

// @desc    Create or get one-on-one chat
// @route   POST /api/chats
// @access  Private
const createOrGetOneOnOneChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if the chat with the user already exists
    let chat = await Chat.findOne({
        isGroupChat: false,
        users: {
            $all: [req.user._id, userId] // Find a chat where both users are present
        }
    })
        .populate('users', '-password') // Attach the users to the chat
        .populate('latestMessage'); // Attach the last message to the chat

    // Populate the sender of the latest message
    chat = await User.populate(chat, { path: 'latestMessage.sender', select: '-password' });

    // If the chat exists, return it
    if (chat) {
        return res.json(chat);
    }

    // If the chat doesn't exist, create a new one
    chat = await Chat.create({
        chatName: user.name,
        isGroupChat: false,
        users: [req.user._id, userId]
    });

    // Populate the users and the latest message
    chat = await Chat.populate(chat, [
        { path: 'users', select: '-password' },
        { path: 'latestMessage' }
    ]);

    // Populate the sender of the latest message
    chat = await User.populate(chat, { path: 'latestMessage.sender', select: '-password' });

    res.status(201).json(chat);
});

// @desc    Create a group chat
// @route   POST /api/chats/group
// @access  Private
const createGroupChat = asyncHandler(async (req, res) => {
    const { chatName, users } = req.body;
    const parsedUsers = JSON.parse(users);

    // More than one user must be present in the group
    if (parsedUsers.length < 2) {
        res.status(400);
        throw new Error('At least two users are required to create a group chat');
    }

    // Create a group chat
    const chat = await Chat.create({
        chatName,
        isGroupChat: true,
        users: [req.user._id, ...parsedUsers],
        groupAdmin: req.user._id
    });

    // Populate the users and the latest message
    const populatedChat = await Chat.populate(chat, [
        { path: 'users', select: '-password' },
        { path: 'groupAdmin', select: '-password' },
        { path: 'latestMessage' }
    ]);

    // Populate the sender of the latest message
    const populatedChatWithSender = await User.populate(populatedChat, {
        path: 'latestMessage.sender',
        select: '-password'
    });

    res.status(201).json(populatedChatWithSender);
});

// @desc    Rename a group chat
// @route   PUT /api/chats/rename-group
// @access  Private
const renameGroupChat = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    // Find the chat by ID
    const chat = await Chat.findById(chatId);

    // Check if the chat exists
    if (!chat) {
        res.status(404);
        throw new Error('Chat not found');
    }

    // Check if the user is the group admin
    if (chat.groupAdmin._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('You are not authorized to rename this group chat');
    }

    // Update the chat name
    chat.chatName = chatName;
    await chat.save();

    // Populate the users and the latest message
    const populatedChat = await Chat.populate(chat, [
        { path: 'users', select: '-password' },
        { path: 'groupAdmin', select: '-password' },
        { path: 'latestMessage' }
    ]);

    // Populate the sender of the latest message
    const populatedChatWithSender = await User.populate(populatedChat, {
        path: 'latestMessage.sender',
        select: '-password'
    });

    res.status(200).json(populatedChatWithSender);
});

// @desc    Add members to a group chat
// @route   PUT /api/chats/add-members
// @access  Private
const addMembersToGroup = asyncHandler(async (req, res) => {
    const { chatId, users } = req.body;
    const parsedUsers = JSON.parse(users);

    // Find the chat by ID
    const chat = await Chat.findById(chatId);

    // Check if the chat exists
    if (!chat) {
        res.status(404);
        throw new Error('Chat not found');
    }

    // Check if the user is the group admin
    if (chat.groupAdmin._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('You are not authorized to add members to this group chat');
    }

    // Add the new members to the chat
    chat.users = [...chat.users, ...parsedUsers];
    await chat.save();

    // Populate the users and the latest message
    const populatedChat = await Chat.populate(chat, [
        { path: 'users', select: '-password' },
        { path: 'groupAdmin', select: '-password' },
        { path: 'latestMessage' }
    ]);

    // Populate the sender of the latest message
    const populatedChatWithSender = await User.populate(populatedChat, {
        path: 'latestMessage.sender',
        select: '-password'
    });

    res.status(200).json(populatedChatWithSender);
});

// @desc    remove user from group chat
// @route   PUT /api/chats/remove-members
// @access  Private
const removeUsersFromGroup = asyncHandler(async (req, res) => {
    const { chatId, users } = req.body;
    const parsedUsers = JSON.parse(users);

    // Find the chat by ID
    const chat = await Chat.findById(chatId);

    // Check if the chat exists
    if (!chat) {
        res.status(404);
        throw new Error('Chat not found');
    }

    // Check if the user is the group admin
    if (chat.groupAdmin._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('You are not authorized to remove members from this group chat');
    }

    // Remove the users from the chat
    chat.users = chat.users.filter((user) => !parsedUsers.includes(user._id.toString()));
    await chat.save();

    // Populate the users and the latest message
    const populatedChat = await Chat.populate(chat, [
        { path: 'users', select: '-password' },
        { path: 'groupAdmin', select: '-password' },
        { path: 'latestMessage' }
    ]);

    // Populate the sender of the latest message
    const populatedChatWithSender = await User.populate(populatedChat, {
        path: 'latestMessage.sender',
        select: '-password'
    });

    res.status(200).json(populatedChatWithSender);
});

export {
    getAllChatsForUser,
    createOrGetOneOnOneChat,
    createGroupChat,
    renameGroupChat,
    addMembersToGroup,
    removeUsersFromGroup
};
