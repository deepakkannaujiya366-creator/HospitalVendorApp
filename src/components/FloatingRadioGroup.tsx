import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface RadioOption {
    label: string;
    value: string;
}

interface FloatingRadioGroupProps {
    label?: string;
    value: string;
    onValueChange: (value: string) => void;
    options: RadioOption[];
    error?: string;
    loading?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    align?: "start" | "center" | "end";
}

export default function FloatingRadioGroup({
    label,
    value,
    onValueChange,
    options,
    error,
    loading = false,
    icon,
    align = "start",
}: FloatingRadioGroupProps) {
    {
        const hasError = Boolean(error);

        return (
            <View className="mb-5">
                {/* Label */}
                {/* Label */}
                {(label || icon) && (
                    <View className="mb-3 flex-row items-center">
                        {icon && (
                            <Ionicons
                                name={icon}
                                size={18}
                                color={hasError ? "#EF4444" : "#64748B"}
                            />
                        )}

                        {label && (
                            <Text
                                className={`ml-2 text-sm font-semibold ${hasError
                                        ? "text-red-500"
                                        : "text-slate-600"
                                    }`}
                            >
                                {label}
                            </Text>
                        )}
                    </View>
                )}

                {/* Radio Options */}
                <View
                    className={`flex-row flex-wrap items-center ${align === "center"
                        ? "justify-center"
                        : align === "end"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                >
                    {options.map((option) => {
                        const selected = value === option.value;

                        return (
                            <Pressable
                                key={option.value}
                                onPress={() => {
                                    if (!loading) {
                                        onValueChange(option.value);
                                    }
                                }}
                                disabled={loading}
                                className="mr-8 flex-row items-center"
                            >
                                {/* Radio Circle */}
                                <View
                                    className={`h-5 w-5 items-center justify-center rounded-full border-2 ${selected
                                        ? "border-blue-600"
                                        : hasError
                                            ? "border-red-400"
                                            : "border-slate-400"
                                        }`}
                                >
                                    {selected && (
                                        <View className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                                    )}
                                </View>

                                {/* Text */}
                                <Text
                                    className={`ml-2 text-base ${selected
                                        ? "font-medium text-slate-900"
                                        : "text-slate-600"
                                        }`}
                                >
                                    {option.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Error */}
                {hasError && (
                    <View className="mt-2 flex-row items-center px-1">
                        <Ionicons
                            name="alert-circle-outline"
                            size={15}
                            color="#EF4444"
                        />

                        <Text className="ml-1 text-xs text-red-500">
                            {error}
                        </Text>
                    </View>
                )}
            </View>
        );
    }
}