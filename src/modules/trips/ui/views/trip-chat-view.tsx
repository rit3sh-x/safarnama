import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Alert } from "react-native";
import {
    GiftedChat,
    Day,
    SystemMessage,
    MessageImage,
} from "react-native-gifted-chat";
import type {
    BubbleProps,
    InputToolbarProps,
    ComposerProps,
    SendProps,
    DayProps,
    SystemMessageProps,
    MessageImageProps,
} from "react-native-gifted-chat";
import { Icon } from "@/components/ui/icon";
import { ChevronDown } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/lib/theme";
import {
    useMessages,
    useTripDetails,
    useSendMessage,
    useEditMessage,
    useDeleteMessage,
    useAddReaction,
    useRemoveReaction,
    usePinMessage,
    useUnpinMessage,
    useMarkRead,
    useUploadChatImage,
} from "../../hooks/use-messages";
import { useAuthentication } from "@/modules/auth/context/auth-context";
import * as ImagePicker from "expo-image-picker";
import type { TripId, Message } from "../../types";
import {
    MessageBubble,
    ChatInputToolbar,
    ChatComposer,
    ChatActions,
    ChatSendButton,
    MessageActionsModal,
    AttachmentPickerModal,
    toGiftedMessage,
} from "../components/chat";
import type { ChatMessage } from "../components/chat";

interface TripChatViewProps {
    tripId: TripId;
}

