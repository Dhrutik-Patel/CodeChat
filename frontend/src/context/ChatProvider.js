import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const ChatContext = React.createContext();

const ChatProvider = ({ children }) => {
    const [user, setUser] = React.useState(null);
    const [selectedChat, setSelectedChat] = React.useState(null);
    const [chats, setChats] = React.useState([]);

    const history = useHistory();

    useEffect(() => {
        // Fetch user data from the local storage
        const user = localStorage.getItem('user');
        if (!user) {
            history.push('/');
        } else {
            setUser(JSON.parse(user));
        }
    }, [history]);

    // Add a new function to update the user data
    const updateUser = (user) => {
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
    };

    // Add the new function to update the selected chat
    const updateSelectedChat = (chat) => {
        setSelectedChat(chat);
    };

    // Add the new function to update the chats
    const updateChats = (chats) => {
        setChats(chats);
    };

    return (
        <ChatContext.Provider
            value={{
                user,
                updateUser,
                selectedChat,
                updateSelectedChat,
                chats,
                updateChats
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

const useChat = () => {
    const context = React.useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

export { ChatProvider, useChat };
