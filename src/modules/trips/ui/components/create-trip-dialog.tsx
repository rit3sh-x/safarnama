import { Portal } from "@rn-primitives/portal";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    BackHandler,
    Platform,
    Pressable,
    TouchableOpacity,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown,
} from "react-native-reanimated";
import { useCSSVariable } from "uniwind";

import { Button } from "@/components/ui/button";
import { Calendar, type DateData } from "@/components/ui/calendar";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { useUploadFileToConvex } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, ImagePlus, X } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateTrip } from "../../hooks/use-trips";

const createTripSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    destination: z
        .string()
        .min(1, "Destination is required")
        .max(100, "Destination is too long"),
    description: z.string().max(500, "Description is too long").optional(),
    isPublic: z.boolean(),
});

type CreateTripForm = z.infer<typeof createTripSchema>;

interface CreateTripDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated?: (tripId: string) => void;
}

export function CreateTripDialog({
    open,
    onOpenChange,
    onCreated,
}: CreateTripDialogProps) {
    const { mutate: createTrip, isPending: isCreating } = useCreateTrip();
    const uploadFile = useUploadFileToConvex();

    const rawColors = useCSSVariable([
        "--color-primary",
        "--color-primary-foreground",
        "--color-accent",
    ]);
    const [primaryColor, primaryFgColor, accentColor] = rawColors.map((c) =>
        String(c ?? "")
    );

    const [coverUri, setCoverUri] = useState<string | null>(null);
    const [coverUploading, setCoverUploading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectingEnd, setSelectingEnd] = useState(false);
    const [isPicking, setIsPicking] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateTripForm>({
        resolver: zodResolver(createTripSchema),
        defaultValues: {
            title: "",
            destination: "",
            description: "",
            isPublic: false,
        },
    });

    const resetAll = useCallback(() => {
        reset();
        setCoverUri(null);
        setStartDate(null);
        setEndDate(null);
        setShowCalendar(false);
        setSelectingEnd(false);
        setSubmitError(null);
    }, [reset]);

    const handleClose = useCallback(() => {
        resetAll();
        onOpenChange(false);
    }, [resetAll, onOpenChange]);

    const pickCoverImage = useCallback(async () => {
        setIsPicking(true);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setCoverUri(result.assets[0].uri);
            }
        } finally {
            setIsPicking(false);
        }
    }, []);

    async function uploadCoverImage(): Promise<string | undefined> {
        if (!coverUri) return undefined;

        setCoverUploading(true);
        try {
            const response = await fetch(coverUri);
            const blob = await response.blob();
            const file = new File([blob], "cover.jpg", { type: "image/jpeg" });
            const { url } = await uploadFile(file);
            return url ?? undefined;
        } catch (error) {
            console.error("Failed to upload cover image:", error);
            return undefined;
        } finally {
            setCoverUploading(false);
        }
    }

    const markedDates = useMemo(() => {
        const marks: Record<string, any> = {};
        if (startDate) {
            marks[startDate] = {
                selected: true,
                startingDay: true,
                endingDay: !endDate,
                color: primaryColor,
                textColor: primaryFgColor,
            };
        }
        if (endDate && startDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const current = new Date(start);
            current.setDate(current.getDate() + 1);

            while (current < end) {
                const key = current.toISOString().split("T")[0];
                marks[key] = {
                    selected: true,
                    color: accentColor,
                    textColor: primaryColor,
                };
                current.setDate(current.getDate() + 1);
            }

            marks[endDate] = {
                selected: true,
                endingDay: true,
                color: primaryColor,
                textColor: primaryFgColor,
            };
            marks[startDate] = {
                ...marks[startDate],
                startingDay: true,
            };
        }
        return marks;
    }, [startDate, endDate, primaryColor, primaryFgColor, accentColor]);

    const handleDayPress = useCallback(
        (day: DateData) => {
            if (!selectingEnd) {
                setStartDate(day.dateString);
                setEndDate(null);
                setSelectingEnd(true);
            } else {
                if (startDate && day.dateString < startDate) {
                    setStartDate(day.dateString);
                    setEndDate(null);
                } else {
                    setEndDate(day.dateString);
                    setSelectingEnd(false);
                    setShowCalendar(false);
                }
            }
        },
        [selectingEnd, startDate]
    );

    const onSubmit = async (data: CreateTripForm) => {
        setSubmitError(null);
        try {
            const logoUrl = await uploadCoverImage();

            const tripId = await createTrip({
                title: data.title.trim(),
                destination: data.destination.trim(),
                description: data.description?.trim() || undefined,
                logoUrl,
                isPublic: data.isPublic,
                startDate: startDate
                    ? new Date(startDate).getTime()
                    : undefined,
                endDate: endDate ? new Date(endDate).getTime() : undefined,
            });

            resetAll();
            onOpenChange(false);
            onCreated?.(tripId);
        } catch (error) {
            console.error("Failed to create trip:", error);
            setSubmitError("Something went wrong. Please try again.");
        }
    };

    function formatDateLabel(dateStr: string | null) {
        if (!dateStr) return "Select";
        return new Date(dateStr).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    useEffect(() => {
        if (!open || Platform.OS !== "android") return;
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            handleClose();
            return true;
        });
        return () => sub.remove();
    }, [open, handleClose]);

    if (!open) return null;

    return (
        <Portal name="create-trip-dialog">
            <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(150)}
                className="justify-end bg-black/50"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: isPicking ? 0 : 1,
                    pointerEvents: isPicking ? "none" : "auto",
                }}
            >
                <Pressable className="flex-1" onPress={handleClose} />

                <Animated.View
                    entering={SlideInDown.duration(300).easing(
                        Easing.out(Easing.cubic)
                    )}
                    exiting={SlideOutDown.duration(200).easing(
                        Easing.in(Easing.cubic)
                    )}
                    className="bg-background rounded-t-3xl"
                    style={{ maxHeight: "90%" }}
                >
                    <View className="items-center pt-3 pb-1">
                        <View className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                    </View>

                    <View className="flex-row items-center justify-between px-5 pb-3">
                        <Text className="text-xl font-semibold text-foreground">
                            New Trip
                        </Text>
                        <TouchableOpacity
                            onPress={handleClose}
                            activeOpacity={0.7}
                        >
                            <Icon
                                as={X}
                                className="size-6 text-muted-foreground"
                            />
                        </TouchableOpacity>
                    </View>

                    <KeyboardAwareScrollView
                        bottomOffset={20}
                        style={{ paddingHorizontal: 20 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingBottom: 32 }}
                    >
                        <TouchableOpacity
                            onPress={pickCoverImage}
                            activeOpacity={0.8}
                            className="mb-5 h-40 rounded-2xl overflow-hidden bg-muted items-center justify-center border border-border"
                        >
                            {coverUri ? (
                                <>
                                    <Image
                                        source={{ uri: coverUri }}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                        }}
                                        contentFit="cover"
                                    />
                                    <View className="absolute inset-0 bg-black/20 items-center justify-center">
                                        <Icon
                                            as={ImagePlus}
                                            className="size-8 text-white"
                                        />
                                    </View>
                                </>
                            ) : (
                                <View className="items-center gap-2">
                                    <Icon
                                        as={ImagePlus}
                                        className="size-8 text-muted-foreground"
                                    />
                                    <Text className="text-sm text-muted-foreground">
                                        Add cover photo
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <View className="gap-4">
                            <View className="gap-1.5">
                                <Label nativeID="title">Title</Label>
                                <Controller
                                    control={control}
                                    name="title"
                                    render={({
                                        field: { onChange, onBlur, value },
                                    }) => (
                                        <Input
                                            placeholder="e.g. Summer Europe Trip"
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            aria-labelledby="title"
                                            autoCapitalize="words"
                                        />
                                    )}
                                />
                                {errors.title && (
                                    <Text className="text-destructive text-sm">
                                        {errors.title.message}
                                    </Text>
                                )}
                            </View>

                            <View className="gap-1.5">
                                <Label nativeID="destination">
                                    Destination
                                </Label>
                                <Controller
                                    control={control}
                                    name="destination"
                                    render={({
                                        field: { onChange, onBlur, value },
                                    }) => (
                                        <Input
                                            placeholder="e.g. Paris, France"
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            aria-labelledby="destination"
                                            autoCapitalize="words"
                                        />
                                    )}
                                />
                                {errors.destination && (
                                    <Text className="text-destructive text-sm">
                                        {errors.destination.message}
                                    </Text>
                                )}
                            </View>

                            <View className="gap-1.5">
                                <Label nativeID="description">
                                    Description (optional)
                                </Label>
                                <Controller
                                    control={control}
                                    name="description"
                                    render={({
                                        field: { onChange, onBlur, value },
                                    }) => (
                                        <Textarea
                                            placeholder="What's this trip about?"
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            value={value}
                                            aria-labelledby="description"
                                        />
                                    )}
                                />
                                {errors.description && (
                                    <Text className="text-destructive text-sm">
                                        {errors.description.message}
                                    </Text>
                                )}
                            </View>

                            <View className="gap-1.5">
                                <Label>Trip Dates (optional)</Label>
                                <View className="flex-row items-center gap-3 border border-border rounded-md px-3 h-10 bg-background">
                                    <Pressable
                                        onPress={() => {
                                            setSelectingEnd(false);
                                            setShowCalendar(!showCalendar);
                                        }}
                                        className="flex-1 flex-row items-center gap-3"
                                    >
                                        <Icon
                                            as={CalendarDays}
                                            className="size-4 text-muted-foreground"
                                        />
                                        <Text className="flex-1 text-sm text-foreground">
                                            {startDate
                                                ? `${formatDateLabel(startDate)}${endDate ? ` - ${formatDateLabel(endDate)}` : ""}`
                                                : "Select dates"}
                                        </Text>
                                    </Pressable>
                                    {startDate && (
                                        <Pressable
                                            onPress={() => {
                                                setStartDate(null);
                                                setEndDate(null);
                                                setShowCalendar(false);
                                            }}
                                            hitSlop={8}
                                        >
                                            <Icon
                                                as={X}
                                                className="size-4 text-muted-foreground"
                                            />
                                        </Pressable>
                                    )}
                                </View>

                                {showCalendar && (
                                    <View className="mt-1">
                                        <Text className="text-xs text-muted-foreground mb-2">
                                            {selectingEnd
                                                ? "Select end date"
                                                : "Select start date"}
                                        </Text>
                                        <Calendar
                                            variant="ghost"
                                            size="sm"
                                            onDayPress={handleDayPress}
                                            markedDates={markedDates}
                                            markingType="period"
                                            minDate={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                        />
                                    </View>
                                )}
                            </View>

                            <Controller
                                control={control}
                                name="isPublic"
                                render={({ field: { onChange, value } }) => (
                                    <View className="flex-row items-center justify-between">
                                        <View className="gap-0.5">
                                            <Label nativeID="isPublic">
                                                Public Trip
                                            </Label>
                                            <Text className="text-muted-foreground text-xs">
                                                Anyone can view this trip
                                            </Text>
                                        </View>
                                        <Switch
                                            checked={value}
                                            onCheckedChange={onChange}
                                            aria-labelledby="isPublic"
                                        />
                                    </View>
                                )}
                            />
                        </View>

                        {submitError && (
                            <Text className="text-destructive text-sm text-center mt-4">
                                {submitError}
                            </Text>
                        )}

                        <View className="flex-row gap-3 mt-6">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onPress={handleClose}
                            >
                                <Text>Cancel</Text>
                            </Button>
                            <Button
                                className="flex-1"
                                onPress={handleSubmit(onSubmit)}
                                disabled={
                                    isSubmitting || coverUploading || isCreating
                                }
                            >
                                <Text>
                                    {coverUploading
                                        ? "Uploading..."
                                        : isSubmitting
                                          ? "Creating..."
                                          : "Create Trip"}
                                </Text>
                            </Button>
                        </View>
                    </KeyboardAwareScrollView>
                </Animated.View>
            </Animated.View>
        </Portal>
    );
}
