"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MoreHorizontal,
  Search,
  Eye,
  Heart,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Pause,
  Edit,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { getInventoryItems, updateItemStatus } from "@/lib/supabase/seller-analytics"
import { createClient } from "@/lib/supabase/client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface InventoryItem {
  id: string
  title: string
  price: number
  status: string
  image_url: string
  created_at: string
  categories: { name: string } | null
  cultural_origins: { name: string } | null
  item_analytics: Array<{
    views: number
    likes: number
    saves: number
    orders: number
    revenue: number
  }>
}

export default function InventoryPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [culturalOrigins, setCulturalOrigins] = useState<any[]>([])
  const [filters, setFilters] = useState({
    search: "",
    status: "all", // Updated default value to "all"
    category: "",
    culturalOrigin: "",
    sortBy: "created_at",
  })
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [itemsData, categoriesData, originsData] = await Promise.all([
          getInventoryItems(user.id, filters),
          supabase.from("categories").select("*").order("name"),
          supabase.from("cultural_origins").select("*").order("name"),
        ])

        setItems(itemsData || [])
        setCategories([{ id: "", name: "All Categories" }, ...(categoriesData.data || [])])
        setCulturalOrigins([{ id: "", name: "All Origins" }, ...(originsData.data || [])])
      } catch (error) {
        console.error("Error fetching inventory:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, filters])

  const handleStatusUpdate = async (itemId: string, newStatus: string) => {
    try {
      await updateItemStatus(itemId, newStatus)
      setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item)))
    } catch (error) {
      console.error("Error updating item status:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "sold":
        return <ShoppingBag className="h-4 w-4 text-blue-500" />
      case "draft":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "paused":
        return <Pause className="h-4 w-4 text-gray-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "sold":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "paused":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    }
  }

  const calculateItemMetrics = (item: InventoryItem) => {
    const analytics = item.item_analytics || []
    return {
      totalViews: analytics.reduce((sum, a) => sum + a.views, 0),
      totalLikes: analytics.reduce((sum, a) => sum + a.likes, 0),
      totalSaves: analytics.reduce((sum, a) => sum + a.saves, 0),
      totalOrders: analytics.reduce((sum, a) => sum + a.orders, 0),
      totalRevenue: analytics.reduce((sum, a) => sum + a.revenue, 0),
    }
  }

  const sortedItems = [...items].sort((a, b) => {
    const aMetrics = calculateItemMetrics(a)
    const bMetrics = calculateItemMetrics(b)

    switch (filters.sortBy) {
      case "views":
        return bMetrics.totalViews - aMetrics.totalViews
      case "revenue":
        return bMetrics.totalRevenue - aMetrics.totalRevenue
      case "orders":
        return bMetrics.totalOrders - aMetrics.totalOrders
      case "price":
        return b.price - a.price
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access your inventory</h1>
          <Button asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
            <p className="text-muted-foreground">Manage your items and track their performance</p>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Button variant="outline" asChild>
              <Link href="/seller/dashboard">Back to Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/sell">Add New Item</Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>

              <Select
                value={filters.status}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem> {/* Updated value prop */}
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.category}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.culturalOrigin}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, culturalOrigin: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Origins" />
                </SelectTrigger>
                <SelectContent>
                  {culturalOrigins.map((origin) => (
                    <SelectItem key={origin.id} value={origin.id}>
                      {origin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.sortBy}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Newest First</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                  <SelectItem value="revenue">Highest Revenue</SelectItem>
                  <SelectItem value="orders">Most Orders</SelectItem>
                  <SelectItem value="price">Highest Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Items</p>
                  <p className="text-2xl font-bold">{items.filter((item) => item.status === "active").length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sold Items</p>
                  <p className="text-2xl font-bold">{items.filter((item) => item.status === "sold").length}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Draft Items</p>
                  <p className="text-2xl font-bold">{items.filter((item) => item.status === "draft").length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Items ({sortedItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                    <div className="w-16 h-16 bg-muted rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                    <div className="w-20 h-8 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : sortedItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground mb-4">
                  {filters.search || filters.status !== "all" || filters.category || filters.culturalOrigin
                    ? "Try adjusting your filters to see more items."
                    : "Start by adding your first item to sell."}
                </p>
                <Button asChild>
                  <Link href="/sell">Add Your First Item</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedItems.map((item) => {
                  const metrics = calculateItemMetrics(item)
                  return (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="relative">
                        <Image
                          src={item.image_url || "/placeholder.svg?height=64&width=64"}
                          alt={item.title}
                          width={64}
                          height={64}
                          className="rounded-lg object-cover"
                        />
                        <div className="absolute -top-2 -right-2">{getStatusIcon(item.status)}</div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium truncate">{item.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStatusColor(item.status)}>
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                              </Badge>
                              {item.categories && <Badge variant="outline">{item.categories.name}</Badge>}
                              {item.cultural_origins && <Badge variant="secondary">{item.cultural_origins.name}</Badge>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">${item.price}</div>
                            {metrics.totalRevenue > 0 && (
                              <div className="text-sm text-muted-foreground">
                                ${metrics.totalRevenue.toFixed(2)} earned
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{metrics.totalViews}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>{metrics.totalLikes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ShoppingBag className="h-4 w-4" />
                            <span>{metrics.totalOrders}</span>
                          </div>
                          {metrics.totalViews > 0 && (
                            <div className="flex items-center gap-1">
                              {metrics.totalOrders / metrics.totalViews > 0.05 ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              )}
                              <span>{((metrics.totalOrders / metrics.totalViews) * 100).toFixed(1)}% conversion</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/items/${item.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Item
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/sell/edit/${item.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Item
                            </Link>
                          </DropdownMenuItem>
                          {item.status === "active" && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(item.id, "paused")}>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause Listing
                            </DropdownMenuItem>
                          )}
                          {item.status === "paused" && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(item.id, "active")}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activate Listing
                            </DropdownMenuItem>
                          )}
                          {item.status === "draft" && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(item.id, "active")}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Publish Item
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this item?")) {
                                // Handle delete
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
