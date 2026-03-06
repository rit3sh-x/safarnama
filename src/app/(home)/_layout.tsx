import { Tabs } from "expo-router";
import { Authenticated } from "convex/react";
import { MapIcon, SettingsIcon, HomeIcon, BookTextIcon, Wallet2Icon } from "lucide-react-native";

const TABS = [
    { name: "dashboard", title: "Dashboard", icon: HomeIcon },
    { name: "blogs/index", title: "Blogs", icon: BookTextIcon },
    { name: "expenses/index", title: "Expenses", icon: Wallet2Icon },
    { name: "trips/index", title: "Trips", icon: MapIcon },
    { name: "settings/index", title: "Settings", icon: SettingsIcon },
];

const HIDDEN_ROUTES = [
    "blogs/[blogId]",
    "trips/[tripId]/chat",
    "trips/[tripId]/expenses",
];

export default function Layout() {
    return (
        <Authenticated>
            <Tabs screenOptions={{ headerShown: false }}>
                {TABS.map(({ name, title, icon: Icon }) => (
                    <Tabs.Screen
                        key={name}
                        name={name}
                        options={{
                            title,
                            tabBarIcon: ({ color, size }) => (
                                <Icon color={color} size={size} />
                            ),
                        }}
                    />
                ))}
                {HIDDEN_ROUTES.map((name) => (
                    <Tabs.Screen
                        key={name}
                        name={name}
                        options={{ href: null }}
                    />
                ))}
            </Tabs>
        </Authenticated>
    );
}