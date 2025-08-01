"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Heart, Shield, Users, Globe } from "lucide-react"
import { acknowledgeCulturalGuidelines } from "@/lib/supabase/reviews"
import { toast } from "@/hooks/use-toast"

interface CulturalGuidelinesModalProps {
  isOpen: boolean
  onClose: () => void
  onAcknowledge: () => void
}

export default function CulturalGuidelinesModal({ isOpen, onClose, onAcknowledge }: CulturalGuidelinesModalProps) {
  const [hasRead, setHasRead] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAcknowledge = async () => {
    if (!hasRead) return

    setIsSubmitting(true)
    try {
      await acknowledgeCulturalGuidelines("1.0")
      onAcknowledge()
      onClose()

      toast({
        title: "Guidelines acknowledged",
        description: "Thank you for helping us maintain a respectful community.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to acknowledge guidelines. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Cultural Appreciation & Community Guidelines
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Introduction */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-semibold text-lg mb-2">Welcome to Bazari</h3>
              <p className="text-sm text-gray-600">
                A marketplace celebrating cultural diversity through authentic fashion and respectful exchange.
              </p>
            </div>

            {/* Core Principles */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Our Core Principles
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <Badge className="mb-2">Appreciation</Badge>
                  <p className="text-sm">
                    Celebrating and honoring cultural traditions with respect, understanding, and proper attribution.
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <Badge variant="outline" className="mb-2">
                    Not Appropriation
                  </Badge>
                  <p className="text-sm">
                    Avoiding the adoption of cultural elements without permission, understanding, or respect.
                  </p>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Community Guidelines
              </h4>

              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h5 className="font-medium text-green-700 mb-1">✅ Do:</h5>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Share the cultural significance and history of items</li>
                    <li>• Credit the cultural origins and artisans</li>
                    <li>• Use respectful language and descriptions</li>
                    <li>• Support authentic sellers from the culture</li>
                    <li>• Ask questions to learn more about cultural context</li>
                    <li>• Report inappropriate content or cultural misrepresentation</li>
                  </ul>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h5 className="font-medium text-red-700 mb-1">❌ Don't:</h5>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Misrepresent the cultural origin of items</li>
                    <li>• Use sacred or ceremonial items as fashion accessories</li>
                    <li>• Make stereotypical or offensive comments</li>
                    <li>• Sell mass-produced imitations as authentic cultural items</li>
                    <li>• Ignore the cultural significance of traditional garments</li>
                    <li>• Use culturally insensitive language or imagery</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Specific Examples */}
            <div>
              <h4 className="font-semibold mb-3">Examples & Context</h4>

              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h5 className="font-medium text-green-800 mb-1">Good Example:</h5>
                  <p className="text-sm text-green-700">
                    "This beautiful sari was handwoven by artisans in West Bengal, India. The intricate patterns
                    represent traditional Bengali motifs passed down through generations. Perfect for cultural
                    celebrations or anyone wanting to honor Indian heritage."
                  </p>
                </div>

                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h5 className="font-medium text-red-800 mb-1">Problematic Example:</h5>
                  <p className="text-sm text-red-700">
                    "Exotic boho dress perfect for festivals! Super trendy ethnic print that goes with everything."
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Issues: Uses "exotic," ignores cultural significance, treats traditional clothing as a trend.
                  </p>
                </div>
              </div>
            </div>

            {/* Reporting */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold mb-2 text-yellow-800">Help Us Maintain Standards</h4>
              <p className="text-sm text-yellow-700 mb-2">
                If you see content that violates these guidelines, please report it. We review all reports and take
                appropriate action.
              </p>
              <p className="text-xs text-yellow-600">
                Our community moderators include cultural consultants who help ensure respectful representation.
              </p>
            </div>

            {/* Consequences */}
            <div>
              <h4 className="font-semibold mb-2">Enforcement</h4>
              <p className="text-sm text-gray-600 mb-2">Violations of these guidelines may result in:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Content removal or editing requirements</li>
                <li>• Educational outreach and guidance</li>
                <li>• Temporary or permanent account restrictions</li>
                <li>• Removal from the platform for severe violations</li>
              </ul>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="acknowledge" checked={hasRead} onCheckedChange={setHasRead} />
            <label htmlFor="acknowledge" className="text-sm">
              I have read and understand these cultural appreciation guidelines and community standards.
            </label>
          </div>

          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleAcknowledge} disabled={!hasRead || isSubmitting} className="flex-1">
              {isSubmitting ? "Acknowledging..." : "I Agree & Continue"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
