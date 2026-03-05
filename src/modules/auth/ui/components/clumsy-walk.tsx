import {
    RiveView,
    useRive,
    useRiveFile,
    useViewModelInstance,
    useRiveTrigger,
} from "@rive-app/react-native";
import { View } from "react-native";

interface UseClumsyWalkProps {
    triggerName?: string;
    stateMachineName?: string;
}

export const useClumsyWalk = ({
    triggerName = "Trigger 1",
    stateMachineName = "State Machine 1",
}: UseClumsyWalkProps = {}) => {
    const { riveFile } = useRiveFile(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require("@/assets/auth/animations/cloudy-walk.riv")
    );

    const { riveViewRef, setHybridRef } = useRive();

    const viewModelInstance = useViewModelInstance(riveFile);

    const { trigger: invokeTrigger } = useRiveTrigger(
        triggerName,
        viewModelInstance,
        {
            onTrigger: () => riveViewRef?.playIfNeeded(),
        }
    );
  
    const Animation = !riveFile || !viewModelInstance ? null : (
        <View pointerEvents="none" className="w-full h-full">
            <RiveView
                hybridRef={setHybridRef}
                file={riveFile}
                stateMachineName={stateMachineName}
                dataBind={viewModelInstance}
                className="w-full h-full"
            />
        </View>
    );

    return { Animation, invokeTrigger };
};
