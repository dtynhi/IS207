const USER_ID_KEY = "uni_user_id";
const USER_EMAIL_KEY = "uni_user_email";
const ADMIN_ID_KEY = "uni_admin_id";
const SESSION_MAX_AGE_DAYS = 30;

export const sessionStorageKeys = {
  USER_ID_KEY,
  USER_EMAIL_KEY,
  ADMIN_ID_KEY,
};

const getCookie = (key: string) => {
  if (typeof document === "undefined") return "";
  const entry = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${key}=`));

  if (!entry) return "";
  return decodeURIComponent(entry.slice(key.length + 1));
};

const getLocal = (key: string) => {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(key) || "";
};

const setLocal = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
};

const clearLocal = (key: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
};

const setCookie = (key: string, value: string, days = SESSION_MAX_AGE_DAYS) => {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
};

const clearCookie = (key: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${key}=; path=/; max-age=0; samesite=lax`;
};

const getSessionValue = (key: string) => getCookie(key) || getLocal(key);
const setSessionValue = (key: string, value: string) => {
  setCookie(key, value);
  setLocal(key, value);
};
const clearSessionValue = (key: string) => {
  clearCookie(key);
  clearLocal(key);
};

export const getUserId = () => getSessionValue(USER_ID_KEY);
export const setUserId = (value: string) => setSessionValue(USER_ID_KEY, value);
export const clearUserId = () => clearSessionValue(USER_ID_KEY);

export const getUserEmail = () => getSessionValue(USER_EMAIL_KEY);
export const setUserEmail = (value: string) => setSessionValue(USER_EMAIL_KEY, value);
export const clearUserEmail = () => clearSessionValue(USER_EMAIL_KEY);

export const getAdminId = () => getSessionValue(ADMIN_ID_KEY);
export const setAdminId = (value: string) => setSessionValue(ADMIN_ID_KEY, value);
export const clearAdminId = () => clearSessionValue(ADMIN_ID_KEY);

export const clearAllSession = () => {
  clearUserId();
  clearUserEmail();
  clearAdminId();
};
