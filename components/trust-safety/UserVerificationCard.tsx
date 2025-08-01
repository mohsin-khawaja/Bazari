"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Shield, CheckCircle, XCircle, Clock, Upload, Phone, Mail, CreditCard, MapPin, Users } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

interface VerificationStatus {
  id: string
  verification_type: 'phone' | 'email' | 'government_id' | 'social_media' | 'address'
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  submitted_at: string
  notes?: string
}

interface UserVerificationCardProps {
  verifications: VerificationStatus[]
  onVerificationSubmit: (type: string, data: any) => Promise<void>
}

const verificationTypes = [
  {
    type: 'phone',
    icon: Phone,
    title: 'Phone Number',
    description: 'Verify your phone number via SMS',
    trustPoints: 1
  },
  {
    type: 'email',
    icon: Mail,
    title: 'Email Address',
    description: 'Verify your email address',
    trustPoints: 1
  },
  {
    type: 'government_id',
    icon: CreditCard,
    title: 'Government ID',
    description: 'Upload a government-issued photo ID',
    trustPoints: 3
  },
  {
    type: 'address',
    icon: MapPin,
    title: 'Address',
    description: 'Verify your physical address',
    trustPoints: 2
  },
  {
    type: 'social_media',
    icon: Users,
    title: 'Social Media',
    description: 'Link your established social media accounts',
    trustPoints: 1
  }
]

export function UserVerificationCard({ verifications, onVerificationSubmit }: UserVerificationCardProps) {
  const [selectedType, setSelectedType] = useState<string>('')
  const [verificationData, setVerificationData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { user } = useAuth()

  const getVerificationStatus = (type: string) => {
    return verifications.find(v => v.verification_type === type)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Shield className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">Not Started</Badge>
    
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handleSubmitVerification = async () => {
    if (!selectedType || !verificationData) return

    setLoading(true)
    try {
      await onVerificationSubmit(selectedType, verificationData)
      toast.success('Verification submitted successfully!')
      setDialogOpen(false)
      setVerificationData({})
      setSelectedType('')
    } catch (error) {
      toast.error('Failed to submit verification')
    } finally {
      setLoading(false)
    }
  }

  const renderVerificationForm = () => {
    const type = verificationTypes.find(v => v.type === selectedType)
    if (!type) return null

    switch (selectedType) {
      case 'phone':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={verificationData.phone || ''}
                onChange={(e) => setVerificationData({...verificationData, phone: e.target.value})}
              />
            </div>
          </div>
        )

      case 'government_id':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="id-type">ID Type</Label>
              <Select value={verificationData.idType || ''} onValueChange={(value) => setVerificationData({...verificationData, idType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                  <SelectItem value="national_id">National ID</SelectItem>
                  <SelectItem value="state_id">State ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="id-number">ID Number</Label>
              <Input
                id="id-number"
                placeholder="Enter ID number"
                value={verificationData.idNumber || ''}
                onChange={(e) => setVerificationData({...verificationData, idNumber: e.target.value})}
              />
            </div>
            <div>
              <Label>Upload ID Photos</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload front and back of ID</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setVerificationData({...verificationData, files: e.target.files})}
                />
              </div>
            </div>
          </div>
        )

      case 'address':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                placeholder="123 Main St"
                value={verificationData.address || ''}
                onChange={(e) => setVerificationData({...verificationData, address: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={verificationData.city || ''}
                  onChange={(e) => setVerificationData({...verificationData, city: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="postal">Postal Code</Label>
                <Input
                  id="postal"
                  placeholder="12345"
                  value={verificationData.postal || ''}
                  onChange={(e) => setVerificationData({...verificationData, postal: e.target.value})}
                />
              </div>
            </div>
          </div>
        )

      case 'social_media':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select value={verificationData.platform || ''} onValueChange={(value) => setVerificationData({...verificationData, platform: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="profile-url">Profile URL</Label>
              <Input
                id="profile-url"
                placeholder="https://..."
                value={verificationData.profileUrl || ''}
                onChange={(e) => setVerificationData({...verificationData, profileUrl: e.target.value})}
              />
            </div>
          </div>
        )

      default:
        return (
          <div>
            <Label htmlFor="verification-data">Verification Data</Label>
            <Textarea
              id="verification-data"
              placeholder="Enter verification information"
              value={verificationData.data || ''}
              onChange={(e) => setVerificationData({...verificationData, data: e.target.value})}
            />
          </div>
        )
    }
  }

  const totalTrustPoints = verifications.reduce((sum, v) => {
    const type = verificationTypes.find(vt => vt.type === v.verification_type)
    return sum + (v.status === 'approved' ? (type?.trustPoints || 0) : 0)
  }, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Account Verification
        </CardTitle>
        <CardDescription>
          Verify your identity to build trust and unlock features. Trust Score: {totalTrustPoints}/8
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {verificationTypes.map((type) => {
            const Icon = type.icon
            const status = getVerificationStatus(type.type)
            
            return (
              <div key={type.type} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium">{type.title}</h4>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status?.status || '')}
                  {getStatusBadge(status?.status)}
                  {!status && (
                    <Dialog open={dialogOpen && selectedType === type.type} onOpenChange={(open) => {
                      setDialogOpen(open)
                      if (open) setSelectedType(type.type)
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Start
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Verify {type.title}</DialogTitle>
                          <DialogDescription>
                            {type.description} (+{type.trustPoints} trust points)
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {renderVerificationForm()}
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleSubmitVerification} disabled={loading}>
                              {loading ? 'Submitting...' : 'Submit'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}