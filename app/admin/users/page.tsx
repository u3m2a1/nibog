"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Eye, Edit, Trash, AlertTriangle, X, Check, Loader2 } from "lucide-react"
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
import { getAllUsers, toggleUserActiveStatus, toggleUserLockedStatus, deleteUser, User } from "@/services/userService"
import { useToast } from "@/components/ui/use-toast"

// User roles - We'll keep this for now, but it's not used with the current API
// In the future, we might want to add role information to the API response

// User roles
const roles = [
  { id: "1", name: "user" },
  { id: "2", name: "admin" },
]

// User statuses
const statuses = [
  { id: "1", name: "active" },
  { id: "2", name: "inactive" },
  { id: "3", name: "locked" },
]

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [usersList, setUsersList] = useState<User[]>([])
  const [isProcessing, setIsProcessing] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getAllUsers()
        setUsersList(data)
      } catch (error) {
        console.error('Failed to fetch users:', error)
        setError('Failed to load users. Please try again.')
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  // Handle delete user
  const handleDeleteUser = async (userId: number) => {
    setIsProcessing(userId)

    try {
      // Call the API to delete the user
      await deleteUser(userId)

      // Update the local state
      setUsersList(usersList.filter(user => user.user_id !== userId))

      toast({
        title: "Success",
        description: "User deleted successfully.",
      })
    } catch (error) {
      console.error(`Failed to delete user ${userId}:`, error)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Handle toggle active status
  const handleToggleActiveStatus = async (userId: number, isActive: boolean) => {
    setIsProcessing(userId)

    try {
      // Call the API to toggle the user's active status
      await toggleUserActiveStatus(userId, !isActive)

      // Update the local state
      setUsersList(usersList.map(user => {
        if (user.user_id === userId) {
          return {
            ...user,
            is_active: !isActive
          }
        }
        return user
      }))

      toast({
        title: "Success",
        description: `User ${isActive ? 'deactivated' : 'activated'} successfully.`,
      })
    } catch (error) {
      console.error(`Failed to toggle active status for user ${userId}:`, error)
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Handle toggle locked status
  const handleToggleLockedStatus = async (userId: number, isLocked: boolean) => {
    setIsProcessing(userId)

    try {
      // Call the API to toggle the user's locked status
      await toggleUserLockedStatus(userId, !isLocked)

      // Update the local state
      setUsersList(usersList.map(user => {
        if (user.user_id === userId) {
          return {
            ...user,
            is_locked: !isLocked
          }
        }
        return user
      }))

      toast({
        title: "Success",
        description: `User ${isLocked ? 'unlocked' : 'locked'} successfully.`,
      })
    } catch (error) {
      console.error(`Failed to toggle locked status for user ${userId}:`, error)
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Filter users based on search, role, and status
  const filteredUsers = usersList.filter((user) => {
    // Search query filter
    if (
      searchQuery &&
      !user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !user.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !user.phone.includes(searchQuery) &&
      !(user.city_name && user.city_name.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false
    }

    // Role filter - We don't have role information in the API response, so we'll skip this filter for now
    // if (selectedRole !== "all" && user.role !== selectedRole) {
    //   return false
    // }

    // Status filter
    if (selectedStatus === "active" && !user.is_active) {
      return false
    } else if (selectedStatus === "inactive" && user.is_active) {
      return false
    } else if (selectedStatus === "locked" && !user.is_locked) {
      return false
    }

    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage NIBOG users and their accounts</p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New User
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="h-9 w-full md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-9 w-full md:w-[150px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9 w-full md:w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.name}>
                      {status.name.charAt(0).toUpperCase() + status.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading users...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2 text-destructive">
            <AlertTriangle className="h-8 w-8" />
            <p>{error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.city_name || 'N/A'}</TableCell>
                    <TableCell>{user.state || 'N/A'}</TableCell>
                    <TableCell>
                      {user.is_active ? (
                        user.is_locked ? (
                          <Badge className="bg-amber-500 hover:bg-amber-600">Locked</Badge>
                        ) : (
                          <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                        )
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/users/${user.user_id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/users/${user.user_id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        {user.is_active && !user.is_locked ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleLockedStatus(user.user_id, user.is_locked)}
                            disabled={isProcessing === user.user_id}
                            title="Lock User"
                          >
                            <X className="h-4 w-4 text-amber-500" />
                            <span className="sr-only">Lock</span>
                          </Button>
                        ) : user.is_locked ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleLockedStatus(user.user_id, user.is_locked)}
                            disabled={isProcessing === user.user_id}
                            title="Unlock User"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="sr-only">Unlock</span>
                          </Button>
                        ) : null}
                        {user.is_active ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActiveStatus(user.user_id, user.is_active)}
                            disabled={isProcessing === user.user_id}
                            title="Deactivate User"
                          >
                            <X className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Deactivate</span>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActiveStatus(user.user_id, user.is_active)}
                            disabled={isProcessing === user.user_id}
                            title="Activate User"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="sr-only">Activate</span>
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                                  <div className="space-y-2">
                                    <div className="font-medium">This action cannot be undone.</div>
                                    <div>
                                      This will permanently delete the user account for {user.full_name} ({user.email}).
                                      Deleting this user may affect existing booking data.
                                    </div>
                                  </div>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => handleDeleteUser(user.user_id)}
                                disabled={isProcessing === user.user_id}
                              >
                                {isProcessing === user.user_id ? "Deleting..." : "Delete User"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
