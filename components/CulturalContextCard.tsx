"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BookOpen, Volume2, Calendar, Users, Info, Heart, AlertTriangle } from "lucide-react"
import { getItemCulturalContext, getCulturalGuidelines } from "@/lib/supabase/cultural-education"
import { toast } from "@/hooks/use-toast"

interface CulturalContextCardProps {
  itemId: string
  culturalOriginId?: string
  itemCategory?: string
}

export default function CulturalContextCard({ itemId, culturalOriginId, itemCategory }: CulturalContextCardProps) {
  const [context, setContext] = useState<any>(null)
  const [guidelines, setGuidelines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contextData, guidelinesData] = await Promise.all([
          getItemCulturalContext(itemId),
          getCulturalGuidelines(culturalOriginId, itemCategory),
        ])

        setContext(contextData)
        setGuidelines(guidelinesData || [])
      } catch (error) {
        console.error("Error fetching cultural context:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [itemId, culturalOriginId, itemCategory])

  const playPronunciation = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    } else {
      toast({
        title: "Not supported",
        description: "Speech synthesis is not supported in your browser.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!context && guidelines.length === 0) {
    return null
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Cultural Context & Education
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {context && (
          <>
            {/* Traditional Name & Pronunciation */}
            {context.traditional_name && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">Traditional Name:</h4>
                  <span className="text-lg font-medium">{context.traditional_name}</span>
                  {context.pronunciation_guide && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playPronunciation(context.traditional_name)}
                      className="h-8 w-8 p-0"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {context.pronunciation_guide && (
                  <p className="text-sm text-muted-foreground">Pronunciation: {context.pronunciation_guide}</p>
                )}
              </div>
            )}

            {/* Cultural Significance */}
            {context.cultural_significance && (
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Cultural Significance
                </h4>
                <p className="text-sm leading-relaxed">{context.cultural_significance}</p>
              </div>
            )}

            {/* Historical Period */}
            {context.historical_period && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-sm">
                  <strong>Historical Period:</strong> {context.historical_period}
                </span>
              </div>
            )}

            {/* Appropriate Occasions */}
            {context.appropriate_occasions && context.appropriate_occasions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Appropriate Occasions:</h4>
                <div className="flex flex-wrap gap-2">
                  {context.appropriate_occasions.map((occasion: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {occasion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Expandable Details */}
            {(context.styling_guidelines || context.care_instructions) && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full justify-center"
                >
                  {isExpanded ? "Show Less" : "Show More Details"}
                </Button>

                {isExpanded && (
                  <div className="space-y-4 pt-2">
                    {context.styling_guidelines && (
                      <div>
                        <h5 className="font-medium mb-2">Styling Guidelines:</h5>
                        <p className="text-sm text-muted-foreground">{context.styling_guidelines}</p>
                      </div>
                    )}

                    {context.care_instructions && (
                      <div>
                        <h5 className="font-medium mb-2">Care Instructions:</h5>
                        <p className="text-sm text-muted-foreground">{context.care_instructions}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Cultural Guidelines */}
        {guidelines.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                Cultural Appreciation Guidelines
              </h4>

              <div className="space-y-2">
                {guidelines.slice(0, 2).map((guideline) => (
                  <div
                    key={guideline.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      guideline.severity === "critical"
                        ? "border-l-red-500 bg-red-50"
                        : guideline.severity === "warning"
                          ? "border-l-yellow-500 bg-yellow-50"
                          : "border-l-blue-500 bg-blue-50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {guideline.severity === "critical" && <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />}
                      <div>
                        <h5 className="font-medium text-sm">{guideline.title}</h5>
                        <p className="text-xs text-muted-foreground mt-1">{guideline.description}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {guidelines.length > 2 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        View All Guidelines ({guidelines.length})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Cultural Appreciation Guidelines</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh] pr-4">
                        <div className="space-y-4">
                          {guidelines.map((guideline) => (
                            <div
                              key={guideline.id}
                              className={`p-4 rounded-lg border-l-4 ${
                                guideline.severity === "critical"
                                  ? "border-l-red-500 bg-red-50"
                                  : guideline.severity === "warning"
                                    ? "border-l-yellow-500 bg-yellow-50"
                                    : "border-l-blue-500 bg-blue-50"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {guideline.severity === "critical" && (
                                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                )}
                                <div className="flex-1">
                                  <h5 className="font-medium mb-2">{guideline.title}</h5>
                                  <p className="text-sm text-muted-foreground mb-3">{guideline.description}</p>

                                  {guideline.examples && guideline.examples.length > 0 && (
                                    <div className="mb-3">
                                      <h6 className="font-medium text-sm mb-1">Examples:</h6>
                                      <ul className="text-xs text-muted-foreground space-y-1">
                                        {guideline.examples.map((example: string, index: number) => (
                                          <li key={index}>• {example}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {guideline.resources && guideline.resources.length > 0 && (
                                    <div>
                                      <h6 className="font-medium text-sm mb-1">Learn More:</h6>
                                      <div className="flex flex-wrap gap-1">
                                        {guideline.resources.map((resource: string, index: number) => (
                                          <Badge key={index} variant="outline" className="text-xs">
                                            {resource}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </>
        )}

        {/* Cultural Origin Badge */}
        {context?.cultural_origin_name && (
          <div className="pt-2 border-t">
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {context.cultural_origin_name} Heritage
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
