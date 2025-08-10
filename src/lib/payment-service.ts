import Razorpay from 'razorpay';
import crypto from 'crypto';

// Razorpay types
interface RazorpayOrderOptions {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

interface RazorpayOrder {
  id: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
  notes: Record<string, string>;
}

interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RefundOptions {
  payment_id: string;
  amount?: number;
  notes?: Record<string, string>;
}

interface RefundResponse {
  id: string;
  amount: number;
  currency: string;
  payment_id: string;
  status: string;
  created_at: number;
}

class PaymentService {
  private razorpay: Razorpay;
  private keySecret: string;

  constructor() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not found in environment variables');
    }

    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
    this.keySecret = process.env.RAZORPAY_KEY_SECRET;
  }

  /**
   * Create a payment order in Razorpay
   */
  async createPaymentOrder(
    amount: number,
    orderNumber: string,
    customerEmail?: string,
    customerPhone?: string
  ): Promise<RazorpayOrder> {
    try {
      const orderOptions: RazorpayOrderOptions = {
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          order_number: orderNumber,
          customer_email: customerEmail || '',
          customer_phone: customerPhone || '',
        },
      };

      const order = await this.razorpay.orders.create(orderOptions);
      return order as RazorpayOrder;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Verify payment signature for security
   */
  verifyPayment(verificationData: PaymentVerificationData): boolean {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verificationData;
      
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === razorpay_signature;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }

  /**
   * Process refund for cancelled orders
   */
  async processRefund(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<RefundResponse> {
    try {
      const refundOptions: RefundOptions = {
        payment_id: paymentId,
        notes: {
          reason: reason || 'Order cancelled',
          processed_at: new Date().toISOString(),
        },
      };

      if (amount) {
        refundOptions.amount = Math.round(amount * 100); // Convert to paise
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundOptions);
      return refund as RefundResponse;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }

  /**
   * Get payment status from Razorpay
   */
  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw new Error('Failed to fetch payment status');
    }
  }

  /**
   * Get order details from Razorpay
   */
  async getOrderDetails(orderId: string): Promise<RazorpayOrder> {
    try {
      const order = await this.razorpay.orders.fetch(orderId);
      return order as RazorpayOrder;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw new Error('Failed to fetch order details');
    }
  }

  /**
   * Verify webhook signature for security
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
        .update(body)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      );
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Calculate platform fees and commissions
   */
  calculateFees(orderAmount: number): {
    platformFee: number;
    paymentGatewayFee: number;
    restaurantAmount: number;
    deliveryFee: number;
  } {
    const platformFeePercent = 0.05; // 5% platform fee
    const paymentGatewayFeePercent = 0.024; // 2.4% Razorpay fee
    const deliveryFeePercent = 0.15; // 15% delivery fee

    const platformFee = Math.round(orderAmount * platformFeePercent * 100) / 100;
    const paymentGatewayFee = Math.round(orderAmount * paymentGatewayFeePercent * 100) / 100;
    const deliveryFee = Math.round(orderAmount * deliveryFeePercent * 100) / 100;
    const restaurantAmount = Math.round((orderAmount - platformFee - paymentGatewayFee) * 100) / 100;

    return {
      platformFee,
      paymentGatewayFee,
      restaurantAmount,
      deliveryFee,
    };
  }

  /**
   * Validate payment amount to prevent manipulation
   */
  validatePaymentAmount(orderAmount: number, paidAmount: number): boolean {
    const tolerance = 1; // ₹1 tolerance for rounding differences
    return Math.abs(orderAmount - paidAmount) <= tolerance;
  }
}

export default PaymentService;
export type { 
  PaymentVerificationData, 
  RazorpayOrder, 
  RefundResponse 
};
