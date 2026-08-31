import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import FloatingInput from "../components/FloatingInput";
import LoginButton from "../components/LoginButton";
import { vendorLogin } from "../services/authService";
import { saveToken, saveUser } from "../utils/storage";

export default function Login() {
  const [vendorId, setVendorId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    if (!vendorId.trim()) {
      Toast.show({
        type: "error",
        text1: "Vendor ID Required",
        text2: "Please enter your Vendor ID.",
      });
      return;
    }

    if (!password.trim()) {
      Toast.show({
        type: "error",
        text1: "Password Required",
        text2: "Please enter your password.",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await vendorLogin(vendorId.trim(), password);

      if (!response?.token) {
        throw new Error(
          response?.message || "Login token not received."
        );
      }

      await saveToken(response.token);

      await saveUser({
        id: response.vendorid,
        name: response.vendorname,
        vendorId: response.vendorid,
      });

      Toast.show({
        type: "success",
        text1: "Login Successful 🎉",
        text2: `Welcome, ${response.vendorname || "Vendor"}!`,
      });

      setTimeout(() => {
        router.replace("/vendor/dashboard");
      }, 200);

    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to login. Please try again.";

      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-10">
          <View className="rounded-3xl border border-slate-100 bg-white p-6">

            <View className="mb-10 items-center">
              <View className="mb-5 h-24 w-24 items-center justify-center rounded-full bg-blue-100">
                <Text className="text-5xl">🏥</Text>
              </View>

              <Text className="text-center text-3xl font-bold text-slate-900">
                Vendor Login
              </Text>

              <Text className="mt-3 text-center text-base leading-6 text-slate-500">
                Sign in to access your{"\n"}
                Hospital Vendor Dashboard
              </Text>
            </View>

            <FloatingInput
              label="Vendor ID"
              value={vendorId}
              onChangeText={setVendorId}
              icon="person-outline"
              autoCapitalize="none"
              autoCorrect={false}
              loading={loading}
            />

            <FloatingInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              isPassword={true}
              loading={loading}
            />

            <LoginButton
              title="LOGIN"
              onPress={handleLogin}
              loading={loading}
              icon="arrow-forward"
            />

            <View className="mt-6 flex-row items-center justify-center">
              <Text className="text-sm text-slate-400">🔐</Text>
              <Text className="ml-1 text-sm text-slate-400">
                Secure Vendor Access
              </Text>
            </View>

            <View className="mt-10 items-center">
              <Text className="text-center text-xs text-slate-400">
                Developed by Torrent Infotech
              </Text>
            </View>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}