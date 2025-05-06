"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface CitySelectorProps {
  onCityChange?: (cityId: number) => void;
}

// City type definition based on API response
interface City {
  id: number;
  city_name: string;
  state: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function CitySelector({ onCityChange }: CitySelectorProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch cities from API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/cities/get-all')

        if (!response.ok) {
          throw new Error(`Failed to fetch cities: ${response.status}`)
        }

        const data = await response.json()

        if (Array.isArray(data)) {
          setCities(data.filter(city => city.is_active))
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err) {
        console.error('Error fetching cities:', err)
        setError(err instanceof Error ? err.message : 'Failed to load cities')
      } finally {
        setLoading(false)
      }
    }

    fetchCities()
  }, [])

  // When value changes, find the city and call onCityChange with its ID
  useEffect(() => {
    if (value && onCityChange) {
      const selectedCity = cities.find(city => city.id.toString() === value)
      if (selectedCity) {
        onCityChange(selectedCity.id)
      }
    }
  }, [value, onCityChange, cities])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading cities...
            </div>
          ) : error ? (
            <div className="flex items-center text-destructive">
              <MapPin className="mr-2 h-4 w-4" />
              Error loading cities
            </div>
          ) : value ? (
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              {cities.find((city) => city.id.toString() === value)?.city_name}
            </div>
          ) : (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="mr-2 h-4 w-4" />
              Select a city...
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search city..." />
          <CommandList>
            <CommandEmpty>No city found.</CommandEmpty>
            {loading ? (
              <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading cities...
              </div>
            ) : error ? (
              <div className="p-6 text-center text-sm text-destructive">
                {error}
              </div>
            ) : (
              <CommandGroup>
                {cities.map((city) => (
                  <CommandItem
                    key={city.id}
                    value={city.id.toString()}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === city.id.toString() ? "opacity-100" : "opacity-0")} />
                    {city.city_name}
                    <span className="ml-2 text-xs text-muted-foreground">{city.state}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
