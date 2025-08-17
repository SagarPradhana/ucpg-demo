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

export const UPDATE_USER_ROLE_DATA: Api = {
  url: `${BACKEND_KPIX}/admin/user_roles/users/edit`,
  method: HttpMethods.PATCH,
};

export const ADMIN_TRANSACTIONS: Api = {
  url: `${BACKEND_KPIX}/admin/transactions`,
  method: HttpMethods.GET,
};

export const ADMIN_TRANSACTION_CANCEL: Api = {
  url: `${BACKEND_KPIX}/admin/transactions/{0}/cancel`,
  method: HttpMethods.PATCH,
};

export const ADMIN_EXCHANGE_SETTINGS: Api = {
  url: `${BACKEND_KPIX}/admin/exchange/rates`,
  method: HttpMethods.GET,
};

export const ADMIN_SETTINGS: Api = {
  url: `${BACKEND_KPIX}/admin/settings`,
  method: HttpMethods.GET,
};

export const ADMIN_SETTINGS_UPDATE: Api = {
  url: `${BACKEND_KPIX}/admin/settings/{0}`,
  method: HttpMethods.PATCH,
};

export const ADMIN_COMMISSION_GLOBAL: Api = {
  url: `${BACKEND_KPIX}/admin/commission/global`,
  method: HttpMethods.GET,
};

export const ADMIN_COMMISSION_GLOBAL_SET: Api = {
  url: `${BACKEND_KPIX}/admin/commission/global`,
  method: HttpMethods.POST,
};

export const ADMIN_COMMISSION_CURRENCIES: Api = {
  url: `${BACKEND_KPIX}/admin/commission/currencies`,
  method: HttpMethods.GET,
};

export const ADMIN_COMMISSION_CALCULATE: Api = {
  url: `${BACKEND_KPIX}/admin/commission/calculate`,
  method: HttpMethods.POST,
};

export const ADMIN_COMMISSION_CURRENCY_UPDATE: Api = {
  url: `${BACKEND_KPIX}/admin/commission/currencies/{0}`,
  method: HttpMethods.PUT,
};
export const ADMIN_TRANSITION_STATISTICS: Api = {
  url: `${BACKEND_KPIX}/admin/dashboard/statistics`,
  method: HttpMethods.GET,
};

// Commission Income (Daily)
export const ADMIN_COMMISSION_INCOME: Api = {
  url: `${BACKEND_KPIX}/admin/dashboard/commission-income`,
  method: HttpMethods.GET,
};

export const ADMIN_CURRENCY_DISTRIBUTION: Api = {
  url: `${BACKEND_KPIX}/admin/dashboard/currency-distribution`,
  method: HttpMethods.GET,
};
export const ADMIN_UNCLAIMED_FUNDS: Api = {
  url: `${BACKEND_KPIX}/admin/dashboard/funds/claimed-unclaimed`,
  method: HttpMethods.GET,
};
export const ADMIN_TRANSACTION_REPORTS: Api = {
  url: `${BACKEND_KPIX}/admin/reports/transactions`,
  method: HttpMethods.GET,
};
export const ADMIN_USER_REPORTS: Api = {
  url: `${BACKEND_KPIX}/admin/reports/users`,
  method: HttpMethods.GET,
};
export const ADMIN_ERRORS_REPORTS: Api = {
  url: `${BACKEND_KPIX}/admin/reports/errors`,
  method: HttpMethods.GET,
};
export const ADMIN_COMMISSION_REPORTS: Api = {
  url: `${BACKEND_KPIX}/admin/reports/commission`,
  method: HttpMethods.GET,
};
export const ADMIN_FINANCIAL_REPORTS: Api = {
  url: `${BACKEND_KPIX}/admin/reports/financial`,
  method: HttpMethods.GET,
};
export const ADMIN_AUDIT_LOGS: Api = {
  url: `${BACKEND_KPIX}/admin/dashboard/activity_logs`,
  method: HttpMethods.GET,
};

// User transactions history
export const USER_TRANSACTIONS_HISTORY: Api = {
  url: `${BACKEND_KPIX}/user/transactions/history`,
  method: HttpMethods.GET,
};

// User transactions stats
export const USER_TRANSACTIONS_STATS: Api = {
  url: `${BACKEND_KPIX}/user/transactions/stats`,
  method: HttpMethods.GET,
};
