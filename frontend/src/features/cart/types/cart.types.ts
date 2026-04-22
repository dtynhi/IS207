export type CartItem = {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  product: {
    id: string;
    title: string;
    stock: number;
    price: number;
    discountPercentage: number;
    priceNew: number;
  };
};

export type CartData = {
  items: CartItem[];
  totalPrice: number;
};

export type UpdateCartQuantityInput = {
  id: string;
  quantity: number;
};
