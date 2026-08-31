import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFilterProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  options: SelectOption[];
}

export default function SelectFilter({
  value,
  onValueChange,
  options,
}: SelectFilterProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleOption = (optionValue: string): void => {
    const updatedValue = value.includes(optionValue)
      ? value.filter((item) => item !== optionValue)
      : [...value, optionValue];

    onValueChange(updatedValue);
  };

  const handleClear = (): void => {
    onValueChange([]);
    setIsOpen(false);
  };

  const handleOutsidePress = (): void => {
    setIsOpen(false);
  };

  return (
    <View>
      {/* FILTER BUTTON */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsOpen((prev) => !prev)}
        className={`h-14 w-14 items-center justify-center rounded-2xl border ${
          isOpen
            ? "border-blue-500 bg-white"
            : "border-slate-200 bg-white"
        }`}
      >
        <Ionicons
          name="filter-outline"
          size={22}
          color={isOpen ? "#2563EB" : "#64748B"}
        />
      </TouchableOpacity>

      {/* DROPDOWN */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={handleOutsidePress}
      >
        <View className="flex-1">

          {/* OUTSIDE CLICK AREA */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleOutsidePress}
            className="absolute inset-0"
          />

          {/* DROPDOWN */}
          <View className="absolute right-5 top-60 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">

            {options.map((option, index) => {
              const isSelected = value.includes(
                option.value
              );

              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.7}
                  onPress={() =>
                    toggleOption(option.value)
                  }
                  className={`flex-row items-center justify-between px-4 py-4 ${
                    index !== options.length - 1
                      ? "border-b border-slate-100"
                      : ""
                  }`}
                >
                  <Text className="text-base text-slate-700">
                    {option.label}
                  </Text>

                  <Ionicons
                    name={
                      isSelected
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={22}
                    color={
                      isSelected
                        ? "#2563EB"
                        : "#94A3B8"
                    }
                  />
                </TouchableOpacity>
              );
            })}

            {/* CLEAR */}
            {value.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleClear}
                className="m-3 items-center rounded-xl bg-slate-100 py-3"
              >
                <Text className="font-semibold text-slate-600">
                  Clear Selection
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}