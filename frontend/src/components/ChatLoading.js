import { Stack } from '@chakra-ui/layout';
import { Skeleton } from '@chakra-ui/skeleton';

const ChatLoading = ({ numOfSkeleton }) => {
    return (
        <Stack>
            {/* <Skeleton height="45px" />
            <Skeleton height="45px" />
            <Skeleton height="45px" />
            <Skeleton height="45px" />
            <Skeleton height="45px" />
            <Skeleton height="45px" />
            <Skeleton height="45px" />
            <Skeleton height="45px" />
            <Skeleton height="45px" />
            <Skeleton height="45px" />
            <Skeleton height="45px" />
            <Skeleton height="45px" /> */}

            {[...Array(numOfSkeleton)].map((_, i) => (
                <Skeleton key={i} height="45px" />
            ))}
        </Stack>
    );
};

export default ChatLoading;
