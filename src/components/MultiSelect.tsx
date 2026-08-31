import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label: string;
  value: string[];
  onValueChange: (value: string[]) => void;
  options: MultiSelectOption[];
  error?: string;
  placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

export default function MultiSelect({
  label,
  value = [],
  onValueChange,
  options,
  error,
  placeholder = "Select options",
  icon = "options-outline",
  disabled = false,
}: MultiSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // =========================================
  // SELECT / UNSELECT OPTION
  // =========================================

  const toggleOption = (optionValue: string): void => {
    if (disabled) return;

    const isSelected = value.includes(optionValue);

    if (isSelected) {
      onValueChange(
        value.filter(
          (item) => item !== optionValue
        )
      );
    } else {
      onValueChange([
        ...value,
        optionValue,
      ]);
    }
  };

  // =========================================
  // REMOVE SELECTED ITEM
  // =========================================

  const removeOption = (
    optionValue: string
  ): void => {
    if (disabled) return;

    onValueChange(
      value.filter(
        (item) => item !== optionValue
      )
    );
  };

  // =========================================
  // GET SELECTED LABELS
  // =========================================

  const getSelectedLabels = (): string[] => {
    return options
      .filter((option) =>
        value.includes(option.value)
      )
      .map((option) => option.label);
  };

  const selectedLabels =
    getSelectedLabels();

  return (
    <View>
      {/* ================= LABEL ================= */}

      <Text className="mb-2 text-sm font-medium text-slate-700">
        {label}
      </Text>

      {/* ================= SELECT BOX ================= */}

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled}
        onPress={() =>
          setModalVisible(true)
        }
        className={`min-h-14 flex-row items-center rounded-2xl border bg-white px-4 ${
          error
            ? "border-red-500"
            : "border-slate-200"
        } ${
          disabled
            ? "opacity-50"
            : ""
        }`}
      >
        {/* ICON */}

        <Ionicons
          name={icon}
          size={21}
          color="#64748B"
        />

        {/* SELECTED VALUES */}

        <View className="ml-3 flex-1">
          {selectedLabels.length === 0 ? (
            <Text className="text-sm text-slate-400">
              {placeholder}
            </Text>
          ) : (
            <Text
              numberOfLines={1}
              className="text-sm font-medium text-slate-700"
            >
              {selectedLabels.join(", ")}
            </Text>
          )}
        </View>

        {/* ARROW */}

        <Ionicons
          name="chevron-down-outline"
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {/* ================= SELECTED CHIPS ================= */}

      {selectedLabels.length > 0 && (
        <View className="mt-2 flex-row flex-wrap gap-2">
          {options
            .filter((option) =>
              value.includes(option.value)
            )
            .map((option) => (
              <View
                key={option.value}
                className="flex-row items-center rounded-full bg-blue-50 px-3 py-1"
              >
                <Text className="text-xs font-medium text-blue-700">
                  {option.label}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    removeOption(option.value)
                  }
                  className="ml-1"
                >
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color="#2563EB"
                  />
                </TouchableOpacity>
              </View>
            ))}
        </View>
      )}

      {/* ================= ERROR ================= */}

      {!!error && (
        <Text className="mt-1 text-xs text-red-500">
          {error}
        </Text>
      )}

      {/* ================= MODAL ================= */}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setModalVisible(false)
        }
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-[75%] rounded-t-3xl bg-white">
            {/* HEADER */}

            <View className="flex-row items-center justify-between border-b border-slate-200 px-5 py-4">
              <View>
                <Text className="text-lg font-bold text-slate-800">
                  {label}
                </Text>

                <Text className="mt-1 text-xs text-slate-400">
                  Select one or more options
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setModalVisible(false)
                }
                className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#475569"
                />
              </TouchableOpacity>
            </View>

            {/* OPTIONS */}

            <ScrollView
              className="px-5"
              showsVerticalScrollIndicator={false}
            >
              <View className="py-3">
                {options.map((option) => {
                  const isSelected =
                    value.includes(option.value);

                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.7}
                      onPress={() =>
                        toggleOption(
                          option.value
                        )
                      }
                      className={`mb-2 flex-row items-center rounded-2xl border px-4 py-4 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      {/* CHECKBOX */}

                      <View
                        className={`h-6 w-6 items-center justify-center rounded-lg border ${
                          isSelected
                            ? "border-blue-600 bg-blue-600"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={17}
                            color="#FFFFFF"
                          />
                        )}
                      </View>

                      {/* OPTION LABEL */}

                      <Text
                        className={`ml-3 flex-1 text-sm ${
                          isSelected
                            ? "font-semibold text-blue-700"
                            : "text-slate-700"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* FOOTER */}

            <View className="flex-row border-t border-slate-200 px-5 py-4">
              <TouchableOpacity
                onPress={() =>
                  onValueChange([])
                }
                className="mr-3 flex-1 items-center justify-center rounded-xl bg-slate-100 py-3"
              >
                <Text className="font-semibold text-slate-600">
                  Clear
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setModalVisible(false)
                }
                className="flex-1 items-center justify-center rounded-xl bg-blue-600 py-3"
              >
                <Text className="font-semibold text-white">
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}