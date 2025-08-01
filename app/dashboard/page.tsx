"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Eye, Package, Star, Users, Settings, Plus } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

// Mock data for analytics
const salesData = [
  { month: "Jan", sales: 1200, views: 3400 },
  { month: "Feb", sales: 1900, views: 4200 },
  { month: "Mar", sales: 2100, views: 5100 },
  { month: "Apr", sales: 1800, views: 4800 },
  { month: "May", sales: 2400, views: 6200 },
  { month: "Jun", sales: 2800, views: 7100 },
]

const topItems = [
  { name: "Vintage Pakistani Shalwar", sales: 12, revenue: 1020, views: 340 },
  { name: "Designer Saree Collection", sales: 8, revenue: 1200, views: 280 },
  { name: "Handwoven Dupatta Set", sales: 15, revenue: 675, views: 420 },
  { name: "Traditional Kurta Set", sales: 6, revenue: 390, views: 180 },
]

const recentActivity = [
  { type: "sale", item: "Vintage Pakistani Shalwar", buyer: "Sarah_M", amount: 85, time: "2 hours ago" },
  { type: "message", item: "Designer Saree", buyer: "Maya_P", time: "4 hours ago" },
  { type: "like", item: "Handwoven Dupatta", buyer: "CulturalFashion", time: "6 hours ago" },
  { type: "view", item: "Traditional Kurta", buyer: "DesiStyle", time: "8 hours ago" },
]

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("30d")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-bold text-xl">Bazari</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="h-4 w-4 mr-1" />
              List Item
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, Aisha! 👋</h1>
            <p className="text-muted-foreground">Here's what's happening with your store</p>
          </div>
          <div className="flex items-center space-x-2">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder.svg?height=48&width=48" alt="Profile" />
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>
            <div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                ✓ Verified Seller
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="followers">Community</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$3,284</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+12.5%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+8.2%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,847</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+15.3%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Followers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+5.7%</span> from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.type === "sale"
                              ? "bg-green-500"
                              : activity.type === "message"
                                ? "bg-blue-500"
                                : activity.type === "like"
                                  ? "bg-red-500"
                                  : "bg-gray-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            {activity.type === "sale" && `💰 Sold "${activity.item}" to @${activity.buyer}`}
                            {activity.type === "message" &&
                              `💬 New message about "${activity.item}" from @${activity.buyer}`}
                            {activity.type === "like" && `❤️ @${activity.buyer} liked "${activity.item}"`}
                            {activity.type === "view" && `👀 @${activity.buyer} viewed "${activity.item}"`}
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                        {activity.amount && <Badge variant="secondary">+${activity.amount}</Badge>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.sales} sales • {item.views} views
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">${item.revenue}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Seller Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Progress</CardTitle>
                <p className="text-sm text-muted-foreground">Complete these steps to improve your seller rating</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Profile completeness</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">Email verified</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">Phone verified</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span className="text-sm">Add more photos</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Analytics</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setTimeRange("7d")}>
                  7d
                </Button>
                <Button variant="outline" size="sm" onClick={() => setTimeRange("30d")}>
                  30d
                </Button>
                <Button variant="outline" size="sm" onClick={() => setTimeRange("90d")}>
                  90d
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="views" fill="#ec4899" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">3.2%</div>
                  <p className="text-sm text-muted-foreground">Views to sales</p>
                  <div className="mt-4">
                    <Progress value={32} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avg. Order Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$87</div>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-green-600">+$12</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-3xl font-bold">4.9</div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Based on 156 reviews</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Listings</h2>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Plus className="h-4 w-4 mr-2" />
                Add New Listing
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src="/placeholder.svg?height=200&width=200"
                      alt="Item"
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-green-500">Active</Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Vintage Pakistani Shalwar Kameez</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold">$85</span>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">124</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>24 likes</span>
                      <span>Listed 3 days ago</span>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        Promote
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold">Recent Orders</h2>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((order) => (
                <Card key={order}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src="/placeholder.svg?height=60&width=60"
                          alt="Item"
                          className="w-15 h-15 rounded object-cover"
                        />
                        <div>
                          <h3 className="font-medium">Vintage Pakistani Shalwar Kameez</h3>
                          <p className="text-sm text-muted-foreground">Sold to @sarah_m</p>
                          <p className="text-sm text-muted-foreground">Order #BZ-{1000 + order}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">$85.00</div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">2 days ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="followers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Followers</CardTitle>
                  <p className="text-sm text-muted-foreground">1,247 people follow you</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((follower) => (
                      <div key={follower} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Follower" />
                            <AvatarFallback>U{follower}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">User {follower}</p>
                            <p className="text-sm text-muted-foreground">@user{follower}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Following</CardTitle>
                  <p className="text-sm text-muted-foreground">You follow 892 people</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((following) => (
                      <div key={following} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Following" />
                            <AvatarFallback>F{following}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Fashion {following}</p>
                            <p className="text-sm text-muted-foreground">@fashion{following}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Unfollow
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Community Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">2,847</div>
                    <p className="text-sm text-muted-foreground">Total Likes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-sm text-muted-foreground">Comments</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">567</div>
                    <p className="text-sm text-muted-foreground">Shares</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">89%</div>
                    <p className="text-sm text-muted-foreground">Response Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
