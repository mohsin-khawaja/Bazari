"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TypingUser {
  user_id: string
  username: string
  avatar_url?: string
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[]
}

export default function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  const [dots, setDots] = useState(".")

  useEffect(() => {
    if (typingUsers.length === 0) return

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "."
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [typingUsers.length])

  if (typingUsers.length === 0) return null

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].username} is typing${dots}`
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].username} and ${typingUsers[1].username} are typing${dots}`
    } else {
      return `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing${dots}`
    }
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
      <div className="flex -space-x-2">
        {typingUsers.slice(0, 3).map((user) => (
          <Avatar key={user.user_id} className="h-6 w-6 border-2 border-white">
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="text-xs">{user.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        ))}
      </div>

      <span className="italic">{getTypingText()}</span>

      {/* Animated dots */}
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  )
}
