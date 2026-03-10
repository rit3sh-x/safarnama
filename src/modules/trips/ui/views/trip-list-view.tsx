import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { CreateTripDialog } from "../components/create-trip-dialog";
import { NavOptions } from "../components/nav-options";
import { Navigations } from "../components/navigations";
import { SearchBar } from "../components/search-bar";
import { Id } from "@backend/dataModel";

export function TripsView() {
    const [showCreate, setShowCreate] = useState(false);
    const router = useRouter();

    const handleTripCreated = useCallback(
        ({
            tripId,
            name,
            logo,
        }: {
            tripId: Id<"trip">;
            name: string;
            logo?: string;
        }) => {
            router.push({
                pathname: `/(custom)/trips/[tripId]/chat`,
                params: { tripId, name, logo },
            });
        },
        [router]
    );

    return (
        <View className="flex-1 gap-4 bg-background px-4">
            <SearchBar />
            <NavOptions />

            <View className="flex-1">
                <Navigations />
            </View>

            <Button
                onPress={() => setShowCreate(true)}
                className="absolute bottom-4 right-4 w-14 h-14 rounded-full items-center justify-center shadow-lg bg-primary"
            >
                <Icon as={Plus} className="size-6 text-primary-foreground" />
            </Button>

            <CreateTripDialog
                open={showCreate}
                onOpenChange={setShowCreate}
                onCreated={handleTripCreated}
            />
        </View>
    );
}
