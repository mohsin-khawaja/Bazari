"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Search, BookOpen, Users, Calendar, Award } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import CulturalTermsGlossary from "@/components/CulturalTermsGlossary"
import ArtisanSpotlight from "@/components/ArtisanSpotlight"
import CulturalEventCalendar from "@/components/CulturalEventCalendar"
import CulturalEducationModule from "@/components/CulturalEducationModule"
import { useAuth } from "@/hooks/useAuth"

export default function CulturalEducationPage() {
  const { user } = useAuth()
  const [cultures, setCultures] = useState<any[]>([])
  const [selectedCulture, setSelectedCulture] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCultures = async () => {
      try {
        const { data } = await supabase.from("cultural_origins").select("*").order("name")
        setCultures(data || [])
      } catch (error) {
        console.error("Error fetching cultures:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCultures()
  }, [])

  const filteredCultures = cultures.filter((culture) => culture.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Bazari</span>
          </Link>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <Users className="h-8 w-8 text-green-600" />
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Cultural Education Center</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn about the rich history, traditions, and significance behind ethnic clothing from cultures around the
            world.
          </p>
        </div>

        {/* Culture Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Explore by Culture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cultures..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCulture === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCulture("")}
                >
                  All Cultures
                </Button>
                {filteredCultures.map((culture) => (
                  <Button
                    key={culture.id}
                    variant={selectedCulture === culture.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCulture(culture.id)}
                  >
                    {culture.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education Content Tabs */}
        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Learning Modules
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Cultural Terms
            </TabsTrigger>
            <TabsTrigger value="artisans" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Master Artisans
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Cultural Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-6">
            <CulturalEducationModule culturalOriginId={selectedCulture || undefined} />
          </TabsContent>

          <TabsContent value="terms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cultural Terms Dictionary</CardTitle>
              </CardHeader>
              <CardContent>
                <CulturalTermsGlossary
                  culturalOriginId={selectedCulture || undefined}
                  trigger={
                    <Button className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Explore Cultural Terms
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="artisans" className="space-y-6">
            <ArtisanSpotlight culturalBackground={selectedCulture || undefined} />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <CulturalEventCalendar culturalOriginId={selectedCulture || undefined} />
          </TabsContent>
        </Tabs>

        {/* User Progress */}
        {user && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                Your Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Complete education modules to track your cultural learning journey!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
