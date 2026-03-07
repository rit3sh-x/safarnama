import { cn } from "@/lib/utils";
import * as React from "react";
import { View, type ViewProps } from "react-native";
import { Text } from "@/components/ui/text";
import { useCSSVariable } from "uniwind";
import {
    DrawerContentScrollView,
    DrawerItem as RNDrawerItem,
    DrawerItemList as RNDrawerItemList,
    DrawerToggleButton,
    useDrawerStatus,
    useDrawerProgress,
    type DrawerContentComponentProps,
} from "@react-navigation/drawer";

interface DrawerContentProps extends DrawerContentComponentProps {
    header?: React.ReactNode;
    footer?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

function DrawerContent({
    header,
    footer,
    children,
    className,
    ...props
}: DrawerContentProps) {
    return (
        <View className={cn("flex-1 bg-background", className)}>
            {header}
            <DrawerContentScrollView {...props}>
                {children ?? <RNDrawerItemList {...props} />}
            </DrawerContentScrollView>
            {footer}
        </View>
    );
}

function DrawerHeader({ className, ...props }: ViewProps) {
    return (
        <View
            className={cn(
                "flex-col gap-1 border-b border-border px-4 pb-4 pt-2",
                className
            )}
            {...props}
        />
    );
}

function DrawerTitle({
    className,
    ...props
}: React.ComponentProps<typeof Text>) {
    return (
        <Text
            className={cn("text-lg font-semibold text-foreground", className)}
            {...props}
        />
    );
}

function DrawerDescription({
    className,
    ...props
}: React.ComponentProps<typeof Text>) {
    return (
        <Text
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    );
}

function DrawerFooter({ className, ...props }: ViewProps) {
    return (
        <View
            className={cn("border-t border-border px-4 py-4", className)}
            {...props}
        />
    );
}

function DrawerSeparator({ className, ...props }: ViewProps) {
    return (
        <View
            className={cn("my-1 mx-3 h-px bg-border", className)}
            {...props}
        />
    );
}

interface DrawerGroupProps extends ViewProps {
    label?: string;
}

function DrawerGroup({
    label,
    className,
    children,
    ...props
}: DrawerGroupProps) {
    return (
        <View className={cn("py-1", className)} {...props}>
            {label ? (
                <Text className="px-7 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {label}
                </Text>
            ) : null}
            {children}
        </View>
    );
}

function useDrawerThemeColors() {
    const [foreground, mutedForeground, accent] = useCSSVariable([
        "--color-foreground",
        "--color-muted-foreground",
        "--color-accent",
    ]);

    return React.useMemo(
        () => ({
            activeTintColor: foreground,
            activeBackgroundColor: accent,
            inactiveTintColor: mutedForeground,
            inactiveBackgroundColor: "transparent",
        }),
        [foreground, mutedForeground, accent]
    );
}

type DrawerItemProps = React.ComponentProps<typeof RNDrawerItem>;

function DrawerItem(props: DrawerItemProps) {
    const colors = useDrawerThemeColors();

    return (
        <RNDrawerItem
            activeTintColor={colors.activeTintColor as string}
            activeBackgroundColor={colors.activeBackgroundColor as string}
            inactiveTintColor={colors.inactiveTintColor as string}
            inactiveBackgroundColor={colors.inactiveBackgroundColor as string}
            labelStyle={{ fontWeight: props.focused ? "600" : "400" }}
            style={{ borderRadius: 12 }}
            {...props}
        />
    );
}

export {
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerItem,
    DrawerSeparator,
    DrawerGroup,
    DrawerToggleButton,
    useDrawerStatus,
    useDrawerProgress,
    useDrawerThemeColors,
};
export type {
    DrawerContentProps,
    DrawerItemProps,
    DrawerGroupProps,
    DrawerContentComponentProps,
};
