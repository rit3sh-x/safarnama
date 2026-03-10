import { useThemeColors } from "@/lib/theme";
import { ChatHeader } from "@/modules/trips/ui/components/chat-header";
import { Id } from "@backend/dataModel";
import { Authenticated } from "convex/react";
import {
    Route,
    router,
    Slot,
    useLocalSearchParams,
    usePathname,
} from "expo-router";
import { useCallback, useMemo, useRef } from "react";
import { View } from "react-native";
import {
    Directions,
    Gesture,
    GestureDetector,
} from "react-native-gesture-handler";

const getTabs = (tripId: string) => [
    {
        name: "chat",
        title: "Chat",
        route: `/(custom)/trips/${tripId}/chat` as Route,
    },
    {
        name: "expenses",
        title: "Expenses",
        route: `/(custom)/trips/${tripId}/expenses` as Route,
    },
    {
        name: "info",
        title: "Info",
        route: `/(custom)/trips/${tripId}/info` as Route,
    },
];

export default function Layout() {
    const colors = useThemeColors();
    const pathname = usePathname();
    const { tripId, name, logo } = useLocalSearchParams<{
        tripId: Id<"trip">;
        name: string;
        logo: string;
    }>();

    const tabs = useMemo(() => getTabs(tripId ?? ""), [tripId]);
    const tabNames = useMemo(() => tabs.map((t) => t.name), [tabs]);

    const currentIndex = tabNames.findIndex((n) => pathname.includes(n));
    const safeIndex = currentIndex === -1 ? 0 : currentIndex;
    const indexRef = useRef(safeIndex);
    indexRef.current = safeIndex;

    const navigateToTab = useCallback(
        (index: number) => {
            if (index < 0 || index >= tabs.length || index === indexRef.current)
                return;
            router.replace(tabs[index].route);
        },
        [tabs]
    );

    const handleBack = useCallback(() => router.back(), []);

    const handleGroupPress = useCallback(() => {
        router.push(`/(custom)/trips/${tripId}/info`);
    }, [tripId]);

    const swipeGesture = useMemo(
        () =>
            Gesture.Race(
                Gesture.Fling()
                    .runOnJS(true)
                    .direction(Directions.LEFT)
                    .onEnd(() => navigateToTab(indexRef.current + 1)),
                Gesture.Fling()
                    .runOnJS(true)
                    .direction(Directions.RIGHT)
                    .onEnd(() => navigateToTab(indexRef.current - 1))
            ),
        [navigateToTab]
    );

    return (
        <Authenticated>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <ChatHeader
                    name={name}
                    logo={logo}
                    tripId={tripId}
                    onBack={handleBack}
                    onGroupPress={handleGroupPress}
                />
                <GestureDetector gesture={swipeGesture}>
                    <View style={{ flex: 1 }}>
                        <Slot />
                    </View>
                </GestureDetector>
            </View>
        </Authenticated>
    );
}
