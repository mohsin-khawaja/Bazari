"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MessageCircle, MoreVertical, BlocksIcon as Block, Flag, ArrowLeft, Users } from "lucide-react"
import { useRealtimeConversations } from "@/hooks/useRealtimeConversations"
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages"
import { useAuth } from "@/hooks/useAuth"
import { blockUser, reportUser } from "@/lib/supabase/message-actions"
import { toast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import MessageBubble from "@/components/MessageBubble"
import MessageInput from "@/components/MessageInput"
import TypingIndicator from "@/components/TypingIndicator"

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileConversation, setShowMobileConversation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const {
    conversations,
    isLoading: conversationsLoading,
    totalUnreadCount,
    markConversationAsRead,
  } = useRealtimeConversations()

  const {
    messages,
    typingUsers,
    onlineUsers,
    isLoading: messagesLoading,
    loadMoreMessages,
  } = useRealtimeMessages(selectedConversationId || "")

  // Auto-select conversation from URL params
  useEffect(() => {
    const conversationId = searchParams.get("conversation")
    if (conversationId && conversations.length > 0) {
      setSelectedConversationId(conversationId)
      setShowMobileConversation(true)
    }
  }, [searchParams, conversations])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversationId) {
      markConversationAsRead(selectedConversationId)
    }
  }, [selectedConversationId, markConversationAsRead])

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.other_user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.item?.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId)

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    setShowMobileConversation(true)
  }

  const handleBackToList = () => {
    setShowMobileConversation(false)
    setSelectedConversationId(null)
  }

  const handleBlockUser = async (userId: string) => {
    try {
      await blockUser({ blocked_user_id: userId, reason: "Blocked from messages" })
      toast({
        title: "User blocked",
        description: "You won't receive messages from this user anymore.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to block user.",
        variant: "destructive",
      })
    }
  }

  const handleReportUser = async (userId: string) => {
    try {
      await reportUser({
        reported_user_id: userId,
        reason: "inappropriate_behavior",
        description: "Reported from messages",
      })
      toast({
        title: "Report submitted",
        description: "Thank you for reporting. We'll review this user.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report.",
        variant: "destructive",
      })
    }
  }

  const isUserOnline = (userId: string) => {
    return onlineUsers.some((u) => u.user_id === userId)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Please log in to view messages</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        {/* Conversations List */}
        <div className={`lg:col-span-1 ${showMobileConversation ? "hidden lg:block" : "block"}`}>
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Messages
                  {totalUnreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {totalUnreadCount}
                    </Badge>
                  )}
                </CardTitle>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                {conversationsLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading conversations...</div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchQuery ? "No conversations found" : "No conversations yet"}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation, index) => (
                      <div key={conversation.id}>
                        <div
                          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedConversationId === conversation.id ? "bg-blue-50 border-r-2 border-blue-500" : ""
                          }`}
                          onClick={() => handleSelectConversation(conversation.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={conversation.other_user.avatar_url || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {conversation.other_user.username?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              {isUserOnline(conversation.other_user.id) && (
                                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-medium text-sm truncate">{conversation.other_user.username}</h3>
                                <div className="flex items-center gap-1">
                                  {conversation.unread_count > 0 && (
                                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                                      {conversation.unread_count}
                                    </Badge>
                                  )}
                                  {conversation.last_message_at && (
                                    <span className="text-xs text-gray-500">
                                      {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {conversation.item && (
                                <div className="flex items-center gap-2 mb-1">
                                  <img
                                    src={conversation.item.images[0] || "/placeholder.svg"}
                                    alt={conversation.item.title}
                                    className="h-6 w-6 rounded object-cover"
                                  />
                                  <span className="text-xs text-gray-600 truncate">{conversation.item.title}</span>
                                </div>
                              )}

                              {conversation.last_message && (
                                <p className="text-sm text-gray-600 truncate">
                                  {conversation.last_message.sender_id === user.id ? "You: " : ""}
                                  {conversation.last_message.message_type === "image"
                                    ? "📷 Image"
                                    : conversation.last_message.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        {index < filteredConversations.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Messages Area */}
        <div className={`lg:col-span-2 ${showMobileConversation ? "block" : "hidden lg:block"}`}>
          {selectedConversation ? (
            <Card className="h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="lg:hidden" onClick={handleBackToList}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>

                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedConversation.other_user.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {selectedConversation.other_user.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {isUserOnline(selectedConversation.other_user.id) && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    <div>
                      <h3 className="font-medium">{selectedConversation.other_user.username}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {isUserOnline(selectedConversation.other_user.id) ? (
                          <span className="text-green-600">Online</span>
                        ) : (
                          <span>Offline</span>
                        )}
                        {onlineUsers.length > 1 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{onlineUsers.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleBlockUser(selectedConversation.other_user.id)}>
                        <Block className="h-4 w-4 mr-2" />
                        Block User
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReportUser(selectedConversation.other_user.id)}>
                        <Flag className="h-4 w-4 mr-2" />
                        Report User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Item Context */}
                {selectedConversation.item && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mt-3">
                    <img
                      src={selectedConversation.item.images[0] || "/placeholder.svg"}
                      alt={selectedConversation.item.title}
                      className="h-12 w-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{selectedConversation.item.title}</h4>
                      <p className="text-sm text-gray-600">${selectedConversation.item.price}</p>
                    </div>
                  </div>
                )}
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="text-center text-gray-500">Loading messages...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((message, index) => {
                          const isOwn = message.sender.id === user.id
                          const showAvatar = index === 0 || messages[index - 1].sender.id !== message.sender.id

                          return (
                            <MessageBubble key={message.id} message={message} isOwn={isOwn} showAvatar={showAvatar} />
                          )
                        })}

                        <TypingIndicator typingUsers={typingUsers} />
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <MessageInput
                conversationId={selectedConversation.id}
                itemId={selectedConversation.item?.id}
                onMessageSent={() => {
                  // Messages will be updated via real-time subscription
                }}
              />
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
