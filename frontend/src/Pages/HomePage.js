import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Container, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import Login from '../components/Auth/Login';
import Signup from '../components/Auth/Signup';

const HomePage = () => {
    const history = useHistory();

    // If the user is already logged in, redirect to the chat page
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            history.push('/chats');
        }
    }, [history]);

    return (
        <Container maxW="3xl" centerContent>
            <Box
                display="flex"
                justifyContent="center"
                p={3}
                bg="white"
                w="100%"
                m="40px 0 15px 0"
                borderRadius="lg"
                borderWidth="1px"
                textAlign="center"
            >
                <Text fontSize="3xl" fontWeight="500">
                    Welcome to the CodeChat!
                </Text>
            </Box>
            <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
                <Tabs isFitted variant="soft-rounded">
                    <TabList mb="1em">
                        <Tab>Login</Tab>
                        <Tab>Sign Up</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Login />
                        </TabPanel>
                        <TabPanel>
                            <Signup />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </Container>
    );
};

export default HomePage;
