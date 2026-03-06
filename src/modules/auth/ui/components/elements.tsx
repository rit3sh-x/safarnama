import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Control, Controller, FieldError, FieldValues, Path } from "react-hook-form";
import { ActivityIndicator, TextInputProps, TouchableOpacity, View } from "react-native";

interface FormFieldProps<T extends FieldValues> extends Omit<TextInputProps, 'onChangeText' | 'onBlur' | 'value'> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    error?: FieldError;
    secureToggle?: boolean;
}

export function FormField<T extends FieldValues>({
    control,
    name,
    label,
    error,
    secureToggle,
    ...inputProps
}: FormFieldProps<T>) {
    const [secure, setSecure] = useState(!!inputProps.secureTextEntry);

    return (
        <View className="mb-4">
            <Label className="mb-2">{label}</Label>

            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                    <View className="relative">
                        <Input
                            className={cn(
                                "rounded-lg",
                                secureToggle && "pr-12",
                                error && "border-destructive"
                            )}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            secureTextEntry={secure}
                            autoCapitalize="none"
                            aria-invalid={!!error}
                            {...inputProps}
                        />
                        {secureToggle && (
                            <TouchableOpacity
                                onPress={() => setSecure((v) => !v)}
                                className="absolute right-3 top-2.5 p-1"
                            >
                                <Text className="text-base">
                                    {secure ? "👁" : "🙈"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />

            {error && (
                <Text variant="muted" className="text-destructive mt-1.5 ml-1">
                    {error.message}
                </Text>
            )}
        </View>
    );
}

interface PrimaryButtonProps {
    label: string;
    onPress: () => void;
    loading?: boolean;
    className?: string;
}

export function PrimaryButton({
    label,
    onPress,
    loading,
    className = "",
}: PrimaryButtonProps) {
    return (
        <Button
            onPress={onPress}
            disabled={loading}
            size="lg"
            className={cn("mt-2 rounded-lg", className)}
        >
            {loading ? (
                <ActivityIndicator color="hsl(var(--primary-foreground))" />
            ) : (
                <Text className="text-primary-foreground font-semibold">
                    {label}
                </Text>
            )}
        </Button>
    );
}

export function Divider({ label = "OR" }: { label?: string }) {
    return (
        <View className="flex-row items-center my-6 gap-3">
            <Separator className="flex-1" />
            <Text variant="small" className="text-muted-foreground">
                {label}
            </Text>
            <Separator className="flex-1" />
        </View>
    );
}

interface SocialButtonProps {
    onPress: () => void;
    icon: string;
}

export function SocialButton({ onPress, icon }: SocialButtonProps) {
    return (
        <Button
            variant="outline"
            size="icon"
            onPress={onPress}
            className="w-12 h-12 rounded-lg"
        >
            <Text className="text-xl">{icon}</Text>
        </Button>
    );
}

interface FooterLinkProps {
    text: string;
    linkText: string;
    onPress: () => void;
}

export function FooterLink({ text, linkText, onPress }: FooterLinkProps) {
    return (
        <View className="flex-row justify-center mt-8">
            <Text variant="small" className="text-muted-foreground">
                {text}{" "}
            </Text>
            <TouchableOpacity onPress={onPress}>
                <Text variant="small" className="font-semibold text-foreground">
                    {linkText}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

export function AuthContainer({
    children,
    title,
    subtitle,
}: {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}) {
    return (
        <View className="flex-1 bg-background px-6 pt-16">
            <Text variant="h1" className="text-left mb-2">
                {title}
            </Text>
            {subtitle && (
                <Text variant="muted" className="mb-8">
                    {subtitle}
                </Text>
            )}
            <View>{children}</View>
        </View>
    );
}