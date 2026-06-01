export type AdminListMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type AdminProductRow = {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  status: "active" | "inactive";
  productCategoryId?: string;
  thumbnail?: string;
  brand?: string;
  description?: string;
  featured?: boolean;
};

export type AdminProductFormValues = {
  title: string;
  slug: string;
  price: number;
  stock: number;
  productCategoryId?: string;
  thumbnail?: string;
  brand?: string;
  description?: string;
  featured?: boolean;
};

export type AdminCategoryRow = {
  id: string;
  title: string;
  slug: string;
  position: number;
  status: "active" | "inactive";
};

export type AdminCategoryFormValues = {
  title: string;
  slug: string;
  position: number;
};

export type AdminRoleRow = {
  id: string;
  title: string;
  description?: string;
  permissions?: unknown;
};

export type AdminRoleFormValues = {
  title: string;
  description?: string;
};

export type AdminPermissionFormValues = {
  permissionsJson: string;
};

export type AdminAccountRow = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  status: "active" | "inactive";
  roleId?: string;
  role?: { title?: string };
};

export type AdminRoleOption = {
  id: string;
  title: string;
};

export type AdminAccountFormValues = {
  fullName: string;
  email: string;
  phone?: string;
  roleId?: string;
};

export type AdminCreateAccountFormValues = {
  fullName: string;
  email: string;
  password: string;
  roleId?: string;
};

export type AdminLoginFormValues = {
  email: string;
  password: string;
};

export type AdminMyAccountFormValues = {
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  password?: string;
};

export type AdminSettingsFormValues = {
  websiteName: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: string;
  copyright?: string;
};

export type AdminOrderItemRow = {
  id: string;
  productId: string;
  price: number;
  discountPercentage: number;
  quantity: number;
  product?: {
    id: string;
    title: string;
    slug?: string;
    thumbnail?: string;
  };
};

export type AdminOrderStatusLog = {
  id: string;
  fromStatus?: "pending_confirm" | "ready_to_pick" | "ready_to_ship" | "delivered" | "awaiting_return" | "returned" | "cancelled" | "completed";
  toStatus: "pending_confirm" | "ready_to_pick" | "ready_to_ship" | "delivered" | "awaiting_return" | "returned" | "cancelled" | "completed";
  reason?: string;
  createdAt: string;
  changedByAccount?: {
    id: string;
    fullName?: string;
    email?: string;
  };
};

export type AdminOrderRow = {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  status: "pending_confirm" | "ready_to_pick" | "ready_to_ship" | "delivered" | "awaiting_return" | "returned" | "cancelled" | "completed";
  paymentStatus: "unpaid" | "paid";
  lockVersion: number;
  couponCode?: string;
  couponId?: string;
  originalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
  assignedAt?: string;
  createdAt: string;
  updatedAt: string;
  assignedToAccount?: {
    id: string;
    fullName?: string;
    email?: string;
  };
  items: AdminOrderItemRow[];
  statusLogs?: AdminOrderStatusLog[];
  returnRequest?: {
    id: string;
    status: "pending" | "approved" | "rejected";
    reason: string;
    description?: string;
    mediaUrls?: string[] | null;
    reviewReason?: string;
    reviewedAt?: string;
  };
};
