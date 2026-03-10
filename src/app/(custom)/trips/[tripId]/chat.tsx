import { useLocalSearchParams } from "expo-router";
import { TripChatView } from "@/modules/trips/ui/views/trip-chat-view";
import { Id } from "@backend/dataModel";

export default function ChatPage() {
    const { tripId } = useLocalSearchParams<{ tripId: Id<"trip"> }>();

    return <TripChatView tripId={tripId} />;
}
