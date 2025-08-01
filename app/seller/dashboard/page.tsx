"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Eye,
  AlertTriangle,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import {
  getSellerDashboardData,
  getItemPerformance,
  getCustomerInsights,
  type DashboardData,
  type ItemPerformance,
  type CustomerInsight,
} from "@/lib/supabase/seller-analytics"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function SellerDashboardPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState("30")
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [itemPerformance, setItemPerformance] = useState<ItemPerformance[]>([])
  const [customerInsights, setCustomerInsights] = useState<CustomerInsight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [dashboard, items, customers] = await Promise.all([
          getSellerDashboardData(user.id, Number.parseInt(timeRange)),
          getItemPerformance(user.id, Number.parseInt(timeRange)),
          getCustomerInsights(user.id),
        ])

        setDashboardData(dashboard)
        setItemPerformance(items)
        setCustomerInsights(customers)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, timeRange])

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access your seller dashboard</h1>
          <Button asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
            <p className="text-muted-foreground">Track your performance and grow your business</p>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Button asChild>
              <Link href="/seller/promotions/create">Create Promotion</Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardData?.revenue.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.orders || 0}</div>
              <p className="text-xs text-muted-foreground">
                <ArrowUpRight className="inline h-3 w-3 mr-1" />
                +8% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.views.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +15% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.conversionRate.toFixed(2) || "0.00"}%</div>
              <p className="text-xs text-muted-foreground">
                <ArrowDownRight className="inline h-3 w-3 mr-1" />
                -2% from last period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts and Opportunities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alerts & Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Low Stock Alert</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                    3 items are running low on inventory and may need restocking soon.
                  </p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/seller/inventory">Manage Inventory</Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">Performance Opportunity</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    Your Indian ethnic wear items are trending 25% higher than average. Consider featuring them.
                  </p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/seller/promotions/create">Create Promotion</Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-800 dark:text-green-200">Seasonal Opportunity</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                    Diwali is approaching! Consider promoting your festive collection for maximum visibility.
                  </p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/seller/promotions/create">Create Festival Promotion</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Item Performance</TabsTrigger>
            <TabsTrigger value="customers">Customer Insights</TabsTrigger>
            <TabsTrigger value="cultural">Cultural Analytics</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {itemPerformance.slice(0, 10).map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <span className="font-bold text-lg">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{item.culturalOrigin}</span>
                            <span>•</span>
                            <span>{item.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-lg">${item.revenue.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.views} views • {item.orders} orders
                        </div>
                        <div className="text-sm">
                          <Badge variant={item.conversionRate > 5 ? "default" : "secondary"}>
                            {item.conversionRate.toFixed(1)}% conversion
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button variant="outline" asChild>
                    <Link href="/seller/inventory">View All Items</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customerInsights.slice(0, 5).map((customer, index) => (
                      <div key={customer.customerId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {customer.customerName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{customer.customerName}</div>
                            <div className="text-sm text-muted-foreground">{customer.totalOrders} orders</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${customer.totalSpent.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">${customer.avgOrderValue.toFixed(2)} avg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Popular Categories</h4>
                      <div className="space-y-2">
                        {["Sarees", "Lehengas", "Kurtas", "Accessories"].map((category, index) => (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-sm">{category}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={85 - index * 15} className="w-20" />
                              <span className="text-sm text-muted-foreground">{85 - index * 15}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Cultural Preferences</h4>
                      <div className="space-y-2">
                        {["Indian", "Pakistani", "Bangladeshi", "Sri Lankan"].map((culture, index) => (
                          <div key={culture} className="flex items-center justify-between">
                            <span className="text-sm">{culture}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={90 - index * 20} className="w-20" />
                              <span className="text-sm text-muted-foreground">{90 - index * 20}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cultural" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Cultural Origin</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dashboardData?.culturalPerformance || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {(dashboardData?.culturalPerformance || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cultural Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.culturalPerformance?.map((culture, index) => (
                      <div
                        key={culture.culturalOrigin}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{culture.culturalOrigin}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${culture.revenue.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            {culture.orders} orders • {culture.conversionRate.toFixed(1)}% conversion
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={[
                      { date: "2024-01-01", revenue: 1200 },
                      { date: "2024-01-02", revenue: 1500 },
                      { date: "2024-01-03", revenue: 1800 },
                      { date: "2024-01-04", revenue: 1400 },
                      { date: "2024-01-05", revenue: 2100 },
                      { date: "2024-01-06", revenue: 1900 },
                      { date: "2024-01-07", revenue: 2300 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
