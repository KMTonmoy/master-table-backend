export const ORDER_STATUS = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

export const RESERVATION_STATUS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export const RESERVATION_STATUS_VALUES = Object.values(RESERVATION_STATUS);

export const PRODUCT_STATUS = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  LOW_STOCK: "Low stock",
  OUT_OF_STOCK: "Out of stock",
};

export const PRODUCT_STATUS_VALUES = Object.values(PRODUCT_STATUS);

export const PAYMENT_METHODS = {
  CARD: "Card",
  CASH: "Cash",
  ONLINE: "Online",
};

export const ORDER_CHANNELS = {
  DELIVERY: "Delivery",
  PICKUP: "Pickup",
  DINE_IN: "Dine-in",
};

export const CUSTOMER_TIERS = {
  REGULAR: "Regular",
  SILVER: "Silver",
  GOLD: "Gold",
  VIP: "VIP",
};

export const tierFor = (spent) => {
  if (spent >= 1000) return CUSTOMER_TIERS.VIP;
  if (spent >= 500) return CUSTOMER_TIERS.GOLD;
  if (spent >= 200) return CUSTOMER_TIERS.SILVER;
  return CUSTOMER_TIERS.REGULAR;
};