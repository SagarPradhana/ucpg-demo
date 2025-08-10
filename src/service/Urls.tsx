import { HttpMethods } from "./HttpClients";

const BACKEND_KPIX = import.meta.env.VITE_BackendUrl;

export enum HttpMethod {
  GET = 1,
  POST = 2,
  PUT = 3,
  DELETE = 4,
  PATCH = 5,
}

export type Api = {
  url: string;
  method: HttpMethods;
};

export function FormatUrl(url: string, ...params: string[]) {
  for (let index = 0; index < params.length; index++) {
    url = url.replace(`{${index}}`, params[index]);
  }
  return url;
}

export const LOGIN: Api = {
  url: `${BACKEND_KPIX}/auth/login`,
  method: HttpMethods.POST,
};

export const SIGNUP: Api = {
  url: `${BACKEND_KPIX}/auth/signup`,
  method: HttpMethods.POST,
};
export const VERIFYOTP: Api = {
  url: `${BACKEND_KPIX}/auth/verify-otp`,
  method: HttpMethods.POST,
};
export const RESENDOTP: Api = {
  url: `${BACKEND_KPIX}/auth/resend-otp`,
  method: HttpMethods.POST,
};

export const FORGOT_PASSWORD: Api = {
  url: `${BACKEND_KPIX}/auth/forgot-password`,
  method: HttpMethods.PUT,
};

export const SENDOTP: Api = {
  url: `${BACKEND_KPIX}/auth/send-otp`,
  method: HttpMethods.POST,
};
export const GET_USER: Api = {
  url: `${BACKEND_KPIX}/user/{0}`,
  method: HttpMethods.GET,
};

export const UPDATEUSERPROFILE: Api = {
  url: `${BACKEND_KPIX}/user/{0}`,
  method: HttpMethods.PUT,
};
export const UPDATEUSERPASSWORD: Api = {
  url: `${BACKEND_KPIX}/user/reset-password/{0}`,
  method: HttpMethods.PUT,
};

export const REFRESH_TOKEN: Api = {
  url: `${BACKEND_KPIX}/auth/refreshtoken`,
  method: HttpMethods.POST,
};

export const GET_ROLE_USER: Api = {
  url: `${BACKEND_KPIX}/admin/user_roles/users`,
  method: HttpMethods.GET,
};
export const CREATE_ROLE_USER: Api = {
  url: `${BACKEND_KPIX}/admin/user_roles/users/create`,
  method: HttpMethods.POST,
};

export const GET_PERMISSION: Api = {
  url: `${BACKEND_KPIX}/admin/user_roles/permissions`,
  method: HttpMethods.GET,
};
export const GET_ERROR_LOGS: Api = {
  url: `${BACKEND_KPIX}/admin/error_logs/error_logs`,
  method: HttpMethods.GET,
};

export const UPDATE_USER_ROLE: Api = {
  url: `${BACKEND_KPIX}/admin/user_roles/roles/assign`,
  method: HttpMethods.PUT,
};
