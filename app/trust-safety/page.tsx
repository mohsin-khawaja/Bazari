"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Shield, AlertTriangle, CheckCircle, Scale, Flag, Users, TrendingUp, Eye } from "lucide-react"
import { UserVerificationCard } from "@/components/trust-safety/UserVerificationCard"
import { DisputeResolutionCenter } from "@/components/trust-safety/DisputeResolutionCenter"
import { ReportModal } from "@/components/trust-safety/ReportModal"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

interface TrustScore {
  overall_score: number
  verification_score: number
  transaction_score: number
  community_score: number
  cultural_sensitivity_score: number
  total_transactions: number
  successful_transactions: number
  disputes_raised: number
  reports_received: number
  verified_cultural_items: number
}

interface SecurityStats {
  activeReports: number
  resolvedReports: number
  activeDisputes: number
  blockedUsers: number
  verificationsPending: number
  fraudAlertsActive: number
}

export default function TrustSafetyPage() {
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null)
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null)
  const [verifications, setVerifications] = useState([])
  const [blockedUsers, setBlockedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    loadTrustSafetyData()
  }, [])

  const loadTrustSafetyData = async () => {
    try {
      const [trustResponse, statsResponse, verificationsResponse, blockedResponse] = await Promise.all([
        fetch('/api/trust-safety/trust-score'),
        fetch('/api/trust-safety/stats'),
        fetch('/api/trust-safety/verifications'),
        fetch('/api/trust-safety/blocked-users')
      ])

      if (trustResponse.ok) {
        const trustData = await trustResponse.json()
        setTrustScore(trustData.trustScore)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setSecurityStats(statsData.stats)
      }

      if (verificationsResponse.ok) {
        const verificationData = await verificationsResponse.json()
        setVerifications(verificationData.verifications)
      }

      if (blockedResponse.ok) {
        const blockedData = await blockedResponse.json()
        setBlockedUsers(blockedData.blockedUsers)
      }

    } catch (error) {
      console.error('Load trust safety data error:', error)
      toast.error('Failed to load security information')
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationSubmit = async (type: string, data: any) => {
    try {
      const response = await fetch('/api/trust-safety/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationType: type, verificationData: data })
      })

      if (!response.ok) throw new Error('Verification submission failed')

      await loadTrustSafetyData()
      toast.success('Verification submitted successfully')
    } catch (error) {
      console.error('Verification submission error:', error)
      throw error
    }
  }

  const unblockUser = async (blockedUserId: string) => {
    try {
      const response = await fetch('/api/trust-safety/block-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedUserId })
      })

      if (!response.ok) throw new Error('Unblock failed')

      await loadTrustSafetyData()
      toast.success('User unblocked successfully')
    } catch (error) {
      console.error('Unblock error:', error)
      toast.error('Failed to unblock user')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span>Loading security information...</span>
        </div>
      </div>
    )
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Fair'
    return 'Needs Improvement'
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trust & Safety</h1>
          <p className="text-gray-600">Manage your account security and build trust with the community</p>
        </div>
        <Button onClick={() => setReportModalOpen(true)}>
          <Flag className="h-4 w-4 mr-2" />
          Report Issue
        </Button>
      </div>

      {/* Trust Score Overview */}
      {trustScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className={`h-5 w-5 ${getTrustScoreColor(trustScore.overall_score)}`} />
              Your Trust Score
            </CardTitle>
            <CardDescription>
              Build trust with buyers and sellers through verification and positive interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getTrustScoreColor(trustScore.overall_score)}`}>
                  {trustScore.overall_score.toFixed(1)}/10
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {getScoreLabel(trustScore.overall_score)}
                </div>
                <Progress 
                  value={trustScore.overall_score * 10} 
                  className="mt-2" 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Verification</span>
                  <span>{trustScore.verification_score.toFixed(1)}/10</span>
                </div>
                <Progress value={trustScore.verification_score * 10} />
                
                <div className="flex justify-between text-sm">
                  <span>Transactions</span>
                  <span>{trustScore.transaction_score.toFixed(1)}/10</span>
                </div>
                <Progress value={trustScore.transaction_score * 10} />
                
                <div className="flex justify-between text-sm">
                  <span>Community</span>
                  <span>{trustScore.community_score.toFixed(1)}/10</span>
                </div>
                <Progress value={trustScore.community_score * 10} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Successful Transactions</span>
                  <Badge variant="outline">
                    {trustScore.successful_transactions}/{trustScore.total_transactions}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cultural Items Verified</span>
                  <Badge variant="outline">{trustScore.verified_cultural_items}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Disputes</span>
                  <Badge variant={trustScore.disputes_raised > 0 ? "destructive" : "secondary"}>
                    {trustScore.disputes_raised}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Stats */}
      {securityStats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <div className="text-2xl font-bold">{securityStats.activeReports}</div>
              <div className="text-xs text-gray-600">Active Reports</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold">{securityStats.resolvedReports}</div>
              <div className="text-xs text-gray-600">Resolved Reports</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Scale className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold">{securityStats.activeDisputes}</div>
              <div className="text-xs text-gray-600">Active Disputes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto text-red-600 mb-2" />
              <div className="text-2xl font-bold">{securityStats.blockedUsers}</div>
              <div className="text-xs text-gray-600">Blocked Users</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <div className="text-2xl font-bold">{securityStats.verificationsPending}</div>
              <div className="text-xs text-gray-600">Pending Verifications</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold">{securityStats.fraudAlertsActive}</div>
              <div className="text-xs text-gray-600">Fraud Alerts</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="verification" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="verification">
          <UserVerificationCard 
            verifications={verifications}
            onVerificationSubmit={handleVerificationSubmit}
          />
        </TabsContent>

        <TabsContent value="disputes">
          <DisputeResolutionCenter />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blocked Users</CardTitle>
              <CardDescription>
                Users you have blocked from contacting you or viewing your items
              </CardDescription>
            </CardHeader>
            <CardContent>
              {blockedUsers.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No blocked users</p>
              ) : (
                <div className="space-y-3">
                  {blockedUsers.map((blockedUser: any) => (
                    <div key={blockedUser.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{blockedUser.blocked_user.full_name}</div>
                        <div className="text-sm text-gray-600">@{blockedUser.blocked_user.username}</div>
                        {blockedUser.reason && (
                          <div className="text-xs text-gray-500 mt-1">Reason: {blockedUser.reason}</div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unblockUser(blockedUser.blocked_user_id)}
                      >
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Your Reports</CardTitle>
              <CardDescription>
                Reports you have submitted and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 py-8">
                Your report history will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  )
}