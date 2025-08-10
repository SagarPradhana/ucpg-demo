import httpClient from "./HttpClients";
import {
  CREATE_ROLE_USER,
  GET_ERROR_LOGS,
  GET_PERMISSION,
  GET_ROLE_USER,
  UPDATE_USER_ROLE,
} from "./Urls";

export const getUserRole = () => {
  const response = httpClient(GET_ROLE_USER?.url, {
    method: GET_ROLE_USER?.method,
    withAuth: true,
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
