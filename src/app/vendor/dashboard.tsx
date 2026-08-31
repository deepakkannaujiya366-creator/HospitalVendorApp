import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getDashboardData } from "../../services/masterService";
import { VendorUser } from "../../types/auth";
import { getToken, getUser } from "../../utils/storage";

export default function Dashboard() {
  const [user, setUser] = useState<VendorUser | null>(null);

  const [todayOPD, setTodayOPD] = useState(0);
  const [totalOPD, setTotalOPD] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const savedUser = await getUser();
      setUser(savedUser);

      const token = await getToken();

      if (!token) {
        console.log("Authentication token not found");
        return;
      }

      const response = await getDashboardData(token);

      if (response.success) {
        setTodayOPD(Number(response.todayOPD) || 0);
        setTotalOPD(Number(response.totalOPD) || 0);
      }
    } catch (error) {
      console.log("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text className="mt-3 text-sm text-slate-500">
          Loading dashboard...
        </Text>
      </View>
    );
  }

  const firstLetter =
    user?.name?.charAt(0)?.toUpperCase() || "V";

  return (
    <View className="flex-1 bg-slate-50">

      {/* ================= CONTENT ================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
        }}
      >

        {/* ================= TITLE ================= */}

        <View className="mb-6">
          <Text className="text-2xl font-bold text-slate-900">
            Dashboard
          </Text>

          <Text className="mt-1 text-sm text-slate-500">
            Manage your hospital activities
          </Text>
        </View>


        {/* ================= OPD ACTIONS ================= */}

        <View className="flex-row flex-wrap justify-between">

          {/* ================= TODAY OPD ================= */}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              router.push("/vendor/opd?tab=today")
            }
            className="mb-4 w-[48%] rounded-3xl bg-white p-5"
          >

            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">

              <Ionicons
                name="calendar-outline"
                size={24}
                color="#2563EB"
              />

            </View>

            <Text className="mt-4 text-3xl font-bold text-blue-600">
              {todayOPD}
            </Text>

            <Text className="mt-1 text-base font-bold text-slate-800">
              Today OPD
            </Text>

            <Text className="mt-1 text-xs text-slate-500">
              View Today OPD
            </Text>

          </TouchableOpacity>


          {/* ================= MONTHLY OPD ================= */}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              router.push("/vendor/opd?tab=total")
            }
            className="mb-4 w-[48%] rounded-3xl bg-white p-5"
          >

            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">

              <Ionicons
                name="stats-chart-outline"
                size={24}
                color="#059669"
              />

            </View>

            <Text className="mt-4 text-3xl font-bold text-emerald-600">
              {totalOPD}
            </Text>

            <Text className="mt-1 text-base font-bold text-slate-800">
              Monthly OPD
            </Text>

            <Text className="mt-1 text-xs text-slate-500">
              View Monthly OPD
            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>

    </View>
  );
}