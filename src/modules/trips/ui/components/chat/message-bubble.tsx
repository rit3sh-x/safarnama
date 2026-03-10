import { View } from "react-native";
import { Bubble, Time } from "react-native-gifted-chat";
import type { BubbleProps } from "react-native-gifted-chat";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Pin, Clock3, Check } from "lucide-react-native";
import type { Message } from "../../../types";
import type { ChatMessage } from "./types";
import { ThemeColors } from "@/lib/theme";

interface MessageBubbleProps {
    props: BubbleProps<ChatMessage>;
    colors: ThemeColors;
    currentUserId: string;
    messageMap: Map<string, Message>;
    onLongPress: (context: unknown, message: unknown) => void;
}

export function MessageBubble({
    props,
    colors,
    currentUserId,
    messageMap,
    onLongPress,
}: MessageBubbleProps) {
    const msg = props.currentMessage as ChatMessage;
    const orig = msg?.originalMessage;
    const isOwn = msg?.user?._id === currentUserId;
    const isPending = !!msg?.pending;

    return (
        <View>
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: isPending
                            ? colors.primary + "B3"
                            : colors.primary,
                        borderRadius: 18,
                        borderBottomRightRadius: 4,
                        paddingVertical: 2,
                        paddingHorizontal: 2,
                        marginVertical: 1,
                    },
                    left: {
                        backgroundColor: colors.secondary,
                        borderRadius: 18,
                        borderBottomLeftRadius: 4,
                        paddingVertical: 2,
                        paddingHorizontal: 2,
                        marginVertical: 1,
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
                renderTime={(timeProps) => (
                    <Time
                        {...timeProps}
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
                )}
                renderUsername={() =>
                    !isOwn && msg?.user?.name ? (
                        <Text className="text-xs font-semibold text-ring px-2.5 pt-1">
                            {msg.user.name}
                        </Text>
                    ) : null
                }
                renderCustomView={() => (
                    <BubbleExtras
                        message={orig}
                        messageMap={messageMap}
                        isOwn={isOwn}
                    />
                )}
                renderTicks={() =>
                    isOwn && !msg?.system ? (
                        <View className="mr-2 mb-1">
                            <Icon
                                as={isPending ? Clock3 : Check}
                                className="size-3 text-primary-foreground/70"
                            />
                        </View>
                    ) : null
                }
                onLongPressMessage={onLongPress}
            />
            {orig?.reactions && orig.reactions.length > 0 ? (
                <View
                    className={`flex-row flex-wrap gap-1 px-3 pb-1 ${isOwn ? "justify-end" : "justify-start"}`}
                >
                    {orig.reactions.map((r) => (
                        <View
                            key={r.emoji}
                            className={`flex-row items-center bg-muted rounded-xl px-1.5 py-0.5 ${
                                r.userIds.includes(currentUserId)
                                    ? "border border-primary"
                                    : ""
                            }`}
                        >
                            <Text className="text-sm">{r.emoji}</Text>
                            {r.count > 1 ? (
                                <Text className="text-[11px] text-muted-foreground ml-0.5">
                                    {r.count}
                                </Text>
                            ) : null}
                        </View>
                    ))}
                </View>
            ) : null}
        </View>
    );
}

function BubbleExtras({
    message,
    messageMap,
    isOwn,
}: {
    message?: Message;
    messageMap: Map<string, Message>;
    isOwn: boolean;
}) {
    if (!message) return null;

    const replyMsg = message.replyToId
        ? messageMap.get(message.replyToId)
        : null;

    const showEdited = !!message.editedAt && !message.deletedAt;
    const showPinned = !!message.pinnedAt;

    if (!replyMsg && !showEdited && !showPinned) return null;

    return (
        <View className="px-2.5 pt-1">
            {replyMsg ? (
                <View
                    style={{
                        backgroundColor: isOwn
                            ? "rgba(255,255,255,0.15)"
                            : "rgba(0,0,0,0.05)",
                        borderRadius: 8,
                        borderLeftWidth: 3,
                    }}
                    className="border-l-ring pl-2 pr-2 py-1 mb-1"
                >
                    <Text
                        className={`text-[11px] font-semibold ${isOwn ? "text-primary-foreground" : "text-primary"}`}
                    >
                        {replyMsg.sender.name}
                    </Text>
                    <Text
                        numberOfLines={1}
                        className={`text-xs ${isOwn ? "text-white/70" : "text-muted-foreground"}`}
                    >
                        {replyMsg.deletedAt ? "[deleted]" : replyMsg.content}
                    </Text>
                </View>
            ) : null}

            {showPinned ? (
                <View className="flex-row items-center gap-1 mb-0.5">
                    <Icon
                        as={Pin}
                        className={`size-2.5 ${isOwn ? "text-white/60" : "text-muted-foreground"}`}
                    />
                    <Text
                        className={`text-[10px] ${isOwn ? "text-white/60" : "text-muted-foreground"}`}
                    >
                        Pinned
                    </Text>
                </View>
            ) : null}
        </View>
    );
}
