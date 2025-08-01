"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Users, Search, MoreVertical, Shield, Ban, CheckCircle, AlertTriangle, Mail, Calendar } from "lucide-react"
import { getUsers, updateUserStatus, verifyUser } from "@/lib/supabase/admin"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/hooks/use-toast"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [verifiedFilter, setVerifiedFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [actionType, setActionType] = useState<string>("")
  const [actionReason, setActionReason] = useState("")
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [searchTerm, statusFilter, verifiedFilter])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const filters: any = {}

      if (statusFilter !== "all") {
        filters.status = statusFilter
      }

      if (verifiedFilter !== "all") {
        filters.verified = verifiedFilter === "verified"
      }

      if (searchTerm) {
        filters.search = searchTerm
      }

      const data = await getUsers(1, 50, filters)
      setUsers(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserAction = async () => {
    if (!selectedUser || !actionType) return

    try {
      setIsActionLoading(true)

      if (actionType === "verify_seller" || actionType === "verify_identity") {
        const verificationType = actionType.replace("verify_", "")
        await verifyUser(selectedUser.id, verificationType)
        toast({
          title: "User Verified",
          description: `User has been verified as ${verificationType}`,
        })
      } else {
        await updateUserStatus(selectedUser.id, actionType, actionReason)
        toast({
          title: "User Updated",
          description: `User status updated to ${actionType}`,
        })
      }

      setSelectedUser(null)
      setActionType("")
      setActionReason("")
      loadUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{users.length} users</Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                  <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{user.first_name?.charAt(0) || user.username.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">
                          {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                        </h3>
                        {user.seller_verified && (
                          <Badge variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified Seller
                          </Badge>
                        )}
                        {user.identity_verified && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            ID Verified
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                        </span>
                        <span>{user._count?.items || 0} items</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusBadge(user.status)}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!user.seller_verified && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setActionType("verify_seller")
                            }}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Verify as Seller
                          </DropdownMenuItem>
                        )}

                        {!user.identity_verified && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setActionType("verify_identity")
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify Identity
                          </DropdownMenuItem>
                        )}

                        {user.status === "active" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setActionType("suspended")
                            }}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        )}

                        {user.status === "suspended" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setActionType("active")
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Reactivate User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType.includes("verify") ? "Verify User" : "Update User Status"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={selectedUser?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {selectedUser?.first_name?.charAt(0) || selectedUser?.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">
                  {selectedUser?.first_name && selectedUser?.last_name
                    ? `${selectedUser.first_name} ${selectedUser.last_name}`
                    : selectedUser?.username}
                </h3>
                <p className="text-sm text-gray-600">{selectedUser?.email}</p>
              </div>
            </div>

            {!actionType.includes("verify") && (
              <div>
                <label className="block text-sm font-medium mb-2">Reason for status change</label>
                <Textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Provide a reason for this action..."
                  rows={3}
                />
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  {actionType.includes("verify")
                    ? "This will verify the user and grant them additional privileges."
                    : "This action will change the user's account status."}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUserAction}
              disabled={isActionLoading || (!actionType.includes("verify") && !actionReason.trim())}
            >
              {isActionLoading ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
