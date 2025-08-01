"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Heart, SlidersHorizontal, ArrowLeft, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAdvancedSearch } from "@/hooks/useAdvancedSearch"
import { useAuth } from "@/hooks/useAuth"
import { AdvancedSearchBar } from "@/components/AdvancedSearchBar"
import { WishlistButton } from "@/components/WishlistButton"
import { createClient } from "@/lib/supabase/client"
import { likeItem, unlikeItem } from "@/lib/supabase/items"
import { useSearchParams } from "next/navigation"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get("search") || ""
  const initialCulture = searchParams.get("culture") || ""

  const { items, loading, filters, suggestions, culturalContext, hasMore, updateFilters, loadMore, clearFilters } =
    useAdvancedSearch({
      query: initialSearch,
      culturalOrigin: initialCulture,
    })

  const { user } = useAuth()
  const [showFilters, setShowFilters] = useState(false)
  const [cultures, setCultures] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [occasions, setOccasions] = useState<any[]>([])
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set())
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set())
  const supabase = createClient()

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      const [culturesData, categoriesData, occasionsData] = await Promise.all([
        supabase.from("cultural_origins").select("*").order("name"),
        supabase.from("categories").select("*").order("name"),
        supabase.from("occasions").select("*").order("name"),
      ])

      setCultures([{ id: "", name: "All" }, ...(culturesData.data || [])])
      setCategories([{ id: "", name: "All" }, ...(categoriesData.data || [])])
      setOccasions([{ id: "", name: "All" }, ...(occasionsData.data || [])])
    }

    fetchFilterOptions()
  }, [])

  // Fetch user's liked items and wishlist
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      const [likesData, savesData] = await Promise.all([
        supabase.from("likes").select("item_id").eq("user_id", user.id),
        supabase.from("saves").select("item_id").eq("user_id", user.id),
      ])

      if (likesData.data) {
        setLikedItems(new Set(likesData.data.map((like) => like.item_id)))
      }
      if (savesData.data) {
        setWishlistItems(new Set(savesData.data.map((save) => save.item_id)))
      }
    }

    fetchUserData()
  }, [user])

  const handleLike = async (itemId: string) => {
    if (!user) return

    try {
      if (likedItems.has(itemId)) {
        await unlikeItem(itemId, user.id)
        setLikedItems((prev) => {
          const newSet = new Set(prev)
          newSet.delete(itemId)
          return newSet
        })
      } else {
        await likeItem(itemId, user.id)
        setLikedItems((prev) => new Set(prev).add(itemId))
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const conditions = [
    { value: "", label: "All" },
    { value: "brand_new", label: "Brand New" },
    { value: "like_new", label: "Like New" },
    { value: "gently_used", label: "Gently Used" },
    { value: "well_loved", label: "Well Loved" },
    { value: "vintage", label: "Vintage" },
    { value: "custom_made", label: "Custom Made" },
    { value: "designer", label: "Designer" },
  ]

  const genders = [
    { value: "", label: "All" },
    { value: "Women", label: "Women" },
    { value: "Men", label: "Men" },
    { value: "Unisex", label: "Unisex" },
    { value: "Kids", label: "Kids" },
  ]

  const sortOptions = [
    { value: "relevance", label: "Most Relevant" },
    { value: "created_at", label: "Newest" },
    { value: "price", label: "Price: Low to High" },
    { value: "likes_count", label: "Most Liked" },
    { value: "views_count", label: "Most Viewed" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex-1 flex items-center gap-2">
            <AdvancedSearchBar
              value={filters.query || ""}
              onChange={(value) => updateFilters({ query: value })}
              suggestions={suggestions}
              culturalContext={culturalContext}
              onSearch={(query) => updateFilters({ query })}
            />

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-primary text-primary-foreground" : ""}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6">
        {/* Advanced Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Basic Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select
                      value={filters.category || ""}
                      onValueChange={(value) => updateFilters({ category: value || undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue />
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

                  <div>
                    <label className="text-sm font-medium mb-2 block">Gender</label>
                    <Select
                      value={filters.gender || ""}
                      onValueChange={(value) => updateFilters({ gender: value || undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                    <label className="text-sm font-medium mb-2 block">Culture</label>
                    <Select
                      value={filters.culturalOrigin || ""}
                      onValueChange={(value) => updateFilters({ culturalOrigin: value || undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                    <label className="text-sm font-medium mb-2 block">Occasion</label>
                    <Select
                      value={filters.occasion || ""}
                      onValueChange={(value) => updateFilters({ occasion: value || undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {occasions.map((occasion) => (
                          <SelectItem key={occasion.id} value={occasion.id}>
                            {occasion.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Price Range and Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Price Range: ${filters.minPrice || 0} - ${filters.maxPrice || 500}
                    </label>
                    <Slider
                      value={[filters.minPrice || 0, filters.maxPrice || 500]}
                      onValueChange={([min, max]) => updateFilters({ minPrice: min, maxPrice: max })}
                      max={500}
                      step={10}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select
                      value={filters.sortBy || "relevance"}
                      onValueChange={(value) => updateFilters({ sortBy: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="City, State or ZIP"
                        value={filters.location || ""}
                        onChange={(e) => updateFilters({ location: e.target.value || undefined })}
                        className="w-full pl-10 pr-3 py-2 border border-input rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                  <div className="text-sm text-muted-foreground">{items.length} items found</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {filters.query ? `Results for "${filters.query}"` : "Browse All Items"}
          </h1>
          <p className="text-muted-foreground">{items.length} items found</p>
        </div>

        {/* Cultural Context Insights */}
        {culturalContext && (
          <Card className="mb-6 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="text-lg">✨</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Cultural Context Detected</h3>
                  <p className="text-sm text-muted-foreground mb-2">{culturalContext.significance}</p>
                  <div className="flex flex-wrap gap-2">
                    {culturalContext.keywords.map((keyword: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Grid */}
        {loading && items.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square bg-muted animate-pulse" />
                <CardContent className="p-3">
                  <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-6 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-3 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  <div className="relative">
                    <Link href={`/items/${item.id}`}>
                      <Image
                        src={item.image_url || "/placeholder.svg?height=300&width=250"}
                        alt={item.title}
                        width={250}
                        height={300}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </Link>

                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`h-8 w-8 bg-white/80 hover:bg-white ${
                          likedItems.has(item.id) ? "text-red-500" : ""
                        }`}
                        onClick={() => handleLike(item.id)}
                        disabled={!user}
                      >
                        <Heart className={`h-4 w-4 ${likedItems.has(item.id) ? "fill-current" : ""}`} />
                      </Button>

                      <WishlistButton
                        itemId={item.id}
                        isInWishlist={wishlistItems.has(item.id)}
                        variant="ghost"
                        size="icon"
                        onToggle={(inWishlist) => {
                          if (inWishlist) {
                            setWishlistItems((prev) => new Set(prev).add(item.id))
                          } else {
                            setWishlistItems((prev) => {
                              const newSet = new Set(prev)
                              newSet.delete(item.id)
                              return newSet
                            })
                          }
                        }}
                      />
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <Badge className="text-xs">{item.cultural_origin_name || "Cultural"}</Badge>
                      {item.occasion_name && (
                        <Badge variant="secondary" className="text-xs">
                          {item.occasion_name}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-3">
                    <Link href={`/items/${item.id}`}>
                      <h3 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg">${item.price}</span>
                      {item.original_price && (
                        <span className="text-sm text-muted-foreground line-through">${item.original_price}</span>
                      )}
                      <div className="flex items-center gap-1 ml-auto">
                        <Heart className="h-3 w-3" />
                        <span className="text-xs text-muted-foreground">{item.likes_count || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>@{item.seller_username}</span>
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </span>
                      )}
                    </div>

                    <Badge variant="outline" className="text-xs">
                      {item.condition?.replace("_", " ")}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg" onClick={loadMore} disabled={loading}>
                  {loading ? "Loading..." : "Load More Items"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
