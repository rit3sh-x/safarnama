import { Text } from "@/components/ui/text";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { TouchableOpacity, View } from "react-native";
import { z } from "zod";
import { useState } from "react";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";

import { changeUsername } from "../../hooks/auth-handlers";
import { useUploadFileToConvex } from "@/lib/utils";
import { AuthContainer, FormField, PrimaryButton } from "./elements";
import { MAX_FILE_SIZE } from "@/lib/constants";

const schema = z.object({
    username: z
        .string()
        .min(3, "At least 3 characters")
        .max(20, "Max 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only"),
});

type FormData = z.infer<typeof schema>;

export function UsernameForm() {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const uploadFile = useUploadFileToConvex();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const pickImage = async () => {
        setImageError(null);
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    };

    const onSubmit = handleSubmit(async ({ username }) => {
        setImageError(null);
        try {
            let imageUrl: string | undefined;

            if (imageUri) {
                const response = await fetch(imageUri);
                const blob = await response.blob();

                if (blob.size > MAX_FILE_SIZE) {
                    setImageError("Image must be under 1 MB");
                    return;
                }

                const file = new File([blob], "avatar.jpg", {
                    type: "image/jpeg",
                });
                const { url } = await uploadFile(file);
                imageUrl = url ?? undefined;
            }

            await changeUsername({
                username,
                imageUrl,
                fetchOptions: {
                    onError: ({ error }) => {
                        console.error(error);
                        setImageError("Failed to upload image");
                    },
                },
            });
        } catch (error) {
            console.error("Submit failed:", error);
            setImageError("Something went wrong. Please try again.");
        }
    });

    return (
        <AuthContainer
            title="Pick a username"
            subtitle="This is how others will find you"
        >
            <View>
                <View className="items-center mb-6">
                    <TouchableOpacity onPress={pickImage}>
                        <View
                            className={`w-24 h-24 rounded-full bg-muted items-center justify-center overflow-hidden border-2 ${imageError ? "border-destructive" : "border-border"}`}
                        >
                            {imageUri ? (
                                <Image
                                    source={{ uri: imageUri }}
                                    style={{ width: "100%", height: "100%" }}
                                    contentFit="cover"
                                />
                            ) : (
                                <Icon
                                    as={Camera}
                                    className="text-muted-foreground size-8"
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                    <Text
                        variant="small"
                        className="text-muted-foreground mt-2"
                    >
                        Add a photo (optional)
                    </Text>
                    {imageError && (
                        <Text
                            variant="small"
                            className="text-destructive mt-1 text-center"
                        >
                            {imageError}
                        </Text>
                    )}
                </View>

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
                    3-20 characters, letters, numbers, underscores
                </Text>

                <PrimaryButton
                    label="Save"
                    onPress={onSubmit}
                    loading={isSubmitting}
                    className="mt-2"
                />
            </View>
        </AuthContainer>
    );
}
