"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Send, ImageIcon, DollarSign, Package } from "lucide-react"
import { sendMessage } from "@/lib/supabase/message-actions"
import { uploadFile } from "@/lib/supabase/storage"
import { realtimeMessaging } from "@/lib/supabase/realtime-messages"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/hooks/use-toast"

interface MessageInputProps {
  conversationId: string
  onMessageSent?: () => void
  itemId?: string
}

export default function MessageInput({ conversationId, onMessageSent, itemId }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messageType, setMessageType] = useState<"text" | "offer" | "inquiry">("text")
  const [offerAmount, setOfferAmount] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const handleTyping = useCallback(() => {
    if (!user) return

    // Send typing indicator
    realtimeMessaging.sendTypingIndicator(conversationId, {
      id: user.id,
      username: user.user_metadata?.username || user.email || "Anonymous",
    })

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      realtimeMessaging.stopTypingIndicator(conversationId, user.id)
    }, 3000)
  }, [conversationId, user])

  const handleSendMessage = async () => {
    if (!message.trim() && messageType !== "offer") return
    if (messageType === "offer" && !offerAmount.trim()) return

    setIsLoading(true)
    try {
      let content = message.trim()
      let metadata: any = {}

      if (messageType === "offer") {
        content = `Price offer: $${offerAmount}`
        metadata = { offer_amount: Number.parseFloat(offerAmount) }
      } else if (messageType === "inquiry" && itemId) {
        metadata = { item_id: itemId }
      }

      await sendMessage({
        conversation_id: conversationId,
        content,
        message_type: messageType,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      })

      setMessage("")
      setOfferAmount("")
      setMessageType("text")

      // Stop typing indicator
      if (user) {
        realtimeMessaging.stopTypingIndicator(conversationId, user.id)
      }

      onMessageSent?.()

      toast({
        title: "Message sent",
        description: "Your message has been delivered.",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const imageUrl = await uploadFile(file, "message-images")

      await sendMessage({
        conversation_id: conversationId,
        content: "Shared an image",
        message_type: "image",
        image_url: imageUrl,
      })

      onMessageSent?.()

      toast({
        title: "Image sent",
        description: "Your image has been shared.",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    } else {
      handleTyping()
    }
  }

  return (
    <Card className="p-4 border-t">
      {messageType === "offer" && (
        <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Make an Offer</span>
          </div>
          <Input
            type="number"
            placeholder="Enter offer amount"
            value={offerAmount}
            onChange={(e) => setOfferAmount(e.target.value)}
            className="bg-white"
          />
        </div>
      )}

      {messageType === "inquiry" && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Item Inquiry</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          {messageType === "text" ? (
            <Textarea
              placeholder="Type your message..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                handleTyping()
              }}
              onKeyPress={handleKeyPress}
              className="min-h-[40px] max-h-[120px] resize-none"
              disabled={isLoading}
            />
          ) : (
            <Input
              placeholder={messageType === "offer" ? "Add a note (optional)" : "Ask about this item..."}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                handleTyping()
              }}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            variant={messageType === "text" ? "default" : "outline"}
            onClick={() => setMessageType("text")}
            disabled={isLoading}
          >
            Text
          </Button>

          <Button
            size="sm"
            variant={messageType === "offer" ? "default" : "outline"}
            onClick={() => setMessageType("offer")}
            disabled={isLoading}
          >
            <DollarSign className="h-3 w-3" />
          </Button>

          {itemId && (
            <Button
              size="sm"
              variant={messageType === "inquiry" ? "default" : "outline"}
              onClick={() => setMessageType("inquiry")}
              disabled={isLoading}
            >
              <Package className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
            <ImageIcon className="h-3 w-3" />
          </Button>

          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={
              isLoading ||
              (!message.trim() && messageType !== "offer") ||
              (messageType === "offer" && !offerAmount.trim())
            }
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
