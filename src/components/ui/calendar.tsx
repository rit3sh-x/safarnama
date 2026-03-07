import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Platform, View } from "react-native";
import {
    Calendar as RNCalendar,
    CalendarList as RNCalendarList,
    type CalendarProps as RNCalendarProps,
    type CalendarListProps as RNCalendarListProps,
    type DateData,
} from "react-native-calendars";
import { useCSSVariable } from "uniwind";

function useCalendarTheme() {
    const rawColors = useCSSVariable([
        "--color-background",
        "--color-foreground",
        "--color-primary",
        "--color-primary-foreground",
        "--color-muted-foreground",
        "--color-accent",
        "--color-border",
    ]);

    const [
        background,
        foreground,
        primary,
        primaryForeground,
        mutedForeground,
        accent,
        border,
    ] = rawColors.map((c) => String(c ?? "")) as [
        string,
        string,
        string,
        string,
        string,
        string,
        string,
    ];

    return React.useMemo(
        () => ({
            backgroundColor: background,
            calendarBackground: background,
            textSectionTitleColor: mutedForeground,
            selectedDayBackgroundColor: primary,
            selectedDayTextColor: primaryForeground,
            todayTextColor: primary,
            todayBackgroundColor: accent,
            dayTextColor: foreground,
            textDisabledColor: border,
            monthTextColor: foreground,
            arrowColor: foreground,
            textMonthFontWeight: "600" as const,
            textMonthFontSize: 16,
            textDayFontSize: 14,
            textDayHeaderFontSize: 12,
            textDayFontWeight: "400" as const,
            textDayHeaderFontWeight: "500" as const,
            "stylesheet.calendar.header": {
                header: {
                    flexDirection: "row" as const,
                    justifyContent: "space-between" as const,
                    alignItems: "center" as const,
                    paddingHorizontal: 4,
                    paddingVertical: 8,
                },
            },
        }),
        [
            background,
            foreground,
            primary,
            primaryForeground,
            mutedForeground,
            accent,
            border,
        ]
    );
}

const calendarContainerVariants = cva(
    cn("overflow-hidden rounded-xl", Platform.select({ web: "select-none" })),
    {
        variants: {
            variant: {
                default: "bg-background border border-border",
                card: "bg-card border border-border shadow-sm shadow-black/5",
                ghost: "bg-transparent",
            },
            size: {
                default: "p-2",
                sm: "p-1",
                lg: "p-4",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

type CalendarVariantProps = VariantProps<typeof calendarContainerVariants>;

type CalendarProps = Omit<RNCalendarProps, "theme"> &
    CalendarVariantProps & {
        className?: string;
    };

function Calendar({ className, variant, size, ...props }: CalendarProps) {
    const theme = useCalendarTheme();

    return (
        <View
            className={cn(
                calendarContainerVariants({ variant, size }),
                className
            )}
        >
            <RNCalendar theme={theme} enableSwipeMonths {...props} />
        </View>
    );
}

type CalendarListComponentProps = Omit<RNCalendarListProps, "theme"> &
    CalendarVariantProps & {
        className?: string;
    };

function CalendarList({
    className,
    variant,
    size,
    ...props
}: CalendarListComponentProps) {
    const theme = useCalendarTheme();

    return (
        <View
            className={cn(
                calendarContainerVariants({ variant, size }),
                className
            )}
        >
            <RNCalendarList theme={theme} {...props} />
        </View>
    );
}

export { Calendar, CalendarList, calendarContainerVariants, useCalendarTheme };
export type { CalendarProps, CalendarListComponentProps, DateData };
