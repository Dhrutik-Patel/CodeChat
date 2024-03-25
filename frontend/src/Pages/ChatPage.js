import React from 'react';
import { useChat } from '../context/ChatProvider';
import { Box } from '@chakra-ui/react';
import SideDrawer from '../components/SideDrawer';
import UserChats from '../components/UserChats';
import ChatWindow from '../components/ChatWindow';

const ChatPage = () => {
    const [fetchAgain, setFetchAgain] = React.useState(false);
    const { user } = useChat();

    if (!user) {
        return null;
    }

    return (
        <div style={{ width: '100%' }}>
            <SideDrawer />

            <Box
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                width="100%"
                height="90vh"
                padding="1rem"
            >
                <UserChats
                    width="30%"
                    height="100%"
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                />
                <ChatWindow
                    width="70%"
                    height="100%"
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                />
            </Box>
        </div>
    );
};

export default ChatPage;
