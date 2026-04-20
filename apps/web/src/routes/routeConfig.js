export const routeConfig = {
  public: {
    root: "/",
    catalog: "/products",
    compare: "/compare",
    profile: "/profile",
    warranties: "/warranties",
    productDetail: "/products/:idOrSlug",
    cart: "/cart",
    checkout: "/checkout",
    paymentResult: "/payment/result",
    orders: "/orders",
    orderDetail: "/orders/:orderId",
    tickets: "/tickets",
    ticketCreate: "/tickets/new",
    ticketDetail: "/tickets/:ticketId",
    aiChat: "/ai-chat",
    pcBuilder: "/pc-builder",
    login: "/login",
    register: "/register"
  },
  staff: {
    root: "/staff",
    orders: "/staff/orders"
  },
  tech: {
    root: "/tech",
    tickets: "/tech/tickets"
  },
  admin: {
    root: "/admin",
    dashboard: "/admin/dashboard",
    system: "/admin/system",
    products: "/admin/products",
    attributes: "/admin/attributes",
    skus: "/admin/skus",
    compatibilityRules: "/admin/compatibility-rules",
    users: "/admin/users"
  }
};
