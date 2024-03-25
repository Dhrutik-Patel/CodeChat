import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
    FormControl,
    Input,
    useToast,
    Box
} from '@chakra-ui/react';
import axios from 'axios';
import { useState } from 'react';
import { useChat } from '../context/ChatProvider';
import UserListItem from './UserListItem';
import ChatLoading from './ChatLoading';
import UserBadgeItem from './UserBadgeItem';

const GroupChatModal = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const { user, chats, updateChats } = useChat();

    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) {
            toast({
                title: 'User already added',
                status: 'warning',
                duration: 3000,
                isClosable: true,
                position: 'top'
            });
            return;
        }

        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            setSearchResult([]);
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };
            const { data } = await axios.get(`/api/user?search=${search}`, config);

            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: 'Error Occured!',
                description: 'Failed to Load the Search Results',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top'
            });
        }
    };

    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
    };

    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) {
            toast({
                title: 'Please fill in the required fields',
                status: 'warning',
                duration: 3000,
                isClosable: true,
                position: 'top'
            });
            return;
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };
            const { data } = await axios.post(
                `/api/chat/group`,
                {
                    chatName: groupChatName,
                    users: JSON.stringify(selectedUsers.map((u) => u._id))
                },
                config
            );

            updateChats([data, ...chats]);
            onClose();

            toast({
                title: 'Chat Created Successfully!',
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'top'
            });
        } catch (error) {
            toast({
                title: 'Error Occured!',
                description: error.response.data,
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top'
            });
        }
    };

    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <Modal onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader fontSize="1.5rem" display="flex" justifyContent="center">
                        Create Group Chat
                    </ModalHeader>

                    <ModalCloseButton />

                    <ModalBody display="flex" flexDir="column" alignItems="center">
                        <FormControl>
                            <Input
                                placeholder="Group Chat Name"
                                mb={3}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder="Search Users"
                                mb={1}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </FormControl>
                        <Box w="100%" display="flex" flexWrap="wrap">
                            {selectedUsers.map((u) => (
                                <UserBadgeItem
                                    key={u._id}
                                    user={u}
                                    handleFunction={() => handleDelete(u)}
                                />
                            ))}
                        </Box>
                        {loading ? (
                            <ChatLoading numOfSkeleton={3} />
                        ) : (
                            searchResult
                                ?.slice(0, 5)
                                .map((user) => (
                                    <UserListItem
                                        key={user._id}
                                        user={user}
                                        handleFunction={() => handleGroup(user)}
                                    />
                                ))
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button onClick={handleSubmit} colorScheme="blue">
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default GroupChatModal;
