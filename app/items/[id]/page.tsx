"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Heart, Flag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getItemById } from "@/lib/supabase/items"
import { useAuth } from "@/hooks/useAuth"
import CulturalContextCard from "@/components/CulturalContextCard"
import CulturalTermsGlossary from "@/components/CulturalTermsGlossary"
import ArtisanSpotlight from "@/components/ArtisanSpotlight"
import CulturalEventCalendar from "@/components/CulturalEventCalendar"
import CulturalEducationModule from "@/components/CulturalEducationModule"
import { AddToCartButton } from "@/components/AddToCartButton"
import { WishlistButton } from "@/components/WishlistButton"
import { SocialShareButton } from "@/components/SocialShareButton"

export default function ItemPage() {
  const params = useParams()
  const { user } = useAuth()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await getItemById(params.id as string)
        setItem(data)
      } catch (error) {
        console.error("Error fetching item:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchItem()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl mx-auto py-8 px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Item not found</h1>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const images = item.item_images || []
  const primaryImage = images.find((img: any) => img.is_primary) || images[0]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <SocialShareButton itemId={item.id} title={item.title} />
            <Button variant="ghost" size="icon">
              <Flag className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
              <Image
                src={images[selectedImageIndex]?.image_url || primaryImage?.image_url || "/placeholder.svg"}
                alt={item.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image: any, index: number) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square relative rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image.image_url || "/placeholder.svg"}
                      alt={`${item.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{item.title}</h1>
                <WishlistButton itemId={item.id} />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Badge>{item.cultural_origin_name}</Badge>
                <Badge variant="outline">{item.category_name}</Badge>
                <Badge variant="secondary">{item.condition?.replace("_", " ")}</Badge>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold">${item.price}</span>
                {item.original_price && (
                  <span className="text-xl text-muted-foreground line-through">${item.original_price}</span>
                )}
                {item.free_shipping && <Badge className="bg-green-100 text-green-800">Free Shipping</Badge>}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </div>

            {/* Item Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {item.size && (
                <div>
                  <span className="font-medium">Size:</span> {item.size}
                </div>
              )}
              {item.color && (
                <div>
                  <span className="font-medium">Color:</span> {item.color}
                </div>
              )}
              {item.gender && (
                <div>
                  <span className="font-medium">Gender:</span> {item.gender}
                </div>
              )}
              {item.occasion && (
                <div>
                  <span className="font-medium">Occasion:</span> {item.occasion}
                </div>
              )}
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <AddToCartButton item={item} className="flex-1" />
                <Button variant="outline" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <CulturalTermsGlossary
                  culturalOriginId={item.cultural_origin_id}
                  trigger={
                    <Button variant="outline" size="sm">
                      Cultural Terms
                    </Button>
                  }
                />
              </div>
            </div>

            {/* Seller Info */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-semibold">{item.seller_username?.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="font-medium">@{item.seller_username}</h4>
                  <p className="text-sm text-muted-foreground">Seller</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto bg-transparent">
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Cultural Education Section */}
        <div className="space-y-8">
          <CulturalContextCard
            itemId={item.id}
            culturalOriginId={item.cultural_origin_id}
            itemCategory={item.category_name}
          />

          <ArtisanSpotlight itemId={item.id} featured />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CulturalEventCalendar culturalOriginId={item.cultural_origin_id} compact maxEvents={3} />
            <CulturalEducationModule culturalOriginId={item.cultural_origin_id} />
          </div>
        </div>
      </div>
    </div>
  )
}
