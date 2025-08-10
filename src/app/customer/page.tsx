"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  Search, 
  Navigation,
  ChefHat,
  Utensils,
  Filter,
  Heart
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'

interface Restaurant {
  id: string
  name: string
  description: string
  address: string
  cuisineTypes: string[]
  averageRating: number
  averagePreparationTime: number
  minimumOrderAmount: number
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

const popularCuisines = [
  { name: 'North Indian', icon: '🍛', count: 12 },
  { name: 'Chinese', icon: '🥢', count: 8 },
  { name: 'Italian', icon: '🍝', count: 6 },
  { name: 'South Indian', icon: '🥥', count: 10 },
  { name: 'Fast Food', icon: '🍔', count: 15 },
  { name: 'Desserts', icon: '🍰', count: 7 },
]

export default function CustomerHome() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState<string>('')
  
  const { data: session } = useSession()
  const router = useRouter()
  
  const {
    location,
    locationPermission,
    requestLocation,
    setLocation
  } = useStore()

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (location) {
      fetchNearbyRestaurants()
    }
    
    // Register PWA client for notifications
    registerPWAClient()
  }, [session, location, router])
  
  const registerPWAClient = async () => {
    if (!session?.user?.id) return
    
    try {
      // Generate session ID
      const sessionId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // PWA Detection
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isiOSStandalone = isIOS && (window.navigator as any).standalone === true
      const isAndroidWebView = /wv/.test(navigator.userAgent)
      const hasManifest = document.querySelector('link[rel="manifest"]') !== null
      
      const isPWAMode = isStandalone || isiOSStandalone || (isAndroidWebView && hasManifest)
      
      const pwaDetails = {
        isStandalone,
        isiOSStandalone,
        isAndroidWebView,
        hasManifest,
        displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
        userAgent: navigator.userAgent
      }
      
      console.log('📱 Customer PWA Registration:', {
        sessionId,
        isPWAMode,
        pwaDetails
      })
      
      const response = await fetch('/api/client-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          isPWA: isPWAMode,
          userAgent: navigator.userAgent,
          pwaDetails
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ PWA Client registered:', result)
      } else {
        console.error('❌ PWA Client registration failed:', response.status)
      }
    } catch (error) {
      console.error('❌ PWA Client registration error:', error)
    }
  }

  const fetchNearbyRestaurants = async () => {
    if (!location) return

    setLoading(true)
    try {
      const response = await fetch('/api/restaurants/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 5,
          filters: {
            cuisineTypes: selectedCuisine ? [selectedCuisine] : [],
            rating: 3.5,
          },
        }),
      })
      
      if (!response.ok) throw new Error('Failed to fetch restaurants')

      const data = await response.json()
      setRestaurants(data.data.restaurants.slice(0, 6)) // Show only first 6 on homepage
    } catch (error) {
      console.error('Error fetching restaurants:', error)
      toast.error('Failed to load restaurants')
    } finally {
      setLoading(false)
    }
  }

  const handleLocationRequest = async () => {
    try {
      await requestLocation()
      toast.success('Location access granted!')
    } catch (error) {
      toast.error('Failed to get location')
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/customer/discover?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Show location setup if no location is set
  if (!location) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="w-24 h-24 bg-accent-leaf-green rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-12 w-12 text-accent-dark-green" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Welcome to Aasta</h1>
              <p className="text-xl text-muted-foreground">
                Your favorite night food delivery service
              </p>
            </div>

            <Card className="p-8">
              <CardHeader>
                <CardTitle>Set Your Location</CardTitle>
                <CardDescription>
                  We need your location to show nearby restaurants and calculate delivery times
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleLocationRequest}
                  className="w-full"
                  size="lg"
                >
                  <Navigation className="h-5 w-5 mr-2" />
                  Use Current Location
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <Link href="/customer/location">
                  <Button variant="outline" className="w-full" size="lg">
                    <Search className="h-5 w-5 mr-2" />
                    Search Address
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Operating hours info */}
            <div className="mt-8 p-4 bg-accent-leaf-green/10 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-accent-dark-green">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Operating Hours: 9:00 PM - 12:00 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Good evening, {session?.user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            What would you like to eat tonight?
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for restaurants, cuisines, or dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Popular Cuisines */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Popular Cuisines</h2>
            <Link href="/customer/discover">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularCuisines.map((cuisine) => (
              <Card 
                key={cuisine.name}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCuisine === cuisine.name ? 'ring-2 ring-accent-dark-green' : ''
                }`}
                onClick={() => {
                  setSelectedCuisine(selectedCuisine === cuisine.name ? '' : cuisine.name)
                  // Trigger refetch when cuisine is selected
                  if (location) fetchNearbyRestaurants()
                }}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{cuisine.icon}</div>
                  <h3 className="font-medium text-sm">{cuisine.name}</h3>
                  <p className="text-xs text-muted-foreground">{cuisine.count} restaurants</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Nearby Restaurants */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {selectedCuisine ? `${selectedCuisine} Restaurants` : 'Restaurants Near You'}
            </h2>
            <Link href="/customer/discover">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <Card key={restaurant.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {restaurant.cuisineTypes.join(', ')}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {restaurant.cuisineTypes.slice(0, 2).map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                      {!restaurant.isOpen && (
                        <Badge variant="destructive" className="text-xs">
                          Closed
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{restaurant.averageRating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{restaurant.estimatedDeliveryTime} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>₹{restaurant.minimumOrderAmount}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{restaurant.distance.toFixed(1)} km away</span>
                      </div>
                      <span>{restaurant.totalOrders} orders</span>
                    </div>

                    {restaurant.featuredItems.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-2">Featured:</p>
                        <div className="space-y-1">
                          {restaurant.featuredItems.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="truncate">{item.name}</span>
                              <span className="font-medium">₹{item.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link href={`/customer/restaurant/${restaurant.id}`}>
                      <Button 
                        className="w-full" 
                        disabled={!restaurant.isOpen}
                      >
                        {restaurant.isOpen ? (
                          <>
                            <Utensils className="h-4 w-4 mr-2" />
                            View Menu
                          </>
                        ) : (
                          'Closed'
                        )}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No restaurants found</h3>
              <p className="text-muted-foreground mb-4">
                {selectedCuisine 
                  ? `No ${selectedCuisine} restaurants available in your area right now.`
                  : 'No restaurants are currently available in your area.'}
              </p>
              {selectedCuisine && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedCuisine('')
                    fetchNearbyRestaurants()
                  }}
                >
                  Clear Filter
                </Button>
              )}
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/customer/discover">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Search className="h-8 w-8 mx-auto mb-2 text-accent-dark-green" />
                <h3 className="font-medium">Discover</h3>
                <p className="text-sm text-muted-foreground">Find new restaurants</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/customer/orders">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-accent-dark-green" />
                <h3 className="font-medium">Orders</h3>
                <p className="text-sm text-muted-foreground">Track your orders</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/customer/favorites">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 text-accent-dark-green" />
                <h3 className="font-medium">Favorites</h3>
                <p className="text-sm text-muted-foreground">Your liked places</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/customer/profile">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-accent-dark-green" />
                <h3 className="font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">Manage account</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
