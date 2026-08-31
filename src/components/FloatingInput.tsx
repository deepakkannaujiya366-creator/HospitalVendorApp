import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from "react-native";

interface FloatingInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  loading?: boolean;
  error?: string;
}

export default function FloatingInput({
  label,
  value,
  onChangeText,
  icon = "person-outline",
  isPassword = false,
  loading = false,
  error,
  ...props
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasValue = value.length > 0;
  const isActive = focused || hasValue;

  const hasError = Boolean(error);

  return (
    <View className="mb-7">

      {/* ================= INPUT BOX ================= */}

      <View
        className={`h-16 flex-row items-center rounded-2xl border px-4 ${
          hasError
            ? "border-red-500 bg-red-50"
            : focused
            ? "border-blue-600 bg-white"
            : "border-slate-200 bg-slate-50"
        }`}
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
          color={
            hasError
              ? "#EF4444"
              : focused
              ? "#2563EB"
              : "#64748B"
          }
        />

        {/* Input */}
        <TextInput
          className="ml-3 h-full flex-1 text-base text-slate-900"
          value={value}
          onChangeText={onChangeText}
          placeholder={isActive ? "" : label}
          placeholderTextColor="#94A3B8"
          editable={!loading}
          secureTextEntry={isPassword && !showPassword}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          {...props}
        />

        {/* Password Eye Button */}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            disabled={loading}
            activeOpacity={0.7}
            className="ml-2 h-10 w-10 items-center justify-center"
          >
            <Ionicons
              name={
                showPassword
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={22}
              color={hasError ? "#EF4444" : "#2563EB"}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* ================= ERROR MESSAGE ================= */}

      {hasError && (
        <View className="mt-1 flex-row items-center">
          <Ionicons
            name="alert-circle-outline"
            size={14}
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