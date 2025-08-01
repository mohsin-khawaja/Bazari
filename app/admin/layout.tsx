"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Flag, Shield, BarChart3, Home, AlertTriangle, Megaphone } from "lucide-react"
import { checkAdminAccess, getDashboardStats } from "@/lib/supabase/admin"
import { toast } from "@/hooks/use-toast"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    async function checkAccess() {
      try {
        const admin = await checkAdminAccess()
        setAdminUser(admin)

        const dashboardStats = await getDashboardStats()
        setStats(dashboardStats)
      } catch (error) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        })
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!adminUser) {
    return null
  }

  const navigationItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: Home,
      badge: null,
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Users,
      badge: stats?.pending_verifications > 0 ? stats.pending_verifications : null,
    },
    {
      href: "/admin/moderation",
      label: "Moderation",
      icon: Shield,
      badge: stats?.moderation_queue > 0 ? stats.moderation_queue : null,
    },
    {
      href: "/admin/reports",
      label: "Reports",
      icon: Flag,
      badge: stats?.pending_reports > 0 ? stats.pending_reports : null,
    },
    {
      href: "/admin/cultural-flags",
      label: "Cultural Flags",
      icon: AlertTriangle,
      badge: stats?.pending_cultural_flags > 0 ? stats.pending_cultural_flags : null,
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      href: "/admin/announcements",
      label: "Announcements",
      icon: Megaphone,
      badge: null,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="font-bold text-xl">Bazari Admin</span>
              </Link>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {adminUser.role.name.replace("_", " ").toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Site
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="destructive" className="h-5 min-w-[20px] flex items-center justify-center text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          <Separator className="my-4" />

          {/* Quick Stats */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Users</span>
                <span className="font-medium">{stats?.total_users?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active Items</span>
                <span className="font-medium">{stats?.active_items?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-medium">{stats?.total_orders?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
