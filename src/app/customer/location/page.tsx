"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Navigation, Search, AlertCircle } from 'lucide-react'
import { useStore } from '@/lib/store'
import { locationService } from '@/lib/location-service'
import { toast } from 'sonner'

export default function LocationSetup() {
  const [address, setAddress] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  
  const {
    location,
    locationPermission,
    locationLoading,
    locationError,
    requestLocation,
    setLocation
  } = useStore()

  useEffect(() => {
    if (location) {
      router.push('/customer/discover')
    }
  }, [location, router])

  const handleRequestLocation = async () => {
    try {
      await requestLocation()
      if (location) {
        toast.success('Location access granted!')
        router.push('/customer/discover')
      }
    } catch (error) {
      toast.error('Failed to get location')
    }
  }

  const handleAddressSearch = async () => {
    if (!address.trim()) return

    setIsSearching(true)
    try {
      const suggestions = await locationService.getPlaceSuggestions(address)
      setSuggestions(suggestions)
    } catch (error) {
      toast.error('Failed to search for address')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectSuggestion = async (suggestion: any) => {
    try {
      const result = await locationService.geocodeAddress(suggestion.address)
      if (result) {
        setLocation({
          latitude: result.latitude,
          longitude: result.longitude,
        })
        toast.success('Location set successfully!')
        router.push('/customer/discover')
      }
    } catch (error) {
      toast.error('Failed to set location')
    }
  }

  const handleManualCoordinates = (lat: string, lng: string) => {
    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)
    
    if (!isNaN(latitude) && !isNaN(longitude)) {
      setLocation({ latitude, longitude })
      toast.success('Location set successfully!')
      router.push('/customer/discover')
    } else {
      toast.error('Please enter valid coordinates')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Set Your Location</h1>
          <p className="text-muted-foreground mt-2">
            We need your location to find nearby restaurants and calculate delivery times
          </p>
        </div>

        {/* Current location method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Use Current Location
            </CardTitle>
            <CardDescription>
              Get your precise location automatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleRequestLocation}
              className="w-full"
              disabled={locationLoading}
            >
              {locationLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Getting Location...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Use Current Location
                </>
              )}
            </Button>
            
            {locationError && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {locationError}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        {/* Address search method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Address
            </CardTitle>
            <CardDescription>
              Enter your address or area name
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter your address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
              />
              <Button 
                onClick={handleAddressSearch}
                disabled={isSearching || !address.trim()}
                size="sm"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {suggestions.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Suggestions:</Label>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 border rounded-md cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{suggestion.address}</p>
                        {suggestion.city && (
                          <p className="text-xs text-muted-foreground">{suggestion.city}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual coordinates method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Manual Coordinates
            </CardTitle>
            <CardDescription>
              Enter latitude and longitude manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="latitude" className="text-sm">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="12.9716"
                  onBlur={(e) => {
                    const lng = (document.getElementById('longitude') as HTMLInputElement)?.value
                    if (e.target.value && lng) {
                      handleManualCoordinates(e.target.value, lng)
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="longitude" className="text-sm">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="77.5946"
                  onBlur={(e) => {
                    const lat = (document.getElementById('latitude') as HTMLInputElement)?.value
                    if (e.target.value && lat) {
                      handleManualCoordinates(lat, e.target.value)
                    }
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              You can get coordinates from Google Maps or other mapping services
            </p>
          </CardContent>
        </Card>

        {/* Skip for now */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/customer')}
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  )
}
