import { router } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getToken } from "../utils/storage";

export default function Index() {
  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async (): Promise<void> => {
    try {
      const token = await getToken();

      if (token) {
        router.replace("/vendor/dashboard");
      } else {
        router.replace("/login");
      }
    } catch (error) {
      router.replace("/login");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🏥</Text>

      <Text style={styles.title}>
        Hospital Vendor
      </Text>

      <ActivityIndicator
        size="large"
        color="#1976D2"
        style={styles.loader}
      />

      <Text style={styles.loadingText}>
        Loading...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    fontSize: 65,
    marginBottom: 15,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },

  loader: {
    marginTop: 30,
  },

  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
});