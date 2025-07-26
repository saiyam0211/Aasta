"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, MapPin, Star, Search, Filter, ChefHat, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'
interface Restaurant {
  id: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  latitude: number
  longitude: number
  cuisineTypes: string[]
  averageRating: number
  averagePreparationTime: number
  minimumOrderAmount: number
  deliveryRadius: number
  isOpen: boolean
  distance: number
  estimatedDeliveryTime: number | null
  totalOrders: number
  menuCategories: string[]
  featuredItems: {
    id: string
    name: string
    price: number
    category: string
  }[]
}

export default function DiscoverRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const { location } = useStore()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (location) {
      fetchRestaurants(location.latitude, location.longitude, 5)
    } else {
      setError('No location available')
      setLoading(false)
    }
  }, [session, location, router])

  const fetchRestaurants = async (latitude: number, longitude: number, radius: number) => {
    try {
      const response = await fetch('/api/restaurants/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude,
          radius,
          filters: {
            cuisineTypes: [],
            rating: 4,
          },
        }),
      })
      if (!response.ok) throw new Error('Failed to fetch restaurants')

      const data = await response.json()
      setRestaurants(data.data.restaurants)
    } catch (error) {
      setError('Error fetching restaurants')
      toast.error('Error fetching restaurants')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Discover Restaurants</h1>

      {loading && <p>Loading...</p>}

      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && restaurants.length === 0 && (
        <p>No restaurants found. Please try again later.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <Card key={restaurant.id}>
            <CardHeader>
              <CardTitle>{restaurant.name}</CardTitle>
              <div className="flex space-x-2">
                {restaurant.cuisineTypes.map((type) => (
                  <Badge key={type}>{type}</Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500">{restaurant.address}</p>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <span className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>{restaurant.averageRating}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{restaurant.estimatedDeliveryTime} min</span>
                </span>
                <span className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>₹{restaurant.minimumOrderAmount}</span>
                </span>
              </div>
            </CardContent>
            <Button variant="outline" onClick={() => router.push(`/restaurant/${restaurant.id}`)}>
              View Details
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

