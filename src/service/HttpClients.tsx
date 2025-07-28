import { getDataFromLocalStorage, LocalStorageItem } from "./constants";

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
  // Example localStorage implementation
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
  options: RequestOptions
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

  const response = await fetch(finalUrl, fetchOptions);

  if (!response.ok) {
    let error: { message: string; [key: string]: unknown } = {
      message: "Something went wrong",
    };
    try {
      error = await response.json();
    } catch {
      error.message = "Something went wrong";
    }
    throw error;
  }

  if (responseType === "blob") {
    return await response.blob();
  }

  return await response.json();
};

export default httpClient;
