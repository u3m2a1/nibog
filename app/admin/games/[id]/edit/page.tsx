"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, Wand2, ArrowLeft } from "lucide-react"

// Mock data - in a real app, this would come from an API
const gameTemplates = [
  {
    id: "1",
    name: "Baby Crawling",
    description: "Let your little crawler compete in a fun and safe environment. This engaging activity is designed for babies aged 5-13 months. During this 60-minute session, babies will explore their crawling abilities in a safe and stimulating environment. Parents will be guided through age-appropriate activities that promote development and bonding.",
    minAge: 5,
    maxAge: 13,
    duration: 60,
    categories: ["olympics", "physical", "competition"],
    isActive: true,
    events: 12,
    createdBy: "Admin User",
    createdAt: "2024-10-15",
    lastUpdatedBy: "Admin User",
    lastUpdatedAt: "2024-11-02",
  },
  {
    id: "2",
    name: "Baby Walker",
    description: "Fun-filled baby walker race in a safe environment. This exciting activity is designed for babies aged 5-13 months who are beginning to use walkers. During this 60-minute session, babies will develop balance and coordination skills while having fun. Parents will assist their little ones through a specially designed course.",
    minAge: 5,
    maxAge: 13,
    duration: 60,
    categories: ["olympics", "physical", "competition"],
    isActive: true,
    events: 8,
    createdBy: "Admin User",
    createdAt: "2024-10-15",
    lastUpdatedBy: "Admin User",
    lastUpdatedAt: "2024-11-02",
  },
  {
    id: "3",
    name: "Running Race",
    description: "Exciting running race for toddlers in a fun and safe environment. This activity is perfect for children aged 13-84 months who are confident walkers and beginning runners. During this 60-minute session, children will participate in age-appropriate races that develop coordination, balance, and healthy competition.",
    minAge: 13,
    maxAge: 84,
    duration: 60,
    categories: ["olympics", "physical", "competition"],
    isActive: true,
    events: 15,
    createdBy: "Admin User",
    createdAt: "2024-10-15",
    lastUpdatedBy: "Admin User",
    lastUpdatedAt: "2024-11-02",
  },
  {
    id: "4",
    name: "Hurdle Toddle",
    description: "Fun hurdle race for toddlers to develop coordination and balance. This activity is designed for children aged 13-84 months who are confident walkers. During this 60-minute session, children will navigate through a course with small, safe hurdles that help develop gross motor skills and spatial awareness.",
    minAge: 13,
    maxAge: 84,
    duration: 60,
    categories: ["olympics", "physical", "competition"],
    isActive: true,
    events: 10,
    createdBy: "Admin User",
    createdAt: "2024-10-15",
    lastUpdatedBy: "Admin User",
    lastUpdatedAt: "2024-11-02",
  },
  {
    id: "5",
    name: "Cycle Race",
    description: "Exciting cycle race for children to showcase their skills. This activity is perfect for children aged 13-84 months who can ride tricycles or bicycles with or without training wheels. During this 60-minute session, children will navigate through a safe course that develops balance, coordination, and confidence.",
    minAge: 13,
    maxAge: 84,
    duration: 60,
    categories: ["olympics", "physical", "competition"],
    isActive: true,
    events: 7,
    createdBy: "Admin User",
    createdAt: "2024-10-15",
    lastUpdatedBy: "Admin User",
    lastUpdatedAt: "2024-11-02",
  },
  {
    id: "6",
    name: "Ring Holding",
    description: "Fun ring holding game to develop hand-eye coordination. This activity is designed for children aged 13-84 months. During this 60-minute session, children will practice fine motor skills and hand-eye coordination by holding and placing rings on targets. The game progressively increases in difficulty to challenge growing skills.",
    minAge: 13,
    maxAge: 84,
    duration: 60,
    categories: ["olympics", "physical", "coordination"],
    isActive: true,
    events: 9,
    createdBy: "Admin User",
    createdAt: "2024-10-15",
    lastUpdatedBy: "Admin User",
    lastUpdatedAt: "2024-11-02",
  },
]

type Props = {
  params: { id: string }
}

export default function EditGameTemplate({ params }: Props) {
  const router = useRouter()
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  const gameId = unwrappedParams.id
  
  const gameData = gameTemplates.find((g) => g.id === gameId)
  
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [minAge, setMinAge] = useState(0)
  const [maxAge, setMaxAge] = useState(36)
  const [duration, setDuration] = useState(60)
  const [isActive, setIsActive] = useState(true)
  const [newCategory, setNewCategory] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (gameData) {
      setName(gameData.name)
      setDescription(gameData.description)
      setMinAge(gameData.minAge)
      setMaxAge(gameData.maxAge)
      setDuration(gameData.duration)
      setIsActive(gameData.isActive)
      setCategories([...gameData.categories])
    }
  }, [gameData])

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()])
      setNewCategory("")
    }
  }

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category))
  }

  const handleGenerateDescription = () => {
    // In a real app, this would call the AI API
    setIsGeneratingDescription(true)
    setTimeout(() => {
      setDescription(
        `This engaging ${name.toLowerCase()} session is designed for babies aged ${minAge}-${maxAge} months. During this ${duration}-minute activity, children will explore and develop various skills in a safe and stimulating environment. Parents will be guided through age-appropriate activities that promote development and bonding.`,
      )
      setIsGeneratingDescription(false)
    }, 1500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would be an API call
    console.log({
      id: gameId,
      name,
      description,
      minAge,
      maxAge,
      duration,
      categories,
      isActive,
    })

    // Show saved state
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      // Redirect to the game details page
      router.push(`/admin/games/${gameId}`)
    }, 1500)
  }

  if (!gameData) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Game Not Found</h2>
          <p className="text-muted-foreground">The game template you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/games">Back to Games</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/games/${gameId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Game Template</h1>
          <p className="text-muted-foreground">Update the details for {gameData.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Game Details</CardTitle>
            <CardDescription>Update the details for this game template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Game Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter game name"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateDescription}
                  disabled={isGeneratingDescription || !name}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  {isGeneratingDescription ? "Generating..." : "Generate with AI"}
                </Button>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter game description"
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Age Range (months)</Label>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Minimum Age: {minAge} months</span>
                    <span>Maximum Age: {maxAge} months</span>
                  </div>
                  <div className="px-1">
                    <Slider
                      value={[minAge, maxAge]}
                      min={0}
                      max={84}
                      step={1}
                      onValueChange={(value) => {
                        setMinAge(value[0])
                        setMaxAge(value[1])
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Duration: {duration} minutes</span>
                  </div>
                  <div className="px-1">
                    <Slider
                      value={[duration]}
                      min={30}
                      max={120}
                      step={15}
                      onValueChange={(value) => setDuration(value[0])}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categories/Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add a category"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddCategory()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddCategory}>
                  Add
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                    <button
                      type="button"
                      className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onClick={() => handleRemoveCategory(category)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {category}</span>
                    </button>
                  </Badge>
                ))}
                {categories.length === 0 && <span className="text-sm text-muted-foreground">No categories added</span>}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="active">Active</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push(`/admin/games/${gameId}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaved}>
              {isSaved ? "Saved!" : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
