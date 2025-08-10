"use client";

import React from "react";
import { useCartStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Minus, Trash2, ShoppingCart, ChefHat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CustomerLayout from "@/components/layouts/customer-layout";
import { toast } from "sonner";

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeItem,
    clearCart,
    calculateTotals,
  } = useCartStore();
  const router = useRouter();

  if (!cart || cart.items.length === 0) {
    return (
      <CustomerLayout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card className="text-center py-16">
            <CardContent className="space-y-6">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold" style={{ color: '#002a01' }}>Your cart is empty</h3>
                <p className="text-gray-500 mt-2">Discover delicious food and add items to your cart</p>
              </div>
              <Button 
                onClick={() => router.push('/customer/discover')}
                className="mt-6"
                style={{
                  backgroundColor: '#d1f86a',
                  color: '#002a01',
                  border: '1px solid #002a01'
                }}
              >
                Discover Restaurants
              </Button>
            </CardContent>
          </Card>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Your Cart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {cart.items.map((item) => (
              <div
                key={item.menuItemId}
                className="border-b py-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <img
                    src={item.menuItem.imageUrl || "/placeholder.png"}
                    alt={item.menuItem.name}
                    className="w-16 h-16 rounded-md"
                  />
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold">
                      {item.menuItem.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      ₹{item.menuItem.price} each
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="px-4 font-semibold">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        removeItem(item.menuItemId);
                        toast.success(`${item.menuItem.name} removed`);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  <p className="text-right font-semibold mt-2">
                    ₹{item.subtotal.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mt-6">
          <Card>
            <CardContent>
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>₹{cart.subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Taxes</p>
                <p>₹{cart.taxes.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p>Delivery Fee</p>
                <p>₹{cart.deliveryFee.toFixed(2)}</p>
              </div>
              <div className="flex justify-between font-bold">
                <p>Total</p>
                <p>₹{cart.total.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => clearCart()}>
              Clear Cart
            </Button>
            <Button onClick={() => router.push('/checkout')}>
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

