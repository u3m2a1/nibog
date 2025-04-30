"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Mock data - in a real app, this would come from an API
const cities = [
  { value: "mumbai", label: "Mumbai", state: "Maharashtra" },
  { value: "delhi", label: "Delhi", state: "Delhi" },
  { value: "bangalore", label: "Bangalore", state: "Karnataka" },
  { value: "hyderabad", label: "Hyderabad", state: "Telangana" },
  { value: "chennai", label: "Chennai", state: "Tamil Nadu" },
  { value: "kolkata", label: "Kolkata", state: "West Bengal" },
  { value: "pune", label: "Pune", state: "Maharashtra" },
  { value: "ahmedabad", label: "Ahmedabad", state: "Gujarat" },
  { value: "jaipur", label: "Jaipur", state: "Rajasthan" },
  { value: "lucknow", label: "Lucknow", state: "Uttar Pradesh" },
  { value: "chandigarh", label: "Chandigarh", state: "Chandigarh" },
  { value: "kochi", label: "Kochi", state: "Kerala" },
]

export default function CitySelector() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? (
            <>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                {cities.find((city) => city.value === value)?.label}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                Select a city...
              </div>
            </>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search city..." />
          <CommandList>
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup>
              {cities.map((city) => (
                <CommandItem
                  key={city.value}
                  value={city.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === city.value ? "opacity-100" : "opacity-0")} />
                  {city.label}
                  <span className="ml-2 text-xs text-muted-foreground">{city.state}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
