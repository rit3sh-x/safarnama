import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";

import { signInWithGoogle, signUpWithEmail } from "../../hooks/auth-handlers";
import {
    AuthContainer,
    Divider,
    FooterLink,
    FormField,
    PrimaryButton,
    SocialButton,
} from "./elements";

const schema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

interface SignUpScreenProps {
    onNavigateLogin: () => void;
    onSuccess: () => void;
}

export function SignUpScreen({ onNavigateLogin, onSuccess }: SignUpScreenProps) {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = handleSubmit(({ name, email, password }) =>
        signUpWithEmail({
            name,
            email,
            password,
            fetchOptions: {
                onSuccess,
                onError: ({ error }) => console.error(error),
            },
        })
    );

    return (
        <AuthContainer title="Sign Up" subtitle="Create an account, it's free">
            <View>
                <FormField
                    control={control}
                    name="name"
                    label="Name"
                    placeholder="Your name"
                    error={errors.name}
                />
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

                <PrimaryButton label="Sign Up" onPress={onSubmit} loading={isSubmitting} />

                <Divider />

                <View className="flex-row justify-center gap-3">
                    <SocialButton onPress={signInWithGoogle} icon="G" />
                    <SocialButton onPress={() => { }} icon="𝕏" />
                </View>

                <FooterLink
                    text="Have account?"
                    linkText="Sign In"
                    onPress={onNavigateLogin}
                />
            </View>
        </AuthContainer>
    );
}