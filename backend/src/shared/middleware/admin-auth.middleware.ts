import { Request, Response, NextFunction } from "express";
import { prisma } from "../../infrastructure/db/prisma.client";
import { sendError } from "../response/response";

export interface AdminRequest extends Request {
  adminId?: string;
  admin?: {
    id: string;
    email: string;
    fullName: string;
    roleId: string | null;
    role: {
      id: string;
      title: string;
      permissions?: unknown;
    } | null;
  };
}

/**
 * Middleware to authenticate admin requests
 * Looks for admin ID in:
 * 1. x-admin-id header
 * 2. admin-id query parameter
 * Validates admin exists and is active
 */
export const requireAdmin = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    // Get admin ID from header or query
    const adminIdHeader = req.headers["x-admin-id"] as string;
    const adminIdQuery = req.query["adminId"] as string;
    const adminId = adminIdHeader || adminIdQuery;

    if (!adminId) {
      return sendError(res, 401, "ADMIN_NOT_FOUND", "Admin authentication required");
    }

    // Validate admin exists and is active
    const admin = await prisma.account.findFirst({
      where: {
        id: adminId,
        deleted: false,
        status: "active",
      },
      include: {
        role: {
          select: {
            id: true,
            title: true,
            permissions: true,
            status: true,
          },
        },
      },
    });

    if (!admin) {
      return sendError(res, 401, "ADMIN_NOT_FOUND", "Admin not found or inactive");
    }

    if (admin.role?.status !== "active") {
      return sendError(res, 403, "ADMIN_FORBIDDEN", "Admin role is inactive");
    }

    // Attach admin info to request
    req.adminId = adminId;
    req.admin = {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      roleId: admin.roleId,
      role: admin.role ? {
        id: admin.role.id,
        title: admin.role.title,
        permissions: admin.role.permissions,
      } : null,
    };

    next();
  } catch (error) {
    return sendError(res, 500, "INTERNAL_ERROR", "Authentication check failed");
  }
};

/**
 * Middleware to check if the authenticated admin has the required permission
 */
export const checkPermission = (resource: string, action: string) => {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      const admin = req.admin;
      if (!admin) {
        return sendError(res, 401, "ADMIN_NOT_FOUND", "Admin authentication required");
      }

      // Quản trị hệ thống (Super Admin) bypasses all permission checks
      if (admin.role?.title === "Quản trị hệ thống") {
        return next();
      }

      const permissions = admin.role?.permissions as any;
      if (!permissions || typeof permissions !== "object") {
        return sendError(res, 403, "ADMIN_FORBIDDEN", "No permissions defined for this role");
      }

      const resourcePermissions = permissions[resource];
      if (!Array.isArray(resourcePermissions) || !resourcePermissions.includes(action)) {
        return sendError(res, 403, "ADMIN_FORBIDDEN", `You do not have permission to ${action} ${resource}`);
      }

      next();
    } catch (error) {
      return sendError(res, 500, "INTERNAL_ERROR", "Permission check failed");
    }
  };
};

