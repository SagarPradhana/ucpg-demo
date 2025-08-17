import httpClient, { HttpMethods } from "./HttpClients";
import {
  CREATE_ROLE_USER,
  GET_ERROR_LOGS,
  GET_PERMISSION,
  GET_ROLE_USER,
  UPDATE_USER_ROLE,
  UPDATE_USER_ROLE_DATA,
  ADMIN_TRANSACTIONS,
  ADMIN_EXCHANGE_SETTINGS,
  ADMIN_SETTINGS,
  ADMIN_SETTINGS_UPDATE,
  ADMIN_COMMISSION_GLOBAL,
  ADMIN_COMMISSION_GLOBAL_SET,
  ADMIN_COMMISSION_CURRENCIES,
  ADMIN_COMMISSION_CALCULATE,
  ADMIN_COMMISSION_CURRENCY_UPDATE,
  FormatUrl,
  ADMIN_TRANSITION_STATISTICS,
  ADMIN_CURRENCY_DISTRIBUTION,
  ADMIN_UNCLAIMED_FUNDS,
  ADMIN_TRANSACTION_REPORTS,
  ADMIN_USER_REPORTS,
  ADMIN_FINANCIAL_REPORTS,
  ADMIN_COMMISSION_REPORTS,
  ADMIN_ERRORS_REPORTS,
  ADMIN_AUDIT_LOGS,
  ADMIN_COMMISSION_INCOME,
  USER_TRANSACTIONS_HISTORY,
  USER_TRANSACTIONS_STATS,
} from "./Urls";

export const getUserRole = (params?: {
  page?: number;
  per_page?: number;
  search?: string;
}) => {
  const response = httpClient(GET_ROLE_USER?.url, {
    method: GET_ROLE_USER?.method,
    withAuth: true,
    queryParams: params,
  });
  return response;
};

export const createUserRole = (data: Object) => {
  const response = httpClient(CREATE_ROLE_USER?.url, {
    method: CREATE_ROLE_USER?.method,
    withAuth: true,
    data: data,
  });
  return response;
};

export const getAllPermissions = () => {
  const response = httpClient(GET_PERMISSION?.url, {
    method: GET_PERMISSION?.method,
    withAuth: true,
  });
  return response;
};
export const getErrorLogs = (data: object) => {
  const response = httpClient(GET_ERROR_LOGS?.url, {
    method: GET_ERROR_LOGS?.method,
    withAuth: true,
    queryParams: data as Record<string, string | number | boolean>,
  });
  return response;
};

export const updateUserRoles = (data: object) => {
  const response = httpClient(UPDATE_USER_ROLE?.url, {
    method: UPDATE_USER_ROLE?.method,
    withAuth: true,
    data: data,
  });
  return response;
};

export const updateUserRolesActive = (data: object, id: string) => {
  const response = httpClient(UPDATE_USER_ROLE_DATA?.url, {
    method: UPDATE_USER_ROLE_DATA?.method,
    withAuth: true,
    data: data,
    queryParams: { user_id: id },
  });
  return response;
};

export const getAdminTransactions = (params?: {
  page?: number;
  limit?: number;
  transaction_status?: string | null;
  transaction_type?: string | null;
  currency?: string | null;
  currency_type?: string | null;
  target_crypto_currency?: string | null;
  date_from?: number | null; // epoch seconds
  date_to?: number | null; // epoch seconds
  user_id?: string | null;
}) => {
  const response = httpClient(ADMIN_TRANSACTIONS.url, {
    method: ADMIN_TRANSACTIONS.method,
    withAuth: true,
    queryParams: params as Record<
      string,
      string | number | boolean | null | undefined
    >,
  });
  return response;
};

