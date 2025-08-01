"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { createClient } from "@/lib/supabase/client"
import { ImageUpload } from "@/components/ImageUpload"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SellPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cultures, setCultures] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    condition: "",
    size: "",
    color: "",
    gender: "",
    occasion: "",
    categoryId: "",
    culturalOriginId: "",
    freeShipping: false,
  })

  // Fetch filter options
  useEffect(() => {
    const fetchOptions = async () => {
      const [culturesData, categoriesData] = await Promise.all([
        supabase.from("cultural_origins").select("*").order("name"),
        supabase.from("categories").select("*").order("name"),
      ])

      setCultures(culturesData.data || [])
      setCategories(categoriesData.data || [])
    }

    fetchOptions()
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirectTo=/sell")
    }
  }, [user, authLoading, router])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag) && selectedTags.length < 10) {
      setSelectedTags((prev) => [...prev, tag])
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.price || !formData.condition) {
        throw new Error("Please fill in all required fields")
      }

      if (images.length === 0) {
        throw new Error("Please add at least one image")
      }

      // Create item
      const { data: item, error: itemError } = await supabase
        .from("items")
        .insert({
          seller_id: user.id,
          title: formData.title,
          description: formData.description,
          price: Number.parseFloat(formData.price),
          original_price: formData.originalPrice ? Number.parseFloat(formData.originalPrice) : null,
          condition: formData.condition as any,
          size: formData.size || null,
          color: formData.color || null,
          gender: formData.gender || null,
          occasion: formData.occasion || null,
          category_id: formData.categoryId || null,
          cultural_origin_id: formData.culturalOriginId || null,
          free_shipping: formData.freeShipping,
          tags: selectedTags.length > 0 ? selectedTags : null,
        })
        .select()
        .single()

      if (itemError) throw itemError

      // Create item images
      if (images.length > 0) {
        const imageInserts = images.map((url, index) => ({
          item_id: item.id,
          image_url: url,
          display_order: index,
          is_primary: index === 0,
        }))

        const { error: imagesError } = await supabase.from("item_images").insert(imageInserts)

        if (imagesError) throw imagesError
      }

      // Redirect to item page
      router.push(`/items/${item.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing")
    } finally {
      setLoading(false)
    }
  }

  const conditions = [
    { value: "brand_new", label: "Brand New" },
    { value: "like_new", label: "Like New" },
    { value: "gently_used", label: "Gently Used" },
    { value: "well_loved", label: "Well Loved" },
    { value: "vintage", label: "Vintage" },
    { value: "custom_made", label: "Custom Made" },
    { value: "designer", label: "Designer" },
  ]

  const genders = [
    { value: "Women", label: "Women" },
    { value: "Men", label: "Men" },
    { value: "Unisex", label: "Unisex" },
    { value: "Kids", label: "Kids" },
  ]

  const suggestedTags = [
    "Vintage",
    "Handmade",
    "Embroidered",
    "Silk",
    "Cotton",
    "Wedding",
    "Festival",
    "Casual",
    "Formal",
    "Traditional",
    "Modern",
    "Authentic",
  ]

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </Link>
          </div>
          <h1 className="font-semibold">List Your Item</h1>
          <div></div>
        </div>
      </header>

      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sell Your Ethnic Clothing</CardTitle>
            <p className="text-muted-foreground">Share your beautiful cultural pieces with the Bazari community</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <Label className="text-base font-medium">Photos (up to 6)</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Add photos to show your item's details and condition
                </p>
                <ImageUpload
                  onImagesUploaded={setImages}
                  maxImages={6}
                  bucket="item-images"
                  path="items"
                  existingImages={images}
                />
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-base font-medium">
                  Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Vintage Pakistani Shalwar Kameez"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="mt-2"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-base font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item's condition, size, cultural significance, and any special details..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="mt-2 min-h-[100px]"
                  required
                />
              </div>

              {/* Culture & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-base font-medium">Culture/Origin</Label>
                  <Select
                    value={formData.culturalOriginId}
                    onValueChange={(value) => handleInputChange("culturalOriginId", value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select culture" />
                    </SelectTrigger>
                    <SelectContent>
                      {cultures.map((culture) => (
                        <SelectItem key={culture.id} value={culture.id}>
                          {culture.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-medium">Category</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => handleInputChange("categoryId", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Size & Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size" className="text-base font-medium">
                    Size
                  </Label>
                  <Input
                    id="size"
                    placeholder="e.g., M, L, XL, Custom"
                    value={formData.size}
                    onChange={(e) => handleInputChange("size", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-base font-medium">Condition *</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Gender & Color */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-base font-medium">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((gender) => (
                        <SelectItem key={gender.value} value={gender.value}>
                          {gender.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color" className="text-base font-medium">
                    Color
                  </Label>
                  <Input
                    id="color"
                    placeholder="e.g., Blue, Red, Multicolor"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Occasion */}
              <div>
                <Label htmlFor="occasion" className="text-base font-medium">
                  Occasion
                </Label>
                <Input
                  id="occasion"
                  placeholder="e.g., Wedding, Festival, Casual, Formal"
                  value={formData.occasion}
                  onChange={(e) => handleInputChange("occasion", e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-base font-medium">
                    Price (USD) *
                  </Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      className="pl-8"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="originalPrice" className="text-base font-medium">
                    Original Price (Optional)
                  </Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.originalPrice}
                      onChange={(e) => handleInputChange("originalPrice", e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Show original price if item is on sale</p>
                </div>
              </div>

              {/* Free Shipping */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="freeShipping"
                  checked={formData.freeShipping}
                  onChange={(e) => handleInputChange("freeShipping", e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="freeShipping" className="text-sm">
                  Offer free shipping
                </Label>
              </div>

              {/* Tags */}
              <div>
                <Label className="text-base font-medium">Tags (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-3">Add tags to help buyers find your item</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {suggestedTags
                    .filter((tag) => !selectedTags.includes(tag))
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => addTag(tag)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={loading}
                >
                  {loading ? "Creating Listing..." : "List Item for Sale"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  By listing, you agree to our Terms of Service and Community Guidelines
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
