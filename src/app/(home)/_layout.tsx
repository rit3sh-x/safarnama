import { TopBar } from "@/modules/dashboard/ui/components/top-bar";
import { useThemeColors } from "@/lib/theme";
import { Authenticated } from "convex/react";
import { Href, router, Tabs, usePathname } from "expo-router";
import {
    BookTextIcon,
    HomeIcon,
    MapIcon,
    SettingsIcon,
    Wallet2Icon,
    type LucideIcon,
} from "lucide-react-native";
import { useCallback, useMemo, useRef } from "react";
import { Pressable, Text, View } from "react-native";

import {
    Directions,
    Gesture,
    GestureDetector,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Tab {
    name: string;
    title: string;
    icon: LucideIcon;
    route: Href;
}

const TABS: Tab[] = [
    {
        name: "dashboard",
        title: "Dashboard",
        icon: HomeIcon,
        route: "/(home)/dashboard",
    },
    {
        name: "trips",
        title: "Trips",
        icon: MapIcon,
        route: "/(home)/trips",
    },
    {
        name: "expenses",
        title: "Expenses",
        icon: Wallet2Icon,
        route: "/(home)/expenses",
    },
    {
        name: "blogs",
        title: "Blogs",
        icon: BookTextIcon,
        route: "/(home)/blogs",
    },
    {
        name: "settings",
        title: "Settings",
        icon: SettingsIcon,
        route: "/(home)/settings",
    },
];

const TAB_NAMES = TABS.map((t) => t.name);

export default function Layout() {
    const colors = useThemeColors();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const currentIndex = TAB_NAMES.findIndex((n) => pathname.includes(n));
    const safeIndex = currentIndex === -1 ? 0 : currentIndex;
    const indexRef = useRef(safeIndex);
    indexRef.current = safeIndex;

    const navigateToTab = useCallback((index: number) => {
        if (index < 0 || index >= TABS.length || index === indexRef.current)
            return;
        router.replace(TABS[index].route);
    }, []);

    const composed = useMemo(
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

    const currentTitle = TABS[safeIndex]?.title ?? "";

    return (
        <Authenticated>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <TopBar title={currentTitle} />

                <GestureDetector gesture={composed}>
                    <View style={{ flex: 1 }}>
                        <Tabs
                            screenOptions={{
                                headerShown: false,
                                tabBarStyle: { display: "none" },
                                sceneStyle: {
                                    backgroundColor: colors.background,
                                },
                                animation: "shift",
                            }}
                        >
                            {TABS.map(({ name, title }) => (
                                <Tabs.Screen
                                    key={name}
                                    name={name}
                                    options={{ title }}
                                />
                            ))}
                        </Tabs>
                    </View>
                </GestureDetector>

                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: colors.background,
                        borderTopColor: colors.border,
                        borderTopWidth: 1,
                        paddingBottom: insets.bottom + 16,
                        paddingHorizontal: 16,
                        paddingTop: 12,
                        gap: 4,
                    }}
                >
                    {TABS.map(({ name, title, icon: Icon }, index) => {
                        const isActive = index === safeIndex;
                        const color = isActive
                            ? colors.primaryForeground
                            : colors.mutedForeground;

                        return (
                            <Pressable
                                key={name}
                                onPress={() => navigateToTab(index)}
                                style={{
                                    flex: isActive ? 1 : 0,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 4,
                                    height: 36,
                                    width: 54,
                                    borderRadius: 999,
                                    backgroundColor: isActive
                                        ? colors.primary
                                        : "transparent",
                                    overflow: "hidden",
                                }}
                            >
                                <Icon color={color} size={18} />
                                {isActive && (
                                    <Text
                                        style={{
                                            color,
                                            fontSize: 12,
                                            fontWeight: "600",
                                        }}
                                        numberOfLines={1}
                                    >
                                        {title}
                                    </Text>
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </Authenticated>
    );
}
