import expressAsyncHandler from 'express-async-handler';

import User from '../models/userModel.js';
import generateToken from '../config/generateToken.js';

// @desc    Register a new user
// @route   POST /api/user/register
// @access  Public
const registerUser = expressAsyncHandler(async (req, res) => {
    const { name, email, password, avatar } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please fill in all fields');
    }

    const user = await User.findOne({ email });
    if (user) {
        res.status(400);
        throw new Error('User already exists');
    }

    const newUser = new User({
        name,
        email,
        password,
        avatar
    });
    await newUser.save();

    if (newUser) {
        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            avatar: newUser.avatar,
            token: generateToken(newUser._id)
        });
    } else {
        res.status(400);
        throw new Error('Failed to create user');
    }
});

// @desc    Authenticate a user
// @route   POST /api/user/login
// @access  Public
const authUser = expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error('Please fill in all fields');
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id)
    });
});

// @desc    Get all users except the logged in user
// @route   GET /api/user
// @access  Private/Admin
const getUsers = expressAsyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
              $or: [
                  { name: { $regex: req.query.search, $options: 'i' } },
                  { email: { $regex: req.query.search, $options: 'i' } }
              ]
          }
        : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
});

export { registerUser, authUser, getUsers };
