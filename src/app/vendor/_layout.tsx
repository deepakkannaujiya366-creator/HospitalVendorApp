import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { router } from "expo-router";
import { VendorUser } from "../../types/auth";
import { getUser } from "../../utils/storage";

export default function VendorLayout() {
    const [user, setUser] = useState<VendorUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const savedUser = await getUser();
            setUser(savedUser);
        } catch (error) {
            console.log("User loading error:", error);
        } finally {
            setLoading(false);
        }
    };

    const firstLetter =
        user?.name?.charAt(0)?.toUpperCase() || "V";

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator
                    size="large"
                    color="#2563EB"
                />

                <Text className="mt-3 text-sm text-slate-500">
                    Loading...
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">

            {/* ================= COMMON HEADER ================= */}

            <View className="bg-blue-600 px-6 pb-6 pt-14">

                <View className="flex-row items-center justify-between">

                    {/* USER INFO */}

                    <View className="flex-1 pr-4">

                        <Text
                            className="text-2xl font-bold text-white"
                            numberOfLines={1}
                        >
                            {user?.name || "Vendor Name"}
                        </Text>

                        <Text className="mt-1 text-sm text-blue-100">
                            Vendor ID: {user?.vendorId || "-"}
                        </Text>

                    </View>

                    {/* AVATAR */}

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.push("/vendor/profile")}
                        className="h-14 w-14 items-center justify-center rounded-full border-2 border-blue-200 bg-white"
                    >
                        <Text className="text-xl font-bold text-blue-600">
                            {firstLetter}
                        </Text>
                    </TouchableOpacity>

                </View>

            </View>

            {/* ================= TABS ================= */}

            <View className="flex-1">

                <Tabs
                    screenOptions={{
                        headerShown: false,

                        tabBarActiveTintColor: "#2563EB",
                        tabBarInactiveTintColor: "#94A3B8",

                        tabBarStyle: {
                            height: 65,
                            paddingTop: 8,
                            paddingBottom: 8,
                            borderTopColor: "#E2E8F0",
                            backgroundColor: "#FFFFFF",
                        },

                        tabBarLabelStyle: {
                            fontSize: 12,
                            fontWeight: "600",
                        },
                    }}
                >

                    <Tabs.Screen
                        name="opd"
                        options={{
                            title: "OPD",
                            tabBarIcon: ({
                                color,
                                size,
                                focused,
                            }) => (
                                <Ionicons
                                    name={
                                        focused
                                            ? "clipboard"
                                            : "clipboard-outline"
                                    }
                                    size={size}
                                    color={color}
                                />
                            ),
                        }}
                    />

                    <Tabs.Screen
                        name="dashboard"
                        options={{
                            title: "Home",
                            tabBarIcon: ({
                                color,
                                size,
                                focused,
                            }) => (
                                <Ionicons
                                    name={
                                        focused
                                            ? "home"
                                            : "home-outline"
                                    }
                                    size={size}
                                    color={color}
                                />
                            ),
                        }}
                    />

                    <Tabs.Screen
                        name="profile"
                        options={{
                            title: "Profile",
                            tabBarIcon: ({
                                color,
                                size,
                                focused,
                            }) => (
                                <Ionicons
                                    name={
                                        focused
                                            ? "person"
                                            : "person-outline"
                                    }
                                    size={size}
                                    color={color}
                                />
                            ),
                        }}
                    />

                    {/* Hide from bottom tab */}
                    <Tabs.Screen
                        name="change-password"
                        options={{
                            href: null,
                        }}
                    />

                </Tabs>

            </View>

        </View>
    );
}