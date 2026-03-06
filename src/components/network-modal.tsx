import { Dialog, DialogContent, DialogPortal } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import NetInfo from "@react-native-community/netinfo";
import { WifiOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";

export function NetworkModal() {
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected ?? true);
        });

        return () => unsubscribe();
    }, []);

    return (
        <Dialog open={!isConnected}>
            <DialogPortal>
                <DialogContent className="max-w-sm items-center gap-4 rounded-2xl p-6 shadow-xl shadow-black/20">
                    <View className="bg-destructive/10 flex h-16 w-16 items-center justify-center rounded-full">
                        <Icon
                            as={WifiOff}
                            className="text-destructive size-8"
                        />
                    </View>

                    <View className="flex flex-col gap-2 text-center">
                        <Text className="text-foreground text-xl font-semibold">
                            No Internet Connection
                        </Text>
                        <Text className="text-muted-foreground text-sm leading-relaxed">
                            Please check your internet connection and try
                            again. Some features may not be available while
                            offline.
                        </Text>
                    </View>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}
