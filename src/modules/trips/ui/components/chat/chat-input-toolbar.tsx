import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import {
    InputToolbar,
    Composer,
    Send,
    SendProps,
    InputToolbarProps,
    ComposerProps,
} from "react-native-gifted-chat";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
    SendHorizontal,
    Paperclip,
    X,
    Reply,
    Pencil,
} from "lucide-react-native";
import type { Message } from "../../../types";
import { cn } from "@/lib/utils";
import { ThemeColors } from "@/lib/theme";
import { ChatMessage } from "./types";

interface ChatInputToolbarProps {
    giftedProps: InputToolbarProps<ChatMessage>;
    colors: ThemeColors;
    bottomInset: number;
    replyTo: Message | null;
    editingMessage: Message | null;
    isUploading: boolean;
    onClearReply: () => void;
    onClearEdit: () => void;
}

export function ChatInputToolbar({
    giftedProps,
    colors,
    bottomInset,
    replyTo,
    editingMessage,
    isUploading,
    onClearReply,
    onClearEdit,
}: ChatInputToolbarProps) {
    if (isUploading) {
        return (
            <View
                style={{ paddingBottom: bottomInset }}
                className="bg-background border-t border-border py-4 items-center"
            >
                <ActivityIndicator color={colors.primary} />
                <Text className="text-xs text-muted-foreground mt-1">
                    Uploading image...
                </Text>
            </View>
        );
    }

    return (
        <View style={{ paddingBottom: bottomInset }}>
            {replyTo ? (
                <View className="bg-muted border-t border-border flex-row items-center px-4 py-2">
                    <Icon as={Reply} className="size-4 text-primary mr-2" />
                    <View className="flex-1">
                        <Text className="text-xs font-semibold text-primary">
                            {replyTo.sender.name}
                        </Text>
                        <Text
                            numberOfLines={1}
                            className="text-[13px] text-muted-foreground"
                        >
                            {replyTo.content}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onClearReply}>
                        <Icon as={X} className="size-5 text-muted-foreground" />
                    </TouchableOpacity>
                </View>
            ) : null}

            {editingMessage ? (
                <View className="bg-muted border-t border-border flex-row items-center px-4 py-2">
                    <Icon as={Pencil} className="size-4 text-primary mr-2" />
                    <View className="flex-1">
                        <Text className="text-xs font-semibold text-primary">
                            Editing message
                        </Text>
                        <Text
                            numberOfLines={1}
                            className="text-[13px] text-muted-foreground"
                        >
                            {editingMessage.content}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onClearEdit}>
                        <Icon as={X} className="size-5 text-muted-foreground" />
                    </TouchableOpacity>
                </View>
            ) : null}

            <InputToolbar
                {...giftedProps}
                containerStyle={{
                    backgroundColor: colors.background,
                    borderTopWidth: replyTo || editingMessage ? 0 : 1,
                    borderTopColor: colors.border,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                }}
            />
        </View>
    );
}

interface ChatComposerProps {
    giftedProps: ComposerProps;
    colors: ThemeColors;
    editingMessage: Message | null;
    editText: string;
    onEditTextChange: (text: string) => void;
}

export function ChatComposer({
    giftedProps,
    colors,
    editingMessage,
    editText,
    onEditTextChange,
}: ChatComposerProps) {
    return (
        <Composer
            {...giftedProps}
            {...(editingMessage ? { text: editText } : {})}
            textInputProps={{
                ...giftedProps.textInputProps,
                placeholder: editingMessage ? "Edit message..." : "Message...",
                placeholderTextColor: colors.mutedForeground,
                style: {
                    backgroundColor: colors.muted,
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingTop: 10,
                    paddingBottom: 10,
                    marginRight: 8,
                    fontSize: 15,
                    lineHeight: 20,
                    color: colors.foreground,
                },
                ...(editingMessage
                    ? { onChangeText: onEditTextChange }
                    : {}),
            }}
        />
    );
}

export function ChatActions({ onPress }: { onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="justify-center items-center ml-1 mb-2 w-9 h-9"
        >
            <Icon as={Paperclip} className="size-5 text-muted-foreground" />
        </TouchableOpacity>
    );
}

export function ChatSendButton({ giftedProps }: { giftedProps: SendProps<ChatMessage> }) {
    const isDisabled = !giftedProps.text || giftedProps.text.trim().length === 0;

    return (
        <Send
            {...giftedProps}
            containerStyle={{
                justifyContent: "center",
                alignItems: "center",
                marginRight: 4,
                marginBottom: 4,
                borderRadius: 999,
                overflow: "hidden",
            }}
        >
            <View
                pointerEvents={isDisabled ? "none" : "auto"}
                className={`w-10 h-10 rounded-full items-center justify-center ${isDisabled ? "bg-muted opacity-50" : "bg-primary"
                    }`}
            >
                <Icon
                    as={SendHorizontal}
                    className={cn("size-5", isDisabled ? "text-muted-foreground" : "text-primary-foreground")}
                />
            </View>
        </Send>
    );
}
