import { Stack } from "expo-router";

export default function AuthLayout() {
    return (
        <Stack
            initialRouteName="signin"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="signin" />
            <Stack.Screen name="sign-up/create-account" />
            <Stack.Screen name="sign-up/create-username" />
        </Stack>
    );
}