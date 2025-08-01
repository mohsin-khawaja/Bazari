"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { User, MapPin, Award, Clock, Palette, Heart, ExternalLink } from "lucide-react"
import { getArtisans, getArtisanById, getItemArtisans } from "@/lib/supabase/cultural-education"
import Image from "next/image"

interface ArtisanSpotlightProps {
  itemId?: string
  culturalBackground?: string
  featured?: boolean
}

export default function ArtisanSpotlight({ itemId, culturalBackground, featured }: ArtisanSpotlightProps) {
  const [artisans, setArtisans] = useState<any[]>([])
  const [selectedArtisan, setSelectedArtisan] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        let data
        if (itemId) {
          // Get artisans for specific item
          data = await getItemArtisans(itemId)
          setArtisans(data?.map((item: any) => item.artisan) || [])
        } else {
          // Get all artisans or by cultural background
          data = await getArtisans(culturalBackground)
          setArtisans(data || [])
        }
      } catch (error) {
        console.error("Error fetching artisans:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchArtisans()
  }, [itemId, culturalBackground])

  const openArtisanProfile = async (artisan: any) => {
    try {
      const fullProfile = await getArtisanById(artisan.id)
      setSelectedArtisan(fullProfile)
    } catch (error) {
      console.error("Error fetching artisan profile:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-muted rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (artisans.length === 0) {
    return null
  }

  const featuredArtisan = featured ? artisans[0] : null

  return (
    <div className="space-y-4">
      {/* Featured Artisan Card */}
      {featuredArtisan && (
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-purple-600" />
              Featured Artisan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={featuredArtisan.profile_image_url || "/placeholder.svg"} />
                <AvatarFallback>{featuredArtisan.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="font-semibold text-lg">{featuredArtisan.name}</h3>
                  <p className="text-sm text-muted-foreground">{featuredArtisan.cultural_background}</p>
                </div>

                {featuredArtisan.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {featuredArtisan.location}
                  </div>
                )}

                {featuredArtisan.years_of_experience && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {featuredArtisan.years_of_experience} years of experience
                  </div>
                )}

                {featuredArtisan.specialties && featuredArtisan.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {featuredArtisan.specialties.slice(0, 3).map((specialty: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {featuredArtisan.specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{featuredArtisan.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <p className="text-sm line-clamp-2">{featuredArtisan.bio}</p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openArtisanProfile(featuredArtisan)}
                  className="mt-2"
                >
                  View Full Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Artisans List */}
      {artisans.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-5 w-5 text-orange-600" />
              {itemId ? "Item Artisans" : "Master Artisans"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {artisans.slice(featured ? 1 : 0).map((artisan) => (
                <div key={artisan.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={artisan.profile_image_url || "/placeholder.svg"} />
                    <AvatarFallback>{artisan.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{artisan.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{artisan.cultural_background}</p>
                    {artisan.specialties && artisan.specialties.length > 0 && (
                      <p className="text-xs text-muted-foreground truncate">{artisan.specialties[0]}</p>
                    )}
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => openArtisanProfile(artisan)}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Artisan Profile Modal */}
      {selectedArtisan && (
        <Dialog open={!!selectedArtisan} onOpenChange={() => setSelectedArtisan(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Artisan Profile
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="max-h-[75vh] pr-4">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={selectedArtisan.profile_image_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">{selectedArtisan.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedArtisan.name}</h2>
                      <p className="text-lg text-muted-foreground">{selectedArtisan.cultural_background}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {selectedArtisan.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {selectedArtisan.location}
                        </div>
                      )}
                      {selectedArtisan.years_of_experience && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {selectedArtisan.years_of_experience} years experience
                        </div>
                      )}
                    </div>

                    {selectedArtisan.specialties && selectedArtisan.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedArtisan.specialties.map((specialty: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Bio */}
                {selectedArtisan.bio && (
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-sm leading-relaxed">{selectedArtisan.bio}</p>
                  </div>
                )}

                {/* Story */}
                {selectedArtisan.story && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      Artisan's Story
                    </h3>
                    <p className="text-sm leading-relaxed">{selectedArtisan.story}</p>
                  </div>
                )}

                {/* Techniques */}
                {selectedArtisan.techniques && selectedArtisan.techniques.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Traditional Techniques</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedArtisan.techniques.map((technique: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {technique}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Awards */}
                {selectedArtisan.awards && selectedArtisan.awards.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-600" />
                      Awards & Recognition
                    </h3>
                    <ul className="text-sm space-y-1">
                      {selectedArtisan.awards.map((award: string, index: number) => (
                        <li key={index}>• {award}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Portfolio */}
                {selectedArtisan.portfolio_images && selectedArtisan.portfolio_images.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Portfolio</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedArtisan.portfolio_images.map((image: string, index: number) => (
                        <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`Portfolio ${index + 1}`}
                            fill
                            className="object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact */}
                {selectedArtisan.contact_info && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Connect with {selectedArtisan.name}</h3>
                    <div className="flex gap-2">
                      {selectedArtisan.contact_info.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={selectedArtisan.contact_info.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Website
                          </a>
                        </Button>
                      )}
                      {selectedArtisan.contact_info.instagram && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`https://instagram.com/${selectedArtisan.contact_info.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Instagram
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
