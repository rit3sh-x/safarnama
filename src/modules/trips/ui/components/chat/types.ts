import type { IMessage } from "react-native-gifted-chat";
import type { Message } from "../../../types";

export interface ChatMessage extends IMessage {
    originalMessage?: Message;
}

export function toGiftedMessage(
    msg: Message,
    _currentUserId: string
): ChatMessage {
    const isSystem = msg.type === "member_joined" || msg.type === "member_left";
    const isOptimistic = !!(msg as any)._optimistic;

    if (isSystem) {
        return {
            _id: msg._id,
            text: msg.content,
            createdAt: new Date(msg._creationTime),
            user: { _id: "" },
            system: true,
            originalMessage: msg,
        };
    }

    return {
        _id: msg._id,
        text: msg.deletedAt ? "[deleted]" : msg.content,
        createdAt: new Date(msg._creationTime),
        user: {
            _id: msg.senderId,
            name: msg.sender.name,
            avatar: msg.sender.image ?? undefined,
        },
        image:
            msg.attachmentType === "image" && msg.attachmentUrl
                ? msg.attachmentUrl
                : undefined,
        pending: isOptimistic,
        sent: !isOptimistic,
        received: !isOptimistic,
        originalMessage: msg,
    };
}
