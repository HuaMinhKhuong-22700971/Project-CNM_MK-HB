export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UserInfo = {
  id: string;
  email: string;
  fullName?: string;
  role: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  price: string | number;
  stock: number;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

export type CartItem = {
  id: string;
  quantity: number;
  product: Product;
};

export type CartData = {
  id: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
};

export type OrderItem = {
  id: string;
  skuSnapshot: string;
  nameSnapshot: string;
  unitPrice: string | number;
  quantity: number;
  lineTotal: string | number;
};

export type Order = {
  id: string;
  totalAmount: string | number;
  paymentMethod: "COD" | "VNPAY";
  paymentStatus: string;
  shippingAddress: string;
  status: string;
  items: OrderItem[];
  createdAt: string;
};
