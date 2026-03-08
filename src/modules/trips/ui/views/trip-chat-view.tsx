import { useCallback, useMemo } from "react";
import { View } from "react-native";
import {
    GiftedChat,
    IMessage,
    Bubble,
    InputToolbar,
    Composer,
    Send,
} from "react-native-gifted-chat";
import { Icon } from "@/components/ui/icon";
import { SendHorizontal } from "lucide-react-native";
import { useThemeColors } from "@/lib/theme";
import { useMessages, useSendMessage } from "../../hooks";
import { useAuthentication } from "@/modules/auth/context/auth-context";
import type { TripId, Message } from "../../types";

interface TripChatViewProps {
    tripId: TripId;
}

function convexMessageToGifted(msg: Message, currentUserId: string): IMessage {
    return {
        _id: msg._id,
        text: msg.content,
        createdAt: new Date(msg.createdAt),
        user: {
            _id: msg.senderId,
        },
        sent: true,
        received: true,
    };
}

export function TripChatView({ tripId }: TripChatViewProps) {
    const colors = useThemeColors();
    const { user } = useAuthentication();
    const { messages, isLoading, canLoadMore, loadMore } = useMessages(tripId);
    const sendMessage = useSendMessage(tripId);

    const currentUserId = user?._id ?? "";

    const giftedMessages: IMessage[] = useMemo(
        () => messages.map((m) => convexMessageToGifted(m, currentUserId)),
        [messages, currentUserId]
    );

    const onSend = useCallback(
        (newMessages: IMessage[] = []) => {
            const text = newMessages[0]?.text;
            if (text) sendMessage(text);
        },
        [sendMessage]
    );

    const renderBubble = useCallback(
        (props: any) => (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: colors.primary,
                        borderRadius: 18,
                        borderBottomRightRadius: 4,
                        paddingVertical: 2,
                        paddingHorizontal: 2,
                        marginVertical: 2,
                    },
                    left: {
                        backgroundColor: colors.secondary,
                        borderRadius: 18,
                        borderBottomLeftRadius: 4,
                        paddingVertical: 2,
                        paddingHorizontal: 2,
                        marginVertical: 2,
                    },
                }}
                textStyle={{
                    right: {
                        color: colors.primaryForeground,
                        fontSize: 15,
                    },
                    left: {
                        color: colors.foreground,
                        fontSize: 15,
                    },
                }}
                timeTextStyle={{
                    right: {
                        color: colors.ring,
                        fontSize: 11,
                    },
                    left: {
                        color: colors.mutedForeground,
                        fontSize: 11,
                    },
                }}
            />
        ),
        [colors]
    );

    const renderInputToolbar = useCallback(
        (props: any) => (
            <InputToolbar
                {...props}
                containerStyle={{
                    backgroundColor: colors.background,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                }}
            />
        ),
        [colors]
    );

    const renderComposer = useCallback(
        (props: any) => (
            <Composer
                {...props}
                textInputStyle={{
                    backgroundColor: colors.muted,
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingTop: 10,
                    paddingBottom: 10,
                    marginRight: 8,
                    fontSize: 15,
                    lineHeight: 20,
                    color: colors.foreground,
                }}
                placeholderTextColor={colors.mutedForeground}
                placeholder="Message..."
            />
        ),
        [colors]
    );

    const renderSend = useCallback(
        (props: any) => (
            <Send
                {...props}
                containerStyle={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 4,
                    marginBottom: 4,
                }}
            >
                <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.primary }}
                >
                    <Icon
                        as={SendHorizontal}
                        className="size-5"
                        style={{ color: colors.primaryForeground }}
                    />
                </View>
            </Send>
        ),
        [colors]
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
                alwaysShowSend
                scrollToBottom
                infiniteScroll
                loadEarlier={canLoadMore}
                onLoadEarlier={loadMore}
                isLoadingEarlier={isLoading}
                renderAvatar={null}
                maxComposerHeight={100}
                minComposerHeight={40}
                bottomOffset={0}
                listViewProps={{
                    showsVerticalScrollIndicator: false,
                }}
            />
        </View>
    );
}
