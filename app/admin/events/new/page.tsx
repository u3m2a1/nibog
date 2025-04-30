"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TimePickerDemo } from "@/components/time-picker"

// Mock data - in a real app, this would come from an API
const cities = [
  { id: "1", name: "Mumbai" },
  { id: "2", name: "Delhi" },
  { id: "3", name: "Bangalore" },
  { id: "4", name: "Chennai" },
  { id: "5", name: "Hyderabad" },
  { id: "6", name: "Pune" },
]

const venues = [
  { id: "1", name: "Little Explorers Center", city: "Mumbai" },
  { id: "2", name: "Rhythm Studio", city: "Delhi" },
  { id: "3", name: "Tiny Champions Arena", city: "Bangalore" },
  { id: "4", name: "Zen Baby Studio", city: "Mumbai" },
  { id: "5", name: "Aqua Tots Center", city: "Pune" },
  { id: "6", name: "Creative Kids Studio", city: "Chennai" },
  { id: "7", name: "Little Movers Gym", city: "Hyderabad" },
]

const gameTemplates = [
  {
    id: "1",
    name: "Baby Sensory Play",
    description: "Engage your baby's senses with various textures, sounds, and colors.",
    minAgeMonths: 6,
    maxAgeMonths: 18,
    durationMinutes: 90,
    suggestedPrice: 799
  },
  {
    id: "2",
    name: "Toddler Music & Movement",
    description: "Fun-filled session with music, dance, and movement activities.",
    minAgeMonths: 12,
    maxAgeMonths: 36,
    durationMinutes: 90,
    suggestedPrice: 899
  },
  {
    id: "3",
    name: "Baby Olympics",
    description: "Exciting mini-games and activities designed for babies to have fun and develop motor skills.",
    minAgeMonths: 8,
    maxAgeMonths: 24,
    durationMinutes: 120,
    suggestedPrice: 999
  },
]

