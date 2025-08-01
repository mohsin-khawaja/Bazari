"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Search, Heart, MessageCircle, User, Plus, Bell, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

interface MobileNavigationProps {
  className?: string
}

export function MobileNavigation({ className }: MobileNavigationProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [notifications, setNotifications] = useState(0)

  // Mock data - replace with real data fetching
  useEffect(() => {
    if (user) {
      setUnreadMessages(3)
      setNotifications(5)
    }
  }, [user])

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/search",
      icon: Search,
      label: "Search",
      active: pathname.startsWith("/search"),
    },
    {
      href: "/sell",
      icon: Plus,
      label: "Sell",
      active: pathname.startsWith("/sell"),
      highlight: true,
    },
    {
      href: "/favorites",
      icon: Heart,
      label: "Favorites",
      active: pathname.startsWith("/favorites"),
    },
    {
      href: user ? "/profile" : "/auth/login",
      icon: User,
      label: "Profile",
      active: pathname.startsWith("/profile") || pathname.startsWith("/auth"),
    },
  ]

  const secondaryItems = [
    {
      href: "/messages",
      icon: MessageCircle,
      label: "Messages",
      badge: unreadMessages,
      active: pathname.startsWith("/messages"),
    },
    {
      href: "/notifications",
      icon: Bell,
      label: "Notifications",
      badge: notifications,
      active: pathname.startsWith("/notifications"),
    },
    {
      href: "/orders",
      icon: ShoppingBag,
      label: "Orders",
      active: pathname.startsWith("/orders"),
    },
  ]

  return (
    <>
      {/* Bottom Navigation */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t md:hidden",
          className,
        )}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1",
                  item.active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  item.highlight &&
                    "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600",
                )}
              >
                <Icon className={cn("h-5 w-5 mb-1", item.highlight && "text-white")} />
                <span className={cn("text-xs font-medium truncate", item.highlight && "text-white")}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
      {/* Top Secondary Navigation */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Bazari
            </span>
          </Link>

          <div className="flex items-center space-x-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="icon"
                  className={cn("relative h-9 w-9", item.active && "text-primary bg-primary/10")}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="h-5 w-5" />
                    {item.badge && item.badge > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                      >
                        {item.badge > 99 ? "99+" : item.badge}
                      </Badge>
                    )}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
      {/* Spacers for fixed navigation */}
      <div className="h-16 md:hidden" /> {/* Top spacer */}
      <div className="h-20 md:hidden" /> {/* Bottom spacer */}
    </>
  )
}
