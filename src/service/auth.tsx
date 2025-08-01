import httpClient from "./HttpClients";
import {
  LOGIN,
  RESENDOTP,
  SIGNUP,
  VERIFYOTP,
  FORGOT_PASSWORD,
  SENDOTP,
  GET_USER,
  FormatUrl,
  UPDATEUSERPROFILE,
  UPDATEUSERPASSWORD,
  REFRESH_TOKEN,
} from "./Urls";
import {
  LoginCredentials,
  SignUpData,
  ApiResponse,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from "@/types";

export const signUp = (data: SignUpData) => {
  const response = httpClient(SIGNUP?.url, {
    method: SIGNUP.method,
    data,
  });
  return response;
};

export const verifyOtp = (data: { email: string; otp: string }) => {
  const response = httpClient(VERIFYOTP?.url, {
    method: VERIFYOTP.method,
    data,
  });
  return response;
};

export const resendOtp = (data: { email: string }) => {
  const response = httpClient(RESENDOTP?.url, {
    method: RESENDOTP.method,
    data,
  });
  return response;
};

export const login = (
  data: LoginCredentials
): Promise<ApiResponse<LoginResponse>> => {
  const response = httpClient(LOGIN?.url, {
    method: LOGIN.method,
    data,
  });
  return response as Promise<ApiResponse<LoginResponse>>;
};

export const forgotPassword = (data: { email: string }) => {
  const response = httpClient(FORGOT_PASSWORD?.url, {
    method: FORGOT_PASSWORD.method,
    data,
    withAuth: false,
  });
  return response;
};

export const sendOtp = (data: { email: string }) => {
  const response = httpClient(SENDOTP?.url, {
    method: SENDOTP.method,
    data,
  });
  return response;
};

export const getUser = (id: string) => {
  console.log("🔄 getUser called with ID:", id);
  const formatedUrl = FormatUrl(GET_USER.url, id);
  console.log("📡 Get user URL:", formatedUrl);

  const response = httpClient(formatedUrl, {
    method: GET_USER.method,
    withAuth: true, // Explicitly ensure authentication header is included
  });
  return response;
};

export const updateUserProfile = (data: object, id: string) => {
  console.log("🔄 updateUserProfile called with:", { data, id });
  console.log("📊 Metadata being sent:", (data as any)?.metadata);

  // Check if metadata has malformed structure and warn
  if ((data as any)?.metadata) {
    const metadata = (data as any).metadata;
    const keys = Object.keys(metadata);
    if (keys.some((key) => !isNaN(Number(key)))) {
      console.warn("⚠️ MALFORMED METADATA DETECTED in API payload:", metadata);
      console.warn("📍 This should be fixed using updateMetadata utility");
    }
  }

  const formatedUrl = FormatUrl(UPDATEUSERPROFILE.url, id);
  console.log("📡 Profile update URL:", formatedUrl);

  const response = httpClient(formatedUrl, {
    method: UPDATEUSERPROFILE.method,
    data,
    withAuth: true, // Explicitly ensure authentication header is included
  });
  return response;
};

export const updateUserPessword = (data: object, id: string) => {
  console.log("🔄 updateUserPessword called with:", { data, id });
  const formatedUrl = FormatUrl(UPDATEUSERPASSWORD.url, id);
  console.log("📡 Password update URL:", formatedUrl);

  const response = httpClient(formatedUrl, {
    method: UPDATEUSERPASSWORD.method,
    data,
    withAuth: true, // Explicitly ensure authentication header is included
  });
  return response;
};

export const refreshToken = (
  data: RefreshTokenRequest
): Promise<ApiResponse<RefreshTokenResponse>> => {
  const response = httpClient(REFRESH_TOKEN?.url, {
    method: REFRESH_TOKEN.method,
    data,
    withAuth: false, // Don't send expired access token with refresh request
  });
  return response as Promise<ApiResponse<RefreshTokenResponse>>;
};
