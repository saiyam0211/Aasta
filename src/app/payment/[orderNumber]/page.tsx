'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  items: any[];
  restaurant: {
    name: string;
  };
  deliveryAddress: string;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params?.orderNumber as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchOrder();
    loadRazorpayScript();
  }, [orderNumber]);

  // Auto-open Razorpay when order is loaded and SDK is present
  useEffect(() => {
    if (!order) return;
    const maybeOpen = () => {
      if (window.Razorpay) {
        initiatePayment();
      } else {
        // Poll briefly for SDK load to avoid user clicking again
        const start = Date.now();
        const interval = setInterval(() => {
          if (window.Razorpay || Date.now() - start > 1500) {
            clearInterval(interval);
            if (window.Razorpay) {
              initiatePayment();
            }
          }
        }, 100);
      }
    };
    maybeOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderNumber}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        toast.error('Order not found');
        router.push('/orders');
      }
    } catch (error) {
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    if (window.Razorpay) return;

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const initiatePayment = async () => {
    if (!order) return;

    setProcessing(true);

    try {
      // Create payment order
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Initialize Razorpay checkout
      const options = {
        key: data.razorpayOrder.key,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: 'Aasta',
        description: `Payment for Order #${order.orderNumber}`,
        order_id: data.razorpayOrder.id,
        handler: async (response: any) => {
          await verifyPayment(response);
        },
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment');
      setProcessing(false);
    }
  };

  const verifyPayment = async (response: any) => {
    try {
      const verifyResponse = await fetch('/api/payments/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      const data = await verifyResponse.json();

      if (data.success) {
        toast.success('Payment successful!');
        router.push(`/orders/${orderNumber}?payment=success`);
      } else {
        toast.error('Payment verification failed');
        router.push(`/orders/${orderNumber}?payment=failed`);
      }
    } catch (error) {
      toast.error('Payment verification failed');
      router.push(`/orders/${orderNumber}?payment=failed`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Order Not Found</h1>
          <Button onClick={() => router.push('/orders')}>View Orders</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl px-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Order Number:</span>
                <span>{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Restaurant:</span>
                <span>{order.restaurant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Delivery Address:</span>
                <span className="max-w-xs text-right">
                  {order.deliveryAddress}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border bg-blue-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-blue-600" />
                      <span className="font-medium">
                        Razorpay Secure Checkout
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      Cards, UPI, Wallets & More
                    </span>
                  </div>
                </div>

                <Button
                  onClick={initiatePayment}
                  disabled={processing}
                  className="h-12 w-full text-lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>Pay ₹{order.total.toFixed(2)}</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-start">
              <Shield className="mt-0.5 mr-2 h-5 w-5 text-green-600" />
              <div className="text-sm text-green-800">
                <p className="mb-1 font-medium">Secure Payment</p>
                <p>
                  Your payment information is encrypted and secure. We don't
                  store your card details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
