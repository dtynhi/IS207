import { Router } from "express";
import { z } from "zod";
import { sendError, sendSuccess } from "../../../../shared/response/response";
import {
  adminLogin,
  changeUserPassword,
  createForgotPasswordOtp,
  getUserByToken,
  loginUser,
  registerUser,
  resetPasswordByEmail,
  verifyForgotPasswordOtp,
} from "../../auth.service";

const router = Router();
const AUTH_COOKIE_NAME = "uni_auth_token";
const AUTH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: AUTH_COOKIE_MAX_AGE,
  path: "/",
});

const readCookie = (cookieHeader: string | undefined, key: string) => {
  if (!cookieHeader) return "";
  return cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${key}=`))
    ?.slice(key.length + 1) || "";
};

router.post("/auth/register", async (req, res, next) => {
  try {
    const payload = z
      .object({
        fullName: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
      })
      .parse(req.body);

    const user = await registerUser(payload);
    return sendSuccess(res, user, { statusCode: 201 });
  } catch (error) {
    next(error);
  }
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const payload = z
      .object({ email: z.string().email(), password: z.string().min(6) })
      .parse(req.body);

    const user = await loginUser(payload);
    if (!user) return sendError(res, 401, "INVALID_CREDENTIALS", "Invalid credentials");
    if (user.tokenUser) {
      res.cookie(AUTH_COOKIE_NAME, user.tokenUser, getAuthCookieOptions());
    }
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

router.get("/auth/session", async (req, res, next) => {
  try {
    const token = readCookie(req.headers.cookie, AUTH_COOKIE_NAME);
    if (!token) return sendSuccess(res, null);

    const user = await getUserByToken(token);
    if (!user) return sendSuccess(res, null);

    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

router.post("/auth/logout", async (_req, res, next) => {
  try {
    const cookieOptions = getAuthCookieOptions();
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
    });
    return sendSuccess(res, { loggedOut: true });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/auth/login", async (req, res, next) => {
  try {
    const payload = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
    const account = await adminLogin(payload);
    if (!account) return sendError(res, 401, "INVALID_CREDENTIALS", "Invalid credentials");
    return sendSuccess(res, account);
  } catch (error) {
    next(error);
  }
});

router.post("/auth/password/forgot", async (req, res, next) => {
  try {
    const payload = z.object({ email: z.string().email() }).parse(req.body);
    const result = await createForgotPasswordOtp(payload.email);

    if (!result) {
      return sendError(res, 404, "USER_NOT_FOUND", "Email not found");
    }

    // For now OTP is returned to support local/dev workflows.
    return sendSuccess(res, result, { statusCode: 201 });
  } catch (error) {
    next(error);
  }
});

router.post("/auth/password/otp", async (req, res, next) => {
  try {
    const payload = z
      .object({
        email: z.string().email(),
        otp: z.string().length(6),
      })
      .parse(req.body);

    const result = await verifyForgotPasswordOtp(payload);
    if (!result) {
      return sendError(res, 400, "INVALID_OTP", "OTP is invalid or expired");
    }

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

router.post("/auth/password/reset", async (req, res, next) => {
  try {
    const payload = z
      .object({
        email: z.string().email(),
        password: z.string().min(6),
      })
      .parse(req.body);

    const result = await resetPasswordByEmail(payload);
    if (!result) {
      return sendError(res, 404, "USER_NOT_FOUND", "User not found");
    }

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

router.patch("/auth/password/change", async (req, res, next) => {
  try {
    const payload = z
      .object({
        userId: z.string().min(1),
        oldPassword: z.string().min(1),
        newPassword: z.string().min(6),
        confirmPassword: z.string().min(6),
      })
      .parse(req.body);

    if (payload.newPassword !== payload.confirmPassword) {
      return sendError(res, 400, "PASSWORD_MISMATCH", "New password and confirm password do not match");
    }

    const result = await changeUserPassword({
      userId: payload.userId,
      oldPassword: payload.oldPassword,
      newPassword: payload.newPassword,
    });

    if (!result.ok && result.reason === "USER_NOT_FOUND") {
      return sendError(res, 404, "USER_NOT_FOUND", "User not found");
    }

    if (!result.ok && result.reason === "OLD_PASSWORD_INVALID") {
      return sendError(res, 400, "OLD_PASSWORD_INVALID", "Old password is invalid");
    }

    return sendSuccess(res, { updated: true });
  } catch (error) {
    next(error);
  }
});

export default router;
