"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Eye, Edit, Trash, AlertTriangle, X, Check } from "lucide-react"
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
const users = [
  {
    id: "1",
    name: "Harikrishna",
    email: "harikrishna@example.com",
    phone: "+91 9876543210",
    city: "Hyderabad",
    bookings: 3,
    role: "user",
    status: "active",
  },
  {
    id: "2",
    name: "Durga Prasad",
    email: "durgaprasad@example.com",
    phone: "+91 9876543211",
    city: "Bangalore",
    bookings: 2,
    role: "user",
    status: "active",
  },
  {
    id: "3",
    name: "Srujana",
    email: "srujana@example.com",
    phone: "+91 9876543212",
    city: "Vizag",
    bookings: 4,
    role: "user",
    status: "active",
  },
  {
    id: "4",
    name: "Ramesh Kumar",
    email: "ramesh@example.com",
    phone: "+91 9876543213",
    city: "Chennai",
    bookings: 1,
    role: "user",
    status: "active",
  },
  {
    id: "5",
    name: "Suresh Reddy",
    email: "suresh@example.com",
    phone: "+91 9876543214",
    city: "Mumbai",
    bookings: 2,
    role: "user",
    status: "active",
  },
  {
    id: "6",
    name: "Admin User",
    email: "admin@nibog.in",
    phone: "+91 9876543215",
    city: "Hyderabad",
    bookings: 0,
    role: "admin",
    status: "active",
  },
]

// User roles
const roles = [
  { id: "1", name: "user" },
  { id: "2", name: "admin" },
]

// User statuses
const statuses = [
  { id: "1", name: "active" },
  { id: "2", name: "inactive" },
  { id: "3", name: "blocked" },
]

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [usersList, setUsersList] = useState(users)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  // Handle delete user
  const handleDeleteUser = (id: string) => {
    setIsProcessing(id)

    // Simulate API call to delete the user
    setTimeout(() => {
      // In a real app, this would be an API call to delete the user
      setUsersList(usersList.filter(user => user.id !== id))
      setIsProcessing(null)
    }, 1000)
  }

  // Handle block/unblock user
  const handleToggleUserStatus = (id: string, currentStatus: string) => {
    setIsProcessing(id)

    // Simulate API call to update the user status
    setTimeout(() => {
      // In a real app, this would be an API call to update the user status
      setUsersList(usersList.map(user => {
        if (user.id === id) {
          return {
            ...user,
            status: currentStatus === "active" ? "blocked" : "active"
          }
        }
        return user
      }))
      setIsProcessing(null)
    }, 1000)
  }

  // Filter users based on search, role, and status
  const filteredUsers = usersList.filter((user) => {
    // Search query filter
    if (
      searchQuery &&
      !user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !user.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !user.phone.includes(searchQuery) &&
      !user.city.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Role filter
    if (selectedRole !== "all" && user.role !== selectedRole) {
      return false
    }

    // Status filter
    if (selectedStatus !== "all" && user.status !== selectedStatus) {
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.city}</TableCell>
                  <TableCell>{user.bookings}</TableCell>
                  <TableCell>
                    {user.role === "admin" ? (
                      <Badge className="bg-purple-500 hover:bg-purple-600">Admin</Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.status === "active" ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                    ) : user.status === "inactive" ? (
                      <Badge variant="outline">Inactive</Badge>
                    ) : (
                      <Badge className="bg-red-500 hover:bg-red-600">Blocked</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/users/${user.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/users/${user.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      {user.status === "active" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleUserStatus(user.id, user.status)}
                          disabled={isProcessing === user.id}
                          title="Block User"
                        >
                          <X className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Block</span>
                        </Button>
                      ) : user.status === "blocked" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleUserStatus(user.id, user.status)}
                          disabled={isProcessing === user.id}
                          title="Unblock User"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="sr-only">Unblock</span>
                        </Button>
                      ) : null}
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
                                    This will permanently delete the user account for {user.name} ({user.email}).
                                    {user.bookings > 0 ? (
                                      <>
                                        <br />
                                        This user has {user.bookings} booking{user.bookings !== 1 ? "s" : ""}.
                                        Deleting this user may affect existing booking data.
                                      </>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={isProcessing === user.id}
                            >
                              {isProcessing === user.id ? "Deleting..." : "Delete User"}
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
    </div>
  )
}
