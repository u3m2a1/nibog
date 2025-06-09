"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Plus, Trash, AlertTriangle, Loader2 } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"
import { getAllBabyGames, deleteBabyGame } from "@/services/babyGameService"
import { BabyGame } from "@/types"

export default function GameTemplatesPage() {
  const [games, setGames] = useState<BabyGame[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getAllBabyGames()

        setGames(data)
      } catch (err: any) {
        const errorMsg = err.message || "Failed to fetch games"
        setError(errorMsg)
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchGames()
  }, []) // Removed toast from dependency array to prevent infinite loop

  const handleDeleteGame = async (id: number) => {
    try {
      await deleteBabyGame(id)
      setGames(games.filter(game => game.id !== id))
      toast({
        title: "Game Deleted",
        description: "The game has been deleted successfully.",
        variant: "default",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete game",
        variant: "destructive",
      })
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NIBOG Baby Games</h1>
          <p className="text-muted-foreground">Manage baby games for NIBOG Olympic events</p>
        </div>
        <Button asChild>
          <Link href="/admin/games/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Baby Game
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading games...</span>
        </div>
      ) : error ? (
        <div className="rounded-md bg-destructive/15 p-4 text-center text-destructive">
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : games.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <p className="text-muted-foreground mb-4">No games found</p>
          <Button asChild>
            <Link href="/admin/games/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Game
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Age Range</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => (
                <TableRow key={game.id}>
                  <TableCell className="font-medium">{game.game_name}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={game.description || "No description"}>
                      {game.description || "No description"}
                    </div>
                  </TableCell>
                  <TableCell>{game.min_age} - {game.max_age} months</TableCell>
                  <TableCell>{game.duration_minutes} minutes</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {game.categories && game.categories.map((category) => (
                        <Badge key={category} variant="outline">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {game.is_active ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/games/${game.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/games/${game.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
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
                                    This will permanently delete the "{game.game_name}" game template.
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
                              onClick={() => handleDeleteGame(game.id!)}
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
      )}
    </div>
  )
}
