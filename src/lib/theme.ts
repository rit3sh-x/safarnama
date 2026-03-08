import { useColorScheme } from "react-native";

export const colors = {
    light: {
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(0, 0%, 3.9%)",
        card: "hsl(0, 0%, 100%)",
        cardForeground: "hsl(0, 0%, 3.9%)",
        popover: "hsl(0, 0%, 100%)",
        popoverForeground: "hsl(0, 0%, 3.9%)",
        primary: "hsl(0, 0%, 9%)",
        primaryForeground: "hsl(0, 0%, 98%)",
        secondary: "hsl(0, 0%, 96%)",
        secondaryForeground: "hsl(0, 0%, 9%)",
        muted: "hsl(0, 0%, 96%)",
        mutedForeground: "hsl(0, 0%, 45.1%)",
        accent: "hsl(0, 0%, 96%)",
        accentForeground: "hsl(0, 0%, 9%)",
        destructive: "hsl(0, 84.2%, 60.2%)",
        destructiveForeground: "hsl(0, 0%, 98%)",
        border: "hsl(0, 0%, 89.8%)",
        input: "hsl(0, 0%, 89.8%)",
        ring: "hsl(0, 0%, 63%)",
    },
    dark: {
        background: "hsl(0, 0%, 3.9%)",
        foreground: "hsl(0, 0%, 98%)",
        card: "hsl(0, 0%, 9%)",
        cardForeground: "hsl(0, 0%, 98%)",
        popover: "hsl(0, 0%, 14.9%)",
        popoverForeground: "hsl(0, 0%, 98%)",
        primary: "hsl(0, 0%, 89.8%)",
        primaryForeground: "hsl(0, 0%, 9%)",
        secondary: "hsl(0, 0%, 14.9%)",
        secondaryForeground: "hsl(0, 0%, 98%)",
        muted: "hsl(0, 0%, 14.9%)",
        mutedForeground: "hsl(0, 0%, 63%)",
        accent: "hsl(0, 0%, 25%)",
        accentForeground: "hsl(0, 0%, 98%)",
        destructive: "hsl(0, 62.8%, 30.6%)",
        destructiveForeground: "hsl(0, 0%, 98%)",
        border: "hsl(0, 0%, 15.5%)",
        input: "hsl(0, 0%, 20.4%)",
        ring: "hsl(0, 0%, 45.1%)",
    },
} as const;

export type ThemeColors = {
    [K in keyof (typeof colors)["light"]]: string;
};

export function useThemeColors(): ThemeColors {
    const colorScheme = useColorScheme();
    return colorScheme === "dark" ? colors.dark : colors.light;
}
