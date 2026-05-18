export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  address: UserAddress[];
};

export type UserAddress = {
  idAddress: string;
  mainAddress: string;
  isDefault: boolean;
};

export type UserPurchase = {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  status: string;
  createdAt: string;
  items: Array<{ quantity: number; price: number; discountPercentage: number; product?: { title: string } }>;
};

export type UserProfileFormValues = {
  fullName?: string;
  phone?: string;
  avatar?: string;
};

export type UserAddressCreateFormValues = {
  mainAddress: string;
};

export type UserAddressUpdatePayload = {
  mainAddress?: string;
  isDefault?: boolean;
};

export type ChangePasswordFormValues = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const purchaseStatusMap: Record<string, { color: string; label: string }> = {
  pending: { color: "processing", label: "Chờ thanh toán" },
  processing: { color: "blue", label: "Đang xử lý" },
  completed: { color: "green", label: "Đã thanh toán" },
  cancelled: { color: "red", label: "Đã huỷ" },
  // Legacy statuses for old data
  confirmed: { color: "blue", label: "Đã xác nhận" },
  shipping: { color: "cyan", label: "Đang giao" },
  delivered: { color: "green", label: "Đã giao" },
};
