import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
    Platform,
    Pressable,
    Text,
    View,
} from "react-native";

interface FloatingDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  maximumDate?: Date;
  minimumDate?: Date;
  loading?: boolean;

  // Validation Error
  error?: string;
}

export default function FloatingDatePicker({
  label,
  value,
  onChange,
  icon = "calendar-outline",
  maximumDate,
  minimumDate,
  loading = false,
  error,
}: FloatingDatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [focused, setFocused] = useState(false);

  const isActive = focused || value !== null;
  const hasError = Boolean(error);

  const formatDate = (date: Date | null): string => {
    if (!date) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const handleChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      setFocused(false);
    }

    if (event.type === "set" && selectedDate) {
      onChange(selectedDate);
    }
  };

  const handleOpenPicker = () => {
    if (loading) return;

    setFocused(true);
    setShowPicker(true);
  };

  const borderClass = hasError
    ? "border-red-500 bg-red-50"
    : focused
    ? "border-blue-600 bg-white"
    : "border-slate-200 bg-slate-50";

  const iconColor = hasError
    ? "#EF4444"
    : focused
    ? "#2563EB"
    : "#64748B";

  return (
    <View className="mb-5">
      {/* ================= DATE INPUT ================= */}
      <Pressable
        onPress={handleOpenPicker}
        disabled={loading}
        className={`h-16 flex-row items-center rounded-2xl border px-4 ${borderClass}`}
      >
        {/* Floating Label */}
        {isActive && (
          <Text
            className={`absolute -top-3 left-4 z-10 px-2 text-xs font-semibold ${
              hasError
                ? "bg-red-50 text-red-500"
                : "bg-white text-blue-600"
            }`}
          >
            {label}
          </Text>
        )}

        {/* Left Icon */}
        <Ionicons
          name={icon}
          size={21}
          color={iconColor}
        />

        {/* Selected Date / Placeholder */}
        <Text
          className={`ml-3 flex-1 text-base ${
            value
              ? "text-slate-900"
              : "text-slate-400"
          }`}
        >
          {value ? formatDate(value) : label}
        </Text>

        {/* Dropdown Icon */}
        <Ionicons
          name="calendar-outline"
          size={21}
          color={iconColor}
        />
      </Pressable>

      {/* ================= ERROR MESSAGE ================= */}
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

      {/* ================= DATE PICKER ================= */}
      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={
            Platform.OS === "ios"
              ? "spinner"
              : "default"
          }
          onChange={handleChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
}