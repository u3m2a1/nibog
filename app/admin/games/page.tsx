"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Plus, Trash, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Mock data - in a real app, this would come from an API
const gameTemplates = [
  {
    id: "1",
    name: "Baby Crawling",
    description: "Let your little crawler compete in a fun and safe environment.",
    ageRange: "5-13 months",
    duration: 60,
    categories: ["olympics", "physical", "competition"],
    isActive: true,
  },
  {
    id: "2",
    name: "Baby Walker",
    description: "Fun-filled baby walker race in a safe environment.",
    ageRange: "5-13 months",
    duration: 60,
    categories: ["olympics", "physical", "competition"],
    isActive: true,
  },
  {
    id: "3",
    name: "Running Race",
    description: "Exciting running race for toddlers in a fun and safe environment.",
    ageRange: "13-84 months",
    duration: 60,
    categories: ["olympics", "physical", "competition"],
    isActive: true,
  },
  {
    id: "4",
    name: "Hurdle Toddle",
    description: "Fun hurdle race for toddlers to develop coordination and balance.",
    ageRange: "13-84 months",
    duration: 60,
    categories: ["olympics", "physical", "competition"],
    isActive: true,
  },
  {
    id: "5",
    name: "Cycle Race",
    description: "Exciting cycle race for children to showcase their skills.",
    ageRange: "13-84 months",
    duration: 60,
    categories: ["olympics", "physical", "competition"],
    isActive: true,
  },
  {
    id: "6",
    name: "Ring Holding",
    description: "Fun ring holding game to develop hand-eye coordination.",
    ageRange: "13-84 months",
    duration: 60,
    categories: ["olympics", "physical", "coordination"],
    isActive: true,
  },
]

export default function GameTemplatesPage() {
  const [gameTemplatesList, setGameTemplatesList] = useState(gameTemplates)

  const handleDeleteGame = (id: string) => {
    // In a real app, this would be an API call to delete the game
    setGameTemplatesList(gameTemplatesList.filter(game => game.id !== id))
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NIBOG Baby Games</h1>
          <p className="text-muted-foreground">Manage baby games for NIBOG Olympic events</p>
        </div>
        <Button asChild>
          <a href="/admin/games/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Baby Game
          </a>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age Range</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gameTemplatesList.map((game) => (
              <TableRow key={game.id}>
                <TableCell className="font-medium">{game.name}</TableCell>
                <TableCell>{game.ageRange} months</TableCell>
                <TableCell>{game.duration} minutes</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {game.categories.map((category) => (
                      <Badge key={category} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {game.isActive ? (
                    <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <a href={`/admin/games/${game.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={`/admin/games/${game.id}/edit`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </a>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Game Template</AlertDialogTitle>
                          <AlertDialogDescription>
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                              <div className="space-y-2">
                                <div className="font-medium">This action cannot be undone.</div>
                                <div>
                                  This will permanently delete the "{game.name}" game template.
                                  Deleting it will not affect existing events, but you won't be able to create new events with this template.
                                </div>
                              </div>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleDeleteGame(game.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
