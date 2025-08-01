"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Scale, MessageCircle, Upload, AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

interface Dispute {
  id: string
  order_id: string
  complainant_id: string
  respondent_id: string
  dispute_type: 'item_not_received' | 'item_not_as_described' | 'damaged_item' | 'return_issue'
  status: 'open' | 'investigating' | 'resolved' | 'escalated'
  description: string
  evidence_urls: string[]
  resolution?: string
  created_at: string
  resolved_at?: string
  order: {
    id: string
    item_title: string
    total_amount: number
    item: {
      title: string
      item_images: { image_url: string }[]
    }
  }
  complainant: {
    username: string
    full_name: string
  }
  respondent: {
    username: string
    full_name: string
  }
}

interface DisputeMessage {
  id: string
  dispute_id: string
  sender_id: string
  message: string
  attachments: string[]
  created_at: string
  sender: {
    username: string
    full_name: string
    avatar_url?: string
  }
}

export function DisputeResolutionCenter() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [disputeMessages, setDisputeMessages] = useState<DisputeMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')
  const { user } = useAuth()

  useEffect(() => {
    loadDisputes()
  }, [])

  const loadDisputes = async () => {
    try {
      const response = await fetch('/api/trust-safety/disputes')
      if (!response.ok) throw new Error('Failed to load disputes')
      
      const data = await response.json()
      setDisputes(data.disputes)
    } catch (error) {
      console.error('Load disputes error:', error)
      toast.error('Failed to load disputes')
    } finally {
      setLoading(false)
    }
  }

  const loadDisputeMessages = async (disputeId: string) => {
    try {
      const response = await fetch(`/api/trust-safety/disputes/${disputeId}/messages`)
      if (!response.ok) throw new Error('Failed to load messages')
      
      const data = await response.json()
      setDisputeMessages(data.messages)
    } catch (error) {
      console.error('Load messages error:', error)
      toast.error('Failed to load dispute messages')
    }
  }

  const sendMessage = async () => {
    if (!selectedDispute || !newMessage.trim()) return

    try {
      const response = await fetch(`/api/trust-safety/disputes/${selectedDispute.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage })
      })

      if (!response.ok) throw new Error('Failed to send message')

      setNewMessage('')
      await loadDisputeMessages(selectedDispute.id)
      toast.success('Message sent')
    } catch (error) {
      console.error('Send message error:', error)
      toast.error('Failed to send message')
    }
  }

  const createDispute = async (orderData: any) => {
    try {
      const response = await fetch('/api/trust-safety/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) throw new Error('Failed to create dispute')

      toast.success('Dispute created successfully')
      await loadDisputes()
    } catch (error) {
      console.error('Create dispute error:', error)
      toast.error('Failed to create dispute')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'investigating':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'escalated':
        return <Scale className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-yellow-100 text-yellow-800">Open</Badge>
      case 'investigating':
        return <Badge className="bg-orange-100 text-orange-800">Investigating</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      case 'escalated':
        return <Badge variant="destructive">Escalated</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDisputeTypeLabel = (type: string) => {
    switch (type) {
      case 'item_not_received':
        return 'Item Not Received'
      case 'item_not_as_described':
        return 'Item Not As Described'
      case 'damaged_item':
        return 'Damaged Item'
      case 'return_issue':
        return 'Return Issue'
      default:
        return type
    }
  }

  const activeDisputes = disputes.filter(d => d.status !== 'resolved')
  const resolvedDisputes = disputes.filter(d => d.status === 'resolved')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dispute Resolution Center</h2>
          <p className="text-gray-600">Resolve issues with orders and transactions</p>
        </div>
        <CreateDisputeDialog onDisputeCreated={loadDisputes} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">
            Active Disputes ({activeDisputes.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedDisputes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeDisputes.map((dispute) => (
            <DisputeCard
              key={dispute.id}
              dispute={dispute}
              onSelect={(dispute) => {
                setSelectedDispute(dispute)
                loadDisputeMessages(dispute.id)
              }}
              currentUserId={user?.id}
            />
          ))}
          {activeDisputes.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Scale className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Disputes</h3>
                <p className="text-gray-600">You don't have any active disputes at the moment.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedDisputes.map((dispute) => (
            <DisputeCard
              key={dispute.id}
              dispute={dispute}
              onSelect={(dispute) => {
                setSelectedDispute(dispute)
                loadDisputeMessages(dispute.id)
              }}
              currentUserId={user?.id}
            />
          ))}
        </TabsContent>
      </Tabs>

      {/* Dispute Detail Modal */}
      {selectedDispute && (
        <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getStatusIcon(selectedDispute.status)}
                Dispute #{selectedDispute.id.slice(0, 8)}
              </DialogTitle>
              <DialogDescription>
                {getDisputeTypeLabel(selectedDispute.dispute_type)} - {selectedDispute.order.item_title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Dispute Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedDispute.status)}</div>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="mt-1 text-sm">{new Date(selectedDispute.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Order Total</Label>
                  <p className="mt-1 text-sm font-medium">${selectedDispute.order.total_amount}</p>
                </div>
                <div>
                  <Label>Item</Label>
                  <p className="mt-1 text-sm">{selectedDispute.order.item.title}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{selectedDispute.description}</p>
              </div>

              {/* Messages */}
              <div>
                <Label>Communication</Label>
                <div className="mt-2 space-y-3 max-h-60 overflow-y-auto border rounded p-4">
                  {disputeMessages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.sender.avatar_url} />
                        <AvatarFallback>
                          {message.sender.full_name?.charAt(0) || message.sender.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{message.sender.full_name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Send Message */}
                {selectedDispute.status !== 'resolved' && (
                  <div className="mt-3 flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function DisputeCard({ 
  dispute, 
  onSelect, 
  currentUserId 
}: { 
  dispute: Dispute; 
  onSelect: (dispute: Dispute) => void; 
  currentUserId?: string;
}) {
  const isComplainant = currentUserId === dispute.complainant_id
  const otherParty = isComplainant ? dispute.respondent : dispute.complainant

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelect(dispute)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(dispute.status)}
            <div>
              <CardTitle className="text-lg">
                {getDisputeTypeLabel(dispute.dispute_type)}
              </CardTitle>
              <CardDescription>
                Order #{dispute.order_id.slice(0, 8)} • {dispute.order.item_title}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(dispute.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {isComplainant ? 'With' : 'From'}: {otherParty.full_name}
            </span>
            <Badge variant="outline" className="text-xs">
              ${dispute.order.total_amount}
            </Badge>
          </div>
          <span className="text-sm text-gray-500">
            {new Date(dispute.created_at).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{dispute.description}</p>
      </CardContent>
    </Card>
  )
}

function CreateDisputeDialog({ onDisputeCreated }: { onDisputeCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    orderId: '',
    disputeType: '',
    description: ''
  })

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/trust-safety/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to create dispute')

      toast.success('Dispute created successfully')
      setOpen(false)
      setFormData({ orderId: '', disputeType: '', description: '' })
      onDisputeCreated()
    } catch (error) {
      console.error('Create dispute error:', error)
      toast.error('Failed to create dispute')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Scale className="h-4 w-4 mr-2" />
          Create Dispute
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Dispute</DialogTitle>
          <DialogDescription>
            Create a dispute for an order that has issues
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="order-id">Order ID</Label>
            <input
              id="order-id"
              type="text"
              placeholder="Enter order ID"
              value={formData.orderId}
              onChange={(e) => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <Label htmlFor="dispute-type">Dispute Type</Label>
            <Select value={formData.disputeType} onValueChange={(value) => setFormData(prev => ({ ...prev, disputeType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select dispute type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="item_not_received">Item Not Received</SelectItem>
                <SelectItem value="item_not_as_described">Item Not As Described</SelectItem>
                <SelectItem value="damaged_item">Damaged Item</SelectItem>
                <SelectItem value="return_issue">Return Issue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Create Dispute</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}