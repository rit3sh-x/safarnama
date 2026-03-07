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
                        backgroundColor: "hsl(0, 0%, 9%)",
                        borderRadius: 18,
                        borderBottomRightRadius: 4,
                        paddingVertical: 2,
                        paddingHorizontal: 2,
                        marginVertical: 2,
                    },
                    left: {
                        backgroundColor: "hsl(0, 0%, 93%)",
                        borderRadius: 18,
                        borderBottomLeftRadius: 4,
                        paddingVertical: 2,
                        paddingHorizontal: 2,
                        marginVertical: 2,
                    },
                }}
                textStyle={{
                    right: {
                        color: "hsl(0, 0%, 98%)",
                        fontSize: 15,
                    },
                    left: {
                        color: "hsl(0, 0%, 9%)",
                        fontSize: 15,
                    },
                }}
                timeTextStyle={{
                    right: {
                        color: "hsl(0, 0%, 70%)",
                        fontSize: 11,
                    },
                    left: {
                        color: "hsl(0, 0%, 45%)",
                        fontSize: 11,
                    },
                }}
            />
        ),
        []
    );

    const renderInputToolbar = useCallback(
        (props: any) => (
            <InputToolbar
                {...props}
                containerStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    borderTopWidth: 1,
                    borderTopColor: "hsl(0, 0%, 89.8%)",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                }}
            />
        ),
        []
    );

    const renderComposer = useCallback(
        (props: any) => (
            <Composer
                {...props}
                textInputStyle={{
                    backgroundColor: "hsl(0, 0%, 96%)",
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingTop: 10,
                    paddingBottom: 10,
                    marginRight: 8,
                    fontSize: 15,
                    lineHeight: 20,
                    color: "hsl(0, 0%, 9%)",
                }}
                placeholderTextColor="hsl(0, 0%, 45%)"
                placeholder="Message..."
            />
        ),
        []
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
                    style={{ backgroundColor: "hsl(0, 0%, 9%)" }}
                >
                    <Icon
                        as={SendHorizontal}
                        className="size-5"
                        style={{ color: "hsl(0, 0%, 98%)" }}
                    />
                </View>
            </Send>
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
