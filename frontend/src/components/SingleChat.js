import { FormControl } from '@chakra-ui/form-control';
import { Input } from '@chakra-ui/input';
import { Box, Text } from '@chakra-ui/layout';
import { IconButton, Spinner, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowBackIcon } from '@chakra-ui/icons';
import ProfileModal from './ProfileModal';
import { useChat } from '../context/ChatProvider';
import { getSenderFull } from '../utils/chatLogic';
import UpdateGroupChatModal from './UpdateGroupChatModal';
import ScrollableChat from './ScrollableChat';
import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:5000';
let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);

    const toast = useToast();
    const { selectedChat, updateSelectedChat, user } = useChat();

    // const defaultOptions = {
    //     loop: true,
    //     autoplay: true,
    //     animationData: animationData,
    //     rendererSettings: {
    //         preserveAspectRatio: 'xMidYMid slice'
    //     }
    // };

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit('setup', user);
        socket.on('connected', () => setSocketConnected(true));
        socket.on('typing', () => setIsTyping(true));
        socket.on('stop-typing', () => setIsTyping(false));

        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        fetchMessages();

        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        socket.on('message-recieved', (newMessageRecieved) => {
            if (
                !selectedChatCompare || // if chat is not selected or doesn't match current chat
                selectedChatCompare._id !== newMessageRecieved.chat._id
            ) {
                // if (!notification.includes(newMessageRecieved)) {
                //     setNotification([newMessageRecieved, ...notification]);
                //     setFetchAgain(!fetchAgain);
                // }
            } else {
                setMessages([...messages, newMessageRecieved]);
            }
        });
    });

    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            setLoading(true);
            const { data } = await axios.get(`/api/messages/${selectedChat._id}`, config);
            setMessages(data);
            setLoading(false);

            socket.emit('join-room', selectedChat._id);
        } catch (error) {
            toast({
                title: 'Error Occured!',
                description: 'Failed to Load the Messages',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
        }
    };

    const sendMessage = async (event) => {
        if (event.key === 'Enter' && newMessage) {
            event.preventDefault();

            try {
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.token}`
                    }
                };

                const { data } = await axios.post(
                    '/api/messages',
                    { chatID: selectedChat._id, content: newMessage },
                    config
                );

                setMessages([...messages, data]);
                setNewMessage('');

                socket.emit('new-message', { chatID: selectedChat._id, message: data });
            } catch (error) {
                toast({
                    title: 'Error Occured!',
                    description: 'Failed to Send the Message',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'top'
                });
            }
        }
    };

    const typingHandler = (e) => {
        setNewMessage(e.target.value);
    };

    return (
        <>
            {selectedChat ? (
                <>
                    <Text
                        fontSize={{ base: '1.25rem', md: '1.5rem' }}
                        fontWeight="bold"
                        pb={3}
                        px={2}
                        w="100%"
                        display="flex"
                        justifyContent={{ base: 'space-between' }}
                        alignItems="center"
                    >
                        <IconButton
                            display={{ base: 'flex', md: 'none' }}
                            icon={<ArrowBackIcon />}
                            onClick={() => updateSelectedChat('')}
                        />
                        {messages &&
                            (!selectedChat.isGroupChat ? (
                                <>
                                    {selectedChat.chatName}
                                    <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                                </>
                            ) : (
                                <>
                                    {selectedChat.chatName.toUpperCase()}
                                    <UpdateGroupChatModal
                                        fetchMessages={fetchMessages}
                                        fetchAgain={fetchAgain}
                                        setFetchAgain={setFetchAgain}
                                    />
                                </>
                            ))}
                    </Text>
                    <Box
                        display="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        p={3}
                        bg="#E8E8E8"
                        w="100%"
                        h="100%"
                        borderRadius="lg"
                        overflowY="hidden"
                    >
                        {loading ? (
                            <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />
                        ) : (
                            <div className="messages">
                                <ScrollableChat messages={messages} />
                            </div>
                        )}

                        <FormControl onKeyDown={sendMessage} id="first-name" isRequired mt={3}>
                            <Input
                                variant="filled"
                                bg="#E0E0E0"
                                placeholder="Enter a message.."
                                value={newMessage}
                                onChange={typingHandler}
                            />
                        </FormControl>
                    </Box>
                </>
            ) : (
                <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                    <Text fontSize="2xl" pb={3}>
                        Select a Chat to Start Messaging
                    </Text>
                </Box>
            )}
        </>
    );
};

export default SingleChat;
