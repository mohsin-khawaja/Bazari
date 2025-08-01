"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreVertical, Trash2, Flag, Check, CheckCheck, DollarSign, Package } from "lucide-react"
import { deleteMessage, reportUser } from "@/lib/supabase/message-actions"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import MessageReactions from "./MessageReactions"

interface MessageBubbleProps {
  message: {
    id: string
    content: string
    message_type: "text" | "image" | "offer" | "inquiry"
    image_url?: string
    metadata?: any
    created_at: string
    is_deleted?: boolean
    sender: {
      id: string
      username: string
      avatar_url?: string
    }
  }
  isOwn: boolean
  isRead?: boolean
  showAvatar?: boolean
}

export default function MessageBubble({ message, isOwn, isRead, showAvatar = true }: MessageBubbleProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isReporting, setIsReporting] = useState(false)
  const { user } = useAuth()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMessage(message.id)
      toast({
        title: "Message deleted",
        description: "Your message has been deleted.",
      })
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Error",
        description: "Failed to delete message.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleReport = async () => {
    if (!user) return

    setIsReporting(true)
    try {
      await reportUser({
        reported_user_id: message.sender.id,
        message_id: message.id,
        reason: "inappropriate_content",
        description: "Reported via message bubble",
      })

      toast({
        title: "Report submitted",
        description: "Thank you for reporting. We'll review this message.",
      })
    } catch (error) {
      console.error("Error reporting message:", error)
      toast({
        title: "Error",
        description: "Failed to submit report.",
        variant: "destructive",
      })
    } finally {
      setIsReporting(false)
      setShowReportDialog(false)
    }
  }

  const renderMessageContent = () => {
    if (message.is_deleted) {
      return <div className="text-gray-500 italic text-sm">This message was deleted</div>
    }

    switch (message.message_type) {
      case "image":
        return (
          <div className="space-y-2">
            {message.image_url && (
              <img
                src={message.image_url || "/placeholder.svg"}
                alt="Shared image"
                className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.image_url, "_blank")}
              />
            )}
            {message.content !== "Shared an image" && <p className="text-sm">{message.content}</p>}
          </div>
        )

      case "offer":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Price Offer
              </Badge>
            </div>
            <p className="font-medium text-green-700">{message.content}</p>
            {message.metadata?.offer_amount && (
              <div className="text-2xl font-bold text-green-600">${message.metadata.offer_amount.toFixed(2)}</div>
            )}
          </div>
        )

      case "inquiry":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Item Inquiry
              </Badge>
            </div>
            <p>{message.content}</p>
          </div>
        )

      default:
        return <p className="whitespace-pre-wrap break-words">{message.content}</p>
    }
  }

  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"} group`}>
      {showAvatar && !isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender.avatar_url || "/placeholder.svg"} />
          <AvatarFallback>{message.sender.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
        {showAvatar && !isOwn && <div className="text-xs text-gray-500 mb-1 px-1">{message.sender.username}</div>}

        <Card className={`p-3 relative ${isOwn ? "bg-blue-500 text-white" : "bg-white border-gray-200"}`}>
          {renderMessageContent()}

          <div
            className={`flex items-center justify-between mt-2 text-xs ${isOwn ? "text-blue-100" : "text-gray-500"}`}
          >
            <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>

            {isOwn && (
              <div className="flex items-center gap-1">
                {isRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
              </div>
            )}
          </div>

          {/* Message Actions */}
          <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwn && !message.is_deleted && (
                  <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
                {!isOwn && (
                  <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>

        {/* Message Reactions */}
        <MessageReactions messageId={message.id} />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Confirmation Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to report this message? Our team will review it for inappropriate content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReport} disabled={isReporting}>
              {isReporting ? "Reporting..." : "Report"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
