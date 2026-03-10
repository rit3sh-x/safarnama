import { View, Pressable, Modal, TouchableOpacity } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Reply, Copy, Pencil, Trash2, Pin, PinOff } from "lucide-react-native";
import type { Message } from "../../../types";
import { QUICK_REACTIONS } from "../../../constants";

interface MessageActionsModalProps {
    visible: boolean;
    message: Message | null;
    isOwn: boolean;
    isAdmin: boolean;
    currentUserId: string;
    onClose: () => void;
    onReply: () => void;
    onCopy: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onPin: () => void;
    onReaction: (emoji: string) => void;
}

export function MessageActionsModal({
    visible,
    message,
    isOwn,
    isAdmin,
    currentUserId,
    onClose,
    onReply,
    onCopy,
    onEdit,
    onDelete,
    onPin,
    onReaction,
}: MessageActionsModalProps) {
    if (!message) return null;

    const actions = [
        { label: "Reply", icon: Reply, onPress: onReply, show: true },
        { label: "Copy", icon: Copy, onPress: onCopy, show: true },
        { label: "Edit", icon: Pencil, onPress: onEdit, show: isOwn },
        {
            label: "Delete",
            icon: Trash2,
            onPress: onDelete,
            show: isOwn || isAdmin,
            destructive: true,
        },
        {
            label: message.pinnedAt ? "Unpin" : "Pin",
            icon: message.pinnedAt ? PinOff : Pin,
            onPress: onPin,
            show: isAdmin,
        },
    ];

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

                    <View className="flex-row justify-center gap-3 px-5 pb-4 border-b border-border">
                        {QUICK_REACTIONS.map(({ emoji }) => {
                            const hasReacted = message.reactions?.some(
                                (r) =>
                                    r.emoji === emoji &&
                                    r.userIds.includes(currentUserId)
                            );
                            return (
                                <TouchableOpacity
                                    key={emoji}
                                    onPress={() => onReaction(emoji)}
                                    className={`w-11 h-11 rounded-full items-center justify-center ${
                                        hasReacted ? "bg-primary" : "bg-muted"
                                    }`}
                                >
                                    <Text className="text-4">{emoji}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View className="pt-2">
                        {actions
                            .filter((a) => a.show)
                            .map((action) => (
                                <TouchableOpacity
                                    key={action.label}
                                    onPress={action.onPress}
                                    activeOpacity={0.6}
                                    className="flex-row items-center px-5 py-3.5 gap-3.5"
                                >
                                    <Icon
                                        as={action.icon}
                                        className={`size-5 ${
                                            action.destructive
                                                ? "text-destructive"
                                                : "text-foreground"
                                        }`}
                                    />
                                    <Text
                                        className={`text-base ${
                                            action.destructive
                                                ? "text-destructive"
                                                : "text-foreground"
                                        }`}
                                    >
                                        {action.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
