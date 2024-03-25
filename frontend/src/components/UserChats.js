import React, { useEffect, useState } from 'react';
import { useChat } from '../context/ChatProvider';
import { Box, Stack, Text, useToast, Button, Avatar } from '@chakra-ui/react';
import ChatLoading from './ChatLoading';
import { AddIcon } from '@chakra-ui/icons';
import GroupChatModal from './GroupChatModal';

const UserChats = ({ fetchAgain, setFetchAgain }) => {
    const [loggedInUser, setLoggedInUser] = useState();
    const { user, selectedChat, chats, updateSelectedChat, updateChats } = useChat();
    const toast = useToast();

    useEffect(() => {
        const fetchUserChats = async () => {
            try {
                const response = await fetch('/api/chat', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.token}`
                    }
                });
                const data = await response.json();
                updateChats(data);
            } catch (error) {
                toast({
                    title: 'An error occurred.',
                    description: error.message,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'top'
                });
            }
        };

        setLoggedInUser(JSON.parse(localStorage.getItem('user')));
        fetchUserChats();
    }, [fetchAgain]);

    return (
        <Box
            display={{ base: selectedChat ? 'none' : 'flex', md: 'flex' }}
            flexDir="column"
            alignItems="center"
            padding={3}
            background="white"
            width={{ base: '100%', md: '25%' }}
            borderRadius="lg"
            borderWidth="1px"
        >
            <Box
                pb={3}
                px={3}
                fontSize={{ base: '1rem', md: '1.5rem' }}
                fontWeight="bold"
                display="flex"
                w="100%"
                justifyContent="space-between"
                alignItems="center"
            >
                My Chats
                <GroupChatModal>
                    <Button
                        display="flex"
                        fontSize={{ base: '1rem', md: '0.75rem', lg: '1rem' }}
                        rightIcon={<AddIcon />}
                    >
                        New Group Chat
                    </Button>
                </GroupChatModal>
            </Box>
            <Box
                display="flex"
                flexDirection="column"
                p={3}
                bg="#F8F8F8"
                w="100%"
                h="100%"
                borderRadius="lg"
            >
                {chats ? (
                    <Stack>
                        {chats.map((chat) => (
                            <Box
                                key={chat._id}
                                onClick={() => updateSelectedChat(chat)}
                                cursor="pointer"
                                bg={selectedChat === chat ? '#38B2AC' : '#E8E8E8'}
                                color={selectedChat === chat ? 'white' : 'black'}
                                px={3}
                                py={3}
                                borderRadius="lg"
                            >
                                <Text>{chat.chatName}</Text>
                                {chat.latestMessage && (
                                    <Text fontSize="xs">
                                        <b>{chat.latestMessage.sender.name} : </b>
                                        {chat.latestMessage.content.length > 50
                                            ? `${chat.latestMessage.content.substring(0, 51)}...`
                                            : chat.latestMessage.content}
                                    </Text>
                                )}
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <ChatLoading numOfSkeleton={10} />
                )}
            </Box>
        </Box>
    );
};

export default UserChats;
