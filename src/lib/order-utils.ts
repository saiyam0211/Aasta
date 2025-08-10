/**
 * Order utility functions for generating order numbers, verification codes, and managing order states
 */

export function generateOrderNumber(): string {
  // Format: AST-YYYYMMDD-HHMMSS-XXXX
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // Generate 4-digit random number
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `AST-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
}

export function generateVerificationCode(): string {
  // Generate 6-digit verification code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateTrackingId(): string {
  // Format: TRK-XXXXXXXX
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TRK-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const ORDER_STATUSES = {
  PENDING: 'PENDING',           // Order placed, awaiting restaurant confirmation
  CONFIRMED: 'CONFIRMED',       // Restaurant confirmed order
  PREPARING: 'PREPARING',       // Food is being prepared
  READY: 'READY',              // Food is ready for pickup
  PICKED_UP: 'PICKED_UP',      // Order picked up by delivery partner
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY', // On the way to customer
  DELIVERED: 'DELIVERED',       // Successfully delivered
  CANCELLED: 'CANCELLED',       // Order cancelled
  REFUNDED: 'REFUNDED'         // Order refunded
} as const;

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUSES.PENDING]: 'Order Placed',
  [ORDER_STATUSES.CONFIRMED]: 'Order Confirmed',
  [ORDER_STATUSES.PREPARING]: 'Being Prepared',
  [ORDER_STATUSES.READY]: 'Ready for Pickup',
  [ORDER_STATUSES.PICKED_UP]: 'Picked Up',
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [ORDER_STATUSES.DELIVERED]: 'Delivered',
  [ORDER_STATUSES.CANCELLED]: 'Cancelled',
  [ORDER_STATUSES.REFUNDED]: 'Refunded'
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUSES.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUSES.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUSES.PREPARING]: 'bg-orange-100 text-orange-800',
  [ORDER_STATUSES.READY]: 'bg-purple-100 text-purple-800',
  [ORDER_STATUSES.PICKED_UP]: 'bg-indigo-100 text-indigo-800',
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: 'bg-cyan-100 text-cyan-800',
  [ORDER_STATUSES.DELIVERED]: 'bg-green-100 text-green-800',
  [ORDER_STATUSES.CANCELLED]: 'bg-red-100 text-red-800',
  [ORDER_STATUSES.REFUNDED]: 'bg-gray-100 text-gray-800'
};

export const NEXT_VALID_STATUSES = {
  [ORDER_STATUSES.PENDING]: [ORDER_STATUSES.CONFIRMED, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.CONFIRMED]: [ORDER_STATUSES.PREPARING, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.PREPARING]: [ORDER_STATUSES.READY, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.READY]: [ORDER_STATUSES.PICKED_UP],
  [ORDER_STATUSES.PICKED_UP]: [ORDER_STATUSES.OUT_FOR_DELIVERY],
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: [ORDER_STATUSES.DELIVERED],
  [ORDER_STATUSES.DELIVERED]: [],
  [ORDER_STATUSES.CANCELLED]: [ORDER_STATUSES.REFUNDED],
  [ORDER_STATUSES.REFUNDED]: []
};

export function canUpdateOrderStatus(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  const validStatuses = NEXT_VALID_STATUSES[currentStatus] || [];
  return (validStatuses as OrderStatus[]).includes(newStatus);
}

export function getOrderProgress(status: OrderStatus): number {
  // Progress statuses only (excludes CANCELLED and REFUNDED)
  const statusOrder: (typeof ORDER_STATUSES[keyof Pick<typeof ORDER_STATUSES, 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED'>])[] = [
    ORDER_STATUSES.PENDING,
    ORDER_STATUSES.CONFIRMED,
    ORDER_STATUSES.PREPARING,
    ORDER_STATUSES.READY,
    ORDER_STATUSES.PICKED_UP,
    ORDER_STATUSES.OUT_FOR_DELIVERY,
    ORDER_STATUSES.DELIVERED
  ];

  const currentIndex = statusOrder.indexOf(status as any);
  if (currentIndex === -1) {
    // For cancelled or refunded orders, return 0 progress
    if (status === ORDER_STATUSES.CANCELLED || status === ORDER_STATUSES.REFUNDED) {
      return 0;
    }
    return 0;
  }
  
  return ((currentIndex + 1) / statusOrder.length) * 100;
}

export function isOrderActive(status: OrderStatus): boolean {
  return ![ORDER_STATUSES.DELIVERED, ORDER_STATUSES.CANCELLED, ORDER_STATUSES.REFUNDED].includes(status as any);
}

export function isOrderCancellable(status: OrderStatus): boolean {
  return [ORDER_STATUSES.PENDING, ORDER_STATUSES.CONFIRMED].includes(status as any);
}

export function getEstimatedDeliveryTime(
  orderCreatedAt: Date,
  preparationTime: number,
  deliveryTime: number = 30
): Date {
  const totalTime = preparationTime + deliveryTime; // in minutes
  return new Date(orderCreatedAt.getTime() + totalTime * 60000);
}

export function formatOrderNumber(orderNumber: string): string {
  // Convert AST-20240126-143052-1234 to a more readable format
  const parts = orderNumber.split('-');
  if (parts.length === 4) {
    const [prefix, date, time, random] = parts;
    return `${prefix}-${random}`;
  }
  return orderNumber;
}

export function validateVerificationCode(inputCode: string, actualCode: string): boolean {
  return inputCode.trim() === actualCode.trim();
}

export function isVerificationCodeExpired(orderCreatedAt: Date, expiryHours: number = 24): boolean {
  const now = new Date();
  const expiryTime = new Date(orderCreatedAt.getTime() + expiryHours * 60 * 60 * 1000);
  return now > expiryTime;
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  timestamp: Date;
  updatedBy: string;
  notes?: string;
}

export function createStatusUpdate(
  status: OrderStatus,
  updatedBy: string,
  notes?: string
): OrderStatusUpdate {
  return {
    status,
    timestamp: new Date(),
    updatedBy,
    notes
  };
}

export function calculateOrderTimings(
  orderCreatedAt: Date,
  statusUpdates: OrderStatusUpdate[]
): Record<string, number> {
  const timings: Record<string, number> = {};
  let previousTime = orderCreatedAt;

  statusUpdates.forEach((update) => {
    const duration = update.timestamp.getTime() - previousTime.getTime();
    timings[update.status] = Math.round(duration / 60000); // Convert to minutes
    previousTime = update.timestamp;
  });

  return timings;
}

export function getOrderPriority(
  orderCreatedAt: Date,
  totalAmount: number,
  customerTier: string = 'REGULAR'
): 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' {
  const ageInMinutes = (Date.now() - orderCreatedAt.getTime()) / 60000;
  
  // High value orders get higher priority
  if (totalAmount > 1000) return 'HIGH';
  
  // Premium customers get higher priority
  if (customerTier === 'PREMIUM') return 'HIGH';
  
  // Orders older than 30 minutes become urgent
  if (ageInMinutes > 30) return 'URGENT';
  
  // Orders older than 15 minutes get high priority
  if (ageInMinutes > 15) return 'HIGH';
  
  return 'NORMAL';
}
