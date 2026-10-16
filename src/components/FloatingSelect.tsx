import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
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
  const [searchText, setSearchText] = useState("");

  const selectedOption = options.find(
    (option) => option.value === value
  );

  const displayValue = selectedOption?.label || "";
  const hasValue = value.length > 0;
  const isActive = focused || hasValue;

  const hasError = Boolean(error);

  // ==========================================
  // FILTER OPTIONS
  // ==========================================

  const filteredOptions = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    if (!search) {
      return options;
    }

    return options.filter((option) => {
      const label = String(option.label || "").toLowerCase();
      const value = String(option.value || "").toLowerCase();

      return (
        label.includes(search) ||
        value.includes(search)
      );
    });
  }, [options, searchText]);

  // ==========================================
  // OPEN DROPDOWN
  // ==========================================

  const handleOpen = () => {
    if (loading) return;

    setSearchText("");
    setFocused(true);
    setVisible(true);
  };

  // ==========================================
  // SELECT OPTION
  // ==========================================

  const handleSelect = (selectedValue: string) => {
    Keyboard.dismiss();

    setSearchText("");
    setVisible(false);
    setFocused(false);

    onValueChange(selectedValue);
  };

  // ==========================================
  // CLOSE DROPDOWN
  // ==========================================

  const handleClose = () => {
    setSearchText("");
    setVisible(false);
    setFocused(false);
  };

  // ==========================================
  // BORDER
  // ==========================================

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

      {/* ==========================================
          SELECT BOX
      ========================================== */}

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

      {/* ==========================================
          ERROR
      ========================================== */}

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

      {/* ==========================================
          DROPDOWN MODAL
      ========================================== */}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >

        {/* Backdrop */}

        <View className="flex-1 items-center justify-center bg-black/40 px-5">

          <TouchableOpacity
            className="absolute inset-0"
            activeOpacity={1}
            onPress={handleClose}
          />

          {/* Modal Box */}

          <View
            className="w-full overflow-hidden rounded-3xl bg-white"
            style={{
              maxHeight: "75%",
            }}
          >

            {/* ==========================================
                HEADER
            ========================================== */}

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

            {/* ==========================================
                SEARCH BOX
            ========================================== */}

            <View className="px-5 pt-4">

              <View className="flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-4">

                <Ionicons
                  name="search-outline"
                  size={20}
                  color="#64748B"
                />

                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder={`Search ${label}...`}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="ml-3 flex-1 py-4 text-base text-slate-900"
                />

                {searchText.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchText("")}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                )}

              </View>

            </View>

            {/* ==========================================
                RESULT COUNT
            ========================================== */}

            <View className="px-5 pt-3">

              <Text className="text-xs font-medium text-slate-500">
                {filteredOptions.length} result
                {filteredOptions.length !== 1 ? "s" : ""}
              </Text>

            </View>

            {/* ==========================================
                OPTIONS
            ========================================== */}

            <ScrollView
              keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingVertical: 16,
                paddingBottom: 24,
              }}
            >
              {filteredOptions.map((option) => {
                const isSelected = option.value === value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
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
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

        </View>

      </Modal>

    </View>
  );
}