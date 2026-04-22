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

const setCookie = (key: string, value: string, days = SESSION_MAX_AGE_DAYS) => {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
};

const clearCookie = (key: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${key}=; path=/; max-age=0; samesite=lax`;
};

export const getUserId = () => getCookie(USER_ID_KEY);
export const setUserId = (value: string) => setCookie(USER_ID_KEY, value);
export const clearUserId = () => clearCookie(USER_ID_KEY);

export const getUserEmail = () => getCookie(USER_EMAIL_KEY);
export const setUserEmail = (value: string) => setCookie(USER_EMAIL_KEY, value);
export const clearUserEmail = () => clearCookie(USER_EMAIL_KEY);

export const getAdminId = () => getCookie(ADMIN_ID_KEY);
export const setAdminId = (value: string) => setCookie(ADMIN_ID_KEY, value);
export const clearAdminId = () => clearCookie(ADMIN_ID_KEY);

export const clearAllSession = () => {
  clearUserId();
  clearUserEmail();
  clearAdminId();
};