export function TripChatView({ tripId }: TripChatViewProps) {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const { user } = useAuthentication();
    const { messages, isLoading, canLoadMore, loadMore } = useMessages(tripId);
    const { trip } = useTripDetails(tripId);
    const { mutate: sendMessage } = useSendMessage();
    const { mutate: editMessage } = useEditMessage();
    const { mutate: deleteMessage } = useDeleteMessage();
    const { mutate: addReaction } = useAddReaction();
    const { mutate: removeReaction } = useRemoveReaction();
    const { mutate: pinMessage } = usePinMessage();
    const { mutate: unpinMessage } = useUnpinMessage();
    const markRead = useMarkRead(tripId);
    const { upload, isUploading } = useUploadChatImage();

    const currentUserId = user?._id ?? "";
    const isAdmin = trip?.role === "owner";

    const [replyTo, setReplyTo] = useState<Message | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(
        null
    );
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    const [editText, setEditText] = useState("");
    const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);

    useEffect(() => {
        if (messages.length > 0) markRead();
    }, [messages.length, markRead]);

    const giftedMessages: ChatMessage[] = useMemo(
        () => messages.map((m) => toGiftedMessage(m, currentUserId)),
        [messages, currentUserId]
    );

    const messageMap = useMemo(() => {
        const map = new Map<string, Message>();
        for (const m of messages) map.set(m._id, m);
        return map;
    }, [messages]);

    const onSend = useCallback(
        (newMessages: ChatMessage[] = []) => {
            const text = newMessages[0]?.text;
            if (!text) return;

            if (editingMessage) {
                editMessage({
                    messageId: editingMessage._id,
                    content: text,
                });
                setEditingMessage(null);
                return;
            }

            sendMessage({
                tripId,
                content: text,
                ...(replyTo ? { replyToId: replyTo._id } : {}),
            });
            setReplyTo(null);
        },
        [tripId, sendMessage, editMessage, replyTo, editingMessage]
    );

    const handlePickImage = useCallback(async () => {
        setShowAttachmentPicker(false);
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.8,
            allowsEditing: true,
        });

        if (result.canceled || !result.assets[0]) return;

        const uploaded = await upload(result.assets[0].uri);
        if (uploaded?.url) {
            sendMessage({
                tripId,
                content: "\uD83D\uDCF7 Photo",
                attachmentUrl: uploaded.url,
                attachmentType: "image",
            });
        }
    }, [tripId, sendMessage, upload]);

    const handleTakePhoto = useCallback(async () => {
        setShowAttachmentPicker(false);
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
            Alert.alert(
                "Permission needed",
                "Camera permission is required to take photos."
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
            allowsEditing: true,
        });

        if (result.canceled || !result.assets[0]) return;

        const uploaded = await upload(result.assets[0].uri);
        if (uploaded?.url) {
            sendMessage({
                tripId,
                content: "\uD83D\uDCF7 Photo",
                attachmentUrl: uploaded.url,
                attachmentType: "image",
            });
        }
    }, [tripId, sendMessage, upload]);

    const handleLongPress = useCallback((_context: unknown, message: unknown) => {
        const orig = (message as ChatMessage).originalMessage;
        if (!orig || orig.deletedAt || orig.type !== "message") return;
        setSelectedMessage(orig);
    }, []);

    const handleReply = useCallback(() => {
        if (selectedMessage) setReplyTo(selectedMessage);
        setSelectedMessage(null);
    }, [selectedMessage]);

    const handleCopy = useCallback(() => {
        setSelectedMessage(null);
    }, []);

    const handleEdit = useCallback(() => {
        if (selectedMessage) {
            setEditingMessage(selectedMessage);
            setEditText(selectedMessage.content);
        }
        setSelectedMessage(null);
    }, [selectedMessage]);

    const handleDelete = useCallback(() => {
        if (!selectedMessage) return;
        Alert.alert("Delete Message", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () =>
                    deleteMessage({ messageId: selectedMessage._id }),
            },
        ]);
        setSelectedMessage(null);
    }, [selectedMessage, deleteMessage]);

    const handlePin = useCallback(() => {
        if (!selectedMessage) return;
        if (selectedMessage.pinnedAt) {
            unpinMessage({ messageId: selectedMessage._id });
        } else {
            pinMessage({ messageId: selectedMessage._id });
        }
        setSelectedMessage(null);
    }, [selectedMessage, pinMessage, unpinMessage]);

    const handleReaction = useCallback(
        (emoji: string) => {
            if (!selectedMessage) return;
            const existing = selectedMessage.reactions?.find(
                (r) => r.emoji === emoji && r.userIds.includes(currentUserId)
            );
            if (existing) {
                removeReaction({ messageId: selectedMessage._id, emoji });
            } else {
                addReaction({ messageId: selectedMessage._id, emoji });
            }
            setSelectedMessage(null);
        },
        [selectedMessage, addReaction, removeReaction, currentUserId]
    );

    const renderBubble = useCallback(
        (props: BubbleProps<ChatMessage>) => (
            <MessageBubble
                props={props}
                colors={colors}
                currentUserId={currentUserId}
                messageMap={messageMap}
                onLongPress={handleLongPress}
            />
        ),
        [colors, currentUserId, handleLongPress, messageMap]
    );

    const renderInputToolbar = useCallback(
        (props: InputToolbarProps<ChatMessage>) => (
            <ChatInputToolbar
                giftedProps={props}
                colors={colors}
                bottomInset={insets.bottom}
                replyTo={replyTo}
                editingMessage={editingMessage}
                isUploading={isUploading}
                onClearReply={() => setReplyTo(null)}
                onClearEdit={() => setEditingMessage(null)}
            />
        ),
        [colors, replyTo, editingMessage, isUploading, insets.bottom]
    );

    const renderComposer = useCallback(
        (props: ComposerProps) => (
            <ChatComposer
                giftedProps={props}
                colors={colors}
                editingMessage={editingMessage}
                editText={editText}
                onEditTextChange={setEditText}
            />
        ),
        [colors, editingMessage, editText]
    );

    const renderActions = useCallback(
        () => <ChatActions onPress={() => setShowAttachmentPicker(true)} />,
        []
    );

    const renderSend = useCallback(
        (props: SendProps<ChatMessage>) => <ChatSendButton giftedProps={props} />,
        []
    );

    const renderDay = useCallback(
        (props: DayProps) => (
            <Day
                {...props}
                textProps={{
                    style: {
                        color: colors.mutedForeground,
                        fontSize: 12,
                        fontWeight: "600",
                    },
                }}
                wrapperStyle={{
                    marginTop: 10,
                    marginBottom: 10,
                }}
            />
        ),
        [colors]
    );

    const renderSystemMessage = useCallback(
        (props: SystemMessageProps<ChatMessage>) => (
            <SystemMessage
                {...props}
                textStyle={{
                    color: colors.mutedForeground,
                    fontSize: 13,
                    fontStyle: "italic",
                    textAlign: "center",
                }}
                containerStyle={{
                    marginVertical: 8,
                }}
            />
        ),
        [colors]
    );

    const renderMessageImage = useCallback(
        (props: MessageImageProps<ChatMessage>) => (
            <MessageImage
                {...props}
                imageStyle={{
                    width: 220,
                    height: 220,
                    borderRadius: 14,
                    margin: 4,
                }}
            />
        ),
        []
    );

    const scrollToBottomComponent = useCallback(
        () => (
            <View className="w-9 h-9 rounded-full bg-card border border-border items-center justify-center">
                <Icon as={ChevronDown} className="size-5 text-foreground" />
            </View>
        ),
        []
    );

    return (
        <View className="flex-1 bg-background">
            <GiftedChat
                messages={giftedMessages}
                onSend={onSend}
                user={{ _id: currentUserId }}
                renderBubble={renderBubble}
                renderInputToolbar={renderInputToolbar}
                renderComposer={renderComposer}
                renderSend={renderSend}
                renderActions={renderActions}
                renderDay={renderDay}
                renderSystemMessage={renderSystemMessage}
                renderMessageImage={renderMessageImage}
                scrollToBottomComponent={scrollToBottomComponent}
                isScrollToBottomEnabled
                isSendButtonAlwaysVisible
                isUsernameVisible
                onLongPressMessage={handleLongPress}
                renderAvatar={null}
                maxComposerHeight={100}
                minComposerHeight={40}
                keyboardAvoidingViewProps={{
                    enabled: true,
                    keyboardVerticalOffset: insets.bottom,
                }}
                loadEarlierMessagesProps={{
                    isAvailable: canLoadMore,
                    onPress: loadMore,
                    isLoading,
                }}
                listProps={{
                    showsVerticalScrollIndicator: false,
                }}
            />

            <MessageActionsModal
                visible={selectedMessage !== null}
                message={selectedMessage}
                isOwn={selectedMessage?.senderId === currentUserId}
                isAdmin={isAdmin}
                currentUserId={currentUserId}
                onClose={() => setSelectedMessage(null)}
                onReply={handleReply}
                onCopy={handleCopy}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPin={handlePin}
                onReaction={handleReaction}
            />

            <AttachmentPickerModal
                visible={showAttachmentPicker}
                onClose={() => setShowAttachmentPicker(false)}
                onPickImage={handlePickImage}
                onTakePhoto={handleTakePhoto}
            />
        </View>
    );
}
