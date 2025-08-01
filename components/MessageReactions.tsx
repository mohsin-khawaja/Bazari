"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Smile } from "lucide-react"
import { addMessageReaction, removeMessageReaction } from "@/lib/supabase/message-actions"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/hooks/use-toast"

interface Reaction {
  emoji: string
  count: number
  users: string[]
  hasReacted: boolean
}

interface MessageReactionsProps {
  messageId: string
}

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡", "🎉", "🔥"]

export default function MessageReactions({ messageId }: MessageReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    loadReactions()

    // Subscribe to reaction changes
    const channel = supabase
      .channel(`message-reactions:${messageId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
          filter: `message_id=eq.${messageId}`,
        },
        () => {
          loadReactions()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [messageId, supabase])

  const loadReactions = async () => {
    try {
      const { data, error } = await supabase
        .from("message_reactions")
        .select(`
          emoji,
          user_id,
          users(username)
        `)
        .eq("message_id", messageId)

      if (error) throw error

      // Group reactions by emoji
      const reactionMap = new Map<string, { users: string[]; userIds: string[] }>()

      data?.forEach((reaction) => {
        const emoji = reaction.emoji
        if (!reactionMap.has(emoji)) {
          reactionMap.set(emoji, { users: [], userIds: [] })
        }
        const group = reactionMap.get(emoji)!
        group.users.push(reaction.users?.username || "Unknown")
        group.userIds.push(reaction.user_id)
      })

      // Convert to reaction format
      const processedReactions: Reaction[] = Array.from(reactionMap.entries()).map(([emoji, group]) => ({
        emoji,
        count: group.users.length,
        users: group.users,
        hasReacted: user ? group.userIds.includes(user.id) : false,
      }))

      setReactions(processedReactions)
    } catch (error) {
      console.error("Error loading reactions:", error)
    }
  }

  const handleReaction = async (emoji: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to react to messages.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const existingReaction = reactions.find((r) => r.emoji === emoji && r.hasReacted)

      if (existingReaction) {
        // Remove reaction
        await removeMessageReaction(messageId, emoji)
      } else {
        // Add reaction
        await addMessageReaction(messageId, emoji)
      }
    } catch (error) {
      console.error("Error handling reaction:", error)
      toast({
        title: "Error",
        description: "Failed to update reaction.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      {/* Existing Reactions */}
      {reactions.map((reaction) => (
        <Button
          key={reaction.emoji}
          variant={reaction.hasReacted ? "default" : "outline"}
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => handleReaction(reaction.emoji)}
          disabled={isLoading}
          title={`${reaction.users.join(", ")} reacted with ${reaction.emoji}`}
        >
          <span className="mr-1">{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </Button>
      ))}

      {/* Add Reaction Button */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" disabled={isLoading}>
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-4 gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg hover:bg-gray-100"
                onClick={() => handleReaction(emoji)}
                disabled={isLoading}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
