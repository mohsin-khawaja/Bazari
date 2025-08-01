"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Star, Settings, Share, ArrowLeft, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Mock user data
const user = {
  name: "Aisha Khan",
  username: "aisha_k",
  bio: "Passionate about Pakistani and South Asian fashion. Sharing authentic pieces from my collection and family heritage. ✨",
  location: "Toronto, Canada",
  joinDate: "March 2023",
  followers: 1247,
  following: 892,
  rating: 4.9,
  totalSales: 156,
  avatar: "/placeholder.svg?height=100&width=100",
}

const userItems = [
  {
    id: 1,
    title: "Vintage Pakistani Shalwar Kameez",
    price: 85,
    condition: "Gently Used",
    likes: 24,
    image: "/placeholder.svg?height=300&width=250",
    status: "active",
  },
  {
    id: 2,
    title: "Handwoven Dupatta Set",
    price: 45,
    condition: "Brand New",
    likes: 18,
    image: "/placeholder.svg?height=300&width=250",
    status: "sold",
  },
  {
    id: 3,
    title: "Designer Lehenga Choli",
    price: 220,
    condition: "Designer",
    likes: 31,
    image: "/placeholder.svg?height=300&width=250",
    status: "active",
  },
  {
    id: 4,
    title: "Traditional Kurta Set",
    price: 65,
    condition: "Like New",
    likes: 15,
    image: "/placeholder.svg?height=300&width=250",
    status: "active",
  },
]

const reviews = [
  {
    id: 1,
    buyer: "Sarah_M",
    rating: 5,
    comment: "Beautiful piece! Exactly as described and shipped quickly. Aisha was so helpful with sizing questions.",
    item: "Vintage Pakistani Shalwar Kameez",
    date: "2 weeks ago",
  },
  {
    id: 2,
    buyer: "CulturalFashion",
    rating: 5,
    comment: "Amazing quality and authentic design. Will definitely buy from Aisha again!",
    item: "Handwoven Dupatta Set",
    date: "1 month ago",
  },
  {
    id: 3,
    buyer: "DesiStyle",
    rating: 4,
    comment: "Gorgeous lehenga! Minor alteration needed but overall very happy with the purchase.",
    item: "Designer Lehenga Choli",
    date: "2 months ago",
  },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("items")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Share className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button>Follow</Button>
                  </div>
                </div>

                <p className="text-sm mb-4">{user.bio}</p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {user.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {user.joinDate}
                  </div>
                </div>

                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="font-semibold">{user.followers.toLocaleString()}</span>
                    <span className="text-muted-foreground ml-1">followers</span>
                  </div>
                  <div>
                    <span className="font-semibold">{user.following.toLocaleString()}</span>
                    <span className="text-muted-foreground ml-1">following</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{user.rating}</span>
                    <span className="text-muted-foreground">({user.totalSales} sales)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="items">Items ({userItems.length})</TabsTrigger>
            <TabsTrigger value="sold">Sold ({userItems.filter((item) => item.status === "sold").length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userItems
                .filter((item) => item.status === "active")
                .map((item) => (
                  <Card
                    key={item.id}
                    className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden"
                  >
                    <div className="relative">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        width={250}
                        height={300}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.title}</h3>

                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">${item.price}</span>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span className="text-xs text-muted-foreground">{item.likes}</span>
                        </div>
                      </div>

                      <Badge variant="outline" className="text-xs">
                        {item.condition}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="sold" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userItems
                .filter((item) => item.status === "sold")
                .map((item) => (
                  <Card key={item.id} className="relative overflow-hidden opacity-75">
                    <div className="relative">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        width={250}
                        height={300}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge className="bg-green-500 hover:bg-green-500">SOLD</Badge>
                      </div>
                    </div>

                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.title}</h3>
                      <span className="font-bold text-lg">${item.price}</span>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{review.buyer.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">@{review.buyer}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>

                    <p className="text-sm mb-2">{review.comment}</p>
                    <p className="text-xs text-muted-foreground">Item: {review.item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
