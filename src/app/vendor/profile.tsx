import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Toast from "react-native-toast-message";

import {
  getVendorDetails,
  VendorDetails,
} from "../../services/masterService";

import { VendorUser } from "../../types/auth";

import {
  clearAuth,
  getToken,
  getUser,
} from "../../utils/storage";

export default function Profile() {
  const [user, setUser] =
    useState<VendorUser | null>(null);

  const [vendor, setVendor] =
    useState<VendorDetails | null>(null);

  const [loading, setLoading] =
    useState(true);

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found"
        );
      }

      /* ================= USER ================= */

      const savedUser = await getUser();

      setUser(savedUser);

      /* ================= VENDOR ================= */

      const vendorData =
        await getVendorDetails(token);      

      setVendor(vendorData);

    } catch (error) {
      console.log(
        "Profile loading error:",
        error
      );

      Toast.show({
        type: "error",
        text1: "Unable to load profile",
        text2:
          "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    Toast.show({
      type: "info",
      text1: "Logout Confirmation",
      text2:
        "Are you sure you want to logout?",
      position: "bottom",
      visibilityTime: 5000,
      autoHide: false,

      props: {
        onConfirm: async () => {
          Toast.hide();

          try {
            await clearAuth();

            Toast.show({
              type: "success",
              text1:
                "Logged Out Successfully",
              text2: "See you again!",
            });

            setTimeout(() => {
              router.replace("/login");
            }, 800);

          } catch (error) {
            console.log(
              "Logout error:",
              error
            );

            Toast.show({
              type: "error",
              text1: "Logout Failed",
              text2:
                "Unable to logout. Please try again.",
            });
          }
        },

        onCancel: () => {
          Toast.hide();
        },
      },
    });
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text className="mt-3 text-sm text-slate-500">
          Loading profile...
        </Text>

      </View>
    );
  }

  /* ================= USER DATA ================= */

  const vendorName =
    vendor?.name ||
    user?.name ||
    "Vendor User";

  const vendorId =
    vendor?.vid ||
    user?.vendorId ||
    "-";

  const firstLetter =
    vendorName
      ?.charAt(0)
      ?.toUpperCase() || "V";

  return (
    <View className="flex-1 bg-slate-50">

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
        }}
      >

        {/* ================================================= */}
        {/* PROFILE HEADER */}
        {/* ================================================= */}

        <View className="items-center rounded-3xl bg-white px-6 pb-6 pt-6">

          {/* PROFILE IMAGE */}

          {vendor?.image ? (

            <Image
              source={{
                uri: vendor.image,
              }}
              className="h-24 w-24 rounded-full border-4 border-blue-100"
              resizeMode="cover"
            />

          ) : (

            <View className="h-24 w-24 items-center justify-center rounded-full border-4 border-blue-100 bg-blue-50">

              <Text className="text-4xl font-bold text-blue-600">
                {firstLetter}
              </Text>

            </View>

          )}

          {/* NAME */}

          <Text className="mt-4 text-xl font-bold text-slate-900">
            {vendorName}
          </Text>

          {/* DESIGNATION */}

          <View className="mt-2 flex-row items-center rounded-full bg-blue-50 px-3 py-1">

            <Ionicons
              name="business-outline"
              size={14}
              color="#2563EB"
            />

            <Text className="ml-1 text-xs font-semibold text-blue-600">
              {vendor?.designation ||
                "Hospital Vendor"}
            </Text>

          </View>

          {/* VENDOR ID */}

          <Text className="mt-3 text-sm text-slate-400">
            Vendor ID: {vendorId}
          </Text>

        </View>

        {/* ================================================= */}
        {/* VENDOR INFORMATION */}
        {/* ================================================= */}

        <Text className="mb-3 mt-7 text-base font-bold text-slate-900">
          Account Information
        </Text>

        <View className="overflow-hidden rounded-3xl bg-white">
          {/* VENDOR ID */}

          <ProfileRow
            icon="card-outline"
            iconBg="bg-indigo-50"
            iconColor="#4F46E5"
            label="Vendor ID"
            value={vendorId}
          />
          {/* NAME */}

          <ProfileRow
            icon="person-outline"
            iconBg="bg-blue-50"
            iconColor="#2563EB"
            label="Vendor Name"
            value={
              vendor?.name ||
              "-"
            }
          />

          {/* DESIGNATION */}

          <ProfileRow
            icon="briefcase-outline"
            iconBg="bg-purple-50"
            iconColor="#7C3AED"
            label="Designation"
            value={
              vendor?.designation ||
              "-"
            }
          />



          {/* CONTACT */}

          <ProfileRow
            icon="call-outline"
            iconBg="bg-emerald-50"
            iconColor="#059669"
            label="Contact Number"
            value={
              vendor?.contactno ||
              "-"
            }
          />

          {/* ALTERNATE CONTACT */}

          <ProfileRow
            icon="call-outline"
            iconBg="bg-orange-50"
            iconColor="#EA580C"
            label="Alternate Contact"
            value={
              vendor?.alternatecontact ||
              "-"
            }
          />

          {/* ADDRESS */}

          <ProfileRow
            icon="location-outline"
            iconBg="bg-red-50"
            iconColor="#DC2626"
            label="Address"
            value={
              vendor?.address ||
              "-"
            }
            multiline
          />

        </View>

        {/* ================================================= */}
        {/* ACCOUNT */}
        {/* ================================================= */}

        <Text className="mb-3 mt-7 text-base font-bold text-slate-900">
          Password
        </Text>

        <View className="overflow-hidden rounded-3xl bg-white">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/vendor/change-password")}
            className="flex-row items-center border-b border-slate-100 px-5 py-4"
          >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#059669"
              />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-slate-800">
                Change Password
              </Text>

              <Text className="mt-1 text-xs text-slate-400">
                Update your account password
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#94A3B8"
            />
          </TouchableOpacity>
        </View>

        {/* ================================================= */}
        {/* LOGOUT */}
        {/* ================================================= */}

        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          className="mt-7 flex-row items-center justify-center rounded-2xl border border-red-200 bg-red-50 py-4"
        >

          <Ionicons
            name="log-out-outline"
            size={21}
            color="#DC2626"
          />

          <Text className="ml-2 text-base font-bold text-red-600">
            Logout
          </Text>

        </TouchableOpacity>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <Text className="mb-3 mt-6 text-center text-xs text-slate-400">
          Hospital Vendor Management System
        </Text>

      </ScrollView>
    </View>
  );
}

/* ================================================= */
/* PROFILE ROW */
/* ================================================= */

interface ProfileRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  multiline?: boolean;
}

function ProfileRow({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  multiline = false,
}: ProfileRowProps) {
  return (
    <View className="flex-row items-center border-b border-slate-100 px-5 py-4">

      {/* ICON */}

      <View
        className={`h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
      >

        <Ionicons
          name={icon}
          size={20}
          color={iconColor}
        />

      </View>

      {/* CONTENT */}

      <View className="ml-3 flex-1">

        <Text className="text-xs text-slate-400">
          {label}
        </Text>

        <Text
          className={`mt-1 text-sm font-semibold text-slate-800 ${multiline
            ? "leading-5"
            : ""
            }`}
        >
          {value || "-"}
        </Text>

      </View>

    </View>
  );
}