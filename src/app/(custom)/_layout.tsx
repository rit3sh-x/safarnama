import { Stack } from "expo-router";
import { Authenticated } from "convex/react";

export default function CustomLayout() {
    return (
        <Authenticated>
            <Stack screenOptions={{ headerShown: false }} />
        </Authenticated>
    );
}
