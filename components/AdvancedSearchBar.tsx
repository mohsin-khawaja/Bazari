"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, X, Clock, Sparkles } from "lucide-react"
import { getSearchHistory } from "@/lib/supabase/recommendations"
import { useAuth } from "@/hooks/useAuth"

interface AdvancedSearchBarProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  culturalContext: any
  onSearch: (query: string) => void
  placeholder?: string
}

export function AdvancedSearchBar({
  value,
  onChange,
  suggestions,
  culturalContext,
  onSearch,
  placeholder = "Search ethnic clothing...",
}: AdvancedSearchBarProps) {
  const { user } = useAuth()
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState<any[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      loadSearchHistory()
    }
  }, [user])

  const loadSearchHistory = async () => {
    if (!user) return

    try {
      const history = await getSearchHistory(user.id)
      setSearchHistory(history)
    } catch (error) {
      console.error("Error loading search history:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setShowSuggestions(newValue.length > 0)
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    onSearch(suggestion)
    setShowSuggestions(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSearch(value.trim())
      setShowSuggestions(false)
    }
  }

  const clearSearch = () => {
    onChange("")
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(value.length > 0 || searchHistory.length > 0)}
            className="pl-10 pr-20 h-12 text-base"
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-12 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2">
            Search
          </Button>
        </div>
      </form>

      {/* Cultural Context Display */}
      {culturalContext && (
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {culturalContext.culture}
          </Badge>
          {culturalContext.occasion && <Badge variant="outline">{culturalContext.occasion}</Badge>}
          {culturalContext.style && <Badge variant="outline">{culturalContext.style}</Badge>}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto">
          <CardContent className="p-2">
            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  AI Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-md text-sm transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </div>
                {searchHistory.slice(0, 5).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(item.query)}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-md text-sm transition-colors"
                  >
                    {item.query}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
