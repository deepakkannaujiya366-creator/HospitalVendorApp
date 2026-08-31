import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface AgeValue {
  years: string;
  months: string;
  days: string;
}

interface AgePickerProps {
  value: AgeValue;
  onChange: (age: AgeValue) => void;
  error?: string;
  loading?: boolean;
}

export default function AgePicker({
  value,
  onChange,
  error,
  loading = false,
}: AgePickerProps) {
  const [visible, setVisible] = useState(false);

  const years = Array.from(
    { length: 121 },
    (_, index) => String(index)
  );

  const months = Array.from(
    { length: 12 },
    (_, index) => String(index)
  );

  const days = Array.from(
    { length: 32 },
    (_, index) => String(index)
  );

  const displayAge =
    value.years || value.months || value.days
      ? `${value.years || 0}Y ${value.months || 0}M ${value.days || 0}D`
      : "";

  const handleChange = (
    field: keyof AgeValue,
    selectedValue: string
  ) => {
    onChange({
      ...value,
      [field]: selectedValue,
    });
  };
  
  const [activeDropdown, setActiveDropdown] = useState<
    keyof AgeValue | null
  >(null);

  return (
    <View className="mb-7">
      <TouchableOpacity
        onPress={() => {
          if (!loading) {
            setVisible(true);
          }
        }}
        disabled={loading}
        activeOpacity={0.8}
        className={`h-16 flex-row items-center rounded-2xl border px-4 ${error
          ? "border-red-500 bg-red-50"
          : "border-slate-200 bg-slate-50"
          }`}
      >
        <Ionicons
          name="hourglass-outline"
          size={21}
          color={error ? "#EF4444" : "#64748B"}
        />

        <Text
          className={`ml-3 flex-1 text-base ${displayAge
            ? "text-slate-900"
            : "text-slate-400"
            }`}
        >
          {displayAge || "Age"}
        </Text>

        <Ionicons
          name="chevron-down-outline"
          size={20}
          color="#64748B"
        />
      </TouchableOpacity>

      {error && (
        <View className="mt-2 flex-row items-center">
          <Ionicons
            name="alert-circle-outline"
            size={16}
            color="#EF4444"
          />

          <Text className="ml-1 text-xs text-red-500">
            {error}
          </Text>
        </View>
      )}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-5">

          {/* Backdrop */}
          <TouchableOpacity
            className="absolute inset-0"
            activeOpacity={1}
            onPress={() => setVisible(false)}
          />

          {/* Modal Box */}
          <View
            className="w-full overflow-hidden rounded-3xl bg-white"
            style={{ maxHeight: "75%" }}
          >
            {/* ================= FIXED HEADER ================= */}
            <View className="flex-row items-center justify-between border-b border-slate-100 px-5 py-4">
              <Text className="text-lg font-bold text-slate-900">
                Select Age
              </Text>

              <TouchableOpacity
                onPress={() => setVisible(false)}
                className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#475569"
                />
              </TouchableOpacity>
            </View>

            {/* ================= SCROLLABLE CONTENT ================= */}
            {/* ================= AGE DROPDOWNS ================= */}
            <View className="px-5 py-5">
              <View className="flex-row">

                {/* ================= YEARS ================= */}
                <View className="flex-1 pr-1">
                  <Text className="mb-2 text-sm font-semibold text-slate-700">
                    Years
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      setActiveDropdown(
                        activeDropdown === "years" ? null : "years"
                      )
                    }
                    className={`h-12 flex-row items-center justify-between rounded-xl border px-3 ${activeDropdown === "years"
                        ? "border-blue-500"
                        : "border-slate-200"
                      }`}
                  >
                    <Text className="text-slate-800">
                      {value.years || "0"}
                    </Text>

                    <Ionicons
                      name={
                        activeDropdown === "years"
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>

                {/* ================= MONTHS ================= */}
                <View className="flex-1 px-1">
                  <Text className="mb-2 text-sm font-semibold text-slate-700">
                    Months
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      setActiveDropdown(
                        activeDropdown === "months" ? null : "months"
                      )
                    }
                    className={`h-12 flex-row items-center justify-between rounded-xl border px-3 ${activeDropdown === "months"
                        ? "border-blue-500"
                        : "border-slate-200"
                      }`}
                  >
                    <Text className="text-slate-800">
                      {value.months || "0"}
                    </Text>

                    <Ionicons
                      name={
                        activeDropdown === "months"
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>

                {/* ================= DAYS ================= */}
                <View className="flex-1 pl-1">
                  <Text className="mb-2 text-sm font-semibold text-slate-700">
                    Days
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      setActiveDropdown(
                        activeDropdown === "days" ? null : "days"
                      )
                    }
                    className={`h-12 flex-row items-center justify-between rounded-xl border px-3 ${activeDropdown === "days"
                        ? "border-blue-500"
                        : "border-slate-200"
                      }`}
                  >
                    <Text className="text-slate-800">
                      {value.days || "0"}
                    </Text>

                    <Ionicons
                      name={
                        activeDropdown === "days"
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* ================= DROPDOWN OPTIONS ================= */}
              {activeDropdown && (
                <ScrollView
                  className="mt-5 max-h-72 rounded-2xl border border-slate-200 bg-slate-50"
                  showsVerticalScrollIndicator={false}
                >
                  <View className="flex-row flex-wrap p-2">
                    {(activeDropdown === "years"
                      ? years
                      : activeDropdown === "months"
                        ? months
                        : days
                    ).map((item) => {
                      const isSelected = value[activeDropdown] === item;

                      return (
                        <TouchableOpacity
                          key={`${activeDropdown}-${item}`}
                          onPress={() => {
                            handleChange(activeDropdown, item);
                            setActiveDropdown(null);
                          }}
                          className={`m-1 h-11 min-w-12 items-center justify-center rounded-xl px-3 ${isSelected
                              ? "bg-blue-600"
                              : "bg-white"
                            }`}
                        >
                          <Text
                            className={
                              isSelected
                                ? "font-semibold text-white"
                                : "text-slate-700"
                            }
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              )}
            </View>

            {/* ================= FIXED FOOTER ================= */}
            <View className="border-t border-slate-100 px-5 py-4">
              <TouchableOpacity
                onPress={() => setVisible(false)}
                className="h-14 items-center justify-center rounded-2xl bg-blue-600"
              >
                <Text className="font-bold text-white">
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