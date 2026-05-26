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
  fullName: string;
  phone: string;
  province: string;
  ward: string;
  addressLine: string;
  isDefault: boolean;
};

export type UserPurchase = {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  status: string;
  paymentStatus?: "unpaid" | "paid";
  cancellationReason?: string;
  returnRequest?: { id: string; status: "pending" | "approved" | "rejected" };
  createdAt: string;
  items: Array<{ quantity: number; price: number; discountPercentage: number; product?: { title: string; thumbnail?: string } }>;
};

export type UserWalletTransaction = {
  id: string;
  orderId?: string;
  type: "credit" | "debit";
  amount: number;
  reason?: string;
  createdAt: string;
};

export type UserWallet = {
  id: string;
  balance: number;
  transactions: UserWalletTransaction[];
};

export type UserProfileFormValues = {
  fullName?: string;
  phone?: string;
  avatar?: string;
};

export type UserAddressCreateFormValues = {
  fullName: string;
  phone: string;
  province: string;
  ward: string;
  addressLine: string;
};

export type UserAddressUpdatePayload = {
  fullName?: string;
  phone?: string;
  province?: string;
  ward?: string;
  addressLine?: string;
  isDefault?: boolean;
};

export type ChangePasswordFormValues = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};