export default function NewEventPage() {
  const router = useRouter()
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedVenue, setSelectedVenue] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [eventTitle, setEventTitle] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [eventStatus, setEventStatus] = useState("draft")
  const [selectedGames, setSelectedGames] = useState<Array<{
    templateId: string;
    customTitle?: string;
    customDescription?: string;
    customPrice?: number;
    slots: Array<{
      id: string;
      startTime: string;
      endTime: string;
      price: number;
      maxParticipants: number;
    }>;
  }>>([])
  const [activeGameIndex, setActiveGameIndex] = useState<number | null>(null)

  // Get filtered venues based on selected city
  const filteredVenues = selectedCity
    ? venues.filter((venue) => venue.city === selectedCity)
    : []

  // Add a game to the event
  const addGame = (templateId: string) => {
    const template = gameTemplates.find((t) => t.id === templateId)
    if (!template) return

    // Check if game is already added
    if (selectedGames.some(game => game.templateId === templateId)) {
      alert("This game is already added to the event.")
      return
    }

    const newGame = {
      templateId,
      customTitle: template.name,
      customDescription: template.description,
      customPrice: template.suggestedPrice,
      slots: [{
        id: `game-${templateId}-slot-1`,
        startTime: "10:00",
        endTime: "11:30",
        price: template.suggestedPrice,
        maxParticipants: 12
      }]
    }

    const newGames = [...selectedGames, newGame]
    setSelectedGames(newGames)
    setActiveGameIndex(newGames.length - 1)
  }

  // Remove a game from the event
  const removeGame = (index: number) => {
    setSelectedGames(selectedGames.filter((_, i) => i !== index))
    if (activeGameIndex === index) {
      setActiveGameIndex(null)
    } else if (activeGameIndex !== null && activeGameIndex > index) {
      setActiveGameIndex(activeGameIndex - 1)
    }
  }

  // Update game details
  const updateGame = (index: number, field: string, value: any) => {
    setSelectedGames(selectedGames.map((game, i) => {
      if (i === index) {
        return { ...game, [field]: value }
      }
      return game
    }))
  }

  // Add a new time slot to a game
  const addSlot = (gameIndex: number) => {
    const game = selectedGames[gameIndex]
    if (!game) return

    const newSlot = {
      id: `game-${game.templateId}-slot-${game.slots.length + 1}`,
      startTime: "10:00",
      endTime: "11:30",
      price: game.customPrice || gameTemplates.find(t => t.id === game.templateId)?.suggestedPrice || 799,
      maxParticipants: 12
    }

    setSelectedGames(selectedGames.map((g, i) => {
      if (i === gameIndex) {
        return { ...g, slots: [...g.slots, newSlot] }
      }
      return g
    }))
  }

  // Remove a time slot from a game
  const removeSlot = (gameIndex: number, slotId: string) => {
    setSelectedGames(selectedGames.map((game, i) => {
      if (i === gameIndex) {
        return { ...game, slots: game.slots.filter(slot => slot.id !== slotId) }
      }
      return game
    }))
  }

  // Update a slot field
  const updateSlot = (gameIndex: number, slotId: string, field: string, value: any) => {
    setSelectedGames(selectedGames.map((game, i) => {
      if (i === gameIndex) {
        return {
          ...game,
          slots: game.slots.map(slot => {
            if (slot.id === slotId) {
              return { ...slot, [field]: value }
            }
            return slot
          })
        }
      }
      return game
    }))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!selectedVenue || !selectedDate || selectedGames.length === 0) {
      alert("Please fill in all required fields and add at least one game.")
      return
    }

    // Check if all games have at least one slot
    const gamesWithoutSlots = selectedGames.filter(game => game.slots.length === 0)
    if (gamesWithoutSlots.length > 0) {
      alert(`Please add at least one time slot to each game. Games without slots: ${gamesWithoutSlots.map(g => g.customTitle).join(", ")}`)
      return
    }

    // In a real app, this would be an API call to create the event
    console.log({
      title: eventTitle,
      description: eventDescription,
      venueId: selectedVenue,
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      status: eventStatus,
      games: selectedGames
    })

    // Redirect to events list
    router.push("/admin/events")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
        <p className="text-muted-foreground">Schedule a new event based on a game template</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Basic information about the event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Enter event title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Event Description</Label>
                  <Textarea
                    id="description"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Enter event description"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Select value={selectedCity} onValueChange={(value) => {
                    setSelectedCity(value)
                    setSelectedVenue("")
                  }}>
                    <SelectTrigger id="city">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Select
                    value={selectedVenue}
                    onValueChange={setSelectedVenue}
                    disabled={!selectedCity}
                  >
                    <SelectTrigger id="venue">
                      <SelectValue placeholder={selectedCity ? "Select a venue" : "Select a city first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredVenues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Event Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Initial Status</Label>
                  <Select value={eventStatus} onValueChange={setEventStatus}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Games</CardTitle>
                <CardDescription>Select games to include in this event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gameTemplate">Game Templates</Label>
                  <div className="flex gap-2">
                    <Select onValueChange={addGame}>
                      <SelectTrigger id="gameTemplate" className="flex-1">
                        <SelectValue placeholder="Select a game to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {gameTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedGames.length === 0 ? (
                  <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                    <p className="text-sm text-muted-foreground">No games added yet. Select a game template to add it to the event.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Selected Games</Label>
                    <div className="space-y-2">
                      {selectedGames.map((game, index) => {
                        const template = gameTemplates.find(t => t.id === game.templateId)
                        return (
                          <div
                            key={`${game.templateId}-${index}`}
                            className={cn(
                              "flex items-center justify-between rounded-md border p-3 cursor-pointer",
                              activeGameIndex === index && "border-primary bg-primary/5"
                            )}
                            onClick={() => setActiveGameIndex(index)}
                          >
                            <div>
                              <h4 className="font-medium">{game.customTitle || template?.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {game.slots.length} slot(s) • Custom Price: ₹{game.customPrice || template?.suggestedPrice}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeGame(index)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove game</span>
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {activeGameIndex !== null && selectedGames[activeGameIndex] && (
              <Card>
                <CardHeader>
                  <CardTitle>Game Configuration</CardTitle>
                  <CardDescription>
                    Customize the selected game for this event
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeGameIndex !== null && selectedGames[activeGameIndex] && (() => {
                    const game = selectedGames[activeGameIndex];
                    const template = gameTemplates.find(t => t.id === game.templateId);

                    if (!template) {
                      return (
                        <div className="flex h-32 items-center justify-center">
                          <p className="text-sm text-muted-foreground">Template not found</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        <div className="rounded-md bg-muted p-3">
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Template:</span>{" "}
                              <span>{template.name}</span>
                            </div>
                            <div>
                              <span className="font-medium">Age Range:</span>{" "}
                              <span>{template.minAgeMonths}-{template.maxAgeMonths} months</span>
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span>{" "}
                              <span>{template.durationMinutes} minutes</span>
                            </div>
                            <div>
                              <span className="font-medium">Suggested Price:</span>{" "}
                              <span>₹{template.suggestedPrice}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="customTitle">Custom Title (Optional)</Label>
                          <Input
                            id="customTitle"
                            value={game.customTitle || ""}
                            onChange={(e) => updateGame(activeGameIndex, "customTitle", e.target.value)}
                            placeholder={template.name}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="customDescription">Custom Description (Optional)</Label>
                          <Textarea
                            id="customDescription"
                            value={game.customDescription || ""}
                            onChange={(e) => updateGame(activeGameIndex, "customDescription", e.target.value)}
                            placeholder={template.description}
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="customPrice">Custom Price (₹)</Label>
                          <Input
                            id="customPrice"
                            type="number"
                            min="0"
                            value={game.customPrice || template.suggestedPrice}
                            onChange={(e) => {
                              const price = parseInt(e.target.value)
                              updateGame(activeGameIndex, "customPrice", price)

                              // Update all slot prices if they match the previous custom price
                              const prevPrice = game.customPrice || template.suggestedPrice
                              const slotsToUpdate = game.slots.filter(slot => slot.price === prevPrice)

                              if (slotsToUpdate.length > 0) {
                                const updatedSlots = game.slots.map(slot => {
                                  if (slot.price === prevPrice) {
                                    return { ...slot, price }
                                  }
                                  return slot
                                })

                                setSelectedGames(selectedGames.map((g, i) => {
                                  if (i === activeGameIndex) {
                                    return { ...g, slots: updatedSlots }
                                  }
                                  return g
                                }))
                              }
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            Suggested price: ₹{template.suggestedPrice}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {activeGameIndex !== null && selectedGames[activeGameIndex] && (
              <Card>
                <CardHeader>
                  <CardTitle>Time Slots</CardTitle>
                  <CardDescription>
                    {(() => {
                      const game = selectedGames[activeGameIndex];
                      const template = gameTemplates.find(t => t.id === game.templateId);
                      return `Define time slots for ${game.customTitle || template?.name}`;
                    })()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const game = selectedGames[activeGameIndex];

                    if (game.slots.length === 0) {
                      return (
                        <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                          <p className="text-sm text-muted-foreground">No time slots added yet</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {game.slots.map((slot, slotIndex) => (
                          <div key={slot.id} className="rounded-md border p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <h4 className="font-medium">Slot {slotIndex + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSlot(activeGameIndex, slot.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove slot</span>
                              </Button>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`start-time-${slot.id}`}>Start Time</Label>
                                <Input
                                  id={`start-time-${slot.id}`}
                                  type="time"
                                  value={slot.startTime}
                                  onChange={(e) => updateSlot(activeGameIndex, slot.id, "startTime", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`end-time-${slot.id}`}>End Time</Label>
                                <Input
                                  id={`end-time-${slot.id}`}
                                  type="time"
                                  value={slot.endTime}
                                  onChange={(e) => updateSlot(activeGameIndex, slot.id, "endTime", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`price-${slot.id}`}>Price (₹)</Label>
                                <Input
                                  id={`price-${slot.id}`}
                                  type="number"
                                  min="0"
                                  value={slot.price}
                                  onChange={(e) => updateSlot(activeGameIndex, slot.id, "price", parseInt(e.target.value))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`capacity-${slot.id}`}>Max Participants</Label>
                                <Input
                                  id={`capacity-${slot.id}`}
                                  type="number"
                                  min="1"
                                  value={slot.maxParticipants}
                                  onChange={(e) => updateSlot(activeGameIndex, slot.id, "maxParticipants", parseInt(e.target.value))}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => addSlot(activeGameIndex)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Time Slot
                  </Button>

                  {selectedGames[activeGameIndex].slots.length > 0 && (
                    <Alert>
                      <AlertDescription>
                        Time slots should be within the venue's operating hours. Make sure to allow enough time between slots for setup and cleanup.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardFooter className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={() => router.push("/admin/events")}>
                  Cancel
                </Button>
                <Button type="submit">Create Event</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
