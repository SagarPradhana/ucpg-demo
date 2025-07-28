import httpClient from "./HttpClients";
import {
  LOGIN,
  RESENDOTP,
  SIGNUP,
  VERIFYOTP,
  FORGOT_PASSWORD,
  SENDOTP,
  FormatUrl,
  UPDATEUSERPROFILE,
  UPDATEUSERPASSWORD,
} from "./Urls";
import { LoginCredentials, SignUpData, ApiResponse } from "@/types";

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

export const login = (data: LoginCredentials) => {
  const response = httpClient(LOGIN?.url, {
    method: LOGIN.method,
    data,
  });
  return response;
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

export const updateUserProfile = (data: object, id: string) => {
  const formatedUrl = FormatUrl(UPDATEUSERPROFILE.url, id);
  const response = httpClient(formatedUrl, {
    method: UPDATEUSERPROFILE.method,
    data,
  });
  return response;
};

export const updateUserPessword = (data: object, id: string) => {
  const formatedUrl = FormatUrl(UPDATEUSERPASSWORD.url, id);
  const response = httpClient(formatedUrl, {
    method: UPDATEUSERPASSWORD.method,
    data,
  });
  return response;
};
