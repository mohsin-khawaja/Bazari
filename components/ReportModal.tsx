"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Flag, Shield, AlertTriangle } from "lucide-react"
import { reportContent, flagCulturalSensitivity } from "@/lib/supabase/reviews"
import { toast } from "@/hooks/use-toast"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  targetType: "item" | "user" | "review"
  targetId: string
  targetTitle?: string
}

export default function ReportModal({ isOpen, onClose, targetType, targetId, targetTitle }: ReportModalProps) {
  const [reportType, setReportType] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reportTypes = {
    item: [
      { value: "cultural_appropriation", label: "Cultural Appropriation", icon: Shield, severity: "high" },
      { value: "misrepresentation", label: "Cultural Misrepresentation", icon: AlertTriangle, severity: "medium" },
      { value: "fake_item", label: "Counterfeit/Fake Item", icon: Flag, severity: "medium" },
      { value: "inappropriate_content", label: "Inappropriate Content", icon: Flag, severity: "low" },
      { value: "spam", label: "Spam or Misleading", icon: Flag, severity: "low" },
    ],
    user: [
      { value: "harassment", label: "Harassment or Bullying", icon: Flag, severity: "high" },
      { value: "cultural_insensitivity", label: "Cultural Insensitivity", icon: Shield, severity: "high" },
      { value: "inappropriate_behavior", label: "Inappropriate Behavior", icon: Flag, severity: "medium" },
      { value: "spam", label: "Spam or Scam", icon: Flag, severity: "medium" },
      { value: "fake_profile", label: "Fake Profile", icon: Flag, severity: "low" },
    ],
    review: [
      { value: "cultural_insensitivity", label: "Cultural Insensitivity", icon: Shield, severity: "high" },
      { value: "harassment", label: "Harassment", icon: Flag, severity: "high" },
      { value: "fake_review", label: "Fake Review", icon: Flag, severity: "medium" },
      { value: "inappropriate_content", label: "Inappropriate Content", icon: Flag, severity: "medium" },
      { value: "spam", label: "Spam", icon: Flag, severity: "low" },
    ],
  }

  const handleSubmit = async () => {
    if (!reportType || !description.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a report type and provide a description.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const selectedType = reportTypes[targetType].find((t) => t.value === reportType)

      if (
        selectedType &&
        (reportType === "cultural_appropriation" ||
          reportType === "cultural_insensitivity" ||
          reportType === "misrepresentation")
      ) {
        // Submit as cultural sensitivity flag
        await flagCulturalSensitivity({
          type: targetType,
          targetId,
          flagType: reportType,
          description,
          severity: selectedType.severity as "low" | "medium" | "high" | "critical",
        })
      } else {
        // Submit as regular report
        await reportContent({
          type: targetType,
          targetId,
          reportType,
          reason: `User reported ${targetType} for: ${reportType}`,
          description,
        })
      }

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe and respectful.",
      })

      onClose()
      setReportType("")
      setDescription("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedTypeData = reportTypes[targetType].find((t) => t.value === reportType)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-600" />
            Report {targetType === "item" ? "Item" : targetType === "user" ? "User" : "Review"}
          </DialogTitle>
          {targetTitle && <p className="text-sm text-muted-foreground">"{targetTitle}"</p>}
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">What's the issue?</Label>
            <RadioGroup value={reportType} onValueChange={setReportType}>
              {reportTypes[targetType].map((type) => {
                const Icon = type.icon
                return (
                  <div key={type.value} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value} className="flex items-center gap-2 cursor-pointer flex-1">
                      <Icon
                        className={`h-4 w-4 ${
                          type.severity === "high"
                            ? "text-red-500"
                            : type.severity === "medium"
                              ? "text-orange-500"
                              : "text-gray-500"
                        }`}
                      />
                      {type.label}
                      {(type.value.includes("cultural") || type.value === "misrepresentation") && (
                        <Badge variant="outline" className="text-xs">
                          Cultural
                        </Badge>
                      )}
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          {selectedTypeData &&
            (selectedTypeData.value.includes("cultural") || selectedTypeData.value === "misrepresentation") && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Cultural Sensitivity Report</span>
                </div>
                <p className="text-xs text-blue-700">
                  This report will be reviewed by our cultural sensitivity team to ensure respectful representation.
                </p>
              </div>
            )}

          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Please provide more details
            </Label>
            <Textarea
              id="description"
              placeholder="Help us understand the issue better..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            Reports are reviewed by our moderation team. False reports may result in account restrictions.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!reportType || !description.trim() || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
