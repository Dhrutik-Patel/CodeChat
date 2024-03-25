import React, { useState } from 'react';
import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Button,
    useToast
} from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const toast = useToast();
    const history = useHistory();

    const toggleShowPassword = () => setShowPassword(!showPassword);

    const submitHandler = async () => {
        // Check if email and password are not empty
        if (!email || !password) {
            toast({
                title: 'Error',
                description: 'Please fill in all fields',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top'
            });
            return;
        }

        // Send login request
        const response = await fetch('/api/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data) {
            toast({
                title: 'Success',
                description: 'Logged in successfully',
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'top'
            });

            // Set user in local storage
            localStorage.setItem('user', JSON.stringify(data));

            // Redirect to chat page
            history.push('/chats');
        } else {
            toast({
                title: 'Error',
                description: 'Invalid email or password',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top'
            });
        }
    };

    return (
        <VStack spacing="5px">
            {/* Email */}
            <FormControl id="email" isRequired marginBottom="1rem">
                <FormLabel>Email Address</FormLabel>
                <Input
                    type="email"
                    placeholder="Enter Your Email Address"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </FormControl>

            {/* Password */}
            <FormControl id="password" isRequired marginBottom="1rem">
                <FormLabel>Password</FormLabel>
                <InputGroup size="md">
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={toggleShowPassword}>
                            {showPassword ? 'Hide' : 'Show'}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            {/* Submit Button */}
            <Button
                colorScheme="blue"
                width="100%"
                style={{ marginTop: 15 }}
                onClick={submitHandler}
            >
                Login
            </Button>
        </VStack>
    );
};

export default Login;
