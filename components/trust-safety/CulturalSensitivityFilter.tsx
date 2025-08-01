"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Globe, AlertTriangle, Info, Heart, CheckCircle, X, Flag } from "lucide-react"
import { toast } from "sonner"

interface CulturalAnalysis {
  riskScore: number
  flags: string[]
  recommendations: string[]
  culturalContext?: {
    origin: string
    significance: string
    appropriateUse: string[]
    inappropriateUse: string[]
  }
}

interface CulturalSensitivityFilterProps {
  itemTitle: string
  description: string
  culturalTags: string[]
  sellerCulturalBackground: string[]
  onAnalysisComplete?: (analysis: CulturalAnalysis) => void
  showFullAnalysis?: boolean
}

const culturalGuidelines = {
  "Sacred Items": {
    description: "Items with religious or spiritual significance",
    examples: ["Prayer items", "Ceremonial objects", "Religious symbols"],
    guidelines: [
      "Verify the item is appropriate for sale",
      "Consult with cultural or religious authorities",
      "Include proper context and respect"
    ]
  },
  "Traditional Clothing": {
    description: "Clothing with specific cultural meaning",
    examples: ["Ceremonial dress", "Traditional costumes", "Cultural uniforms"],
    guidelines: [
      "Respect the cultural significance",
      "Provide accurate historical context",
      "Avoid misrepresentation or stereotypes"
    ]
  },
  "Artisan Crafts": {
    description: "Handmade items from traditional artisans",
    examples: ["Traditional pottery", "Handwoven textiles", "Cultural art"],
    guidelines: [
      "Credit the artisan and cultural origin",
      "Ensure fair compensation",
      "Preserve traditional techniques"
    ]
  }
}

export function CulturalSensitivityFilter({
  itemTitle,
  description,
  culturalTags,
  sellerCulturalBackground,
  onAnalysisComplete,
  showFullAnalysis = false
}: CulturalSensitivityFilterProps) {
  const [analysis, setAnalysis] = useState<CulturalAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [showGuidelines, setShowGuidelines] = useState(false)
  const [userFeedback, setUserFeedback] = useState('')
  const [flagReason, setFlagReason] = useState('')

  useEffect(() => {
    if (itemTitle && culturalTags.length > 0) {
      performAnalysis()
    }
  }, [itemTitle, description, culturalTags, sellerCulturalBackground])

  const performAnalysis = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/trust-safety/cultural-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemTitle,
          description,
          culturalTags,
          sellerCulturalBackground
        })
      })

      if (!response.ok) throw new Error('Analysis failed')

      const result = await response.json()
      const analysisResult: CulturalAnalysis = {
        riskScore: result.riskScore,
        flags: result.flags,
        recommendations: result.recommendations
      }

      setAnalysis(analysisResult)
      onAnalysisComplete?.(analysisResult)

    } catch (error) {
      console.error('Cultural analysis error:', error)
      toast.error('Failed to analyze cultural sensitivity')
    } finally {
      setLoading(false)
    }
  }

  const submitCulturalFlag = async () => {
    if (!flagReason.trim()) {
      toast.error('Please provide a reason for flagging')
      return
    }

    try {
      const response = await fetch('/api/trust-safety/cultural-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemTitle,
          culturalOrigin: culturalTags[0],
          flagType: 'cultural_appropriation',
          description: flagReason,
          severity: analysis?.riskScore && analysis.riskScore > 0.7 ? 'high' : 'medium'
        })
      })

      if (!response.ok) throw new Error('Failed to submit flag')

      toast.success('Cultural sensitivity concern submitted for review')
      setFlagReason('')
    } catch (error) {
      console.error('Flag submission error:', error)
      toast.error('Failed to submit concern')
    }
  }

  const getRiskLevel = (score: number) => {
    if (score >= 0.8) return { level: 'High', color: 'text-red-600', bg: 'bg-red-50 border-red-200' }
    if (score >= 0.5) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' }
    if (score >= 0.2) return { level: 'Low', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' }
    return { level: 'Minimal', color: 'text-green-600', bg: 'bg-green-50 border-green-200' }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Analyzing cultural sensitivity...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) return null

  const risk = getRiskLevel(analysis.riskScore)

  return (
    <div className="space-y-4">
      {/* Risk Assessment Card */}
      <Card className={`border-2 ${risk.bg}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Cultural Sensitivity Assessment
            </CardTitle>
            <Badge className={`${risk.color} bg-transparent border-current`}>
              {risk.level} Risk
            </Badge>
          </div>
          <CardDescription>
            Risk Score: {(analysis.riskScore * 100).toFixed(0)}% 
            {culturalTags.length > 0 && ` • Cultural Origins: ${culturalTags.join(', ')}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Flags */}
          {analysis.flags.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Concerns Identified
              </h4>
              <ul className="space-y-1">
                {analysis.flags.map((flag, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Recommendations
              </h4>
              <ul className="space-y-1">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGuidelines(true)}
            >
              <Info className="h-4 w-4 mr-1" />
              View Guidelines
            </Button>
            
            {analysis.riskScore > 0.3 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Flag className="h-4 w-4 mr-1" />
                    Report Concern
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report Cultural Sensitivity Concern</DialogTitle>
                    <DialogDescription>
                      Help us maintain cultural respect by reporting concerns
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Reason for concern:</label>
                      <Textarea
                        placeholder="Please explain your cultural sensitivity concern..."
                        value={flagReason}
                        onChange={(e) => setFlagReason(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setFlagReason('')}>
                        Cancel
                      </Button>
                      <Button onClick={submitCulturalFlag}>
                        Submit Concern
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* High Risk Warning */}
      {analysis.riskScore >= 0.8 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>High Cultural Sensitivity Risk Detected</strong>
            <br />
            This item may involve cultural appropriation or misrepresentation. 
            Please review our cultural guidelines and consider the impact on the 
            communities these traditions come from.
          </AlertDescription>
        </Alert>
      )}

      {/* Cultural Guidelines Modal */}
      <Dialog open={showGuidelines} onOpenChange={setShowGuidelines}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cultural Sensitivity Guidelines</DialogTitle>
            <DialogDescription>
              Guidelines for respectful cultural exchange and avoiding appropriation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {Object.entries(culturalGuidelines).map(([category, info]) => (
              <div key={category}>
                <h3 className="font-semibold text-lg mb-2">{category}</h3>
                <p className="text-sm text-gray-600 mb-3">{info.description}</p>
                
                <div className="mb-3">
                  <h4 className="font-medium text-sm mb-1">Examples:</h4>
                  <div className="flex flex-wrap gap-1">
                    {info.examples.map((example, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Guidelines:</h4>
                  <ul className="space-y-1">
                    {info.guidelines.map((guideline, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        {guideline}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Remember:</h4>
              <p className="text-sm text-blue-700">
                Cultural appreciation involves learning about, respecting, and properly 
                crediting other cultures. Cultural appropriation involves taking elements 
                from a culture without permission, understanding, or respect, especially 
                when it perpetuates stereotypes or is profitable without benefiting the 
                originating community.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}