import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import Toast from "react-native-toast-message";

import { apiRequest } from "../../services/api";
import { clearAuth, getToken } from "../../utils/storage";

interface ChangePasswordForm {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface PasswordFieldProps {
    label: string;
    value: string;
    field: keyof ChangePasswordForm;
    visible: boolean;
    onChange: (
        field: keyof ChangePasswordForm,
        value: string
    ) => void;
    onToggle: () => void;
}

/* ================================================= */
/* PASSWORD FIELD */
/* ================================================= */

function PasswordField({
    label,
    value,
    field,
    visible,
    onChange,
    onToggle,
}: PasswordFieldProps) {
    return (
        <View className="mb-5">

            <Text className="mb-2 text-sm font-semibold text-slate-700">
                {label}
            </Text>

            <View className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-4">

                <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#64748B"
                />

                <TextInput
                    value={value}
                    onChangeText={(text) =>
                        onChange(field, text)
                    }
                    secureTextEntry={!visible}
                    placeholder={label}
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="ml-3 h-14 flex-1 text-base text-slate-800"
                    returnKeyType={
                        field === "confirmPassword"
                            ? "done"
                            : "next"
                    }
                />

                <TouchableOpacity
                    onPress={onToggle}
                    activeOpacity={0.7}
                    className="p-1"
                >
                    <Ionicons
                        name={
                            visible
                                ? "eye-outline"
                                : "eye-off-outline"
                        }
                        size={21}
                        color="#64748B"
                    />
                </TouchableOpacity>

            </View>
        </View>
    );
}

/* ================================================= */
/* CHANGE PASSWORD */
/* ================================================= */

export default function ChangePassword() {

    const [formData, setFormData] =
        useState<ChangePasswordForm>({
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

    const [loading, setLoading] =
        useState(false);

    const [showOldPassword, setShowOldPassword] =
        useState(false);

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);
    const [showPasswordSuccess, setShowPasswordSuccess] =
        useState(false);

    /* ================================================= */
    /* SINGLE CHANGE METHOD */
    /* ================================================= */

    const handleChange = (
        field: keyof ChangePasswordForm,
        value: string
    ): void => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    /* ================================================= */
    /* SUBMIT */
    /* ================================================= */

    const handleSubmit = async (): Promise<void> => {
        const {
            oldPassword,
            newPassword,
            confirmPassword,
        } = formData;

        // ================= VALIDATION =================

        if (!oldPassword.trim()) {
            Toast.show({
                type: "error",
                text1: "Old Password Required",
                text2: "Please enter your old password.",
            });
            return;
        }

        if (!newPassword.trim()) {
            Toast.show({
                type: "error",
                text1: "New Password Required",
                text2: "Please enter your new password.",
            });
            return;
        }

        if (newPassword.length < 6) {
            Toast.show({
                type: "error",
                text1: "Invalid Password",
                text2: "Password must be at least 6 characters.",
            });
            return;
        }

        if (!confirmPassword.trim()) {
            Toast.show({
                type: "error",
                text1: "Confirm Password Required",
                text2: "Please confirm your new password.",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.show({
                type: "error",
                text1: "Password Mismatch",
                text2: "New password and confirm password do not match.",
            });
            return;
        }

        if (oldPassword === newPassword) {
            Toast.show({
                type: "error",
                text1: "Invalid Password",
                text2: "New password must be different from old password.",
            });
            return;
        }

        // ================= API =================

        try {
            setLoading(true);

            const token = await getToken();

            if (!token) {
                throw new Error("Authentication token not found");
            }



            const response = await apiRequest<{
                success: boolean;
                message: string;
            }>(
                "api/Vendor/ChangePassword",
                {
                    method: "POST",
                    token,
                    body: JSON.stringify({
                        oldPassword: oldPassword,
                        newPassword: newPassword,
                        confirmPassword: confirmPassword,
                    }),
                }
            );

            if (response?.success) {
                Toast.show({
                    type: "success",
                    text1: "Password Changed Successfully",
                    text2: "Your password has been updated.",
                });

                setFormData({
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });

                setShowPasswordSuccess(true);
            } else {
                Toast.show({
                    type: "error",
                    text1: "Change Password Failed",
                    text2:
                        response?.message ||
                        "Unable to change password.",
                });
            }
        } catch (error) {
            console.log(
                "CHANGE PASSWORD API ERROR:",
                error
            );

            Toast.show({
                type: "error",
                text1: "Change Password Failed",
                text2:
                    error instanceof Error
                        ? error.message
                        : "Unable to change password.",
            });
        } finally {
            setLoading(false);
        }
    };
    const handleLogout = async (): Promise<void> => {
        try {
            setShowPasswordSuccess(false);

            await clearAuth();

            Toast.show({
                type: "success",
                text1: "Logged Out Successfully",
                text2: "See you again!",
            });

            setTimeout(() => {
                router.replace("/login");
            }, 800);
        } catch (error) {
            console.log("Logout error:", error);

            Toast.show({
                type: "error",
                text1: "Logout Failed",
                text2: "Unable to logout. Please try again.",
            });
        }
    };
    /* ================================================= */
    /* UI */
    /* ================================================= */

    return (
        <View className="flex-1 bg-slate-50">

            {/* ================= HEADER ================= */}

            <View className="flex-row items-center border-b border-slate-100 bg-white px-5 pb-4 pt-14">

                <TouchableOpacity
                    onPress={() => router.replace("/vendor/profile")}
                    activeOpacity={0.7}
                    className="h-10 w-10 items-center justify-center rounded-xl bg-slate-100"
                >
                    <Ionicons
                        name="arrow-back"
                        size={21}
                        color="#334155"
                    />
                </TouchableOpacity>

                <View className="ml-3">

                    <Text className="text-xl font-bold text-slate-900">
                        Change Password
                    </Text>

                    <Text className="mt-1 text-xs text-slate-500">
                        Update your account password
                    </Text>

                </View>

            </View>

            {/* ================= CONTENT ================= */}

            <View className="flex-1 px-5 pt-6">

                {/* SECURITY CARD */}

                <View className="mb-6 flex-row items-center rounded-3xl bg-blue-50 p-5">

                    <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white">

                        <Ionicons
                            name="shield-checkmark-outline"
                            size={25}
                            color="#2563EB"
                        />

                    </View>

                    <View className="ml-4 flex-1">

                        <Text className="text-base font-bold text-slate-800">
                            Secure Your Account
                        </Text>

                        <Text className="mt-1 text-xs leading-5 text-slate-500">
                            Create a strong password to keep
                            your account secure.
                        </Text>

                    </View>

                </View>

                {/* ================= FORM ================= */}

                <View className="rounded-3xl bg-white p-5">

                    <PasswordField
                        label="Old Password"
                        value={formData.oldPassword}
                        field="oldPassword"
                        visible={showOldPassword}
                        onChange={handleChange}
                        onToggle={() =>
                            setShowOldPassword(
                                (previous) => !previous
                            )
                        }
                    />

                    <PasswordField
                        label="New Password"
                        value={formData.newPassword}
                        field="newPassword"
                        visible={showNewPassword}
                        onChange={handleChange}
                        onToggle={() =>
                            setShowNewPassword(
                                (previous) => !previous
                            )
                        }
                    />

                    <PasswordField
                        label="Confirm Password"
                        value={formData.confirmPassword}
                        field="confirmPassword"
                        visible={showConfirmPassword}
                        onChange={handleChange}
                        onToggle={() =>
                            setShowConfirmPassword(
                                (previous) => !previous
                            )
                        }
                    />

                    {/* PASSWORD INFO */}

                    <View className="mb-4 flex-row items-start rounded-2xl bg-slate-50 p-3">

                        <Ionicons
                            name="information-circle-outline"
                            size={18}
                            color="#64748B"
                        />

                        <Text className="ml-2 flex-1 text-xs leading-5 text-slate-500">
                            Password must contain at least
                            6 characters.
                        </Text>

                    </View>

                    {/* SUBMIT */}

                    <TouchableOpacity
                        activeOpacity={0.8}
                        disabled={loading}
                        onPress={handleSubmit}
                        className={`h-14 flex-row items-center justify-center rounded-2xl ${loading
                            ? "bg-blue-400"
                            : "bg-blue-600"
                            }`}
                    >

                        {loading ? (
                            <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                            />
                        ) : (
                            <>
                                <Ionicons
                                    name="checkmark-circle-outline"
                                    size={21}
                                    color="#FFFFFF"
                                />

                                <Text className="ml-2 text-base font-bold text-white">
                                    Change Password
                                </Text>
                            </>
                        )}

                    </TouchableOpacity>

                </View>

            </View>
            {/* ================= PASSWORD SUCCESS MODAL ================= */}

            <Modal
                visible={showPasswordSuccess}
                transparent
                animationType="fade"
                onRequestClose={() => { }}
            >
                <View className="flex-1 items-center justify-center bg-black/50 px-6">

                    <View className="w-full rounded-3xl bg-white p-6">

                        {/* Icon */}

                        <View className="items-center">

                            <View className="h-16 w-16 items-center justify-center rounded-full bg-emerald-100">

                                <Ionicons
                                    name="checkmark-circle"
                                    size={38}
                                    color="#059669"
                                />

                            </View>

                            <Text className="mt-4 text-xl font-bold text-slate-900">
                                Password Changed
                            </Text>

                            <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
                                Your password has been changed successfully.
                            </Text>

                            <Text className="mt-1 text-center text-sm font-medium text-slate-600">
                                Would you like to continue?
                            </Text>

                        </View>

                        {/* Buttons */}

                        <View className="mt-6 flex-row gap-3">

                            {/* Continue */}

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                    setShowPasswordSuccess(false);
                                    router.replace("/vendor/dashboard");
                                }}
                                className="h-14 flex-1 items-center justify-center rounded-2xl bg-blue-600"
                            >
                                <Text className="text-base font-bold text-white">
                                    Continue
                                </Text>
                            </TouchableOpacity>

                            {/* Logout */}

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleLogout}
                                className="h-14 flex-1 items-center justify-center rounded-2xl border border-red-200 bg-red-50"
                            >
                                <Text className="text-base font-bold text-red-600">
                                    Logout
                                </Text>
                            </TouchableOpacity>

                        </View>

                    </View>

                </View>
            </Modal>
        </View>

    );
}