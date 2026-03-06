import { useAuthentication } from "@/modules/auth/context/auth-context";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useUploadFileToConvex } from "@/lib/utils";
import { useState } from "react";
import { changeUsername } from "@/modules/auth/hooks/auth-handlers";

const Page = () => {
    const { user } = useAuthentication();
    const uploadFile = useUploadFileToConvex();
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

    const testUpload = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (result.canceled || !result.assets[0]) return;

        try {
            const response = await fetch(result.assets[0].uri);
            const blob = await response.blob();
            const file = new File([blob], "test.jpg", { type: "image/jpeg" });
            const { storageId, url } = await uploadFile(file);
            console.log("Upload success, storageId:", storageId, "url:", url);
            setUploadedUrl(url);
            await changeUsername({
                username: "hello",
                imageUrl: url ?? undefined,
            })
        } catch (e) {
            console.error("Upload failed:", e);
        }
    };

    return (
        <View className="flex-1 w-full items-center justify-center gap-4">
            <Text className="text-foreground text-lg">Dashboard</Text>
            <Text className="text-muted-foreground">user.image: {user?.image ?? "none"}</Text>

            {user?.image && (
                <View className="items-center gap-1">
                    <Text className="text-muted-foreground text-sm">Profile image:</Text>
                    <Image
                        source={{ uri: user.image }}
                        style={{ width: 96, height: 96, borderRadius: 48 }}
                        contentFit="cover"
                    />
                </View>
            )}

            <TouchableOpacity
                onPress={testUpload}
                className="bg-primary px-6 py-3 rounded-lg"
            >
                <Text className="text-primary-foreground font-medium">Test Upload</Text>
            </TouchableOpacity>

            {uploadedUrl && (
                <View className="items-center gap-1">
                    <Text className="text-muted-foreground text-sm">Test upload result:</Text>
                    <Image
                        source={{ uri: uploadedUrl }}
                        style={{ width: 96, height: 96, borderRadius: 48 }}
                        contentFit="cover"
                    />
                </View>
            )}
        </View>
    );
};

export default Page;