// User Transactions History
export const getUserTransactionsHistory = (params: {
  user_id: string; // required
  transaction_type?: string | null;
  status?: string | null;
  currency?: string | null;
  target_crypto_currency?: string | null;
  search?: string | null;
  from_date?: number | null; // epoch seconds
  to_date?: number | null; // epoch seconds
  sort_by?: string; // default created_date
  sort_order?: string; // default desc
  page_size?: number; // default 50, max 200
  page_no?: number; // default 1
}) => {
  const response = httpClient(USER_TRANSACTIONS_HISTORY.url, {
    method: USER_TRANSACTIONS_HISTORY.method,
    withAuth: true,
    queryParams: params as Record<
      string,
      string | number | boolean | null | undefined
    >,
  });
  return response;
};

// User Transactions Stats
export const getUserTransactionsStats = (params: {
  user_id: string; // required
  from_date?: number | null;
  to_date?: number | null;
}) => {
  const response = httpClient(USER_TRANSACTIONS_STATS.url, {
    method: USER_TRANSACTIONS_STATS.method,
    withAuth: true,
    queryParams: params as Record<
      string,
      string | number | boolean | null | undefined
    >,
  });
  return response;
};

export const getAdminSettings = () => {
  const response = httpClient(ADMIN_SETTINGS.url, {
    method: ADMIN_SETTINGS.method,
    withAuth: true,
  });
  return response;
};

export const updateAdminSettings = (
  setting_id: string,
  data: {
    qr_expiration_minutes?: number;
    max_daily_transaction_limit?: number;
    maintenance_mode?: boolean;
    maintenance_message?: string;
    telegram_notifications_enabled?: boolean;
    telegram_bot_token?: string;
    telegram_chat_id?: string;
  }
) => {
  return httpClient(FormatUrl(ADMIN_SETTINGS_UPDATE.url, setting_id), {
    method: ADMIN_SETTINGS_UPDATE.method,
    withAuth: true,
    data,
  });
};
export const getAdminExchangeSettings = () => {
  const response = httpClient(ADMIN_EXCHANGE_SETTINGS.url, {
    method: ADMIN_EXCHANGE_SETTINGS.method,
    withAuth: true,
  });
  return response;
};

export const getAdminCommissionGlobal = () => {
  const response = httpClient(ADMIN_COMMISSION_GLOBAL.url, {
    method: ADMIN_COMMISSION_GLOBAL.method,
    withAuth: true,
  });
  return response;
};

export const postAdminCommissionGlobal = (data: { rate: number }) => {
  return httpClient(ADMIN_COMMISSION_GLOBAL_SET.url, {
    method: ADMIN_COMMISSION_GLOBAL_SET.method,
    withAuth: true,
    data,
  });
};

export const getAdminCommissionCurrencies = () => {
  const response = httpClient(ADMIN_COMMISSION_CURRENCIES.url, {
    method: ADMIN_COMMISSION_CURRENCIES.method,
    withAuth: true,
  });

  return response;
};
export const getAdminTransitionStatistics = () => {
  const response = httpClient(ADMIN_TRANSITION_STATISTICS?.url, {
    method: ADMIN_TRANSITION_STATISTICS?.method,
    withAuth: true,
  });
  return response;
};

export const getAdminCommissionIncome = (params: {
  from_date: number;
  to_date: number;
}) => {
  const response = httpClient(ADMIN_COMMISSION_INCOME.url, {
    method: ADMIN_COMMISSION_INCOME.method,
    withAuth: true,
    queryParams: params,
  });
  return response as Promise<{
    status: string;
    status_code: number;
    message: string;
    data: { total: number };
  }>;
};

export const getAdminCurrencyDistribution = (params: {
  from_date: number; // epoch timestamp
  to_date: number; // epoch timestamp
}) => {
  const response = httpClient(ADMIN_CURRENCY_DISTRIBUTION?.url, {
    method: ADMIN_CURRENCY_DISTRIBUTION?.method,
    withAuth: true,
    queryParams: params,
  });
  return response;
};

export const createAdminCommissionCurrency = (data: {
  currency: string;
  rate: number;
}) => {
  return httpClient(ADMIN_COMMISSION_CURRENCIES.url, {
    method: HttpMethods.POST,
    withAuth: true,
    data,
  });
};

