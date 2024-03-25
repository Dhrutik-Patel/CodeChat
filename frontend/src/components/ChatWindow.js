import { Box } from '@chakra-ui/react';
import React from 'react';
import { useChat } from '../context/ChatProvider';
import SingleChat from './SingleChat';

const ChatWindow = ({ fetchAgain, setFetchAgain }) => {
    const { selectedChat } = useChat();

    return (
        <Box
            display={{ base: selectedChat ? 'flex' : 'none', md: 'flex' }}
            alignItems="center"
            flexDir="column"
            p={3}
            bg="white"
            w={{ base: '100%', md: '70%' }}
            borderRadius="lg"
        >
            <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        </Box>
    );
};

export default ChatWindow;
