"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Volume2, BookOpen, Globe } from "lucide-react"
import { getCulturalTerms, searchCulturalTerms } from "@/lib/supabase/cultural-education"
import { toast } from "@/hooks/use-toast"

interface CulturalTermsGlossaryProps {
  culturalOriginId?: string
  category?: string
  trigger?: React.ReactNode
}

export default function CulturalTermsGlossary({ culturalOriginId, category, trigger }: CulturalTermsGlossaryProps) {
  const [terms, setTerms] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(category || "")

  const categories = ["clothing", "accessory", "technique", "ceremony", "festival", "art", "textile"]

  useEffect(() => {
    fetchTerms()
  }, [culturalOriginId, selectedCategory])

  const fetchTerms = async () => {
    setLoading(true)
    try {
      const data = await getCulturalTerms(culturalOriginId, selectedCategory || undefined)
      setTerms(data || [])
    } catch (error) {
      console.error("Error fetching terms:", error)
      toast({
        title: "Error",
        description: "Failed to load cultural terms.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchTerms()
      return
    }

    setLoading(true)
    try {
      const data = await searchCulturalTerms(searchQuery)
      setTerms(data || [])
    } catch (error) {
      console.error("Error searching terms:", error)
      toast({
        title: "Error",
        description: "Failed to search cultural terms.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const playPronunciation = (term: string, pronunciation?: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(pronunciation || term)
      utterance.rate = 0.7
      speechSynthesis.speak(utterance)
    } else {
      toast({
        title: "Not supported",
        description: "Speech synthesis is not supported in your browser.",
        variant: "destructive",
      })
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <BookOpen className="h-4 w-4 mr-2" />
      Cultural Terms Glossary
    </Button>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Cultural Terms Glossary
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cultural terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              Search
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("")}
            >
              All Categories
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="capitalize"
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Terms List */}
          <ScrollArea className="h-[50vh] pr-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : terms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No cultural terms found.</p>
                {searchQuery && (
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} className="mt-2">
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {terms.map((term) => (
                  <Card key={term.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Term Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold">{term.term}</h3>
                              {term.pronunciation && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => playPronunciation(term.term, term.pronunciation)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Volume2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            {term.pronunciation && (
                              <p className="text-sm text-muted-foreground mb-2">/{term.pronunciation}/</p>
                            )}
                          </div>

                          <div className="flex flex-col gap-1">
                            {term.category && (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {term.category}
                              </Badge>
                            )}
                            {term.cultural_origin?.name && (
                              <Badge variant="outline" className="text-xs">
                                {term.cultural_origin.name}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Definition */}
                        <p className="text-sm leading-relaxed">{term.definition}</p>

                        {/* Related Terms */}
                        {term.related_terms && term.related_terms.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Related Terms:</h4>
                            <div className="flex flex-wrap gap-1">
                              {term.related_terms.map((relatedTerm: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {relatedTerm}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Examples */}
                        {term.examples && term.examples.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Examples:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {term.examples.map((example: string, index: number) => (
                                <li key={index}>• {example}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
