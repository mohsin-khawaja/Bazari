"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, MapPin, Clock, Users, ExternalLink, Heart } from "lucide-react"
import { getUpcomingCulturalEvents, getCulturalEventsByOrigin } from "@/lib/supabase/cultural-education"
import { format, isToday, isTomorrow, isThisWeek } from "date-fns"
import Image from "next/image"

interface CulturalEventCalendarProps {
  culturalOriginId?: string
  compact?: boolean
  maxEvents?: number
}

export default function CulturalEventCalendar({
  culturalOriginId,
  compact = false,
  maxEvents = 5,
}: CulturalEventCalendarProps) {
  const [events, setEvents] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        let data
        if (culturalOriginId) {
          data = await getCulturalEventsByOrigin(culturalOriginId)
        } else {
          data = await getUpcomingCulturalEvents(90) // Next 3 months
        }
        setEvents(data || [])
      } catch (error) {
        console.error("Error fetching cultural events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [culturalOriginId])

  const getDateLabel = (date: string) => {
    const eventDate = new Date(date)
    if (isToday(eventDate)) return "Today"
    if (isTomorrow(eventDate)) return "Tomorrow"
    if (isThisWeek(eventDate)) return format(eventDate, "EEEE")
    return format(eventDate, "MMM d")
  }

  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "festival":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "ceremony":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "celebration":
        return "bg-green-100 text-green-800 border-green-200"
      case "holiday":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-12 w-12 bg-muted rounded"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
            Cultural Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming cultural events found.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayEvents = events.slice(0, maxEvents)

  return (
    <div className="space-y-4">
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-green-600" />
            {culturalOriginId ? "Cultural Events" : "Upcoming Cultural Events"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {displayEvents.map((event) => (
              <div
                key={event.event_id}
                className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedEvent(event)}
              >
                {/* Date Badge */}
                <div className="flex flex-col items-center justify-center min-w-[60px] p-2 bg-primary/10 rounded-lg">
                  <span className="text-xs font-medium text-primary">{format(new Date(event.start_date), "MMM")}</span>
                  <span className="text-lg font-bold text-primary">{format(new Date(event.start_date), "d")}</span>
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold line-clamp-1">{event.title}</h3>
                    <Badge className={`text-xs ${getEventTypeColor(event.event_type)}`}>{event.event_type}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{event.description}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.cultural_origin_name}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getDateLabel(event.start_date)}
                    </div>
                  </div>

                  {/* Traditional Attire Preview */}
                  {event.traditional_attire && event.traditional_attire.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {event.traditional_attire.slice(0, 3).map((attire: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {attire}
                          </Badge>
                        ))}
                        {event.traditional_attire.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{event.traditional_attire.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {events.length > maxEvents && (
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                View All Events ({events.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {selectedEvent.title}
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6">
                {/* Event Image */}
                {selectedEvent.image_url && (
                  <div className="aspect-video relative rounded-lg overflow-hidden">
                    <Image
                      src={selectedEvent.image_url || "/placeholder.svg"}
                      alt={selectedEvent.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Event Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={`${getEventTypeColor(selectedEvent.event_type)}`}>
                      {selectedEvent.event_type}
                    </Badge>
                    <Badge variant="outline">{selectedEvent.cultural_origin_name}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(selectedEvent.start_date), "MMMM d, yyyy")}
                        {selectedEvent.end_date &&
                          selectedEvent.end_date !== selectedEvent.start_date &&
                          ` - ${format(new Date(selectedEvent.end_date), "MMMM d, yyyy")}`}
                      </span>
                    </div>
                    {selectedEvent.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedEvent.description && (
                  <div>
                    <h3 className="font-semibold mb-2">About This Event</h3>
                    <p className="text-sm leading-relaxed">{selectedEvent.description}</p>
                  </div>
                )}

                {/* Cultural Significance */}
                {selectedEvent.significance && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      Cultural Significance
                    </h3>
                    <p className="text-sm leading-relaxed">{selectedEvent.significance}</p>
                  </div>
                )}

                {/* Traditional Attire */}
                {selectedEvent.traditional_attire && selectedEvent.traditional_attire.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Traditional Attire</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedEvent.traditional_attire.map((attire: string, index: number) => (
                        <Badge key={index} variant="secondary" className="justify-center py-2">
                          {attire}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Link */}
                {selectedEvent.external_link && (
                  <div className="p-4 bg-muted rounded-lg">
                    <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                      <a href={selectedEvent.external_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Learn More
                      </a>
                    </Button>
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
