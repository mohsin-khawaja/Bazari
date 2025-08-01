"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  reportedUserId?: string
  reportedItemId?: string
  reportedUserName?: string
  reportedItemTitle?: string
}

const reportTypes = [
  {
    value: 'fraud',
    label: 'Fraud or Scam',
    description: 'Fake items, payment fraud, or deceptive practices',
    priority: 'high'
  },
  {
    value: 'inappropriate_content',
    label: 'Inappropriate Content',
    description: 'Offensive, explicit, or harmful content',
    priority: 'medium'
  },
  {
    value: 'cultural_appropriation',
    label: 'Cultural Appropriation',
    description: 'Misuse or misrepresentation of cultural items',
    priority: 'high'
  },
  {
    value: 'harassment',
    label: 'Harassment or Abuse',
    description: 'Threatening, bullying, or abusive behavior',
    priority: 'urgent'
  },
  {
    value: 'fake_listing',
    label: 'Fake or Misleading Listing',
    description: 'False product information or fake items',
    priority: 'medium'
  },
  {
    value: 'spam',
    label: 'Spam',
    description: 'Unwanted promotional content or repetitive posts',
    priority: 'low'
  }
]

export function ReportModal({ 
  isOpen, 
  onClose, 
  reportedUserId, 
  reportedItemId,
  reportedUserName,
  reportedItemTitle
}: ReportModalProps) {
  const [reportType, setReportType] = useState('')
  const [description, setDescription] = useState('')
  const [evidenceFiles, setEvidenceFiles] = useState<FileList | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async () => {
    if (!reportType || !description.trim()) {
      toast.error('Please select a report type and provide a description')
      return
    }

    setLoading(true)
    try {
      // Upload evidence files if any
      const evidenceUrls: string[] = []
      if (evidenceFiles) {
        for (let i = 0; i < evidenceFiles.length; i++) {
          const file = evidenceFiles[i]
          // Upload file to storage (Supabase Storage or similar)
          const uploadResponse = await uploadEvidenceFile(file)
          evidenceUrls.push(uploadResponse.url)
        }
      }

      // Submit report
      const reportData = {
        reported_user_id: reportedUserId,
        reported_item_id: reportedItemId,
        report_type: reportType,
        description,
        evidence_urls: evidenceUrls,
        additional_info: additionalInfo
      }

      const response = await fetch('/api/trust-safety/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      })

      if (!response.ok) throw new Error('Failed to submit report')

      const result = await response.json()
      
      toast.success('Report submitted successfully. We will review it within 24 hours.')
      onClose()
      resetForm()

    } catch (error) {
      console.error('Report submission error:', error)
      toast.error('Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setReportType('')
    setDescription('')
    setEvidenceFiles(null)
    setAdditionalInfo('')
  }

  const uploadEvidenceFile = async (file: File) => {
    // Mock implementation - replace with actual file upload
    return { url: `https://example.com/evidence/${file.name}` }
  }

  const selectedReportType = reportTypes.find(type => type.value === reportType)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Report Issue
          </DialogTitle>
          <DialogDescription>
            {reportedUserId && `Report user: ${reportedUserName}`}
            {reportedItemId && `Report item: ${reportedItemTitle}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Type Selection */}
          <div>
            <Label htmlFor="report-type">What type of issue are you reporting? *</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{type.label}</span>
                      <Badge 
                        variant={type.priority === 'urgent' ? 'destructive' : 
                                type.priority === 'high' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {type.priority}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedReportType && (
              <p className="text-sm text-gray-600 mt-1">{selectedReportType.description}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Please describe the issue in detail *</Label>
            <Textarea
              id="description"
              placeholder="Provide specific details about what happened, when it occurred, and any relevant context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Evidence Upload */}
          <div>
            <Label>Evidence (Screenshots, Photos, etc.)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload screenshots, photos, or other evidence
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setEvidenceFiles(e.target.files)}
                  className="hidden"
                  id="evidence-upload"
                />
                <Label
                  htmlFor="evidence-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-800"
                >
                  Choose files
                </Label>
              </div>
              {evidenceFiles && evidenceFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Selected files:</p>
                  <div className="space-y-1">
                    {Array.from(evidenceFiles).map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const dt = new DataTransfer()
                            const files = Array.from(evidenceFiles).filter((_, i) => i !== index)
                            files.forEach(file => dt.items.add(file))
                            setEvidenceFiles(dt.files.length > 0 ? dt.files : null)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <Label htmlFor="additional-info">Additional Information</Label>
            <Textarea
              id="additional-info"
              placeholder="Any other relevant information or context..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
            />
          </div>

          {/* Cultural Appropriation Specific Questions */}
          {reportType === 'cultural_appropriation' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Cultural Appropriation Report</h4>
              <div className="space-y-2 text-sm text-yellow-700">
                <p>Please help us understand:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>What cultural tradition or item is being misrepresented?</li>
                  <li>How is it being used inappropriately?</li>
                  <li>What is your connection to this cultural tradition?</li>
                  <li>What would be an appropriate way to handle this item?</li>
                </ul>
              </div>
            </div>
          )}

          {/* Fraud Report Specific */}
          {reportType === 'fraud' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Fraud Report</h4>
              <div className="space-y-2 text-sm text-red-700">
                <p>For fraud reports, please include:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Transaction details (if applicable)</li>
                  <li>Communication records</li>
                  <li>Payment information (without sensitive details)</li>
                  <li>Timeline of events</li>
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}