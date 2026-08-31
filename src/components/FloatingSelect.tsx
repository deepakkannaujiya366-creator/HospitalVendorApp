import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SelectOption {
  label: string;
  value: string;
}

interface FloatingSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  placeholder?: string;

  // Validation Error
  error?: string;
}

export default function FloatingSelect({
  label,
  value,
  onValueChange,
  options,
  icon = "chevron-down-outline",
  loading = false,
  placeholder,
  error,
}: FloatingSelectProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  const displayValue = selectedOption?.label || "";
  const hasValue = value.length > 0;
  const isActive = focused || hasValue;

  const hasError = Boolean(error);

  const handleOpen = () => {
    if (loading) return;

    setFocused(true);
    setVisible(true);
  };

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);

    setVisible(false);
    setFocused(false);
  };

  const handleClose = () => {
    setVisible(false);
    setFocused(false);
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
      {/* ================= SELECT BOX ================= */}
      <TouchableOpacity
        onPress={handleOpen}
        activeOpacity={0.8}
        disabled={loading}
        className={`h-16 flex-row items-center rounded-2xl border px-4 ${borderClass}`}
      >
        {/* Floating Label */}
        {isActive && (
          <Text
            className={`absolute -top-3 left-4 z-10 px-2 text-xs font-semibold ${hasError
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

        {/* Selected Value */}
        <Text
          className={`ml-3 flex-1 text-base ${hasValue
            ? "text-slate-900"
            : "text-slate-400"
            }`}
          numberOfLines={1}
        >
          {displayValue || placeholder || label}
        </Text>

        {/* Dropdown Arrow */}
        <Ionicons
          name={
            visible
              ? "chevron-up-outline"
              : "chevron-down-outline"
          }
          size={22}
          color={iconColor}
        />
      </TouchableOpacity>

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

      {/* ================= DROPDOWN MODAL ================= */}
      {/* ================= DROPDOWN MODAL ================= */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        {/* Backdrop */}
        <View className="flex-1 items-center justify-center bg-black/40 px-5">

          {/* Backdrop Press */}
          <TouchableOpacity
            className="absolute inset-0"
            activeOpacity={1}
            onPress={handleClose}
          />

          {/* Modal Box */}
          <View
            className="w-full overflow-hidden rounded-3xl bg-white"
            style={{
              maxHeight: "70%",
            }}
          >
            {/* ================= FIXED HEADER ================= */}
            <View className="flex-row items-center justify-between border-b border-slate-100 px-5 py-4">

              <Text
                className="flex-1 pr-3 text-lg font-bold text-slate-900"
                numberOfLines={1}
              >
                Select {label}
              </Text>

              <TouchableOpacity
                onPress={handleClose}
                activeOpacity={0.7}
                className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#475569"
                />
              </TouchableOpacity>
            </View>

            {/* ================= SCROLLABLE OPTIONS ================= */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingVertical: 16,
                paddingBottom: 24,
              }}
            >
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    activeOpacity={0.7}
                    className={`mb-2 flex-row items-center justify-between rounded-2xl px-4 py-4 ${isSelected
                        ? "bg-blue-50"
                        : "bg-slate-50"
                      }`}
                  >
                    <Text
                      className={`flex-1 pr-3 text-base ${isSelected
                          ? "font-semibold text-blue-600"
                          : "text-slate-700"
                        }`}
                    >
                      {option.label}
                    </Text>

                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#2563EB"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

          </View>
        </View>
      </Modal>
    </View>
  );
}