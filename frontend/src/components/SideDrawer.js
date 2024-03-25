import React, { useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
    Flex,
    Input,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Spinner,
    Text,
    Tooltip,
    useToast
} from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/hooks';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useChat } from '../context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useHistory } from 'react-router-dom';
import ChatLoading from './ChatLoading';
import UserListItem from './UserListItem';

const SideDrawer = () => {
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);

    const history = useHistory();
    const { user, updateSelectedChat, chats, updateChats } = useChat();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const handleSearch = async () => {
        // Check if search query is empty
        if (!search) {
            toast({
                title: 'Please enter a search query',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top'
            });
            setLoading(false);
            setSearchResults([]);
            return;
        }

        try {
            // Set loading to true
            setLoading(true);

            // Fetch users from the backend
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                }
            };
            const response = await fetch(`/api/user?search=${search}`, config);
            const data = await response.json();

            // Set search results to state
            setSearchResults(data);
            setLoading(false);
        } catch (error) {
            toast({
                title: 'An error occurred',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top'
            });
            setLoading(false);
            setSearchResults([]);
        }
    };

    // Access chat
    const accessChat = async (id) => {
        try {
            // Set loading to true
            setLoadingChat(true);

            // Post request to create chat
            const body = {
                userId: id
            };
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(body)
            };
            const response = await fetch('/api/chat', config);
            const data = await response.json();

            // Check if chat already exists
            if (!chats.find((chat) => chat._id === data._id)) {
                updateChats([...chats, data]);
            }

            updateSelectedChat(data);
            setLoadingChat(false);
            onClose();
        } catch (error) {
            toast({
                title: 'An error occurred',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top'
            });
            setLoadingChat(false);
        }
    };

    // Logout user
    const logoutUser = () => {
        localStorage.removeItem('user');
        history.push('/');
    };

    return (
        <>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                bg="white"
                w="100%"
                p="1rem"
            >
                {/* Input group for searching users */}
                <Tooltip
                    label="Search for users to start a conversation"
                    aria-label="Search for users to start a conversation"
                    hasArrow
                    placement="bottom"
                >
                    <Button variant="ghost" onClick={onOpen}>
                        <i className="fas fa-search"></i>
                        <Text display={{ base: 'none', md: 'flex' }} px={4}>
                            Search User
                        </Text>
                    </Button>
                </Tooltip>

                {/* Logo */}
                <Text fontSize="2xl" fontWeight="bold">
                    CodeChat
                </Text>

                <div>
                    {/* Notification */}
                    <Menu>
                        <MenuButton p={1}>
                            {/* <NotificationBadge count={notification.length} effect={Effect.SCALE} /> */}
                            <BellIcon fontSize="2xl" m={1} />
                        </MenuButton>
                        {/* <MenuList pl={2}></MenuList> */}
                    </Menu>

                    {/* User profile */}
                    <Menu>
                        <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
                            <Avatar size="sm" cursor="pointer" name={user.name} src={user.avatar} />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModal>
                            <MenuDivider />
                            <MenuItem onClick={logoutUser}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>

            <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    {/* Drawer header */}
                    <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
                    {/* Drawer body */}
                    <DrawerBody>
                        {/* Search input and button */}
                        <Flex alignItems="center" paddingBottom={2}>
                            <Input
                                placeholder="Search users by name or email"
                                marginRight={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button colorScheme="blue" onClick={handleSearch}>
                                Go
                            </Button>
                        </Flex>
                        {/* Display search results */}
                        {loading ? (
                            <ChatLoading numOfSkeleton={10} />
                        ) : (
                            // Map through search results and display user list items
                            searchResults?.map((user) => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => accessChat(user._id)}
                                />
                            ))
                        )}
                        {/* Display spinner while loading chat */}
                        {loadingChat && <Spinner marginLeft="auto" display="flex" />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default SideDrawer;
