import { getDataFromLocalStorage, LocalStorageItem } from "./constants";
import TokenManager from "@/utils/tokenManager";

export enum HttpMethods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

interface RequestOptions {
  method: HttpMethods;
  data?: unknown;
  withAuth?: boolean;
  queryParams?: Record<string, string | number | boolean>;
  responseType?: "json" | "blob";
  signal?: AbortSignal;
  headers?: Record<string, string>;
  selectedLang?: string;
}

const buildUrl = (
  url: string,
  params?: Record<string, string | number | boolean>
) => {
  // Handle both absolute URLs and relative URLs
  let finalUrl: URL;

  try {
    // Try to create URL directly (for absolute URLs)
    finalUrl = new URL(encodeURI(url));
  } catch (error) {
    // If it fails, it's likely a relative URL, so use current origin as base
    finalUrl = new URL(encodeURI(url), window.location.origin);
  }

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        finalUrl.searchParams.append(key, value.toString());
      }
    });
  }
  return finalUrl.toString();
};

const getToken = (): string | null => {
  // First try to get session token (preferred method)
  const sessionToken = localStorage.getItem("sessionToken");
  if (sessionToken) {
    return sessionToken;
  }

  // Fallback to old method for backwards compatibility
  const userData = getDataFromLocalStorage(LocalStorageItem.USER_INFO);
  if (!userData) return null;
  try {
    const parsed = JSON.parse(userData as any);
    return parsed?.token || parsed?.app_token || null;
  } catch {
    return null;
  }
};

const httpClient = async (
  url: string,
  options: RequestOptions,
  retryCount = 0
): Promise<unknown> => {
  const {
    method,
    data,
    withAuth = true,
    queryParams,
    responseType = "json",
    signal,
    headers = {},
    selectedLang,
  } = options;

  const finalUrl = buildUrl(url, queryParams);

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(selectedLang && { "Accept-Language": selectedLang }),
    ...headers,
  };

  if (!(data instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (withAuth) {
    const token = getToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
      console.log("🔑 Adding Bearer token to request:", url);
    } else {
      console.warn("⚠️ No token found for authenticated request:", url);
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
    signal,
    mode: "cors",
    credentials: "include",
  };

  if (data && method !== HttpMethods.GET) {
    fetchOptions.body = data instanceof FormData ? data : JSON.stringify(data);
  }

  try {
    const response = await fetch(finalUrl, fetchOptions);

    // Handle 401 Unauthorized - try to refresh token and retry
    if (response.status === 401 && withAuth && retryCount === 0) {
      console.log("Received 401, attempting token refresh");

      const tokenManager = TokenManager.getInstance();
      const refreshed = await tokenManager.manualRefresh();

      if (refreshed) {
        console.log("Token refreshed, retrying request");
        // Retry the request with the new token (only retry once)
        return await httpClient(url, options, retryCount + 1);
      } else {
        console.log("Token refresh failed");
        // Let the error propagate to trigger logout
      }
    }

    if (!response.ok) {
      let error: { message: string; status: number; [key: string]: unknown } = {
        message: "Something went wrong",
        status: response.status,
      };
      try {
        error = await response.json();
        error.status = response.status;
      } catch {
        error.message = "Something went wrong";
        error.status = response.status;
      }
      throw error;
    }

    if (responseType === "blob") {
      return await response.blob();
    }

    return await response.json();
  } catch (fetchError) {
    // If it's a network error or parsing error, just throw it
    if (!(fetchError as any).status) {
      throw fetchError;
    }

    // If it's an HTTP error, it was already handled above
    throw fetchError;
  }
};

export default httpClient;
