import { Stack } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import "../../global.css";

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#16A34A",
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: "700",
      }}
      text2Style={{
        fontSize: 13,
      }}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 15,
        fontWeight: "700",
      }}
      text2Style={{
        fontSize: 13,
      }}
    />
  ),

  info: ({ text1, text2, props }: any) => (
    <View
      style={{
        width: "90%",
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        elevation: 8,
      }}
    >
      <Text
        style={{
          fontSize: 17,
          fontWeight: "700",
          color: "#0F172A",
        }}
      >
        {text1}
      </Text>

      <Text
        style={{
          marginTop: 6,
          fontSize: 14,
          color: "#64748B",
        }}
      >
        {text2}
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginTop: 18,
        }}
      >
        <TouchableOpacity
          onPress={props.onCancel}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 16,
            marginRight: 10,
          }}
        >
          <Text
            style={{
              color: "#64748B",
              fontWeight: "600",
            }}
          >
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={props.onConfirm}
          style={{
            backgroundColor: "#DC2626",
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "700",
            }}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  ),
};

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="vendor" />
      </Stack>

      <Toast config={toastConfig} />
    </>
  );
}