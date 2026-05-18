export type CheckoutFormValues = {
  fullName: string;
  phone: string;
  province: string; // province / city name
  ward: string; // ward / commune name
  addressLine: string; // Tên đường, Tòa nhà, Số nhà (combined)
  paymentMethod: "cod" | "bank";
};

export type CreateCheckoutOrderPayload = {
  userId?: string;
  fullName: string;
  phone: string;
  address: string; // formatted address string
  paymentMethod?: "cod" | "bank";
  returnUrl?: string;
  items: Array<{ productId: string; quantity: number }>;
};

export type CheckoutOrderResponse = {
  id: string;
  paymentUrl?: string;
};