export const deleteAdminCommissionCurrency = (commission_id: string) => {
  return httpClient(
    FormatUrl(ADMIN_COMMISSION_CURRENCY_UPDATE.url, commission_id),
    {
      method: HttpMethods.DELETE,
      withAuth: true,
    }
  );
};

export const postAdminCommissionCalculate = (data: {
  amount: number;
  currency?: string;
  transaction_type?: string; // send | receive
}) => {
  const response = httpClient(ADMIN_COMMISSION_CALCULATE.url, {
    method: ADMIN_COMMISSION_CALCULATE.method,
    withAuth: true,
    data,
  });
  return response;
};

export const getAdminUnclaimedFunds = (data: {
  from_date: number;
  to_date: number;
}) => {
  const response = httpClient(ADMIN_UNCLAIMED_FUNDS.url, {
    method: ADMIN_UNCLAIMED_FUNDS.method,
    withAuth: true,
    queryParams: data,
  });
  return response;
};

export const updateAdminCommissionCurrency = (
  commission_id: string,
  data: { rate?: number; is_active?: boolean }
) => {
  const response = httpClient(
    FormatUrl(ADMIN_COMMISSION_CURRENCY_UPDATE.url, commission_id),
    {
      method: ADMIN_COMMISSION_CURRENCY_UPDATE.method,
      withAuth: true,
      data,
    }
  );
  return response;
};

export const getAdminReports = async (
  reportValue: string,
  data: {
    from_date: number;
    to_date: number;
    page_size?: number;
    page_no?: number;
  }
) => {
  let apiConfig;

  switch (reportValue) {
    case "transaction":
      apiConfig = ADMIN_TRANSACTION_REPORTS;
      break;
    case "user":
      apiConfig = ADMIN_USER_REPORTS;
      break;
    case "financial":
      apiConfig = ADMIN_FINANCIAL_REPORTS;
      break;
    case "commission":
      apiConfig = ADMIN_COMMISSION_REPORTS;
      break;
    case "errorlog":
      apiConfig = ADMIN_ERRORS_REPORTS;
      break;
    default:
      apiConfig = ADMIN_TRANSACTION_REPORTS;
      break;
  }

  const response = await httpClient(apiConfig.url, {
    method: apiConfig.method,
    withAuth: true,
    queryParams: data,
  });

  return response;
};

// Download reports as PDF or Excel by passing the appropriate flags
export const downloadAdminReport = async (
  reportValue: string,
  params: {
    from_date: number;
    to_date: number;
    is_pdf_download?: boolean;
    is_excel_download?: boolean;
  }
) => {
  let apiConfig;

  switch (reportValue) {
    case "transaction":
      apiConfig = ADMIN_TRANSACTION_REPORTS;
      break;
    case "user":
      apiConfig = ADMIN_USER_REPORTS;
      break;
    case "financial":
      apiConfig = ADMIN_FINANCIAL_REPORTS;
      break;
    case "commission":
      apiConfig = ADMIN_COMMISSION_REPORTS;
      break;
    case "errorlog":
      apiConfig = ADMIN_ERRORS_REPORTS;
      break;
    default:
      apiConfig = ADMIN_TRANSACTION_REPORTS;
      break;
  }

  const response = await httpClient(apiConfig.url, {
    method: apiConfig.method,
    withAuth: true,
    queryParams: params as Record<string, string | number | boolean>,
    responseType: "blob",
  });

  return response as Blob;
};

export const getAuditLogs = (params: {
  action?: string;
  message?: string;
  user_email?: string;
  order_by?: string;
  order_direction?: "asc" | "desc";
  from_date: number; // epoch seconds (UTC)
  to_date: number; // epoch seconds (UTC)
  search?: string;
  page_number?: number; // minimum: 1
  limit?: number; // 1..200
}) => {
  const response = httpClient(ADMIN_AUDIT_LOGS.url, {
    method: ADMIN_AUDIT_LOGS.method,
    withAuth: true,
    queryParams: params as Record<string, string | number | boolean>,
  });
  return response;
};
