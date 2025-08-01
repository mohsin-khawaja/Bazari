"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Search, User, Plus, Filter, Star, MessageCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useItems } from "@/hooks/useItems"
import { useAuth } from "@/hooks/useAuth"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { likeItem, unlikeItem } from "@/lib/supabase/items"

export default function HomePage() {
  const { items, loading, loadMore, hasMore } = useItems({}, 12)
  const { user } = useAuth()
  const [cultures, setCultures] = useState<any[]>([])
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set())
  const supabase = createClient()

  // Fetch cultural origins
  useEffect(() => {
    const fetchCultures = async () => {
      const { data } = await supabase.from("cultural_origins").select("*").order("name").limit(10)

      setCultures([{ name: "All" }, ...(data || [])])
    }

    fetchCultures()
  }, [])

  // Fetch user's liked items
  useEffect(() => {
    const fetchLikedItems = async () => {
      if (!user) return

      const { data } = await supabase.from("likes").select("item_id").eq("user_id", user.id)

      if (data) {
        setLikedItems(new Set(data.map((like) => like.item_id)))
      }
    }

    fetchLikedItems()
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Bazari
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/messages">
                <MessageCircle className="h-5 w-5" />
              </Link>
            </Button>
            {user ? (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/auth/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              asChild
            >
              <Link href="/sell">
                <Plus className="h-4 w-4 mr-1" />
                Sell
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Discover Ethnic Fashion
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Buy and sell authentic ethnic clothing from all cultures. From vintage finds to custom designs, celebrate
            diversity through fashion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              asChild
            >
              <Link href="/search">Start Shopping</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sell">Sell Your Items</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Culture Filter */}
      <section className="py-6 px-4 border-b">
        <div className="container">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Shop by Culture</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/search">
                <Filter className="h-4 w-4 mr-2" />
                All Filters
              </Link>
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {cultures.map((culture) => (
              <Badge
                key={culture.name}
                variant="secondary"
                className="whitespace-nowrap cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                asChild
              >
                <Link href={culture.name === "All" ? "/search" : `/search?culture=${culture.name}`}>
                  {culture.name}
                </Link>
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items Feed */}
      <section className="py-8 px-4">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">For You</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/search">View All</Link>
            </Button>
          </div>

          {loading && items.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white ${
                          likedItems.has(item.id) ? "text-red-500" : ""
                        }`}
                        onClick={() => handleLike(item.id)}
                        disabled={!user}
                      >
                        <Heart className={`h-4 w-4 ${likedItems.has(item.id) ? "fill-current" : ""}`} />
                      </Button>
                      <Badge className="absolute top-2 left-2 text-xs">{item.cultural_origin_name || "Cultural"}</Badge>
                    </div>

                    <CardContent className="p-3">
                      <Link href={`/items/${item.id}`}>
                        <h3 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                      </Link>

                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">${item.price}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">4.8</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>@{item.seller_username}</span>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{item.likes_count}</span>
                        </div>
                      </div>

                      <Badge variant="outline" className="mt-2 text-xs">
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
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Bazari?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover Authentic Pieces</h3>
              <p className="text-muted-foreground">
                Find genuine ethnic clothing from all cultures, verified by our community of sellers.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Support Cultural Heritage</h3>
              <p className="text-muted-foreground">
                Every purchase supports artisans and preserves traditional craftsmanship.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Join Our Community</h3>
              <p className="text-muted-foreground">
                Connect with sellers and buyers who share your passion for cultural fashion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="font-bold text-xl">Bazari</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Celebrating cultural diversity through authentic ethnic fashion.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/search" className="hover:text-foreground">
                    Browse All
                  </Link>
                </li>
                <li>
                  <Link href="/search?sort=newest" className="hover:text-foreground">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/search?condition=vintage" className="hover:text-foreground">
                    Vintage
                  </Link>
                </li>
                <li>
                  <Link href="/search?condition=custom_made" className="hover:text-foreground">
                    Custom Made
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Sell</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/sell" className="hover:text-foreground">
                    Start Selling
                  </Link>
                </li>
                <li>
                  <Link href="/help/seller-guide" className="hover:text-foreground">
                    Seller Guide
                  </Link>
                </li>
                <li>
                  <Link href="/help/fees" className="hover:text-foreground">
                    Fees
                  </Link>
                </li>
                <li>
                  <Link href="/success-stories" className="hover:text-foreground">
                    Success Stories
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="hover:text-foreground">
                    Safety
                  </Link>
                </li>
                <li>
                  <Link href="/community-guidelines" className="hover:text-foreground">
                    Community Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Bazari. All rights reserved. Celebrating cultural diversity through fashion.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
