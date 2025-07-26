"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Receipt, AlertCircle, ChefHat } from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatOrderNumber, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS  } from '@/lib/order-utils'
import { toast } from 'sonner'

interface Order {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  deliveryFee: number
  platformFee: number
  taxes: number
  totalAmount: number
  createdAt: string
  estimatedDeliveryTime?: string
  deliveredAt?: string
  specialInstructions?: string
  verificationCode: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  restaurant: {
    id: string
    name: string
    address: string
  }
  orderItems: {
    id: string
    quantity: number
    menuItem: {
      id: string
      name: string
      description?: string
      imageUrl?: string
      
    }
  }[]
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const { user } = useStore()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchOrders()
  }, [session, router])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/orders`)
      if (!response.ok) throw new Error('Failed to fetch orders')

      const data = await response.json()
      setOrders(data.data.orders)
    } catch (error) {
      setError('Error fetching orders')
      toast.error('Error fetching orders')
    } finally {
      setLoading(false)
    }
  }

  return (
    [div className="container mx-auto py-8"
      [h1 className="text-3xl font-bold mb-8"Your Orders[/h1

      {loading && [pLoading...[/p}

      {error && [p className="text-red-500"{error}[/p}

      {!loading && !error && orders.length === 0 && (
        [pYou have not placed any orders yet.[/p)
      )}

      [div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        {orders.map((order) => (
          [Card key={order.id}
            [CardHeader
              [CardTitle className="flex justify-between items-center"
                [spanOrder #[001b[strong{formatOrderNumber(order.orderNumber)}[/strong
                <Badge className={ORDER_STATUS_COLORS[order.status]}0_ORDER_STATUS_LABELS[order.status]u
              [/CardTitle
              <div className="flex space-x-2 text-sm"
                <Clock className="w-4 h-4 text-muted-foreground" /0
                <span>Ordered: {new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              {order.deliveredAt && (
              <div className="flex space-x-2 text-sm"
                <Calendar className="w-4 h-4 text-muted-foreground" /0
                <span>Delivered: {new Date(order.deliveredAt).toLocaleDateString()}</span>
              </div>
              )}
            [/CardHeader
            [CardContent className="space-y-4"
              [div className="divide-y divide-gray-200"
                {order.orderItems.map((item) => (
                  [div key={item.id} className="py-2"
                    <div className="grid grid-cols-6 gap-2"
                      <img src={item.menuItem.imageUrl || '/images/placeholder.png'} alt={item.menuItem.name} className="h-16 w-16 object-cover rounded" 
                      <div className="col-span-5"
                        <h3 className="font-medium">{item.menuItem.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.menuItem.description}</p>
                        <div className="flex justify-between text-sm text-muted-foreground mt-1"
                          <span>Quantity: {item.quantity}</span>
                          <span>₹{item.subtotal}</span>
                        </div>
                      </div>
                    ,div>
                  [/div
                ))}
              </div>
              <div className="flex justify-between text-sm text-muted-foreground"
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground"
                <span>Delivery Fee</span>
                <span>₹{order.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground"
                <span>Platform Fee</span>
                <span>₹{order.platformFee}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground"
                <span>Taxes</span>
                <span>₹{order.taxes}</span>
              </div>
              <div className="flex justify-between font-medium"
                <span>Total</span>
                <span>₹{order.totalAmount}</span>
              </div>
            [/CardContent0
            <Button variant="ghost" size="sm" onClick={() => router.push(`/customer/orders/${order.id}`)}
              View Details
            /Button>
          [/Card
        ))}
      [/div
    [/div
  )
}


