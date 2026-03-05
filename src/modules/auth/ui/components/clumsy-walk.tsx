import Rive, { RiveRef } from "rive-react-native";
import { useRef } from "react";
import { View } from "react-native";

interface UseClumsyWalkProps {
    triggerName?: string;
    stateMachineName?: string;
}

export const useClumsyWalk = ({
    triggerName = "Trigger 1",
    stateMachineName = "State Machine 1",
}: UseClumsyWalkProps = {}) => {
    const riveRef = useRef<RiveRef>(null);

    const invokeTrigger = () => {
        riveRef.current?.fireState(stateMachineName, triggerName);
        riveRef.current?.play();
    };

    const Animation = (
        <View pointerEvents="none" className="w-full h-full">
            <Rive
                ref={riveRef}
                resourceName="cloudy-walk"
                stateMachineName={stateMachineName}
                autoplay={false}
                style={{ width: "100%", height: "100%" }}
            />
        </View>
    );

    return { Animation, invokeTrigger };
};
