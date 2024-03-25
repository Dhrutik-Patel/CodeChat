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

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [avatar, setAvatar] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);

    const toast = useToast();
    const history = useHistory();

    const toggleShowPassword = () => setShowPassword(!showPassword);
    const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    const postDetails = async (file) => {
        setAvatarLoading(true);

        // Check if a file is selected
        if (!file) {
            toast({
                title: 'No file selected',
                description: 'Please select a file to upload',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top'
            });
            setAvatarLoading(false);
            return;
        }

        // Check if the file is an image
        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
            toast({
                title: 'Invalid file type',
                description: 'Please select a valid file type (JPEG/PNG)',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top'
            });
            setAvatarLoading(false);
            return;
        }

        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', 'CodeChat');
        data.append('cloud_name', 'dztl6r0e6');

        const response = await fetch('https://api.cloudinary.com/v1_1/dztl6r0e6/image/upload', {
            method: 'POST',
            body: data
        });
        const uploadedFile = await response.json();

        setAvatar(uploadedFile.secure_url); // TODO: Check this
        setAvatarLoading(false);
    };

    const submitHandler = async () => {
        // Check if any field is empty
        if (!name || !email || !password || !confirmPassword) {
            toast({
                title: 'Fields cannot be empty',
                description: 'Please fill in all the fields',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top'
            });
            return;
        }

        // Check if the email is valid
        if (password !== confirmPassword) {
            toast({
                title: 'Passwords do not match',
                description: 'Please make sure both passwords match',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top'
            });
            return;
        }

        const response = await fetch('http://localhost:5000/api/user/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password,
                avatar
            })
        });

        const data = await response.json();

        if (data) {
            toast({
                title: 'Account created',
                description: 'Your account has been created successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'top'
            });

            // Store the data in local storage
            localStorage.setItem('user', JSON.stringify(data));

            // Redirect to the chat page
            history.push('/chats');
        } else {
            toast({
                title: 'An error occurred',
                description: data.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top'
            });
        }
    };

    return (
        <VStack spacing="5px">
            {/* Name */}
            <FormControl id="first-name" isRequired marginBottom="1rem">
                <FormLabel>Name</FormLabel>
                <Input placeholder="Enter Your Name" onChange={(e) => setName(e.target.value)} />
            </FormControl>

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

            {/* Confirm Password */}
            <FormControl id="confirm-password" isRequired marginBottom="1rem">
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup size="md">
                    <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={toggleShowConfirmPassword}>
                            {showConfirmPassword ? 'Hide' : 'Show'}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            {/* Profile Picture */}
            <FormControl id="avatar" marginBottom="1rem">
                <FormLabel>Upload your Picture</FormLabel>
                <Input
                    type="file"
                    p={1.5}
                    accept="image/*"
                    onChange={(e) => postDetails(e.target.files[0])}
                />
            </FormControl>

            {/* Submit Button */}
            <Button
                colorScheme="blue"
                width="100%"
                style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={avatarLoading}
            >
                Sign Up
            </Button>
        </VStack>
    );
};

export default Signup;
