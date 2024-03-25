import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import messagesRoutes from './routes/messagesRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Create an express app
const app = express();
// Create an HTTP server using the express app
const server = createServer(app);
// Create a socket.io server using the HTTP server
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

// Load environment variables
dotenv.config({
    path: '../config.env'
});

// Connect to the database
connectDB();

// Allow requests from all origins
app.use(cors());

// Required to parse JSON bodies
app.use(express.json());

// User routes
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messagesRoutes);

// Error handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

io.on('connection', (socket) => {
    console.log('Connected to socket.io');

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit('connected');
    });

    socket.on('join-chat', (room) => {
        socket.join(room);
        console.log(`User joined room ${room}`);
    });

    socket.on('typing', (room) => {
        socket.to(room).emit('typing');
    });

    socket.on('stop-typing', (room) => {
        socket.to(room).emit('stop-typing');
    });

    socket.on('new-message', (message) => {
        let chat = message.chat;

        if (!chat.users) return console.log('Chat.users not defined');

        chat.users.forEach((user) => {
            if (user._id === message.sender._id) return;
            socket.in(user._id).emit('message-recieved', message);
        });
    });
});
