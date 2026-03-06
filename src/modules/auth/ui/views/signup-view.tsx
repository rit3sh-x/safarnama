import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { useEffect } from "react";
import { Image, View } from "react-native";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { SignUpScreen } from "../components/signup-form";
import { useRouter } from "expo-router";

export function SignUpView() {
    const router = useRouter();
    const translateY = useSharedValue(1000);

    const onNavigateLogin = () => {
        router.push("/(auth)/signin");
    }

    const onSuccess = () => {
        router.push("/(auth)/sign-up/create-username");
    }

    useEffect(() => {
        translateY.value = withSpring(0, {
            damping: 20,
            stiffness: 90,
        });
    }, [translateY]);

    return (
        <View className="flex-1 bg-background">
            <View className="absolute inset-0 justify-center items-center pt-16">
                <Image
                    source={require("@/assets/auth/booking.svg")}
                    className="w-[70%] h-[45%] opacity-90"
                    resizeMode="contain"
                />
            </View>

            <NativeOnlyAnimatedView
                className="absolute bottom-0 left-0 right-0 bg-background rounded-t-4xl shadow-lg shadow-black/10"
                style={[
                    {
                        transform: [{ translateY }],
                    },
                ]}
            >
                <SignUpScreen onNavigateLogin={onNavigateLogin} onSuccess={onSuccess} />
            </NativeOnlyAnimatedView>
        </View>
    );
}