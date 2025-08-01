"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Package, ShoppingCart, Flag, Shield, AlertTriangle, Clock, CheckCircle } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { getDashboardStats, getCulturalAnalytics, getAdminActions } from "@/lib/supabase/admin"
import { formatDistanceToNow } from "date-fns"

// Mock data for charts
const userGrowthData = [
  { month: "Jan", users: 1200, sellers: 340 },
  { month: "Feb", users: 1450, sellers: 420 },
  { month: "Mar", users: 1680, sellers: 510 },
  { month: "Apr", users: 1920, sellers: 630 },
  { month: "May", users: 2150, sellers: 750 },
  { month: "Jun", users: 2400, sellers: 890 },
]

const orderStatusData = [
  { name: "Completed", value: 65, color: "#10b981" },
  { name: "Processing", value: 20, color: "#f59e0b" },
  { name: "Shipped", value: 10, color: "#3b82f6" },
  { name: "Cancelled", value: 5, color: "#ef4444" },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [culturalData, setCulturalData] = useState<any[]>([])
  const [recentActions, setRecentActions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [dashboardStats, cultural, actions] = await Promise.all([
          getDashboardStats(),
          getCulturalAnalytics(),
          getAdminActions(10),
        ])

        setStats(dashboardStats)
        setCulturalData(cultural)
        setRecentActions(actions)
      } catch (error) {
        console.error("Error loading admin data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "user_verification":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "user_status_update":
        return <Users className="h-4 w-4 text-blue-600" />
      case "moderation_review":
        return <Shield className="h-4 w-4 text-purple-600" />
      case "cultural_flag_review":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "report_review":
        return <Flag className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionDescription = (action: any) => {
    switch (action.action_type) {
      case "user_verification":
        return `Verified user as ${action.details?.verification_type}`
      case "user_status_update":
        return `Updated user status to ${action.details?.status}`
      case "moderation_review":
        return `${action.details?.status} moderation item`
      case "cultural_flag_review":
        return `${action.details?.status} cultural sensitivity flag`
      case "report_review":
        return `${action.details?.status} community report`
      default:
        return action.action_type.replace("_", " ")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            System Healthy
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats?.active_users}</span> active this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_items?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats?.total_items} total items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_orders?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.pending_reports || 0) + (stats?.pending_cultural_flags || 0) + (stats?.moderation_queue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="sellers" stroke="#ec4899" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cultural Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Cultural Origins Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={culturalData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cultural_origin" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_items" fill="#8b5cf6" />
              <Bar dataKey="total_sales" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActions.map((action) => (
              <div key={action.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {getActionIcon(action.action_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {action.admin.first_name || action.admin.username}
                  </p>
                  <p className="text-sm text-gray-600">{getActionDescription(action)}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{stats?.pending_verifications || 0}</div>
            <p className="text-sm text-gray-600 mb-4">Users waiting for verification</p>
            <Button size="sm" className="w-full">
              Review Verifications
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Moderation Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{stats?.moderation_queue || 0}</div>
            <p className="text-sm text-gray-600 mb-4">Items requiring moderation</p>
            <Button size="sm" className="w-full">
              Review Content
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cultural Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{stats?.pending_cultural_flags || 0}</div>
            <p className="text-sm text-gray-600 mb-4">Cultural sensitivity reviews</p>
            <Button size="sm" className="w-full">
              Review Flags
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
