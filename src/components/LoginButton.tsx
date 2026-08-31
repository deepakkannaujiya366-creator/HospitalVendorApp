import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface AppButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
}

export default function AppButton({
    title,
    onPress,
    loading = false,
    disabled = false,
    icon = "arrow-forward",
}: AppButtonProps) {
    const isDisabled = loading || disabled;

    return (
        <TouchableOpacity
            className={`h-14 items-center justify-center rounded-2xl ${isDisabled ? "bg-blue-400" : "bg-blue-600"
                }`}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.85}
        >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" />
            ) : (
                <View className="flex-row items-center justify-center">
                    <Text className="text-base font-bold tracking-wide text-white">
                        {title}
                    </Text>

                    {icon && (
                        <View className="ml-2 items-center justify-center">
                            <Ionicons
                                name={icon}
                                size={20}
                                color="#FFFFFF"
                            />
                        </View>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}