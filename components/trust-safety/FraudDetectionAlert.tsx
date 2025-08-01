"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, Shield, TrendingDown, DollarSign, MapPin, Clock, X } from "lucide-react"

interface FraudAlert {
  id: string
  alert_type: 'suspicious_payment' | 'fake_listing' | 'account_takeover' | 'price_manipulation'
  risk_score: number
  status: 'active' | 'resolved' | 'false_positive'
  metadata: {
    payment_data?: any
    item_data?: any
    fraud_factors?: any
    location_data?: any
  }
  created_at: string
}

interface FraudDetectionAlertProps {
  userId?: string
  showAllAlerts?: boolean
  onAlertAction?: (alertId: string, action: 'resolve' | 'escalate' | 'dismiss') => void
}

export function FraudDetectionAlert({ 
  userId, 
  showAllAlerts = false,
  onAlertAction 
}: FraudDetectionAlertProps) {
  const [alerts, setAlerts] = useState<FraudAlert[]>([])
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFraudAlerts()
  }, [userId])

  const loadFraudAlerts = async () => {
    try {
      const url = showAllAlerts ? '/api/admin/fraud-alerts' : '/api/trust-safety/fraud-alerts'
      const response = await fetch(url)
      
      if (!response.ok) throw new Error('Failed to load fraud alerts')
      
      const data = await response.json()
      setAlerts(data.alerts || [])
    } catch (error) {
      console.error('Load fraud alerts error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAlertAction = async (alertId: string, action: 'resolve' | 'escalate' | 'dismiss') => {
    try {
      const response = await fetch(`/api/trust-safety/fraud-alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (!response.ok) throw new Error('Failed to update alert')

      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: action === 'resolve' ? 'resolved' : alert.status }
          : alert
      ))

      if (onAlertAction) {
        onAlertAction(alertId, action)
      }

    } catch (error) {
      console.error('Alert action error:', error)
    }
  }

  const getRiskLevel = (score: number) => {
    if (score >= 0.8) return { level: 'Critical', color: 'text-red-600', bg: 'bg-red-50' }
    if (score >= 0.6) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-50' }
    if (score >= 0.4) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { level: 'Low', color: 'text-blue-600', bg: 'bg-blue-50' }
  }

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'suspicious_payment':
        return <DollarSign className="h-5 w-5" />
      case 'fake_listing':
        return <AlertTriangle className="h-5 w-5" />
      case 'account_takeover':
        return <Shield className="h-5 w-5" />
      case 'price_manipulation':
        return <TrendingDown className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getAlertTitle = (alertType: string) => {
    switch (alertType) {
      case 'suspicious_payment':
        return 'Suspicious Payment Activity'
      case 'fake_listing':
        return 'Potential Fake Listing'
      case 'account_takeover':
        return 'Account Security Alert'
      case 'price_manipulation':
        return 'Price Manipulation Detected'
      default:
        return 'Security Alert'
    }
  }

  const activeAlerts = alerts.filter(alert => alert.status === 'active')
  const highRiskAlerts = activeAlerts.filter(alert => alert.risk_score >= 0.6)

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  // Show summary alert for high-risk alerts
  if (!showAllAlerts && highRiskAlerts.length > 0) {
    return (
      <Alert className="border-red-200 bg-red-50 mb-6">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="flex items-center justify-between">
            <div>
              <strong>Security Alert:</strong> {highRiskAlerts.length} high-risk fraud alert{highRiskAlerts.length > 1 ? 's' : ''} detected.
              <div className="mt-1 text-sm">
                Review your account activity and recent transactions for any suspicious behavior.
              </div>
            </div>
            <Button 
              size="sm" 
              onClick={() => window.location.href = '/trust-safety'}
              className="ml-4"
            >
              Review Alerts
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (!showAllAlerts) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fraud Detection</h2>
          <p className="text-gray-600">Monitor and manage security alerts</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={activeAlerts.length > 0 ? "destructive" : "secondary"}>
            {activeAlerts.length} Active
          </Badge>
          <Badge variant="outline">
            {alerts.filter(a => a.status === 'resolved').length} Resolved
          </Badge>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="space-y-4">
        {activeAlerts.map((alert) => {
          const risk = getRiskLevel(alert.risk_score)
          
          return (
            <Card key={alert.id} className={`border-l-4 ${risk.bg} border-l-red-500`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getAlertIcon(alert.alert_type)}
                    {getAlertTitle(alert.alert_type)}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={`${risk.color} bg-transparent border-current`}>
                      {risk.level} Risk
                    </Badge>
                    <Badge variant="outline">
                      Score: {Math.round(alert.risk_score * 100)}%
                    </Badge>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(alert.created_at).toLocaleString()}
                  </span>
                  <span>Alert ID: {alert.id.slice(0, 8)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Fraud Factors */}
                  {alert.metadata.fraud_factors && (
                    <div>
                      <h4 className="font-medium mb-2">Risk Factors:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(alert.metadata.fraud_factors).map(([factor, detected]) => (
                          <div key={factor} className={`flex items-center gap-2 ${detected ? 'text-red-600' : 'text-gray-600'}`}>
                            {detected ? <AlertTriangle className="h-3 w-3" /> : <div className="h-3 w-3" />}
                            <span className="capitalize">{factor.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Data */}
                  {alert.metadata.payment_data && (
                    <div>
                      <h4 className="font-medium mb-2">Transaction Details:</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <div>Amount: ${alert.metadata.payment_data.amount}</div>
                        {alert.metadata.payment_data.billing_address && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            Location: {alert.metadata.payment_data.billing_address.city || 'Unknown'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => setSelectedAlert(alert)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAlertAction(alert.id, 'resolve')}
                    >
                      Mark Resolved
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAlertAction(alert.id, 'dismiss')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {activeAlerts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Fraud Alerts</h3>
              <p className="text-gray-600">Your account security looks good!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getAlertIcon(selectedAlert.alert_type)}
                {getAlertTitle(selectedAlert.alert_type)}
              </DialogTitle>
              <DialogDescription>
                Alert ID: {selectedAlert.id} • Risk Score: {Math.round(selectedAlert.risk_score * 100)}%
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Alert Details</h4>
                <div className="bg-gray-50 p-4 rounded">
                  <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedAlert.metadata, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    handleAlertAction(selectedAlert.id, 'resolve')
                    setSelectedAlert(null)
                  }}
                >
                  Mark Resolved
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}