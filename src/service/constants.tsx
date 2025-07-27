// utils/storage.ts
import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || "default_secret"; // Make sure this is defined in .env

export enum LocalStorageItem {
  USER_INFO = "user_info",
}

export const setStringToLocalStorage = (
  name: LocalStorageItem,
  data: string
): void => {
  const encrypted = CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  localStorage.setItem(name.toString(), encrypted);
};

export const getStringFromLocalStorage = (
  name: LocalStorageItem
): string | undefined => {
  const encrypted = localStorage.getItem(name.toString());
  if (!encrypted) return undefined;
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return undefined;
  }
};

export const getDataFromLocalStorage = (
  name: LocalStorageItem
): object | undefined => {
  const data = getStringFromLocalStorage(name);
  return data ? JSON.parse(data) : undefined;
};
