import { auth } from "@clerk/nextjs/server";

export const getRole = async () => {
    try {
        const { sessionClaims } = await auth();
        return (sessionClaims?.metadata as { role?: string })?.role;
    } catch (error) {
        console.log('ERROR WHILE FETCHING ROLE:', error);
    }
};

export const getCurrentUserId = async () => {
    try {
        const { userId } = await auth();
        return userId;
    } catch (error) {
        console.log('ERROR WHILE FETCHING USER ID:', error);
    }
};
