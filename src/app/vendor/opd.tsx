import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AddOpdForm from "../../components/opd/AddOpdForm";
import TodayOpd from "../../components/opd/TodayOpd";
import TotalOpd from "../../components/opd/TotalOpd";

type OpdTab = "add" | "today" | "total";

export default function Opd() {
  const { tab } = useLocalSearchParams<{
    tab?: string;
  }>();

  const [activeTab, setActiveTab] = useState<OpdTab>("add");

  useEffect(() => {
    if (tab === "today") {
      setActiveTab("today");
    } else if (tab === "total") {
      setActiveTab("total");
    } else {
      setActiveTab("add");
    }
  }, [tab]);
  return (
    <View className="flex-1 bg-slate-50">

      {/* ================= TOP TABS ================= */}
      <View className="border-b border-slate-200 bg-white">

        <View className="flex-row">

          {/* ADD OPD */}
          <TouchableOpacity
            onPress={() => setActiveTab("add")}
            className="flex-1 items-center py-4"
            activeOpacity={0.7}
          >
            <Ionicons
              name="add-circle-outline"
              size={21}
              color={
                activeTab === "add"
                  ? "#2563EB"
                  : "#94A3B8"
              }
            />

            <Text
              className={`mt-1 text-xs font-semibold ${activeTab === "add"
                  ? "text-blue-600"
                  : "text-slate-400"
                }`}
            >
              Add OPD
            </Text>

            {activeTab === "add" && (
              <View className="absolute bottom-0 h-1 w-full bg-blue-600" />
            )}
          </TouchableOpacity>

          {/* TODAY OPD */}
          <TouchableOpacity
            onPress={() => setActiveTab("today")}
            className="flex-1 items-center py-4"
            activeOpacity={0.7}
          >
            <Ionicons
              name="calendar-outline"
              size={21}
              color={
                activeTab === "today"
                  ? "#2563EB"
                  : "#94A3B8"
              }
            />

            <Text
              className={`mt-1 text-xs font-semibold ${activeTab === "today"
                  ? "text-blue-600"
                  : "text-slate-400"
                }`}
            >
              Today OPD
            </Text>

            {activeTab === "today" && (
              <View className="absolute bottom-0 h-1 w-full bg-blue-600" />
            )}
          </TouchableOpacity>

          {/* TOTAL OPD */}
          <TouchableOpacity
            onPress={() => setActiveTab("total")}
            className="flex-1 items-center py-4"
            activeOpacity={0.7}
          >
            <Ionicons
              name="list-outline"
              size={21}
              color={
                activeTab === "total"
                  ? "#2563EB"
                  : "#94A3B8"
              }
            />

            <Text
              className={`mt-1 text-xs font-semibold ${activeTab === "total"
                  ? "text-blue-600"
                  : "text-slate-400"
                }`}
            >
              Monthly OPD
            </Text>

            {activeTab === "total" && (
              <View className="absolute bottom-0 h-1 w-full bg-blue-600" />
            )}
          </TouchableOpacity>

        </View>
      </View>

      {/* ================= TAB CONTENT ================= */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "add" && <AddOpdForm />}

        {activeTab === "today" && <TodayOpd />}

        {activeTab === "total" && <TotalOpd />}
      </ScrollView>
    </View>
  );
}