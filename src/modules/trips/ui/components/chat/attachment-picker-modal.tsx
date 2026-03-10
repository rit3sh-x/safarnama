import { View, Pressable, Modal, TouchableOpacity } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Image as ImageIcon, Camera } from "lucide-react-native";

interface AttachmentPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onPickImage: () => void;
    onTakePhoto: () => void;
}

export function AttachmentPickerModal({
    visible,
    onClose,
    onPickImage,
    onTakePhoto,
}: AttachmentPickerModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                onPress={onClose}
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    justifyContent: "flex-end",
                }}
            >
                <Pressable
                    onPress={(e) => e.stopPropagation()}
                    className="bg-card rounded-t-[20px] pb-8"
                >
                    <View className="w-9 h-1 rounded-full bg-border self-center mt-2.5 mb-4" />

                    <TouchableOpacity
                        onPress={onPickImage}
                        activeOpacity={0.6}
                        className="flex-row items-center px-5 py-3.5 gap-3.5"
                    >
                        <Icon
                            as={ImageIcon}
                            className="size-5 text-foreground"
                        />
                        <Text className="text-base text-foreground">
                            Choose from Gallery
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onTakePhoto}
                        activeOpacity={0.6}
                        className="flex-row items-center px-5 py-3.5 gap-3.5"
                    >
                        <Icon as={Camera} className="size-5 text-foreground" />
                        <Text className="text-base text-foreground">
                            Take Photo
                        </Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
