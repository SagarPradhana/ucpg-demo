import httpClient, { HttpMethods } from "./HttpClients";
import {
  LOGIN,
  RESENDOTP,
  SIGNUP,
  VERIFYOTP,
  FORGOT_PASSWORD,
  SENDOTP,
} from "./Urls";

export const signUp = (obj: Object) => {
  const response = httpClient(SIGNUP?.url, {
    method: SIGNUP.method,
    data: obj,
  });
  return response;
};
export const verifyOtp = (obj: Object) => {
  const response = httpClient(VERIFYOTP?.url, {
    method: VERIFYOTP.method,
    data: obj,
  });
  return response;
};

export const resendOtp = (obj: Object) => {
  const response = httpClient(RESENDOTP?.url, {
    method: RESENDOTP.method,
    data: obj,
  });
  return response;
};
export const login = (obj: Object) => {
  const response = httpClient(LOGIN?.url, {
    method: LOGIN.method,
    data: obj,
  });
  return response;
};

export const forgotPassword = (obj: Object) => {
  const response = httpClient(FORGOT_PASSWORD?.url, {
    method: FORGOT_PASSWORD.method,
    data: obj,
    withAuth: false,
  });
  return response;
};

export const sendOtp = (obj: Object) => {
  const response = httpClient(SENDOTP?.url, {
    method: SENDOTP.method,
    data: obj,
    // withAuth: false,
  });
  return response;
};
