"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, CalendarIcon, Percent, DollarSign, Gift, Truck } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { createPromotion } from "@/lib/supabase/seller-analytics"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function CreatePromotionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [culturalOrigins, setCulturalOrigins] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "percentage" as "percentage" | "fixed_amount" | "bogo" | "free_shipping",
    value: "",
    minOrderAmount: "",
    maxUses: "",
    promoCode: "",
    targetType: "all" as "all" | "items" | "categories" | "cultural_origins",
    targetIds: [] as string[],
    isActive: true,
  })

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      const [itemsData, categoriesData, originsData] = await Promise.all([
        supabase.from("items").select("id, title, price").eq("seller_id", user.id).eq("status", "active"),
        supabase.from("categories").select("*").order("name"),
        supabase.from("cultural_origins").select("*").order("name"),
      ])

      setItems(itemsData.data || [])
      setCategories(categoriesData.data || [])
      setCulturalOrigins(originsData.data || [])
    }

    fetchData()
  }, [user])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const generatePromoCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    handleInputChange("promoCode", code)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !startDate || !endDate) return

    setLoading(true)
    setError(null)

    try {
      const promotion = {
        seller_id: user.id,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        value: Number.parseFloat(formData.value),
        min_order_amount: formData.minOrderAmount ? Number.parseFloat(formData.minOrderAmount) : null,
        max_uses: formData.maxUses ? Number.parseInt(formData.maxUses) : null,
        promo_code: formData.promoCode || null,
        target_type: formData.targetType,
        target_ids: formData.targetType === "all" ? null : formData.targetIds,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        is_active: formData.isActive,
      }

      await createPromotion(promotion)
      router.push("/seller/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create promotion")
    } finally {
      setLoading(false)
    }
  }

  const promotionTypes = [
    { value: "percentage", label: "Percentage Off", icon: Percent, description: "Discount by percentage" },
    { value: "fixed_amount", label: "Fixed Amount Off", icon: DollarSign, description: "Discount by fixed amount" },
    { value: "bogo", label: "Buy One Get One", icon: Gift, description: "Buy one get one free/discounted" },
    { value: "free_shipping", label: "Free Shipping", icon: Truck, description: "Free shipping on orders" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/seller/dashboard" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="font-semibold">Create Promotion</h1>
          <div></div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Promotion</CardTitle>
            <p className="text-muted-foreground">Boost your sales with targeted promotions and discounts</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Promotion Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Summer Sale 2024"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="promoCode">Promo Code (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="promoCode"
                        placeholder="SUMMER2024"
                        value={formData.promoCode}
                        onChange={(e) => handleInputChange("promoCode", e.target.value)}
                      />
                      <Button type="button" variant="outline" onClick={generatePromoCode}>
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your promotion..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>
              </div>

              {/* Promotion Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Promotion Type</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {promotionTypes.map((type) => (
                    <Card
                      key={type.value}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        formData.type === type.value ? "ring-2 ring-primary" : "",
                      )}
                      onClick={() => handleInputChange("type", type.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <type.icon className="h-6 w-6 text-primary" />
                          <div>
                            <h4 className="font-medium">{type.label}</h4>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="value">
                      {formData.type === "percentage"
                        ? "Discount Percentage"
                        : formData.type === "fixed_amount"
                          ? "Discount Amount ($)"
                          : formData.type === "bogo"
                            ? "Get Discount (%)"
                            : "Free Shipping Threshold ($)"}
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      placeholder={formData.type === "percentage" ? "20" : "10.00"}
                      value={formData.value}
                      onChange={(e) => handleInputChange("value", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="minOrderAmount">Minimum Order Amount ($)</Label>
                    <Input
                      id="minOrderAmount"
                      type="number"
                      step="0.01"
                      placeholder="50.00"
                      value={formData.minOrderAmount}
                      onChange={(e) => handleInputChange("minOrderAmount", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxUses">Maximum Uses (Optional)</Label>
                    <Input
                      id="maxUses"
                      type="number"
                      placeholder="100"
                      value={formData.maxUses}
                      onChange={(e) => handleInputChange("maxUses", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Target Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Apply To</h3>

                <Select value={formData.targetType} onValueChange={(value) => handleInputChange("targetType", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="items">Specific Items</SelectItem>
                    <SelectItem value="categories">Categories</SelectItem>
                    <SelectItem value="cultural_origins">Cultural Origins</SelectItem>
                  </SelectContent>
                </Select>

                {formData.targetType === "items" && (
                  <div>
                    <Label>Select Items</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={item.id}
                            checked={formData.targetIds.includes(item.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange("targetIds", [...formData.targetIds, item.id])
                              } else {
                                handleInputChange(
                                  "targetIds",
                                  formData.targetIds.filter((id) => id !== item.id),
                                )
                              }
                            }}
                          />
                          <label htmlFor={item.id} className="text-sm cursor-pointer">
                            {item.title} - ${item.price}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.targetType === "categories" && (
                  <div>
                    <Label>Select Categories</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={category.id}
                            checked={formData.targetIds.includes(category.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange("targetIds", [...formData.targetIds, category.id])
                              } else {
                                handleInputChange(
                                  "targetIds",
                                  formData.targetIds.filter((id) => id !== category.id),
                                )
                              }
                            }}
                          />
                          <label htmlFor={category.id} className="text-sm cursor-pointer">
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.targetType === "cultural_origins" && (
                  <div>
                    <Label>Select Cultural Origins</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {culturalOrigins.map((origin) => (
                        <div key={origin.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={origin.id}
                            checked={formData.targetIds.includes(origin.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange("targetIds", [...formData.targetIds, origin.id])
                              } else {
                                handleInputChange(
                                  "targetIds",
                                  formData.targetIds.filter((id) => id !== origin.id),
                                )
                              }
                            }}
                          />
                          <label htmlFor={origin.id} className="text-sm cursor-pointer">
                            {origin.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Schedule</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>End Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                  <Label htmlFor="isActive">Activate promotion immediately</Label>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Promotion"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/seller/dashboard">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
