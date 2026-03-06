import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";

import { signInWithEmail, signInWithGoogle } from "../../hooks/auth-handlers";
import {
    AuthContainer,
    Divider,
    FooterLink,
    FormField,
    PrimaryButton,
    SocialButton,
} from "./elements";

const schema = z.object({
    email: z.email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

interface LoginScreenProps {
    onNavigateSignUp: () => void;
}

export function LoginScreen({ onNavigateSignUp }: LoginScreenProps) {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = handleSubmit(({ email, password }) =>
        signInWithEmail({
            email,
            password,
            fetchOptions: {
                onSuccess: () => console.log("Signed in!"),
                onError: ({ error }) => console.error(error),
            },
        })
    );

    return (
        <AuthContainer title="Sign In" subtitle="Welcome back">
            <View>
                <FormField
                    control={control}
                    name="email"
                    label="Email"
                    placeholder="youremail@yahoo.com"
                    keyboardType="email-address"
                    error={errors.email}
                />
                <FormField
                    control={control}
                    name="password"
                    label="Password"
                    placeholder="••••••••"
                    secureTextEntry
                    secureToggle
                    error={errors.password}
                />

                <PrimaryButton label="Sign In" onPress={onSubmit} loading={isSubmitting} />

                <Divider />

                <View className="flex-row justify-center gap-3">
                    <SocialButton onPress={signInWithGoogle} icon="G" />
                    <SocialButton onPress={() => { }} icon="𝕏" />
                </View>

                <FooterLink
                    text="No account?"
                    linkText="Sign Up"
                    onPress={onNavigateSignUp}
                />
            </View>
        </AuthContainer>
    );
}