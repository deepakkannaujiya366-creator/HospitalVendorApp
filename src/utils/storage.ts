import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { VendorUser } from "../types/auth";

const TOKEN_KEY = "vendor_token";
const USER_KEY = "vendor_user";

/**
 * Save value
 */
const saveItem = async (
  key: string,
  value: string
): Promise<void> => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
};

/**
 * Get value
 */
const getItem = async (
  key: string
): Promise<string | null> => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }

  return await SecureStore.getItemAsync(key);
};

/**
 * Remove value
 */
const removeItem = async (
  key: string
): Promise<void> => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
};

/**
 * Save vendor login token
 */
export const saveToken = async (
  token: string
): Promise<void> => {
  await saveItem(TOKEN_KEY, token);
};

/**
 * Get vendor login token
 */
export const getToken = async (): Promise<string | null> => {
  return await getItem(TOKEN_KEY);
};

/**
 * Save vendor user
 */
export const saveUser = async (
  user: VendorUser
): Promise<void> => {
  await saveItem(USER_KEY, JSON.stringify(user));
};

/**
 * Get vendor user
 */
export const getUser = async (): Promise<VendorUser | null> => {
  try {
    const userData = await getItem(USER_KEY);

    if (!userData) {
      return null;
    }

    return JSON.parse(userData) as VendorUser;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

/**
 * Remove token
 */
export const removeToken = async (): Promise<void> => {
  await removeItem(TOKEN_KEY);
};

/**
 * Remove vendor user
 */
export const removeUser = async (): Promise<void> => {
  await removeItem(USER_KEY);
};

/**
 * Clear complete authentication
 */
export const clearAuth = async (): Promise<void> => {
  await removeItem(TOKEN_KEY);
  await removeItem(USER_KEY);
};