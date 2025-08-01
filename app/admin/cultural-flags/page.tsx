"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, AlertTriangle, CheckCircle, X, ArrowUp, User, Package } from "lucide-react"
import { getCulturalFlags, reviewCulturalFlag } from "@/lib/supabase/admin"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/hooks/use-toast"

export default function CulturalFlagsPage() {
  const [flags, setFlags] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("pending")
  const [selectedFlag, setSelectedFlag] = useState<any>(null)
  const [reviewAction, setReviewAction] = useState<string>("")
  const [reviewNotes, setReviewNotes] = useState("")
  const [isReviewLoading, setIsReviewLoading] = useState(false)

  useEffect(() => {
    loadFlags()
  }, [statusFilter])

  const loadFlags = async () => {
    try {
      setIsLoading(true)
      const data = await getCulturalFlags(statusFilter === "all" ? undefined : statusFilter)
      setFlags(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cultural flags",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReview = async () => {
    if (!selectedFlag || !reviewAction) return

    try {
      setIsReviewLoading(true)
      await reviewCulturalFlag(selectedFlag.id, reviewAction as any, reviewNotes)

      toast({
        title: "Flag Reviewed",
        description: `Cultural sensitivity flag has been ${reviewAction}`,
      })

      setSelectedFlag(null)
      setReviewAction("")
      setReviewNotes("")
      loadFlags()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to review flag",
        variant: "destructive",
      })
    } finally {
      setIsReviewLoading(false)
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      case "dismissed":
        return <Badge className="bg-gray-100 text-gray-800">Dismissed</Badge>
      case "escalated":
        return <Badge className="bg-red-100 text-red-800">Escalated</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getFlagTypeLabel = (flagType: string) => {
    switch (flagType) {
      case "appropriation_concern":
        return "Cultural Appropriation"
      case "misrepresentation":
        return "Cultural Misrepresentation"
      case "offensive_content":
        return "Offensive Content"
      default:
        return flagType.replace("_", " ")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Cultural Sensitivity Flags</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{flags.length} flags</Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Flags List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Cultural Sensitivity Flags
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : flags.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No flags found</h3>
              <p className="text-gray-600">No cultural sensitivity flags match your current filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {flags.map((flag) => (
                <div key={flag.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getSeverityBadge(flag.severity)}
                      {getStatusBadge(flag.status)}
                      <Badge variant="outline" className="text-xs">
                        {getFlagTypeLabel(flag.flag_type)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(flag.created_at), { addSuffix: true })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Flagged Content */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        {flag.item ? <Package className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        Flagged Content
                      </h4>
                      {flag.item && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium">{flag.item.title}</p>
                          <p className="text-sm text-gray-600">Cultural Origin: {flag.item.cultural_origin?.name}</p>
                          <p className="text-sm text-gray-600">Price: ${flag.item.price}</p>
                        </div>
                      )}
                      {flag.user && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={flag.user.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback>
                                {flag.user.first_name?.charAt(0) || flag.user.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{flag.user.username}</p>
                              <p className="text-sm text-gray-600">{flag.user.first_name}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Flag Details */}
                    <div>
                      <h4 className="font-medium mb-2">Flag Details</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm mb-2">{flag.description}</p>
                        {flag.reviewed_by_user && (
                          <div className="text-xs text-gray-500 border-t pt-2">
                            Reviewed by {flag.reviewed_by_user.first_name || flag.reviewed_by_user.username}
                            {flag.reviewed_at && (
                              <span> • {formatDistanceToNow(new Date(flag.reviewed_at), { addSuffix: true })}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {flag.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedFlag(flag)
                          setReviewAction("resolved")
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedFlag(flag)
                          setReviewAction("dismissed")
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedFlag(flag)
                          setReviewAction("escalated")
                        }}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <ArrowUp className="h-4 w-4 mr-1" />
                        Escalate
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedFlag} onOpenChange={() => setSelectedFlag(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Review Cultural Sensitivity Flag
            </DialogTitle>
          </DialogHeader>

          {selectedFlag && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getSeverityBadge(selectedFlag.severity)}
                  <Badge variant="outline">{getFlagTypeLabel(selectedFlag.flag_type)}</Badge>
                </div>
                <p className="text-sm">{selectedFlag.description}</p>
              </div>

              {selectedFlag.item && (
                <div>
                  <h4 className="font-medium mb-2">Flagged Item</h4>
                  <div className="border p-3 rounded-lg">
                    <p className="font-medium">{selectedFlag.item.title}</p>
                    <p className="text-sm text-gray-600">Cultural Origin: {selectedFlag.item.cultural_origin?.name}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Review Action</label>
                <Select value={reviewAction} onValueChange={setReviewAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resolved">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Resolve - Flag is valid and addressed
                      </div>
                    </SelectItem>
                    <SelectItem value="dismissed">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-gray-600" />
                        Dismiss - Flag is not valid
                      </div>
                    </SelectItem>
                    <SelectItem value="escalated">
                      <div className="flex items-center gap-2">
                        <ArrowUp className="h-4 w-4 text-red-600" />
                        Escalate - Requires senior review
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Review Notes</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Provide details about your decision..."
                  rows={4}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Cultural Sensitivity Review</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  This review will be logged and may affect content visibility and user standing.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedFlag(null)}>
              Cancel
            </Button>
            <Button onClick={handleReview} disabled={isReviewLoading || !reviewAction}>
              {isReviewLoading ? "Processing..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
