const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.warn("EXPO_PUBLIC_API_URL is not defined");
}

interface ApiRequestOptions extends RequestInit {
  token?: string;
}

export const apiRequest = async <T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const { token, headers, body, ...restOptions } = options;

  const baseUrl = API_URL?.replace(/\/$/, "") || "";

  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const url = `${baseUrl}${cleanEndpoint}`;

  // FormData check
  const isFormData = body instanceof FormData;

  const response = await fetch(url, {
    ...restOptions,
    body,
    headers: {
      Accept: "application/json",

      // FormData me Content-Type mat bhejo
      ...(!isFormData
        ? {
            "Content-Type": "application/json",
          }
        : {}),

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...headers,
    },
  });

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorData = data as {
      message?: string;
      error?: string;
    } | null;

    throw new Error(
      errorData?.message ||
        errorData?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data as T;
};