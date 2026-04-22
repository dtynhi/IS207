export type CheckoutFormValues = {
  fullName: string;
  phone: string;
  address: string;
};

export type CreateCheckoutOrderPayload = {
  userId?: string;
  fullName: string;
  phone: string;
  address: string;
  items: Array<{ productId: string; quantity: number }>;
};
