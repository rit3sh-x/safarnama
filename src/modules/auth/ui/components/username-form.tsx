import { Text } from "@/components/ui/text";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";

import { changeUsername } from "../../hooks/auth-handlers";
import { AuthContainer, FormField, PrimaryButton } from "./elements";

const schema = z.object({
    username: z
        .string()
        .min(3, "At least 3 characters")
        .max(20, "Max 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only"),
});

type FormData = z.infer<typeof schema>;

interface UsernameScreenProps {
    onSuccess?: () => void;
}

export function UsernameScreen({ onSuccess }: UsernameScreenProps) {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = handleSubmit(({ username }) =>
        changeUsername({
            username,
            fetchOptions: {
                onSuccess: () => {
                    console.log("Username updated!");
                    onSuccess?.();
                },
                onError: ({ error }) => console.error(error),
            },
        })
    );

    return (
        <AuthContainer
            title="Pick a username"
            subtitle="This is how others will find you"
        >
            <View>
                <FormField
                    control={control}
                    name="username"
                    label="Username"
                    placeholder="e.g. cool_user42"
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={errors.username}
                />

                <Text variant="muted" className="-mt-2 ml-1 mb-2">
                    3–20 characters · letters, numbers, underscores
                </Text>

                <PrimaryButton
                    label="Save Username"
                    onPress={onSubmit}
                    loading={isSubmitting}
                    className="mt-2"
                />
            </View>
        </AuthContainer>
    );
}