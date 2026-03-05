import Rive, { RiveRef, Alignment, Fit } from "rive-react-native";
import { useRef } from "react";
import { Image, View } from "react-native";

interface UseAnimationProps {
    triggerName?: string;
    stateMachineName?: string;
}

const rivSource = Image.resolveAssetSource(
    // eslint-disable-next-line
    require("@/assets/onboarding/cloudy-walk.riv")
);

export const useAnimation = ({
    triggerName = "Trigger 1",
    stateMachineName = "State Machine 1",
}: UseAnimationProps = {}) => {
    const riveRef = useRef<RiveRef>(null);

    const invokeTrigger = () => {
        riveRef.current?.fireState(stateMachineName, triggerName);
    };

    const Animation = (
        <View
            pointerEvents="none"
            style={{
                height: "100%",
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
            }}
        >
            <Rive
                ref={riveRef}
                url={rivSource.uri}
                stateMachineName={stateMachineName}
                autoplay={true}
                fit={Fit.Cover}
                alignment={Alignment.Center}
                style={{ width: "140%", height: "140%" }}
            />
        </View>
    );

    return { Animation, invokeTrigger };
};
