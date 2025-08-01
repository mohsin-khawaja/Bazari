"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Heart, Shield, Users, Globe, Flag, CheckCircle, XCircle, AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Bazari</span>
          </Link>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <Heart className="h-8 w-8 text-red-500" />
            <Globe className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Community Guidelines</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Building a respectful marketplace that celebrates cultural diversity through authentic fashion and
            meaningful exchange.
          </p>
        </div>

        {/* Core Values */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Our Core Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Cultural Respect</h3>
                <p className="text-sm text-muted-foreground">
                  Honoring traditions, stories, and the cultural significance behind every piece.
                </p>
              </div>
              <div className="text-center">
                <Users className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Authentic Community</h3>
                <p className="text-sm text-muted-foreground">
                  Supporting genuine sellers and fostering meaningful connections.
                </p>
              </div>
              <div className="text-center">
                <Globe className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Global Understanding</h3>
                <p className="text-sm text-muted-foreground">
                  Learning from each other and celebrating our diverse world.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cultural Appreciation vs Appropriation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Cultural Appreciation vs. Appropriation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Cultural Appreciation</h3>
                </div>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• Learning about and respecting cultural significance</li>
                  <li>• Supporting authentic sellers from the culture</li>
                  <li>• Giving proper credit and context</li>
                  <li>• Understanding when and how items should be worn</li>
                  <li>• Engaging with cultural communities respectfully</li>
                  <li>• Acknowledging the history and meaning</li>
                </ul>
              </div>

              <div className="p-4 border-2 border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">Cultural Appropriation</h3>
                </div>
                <ul className="space-y-2 text-sm text-red-700">
                  <li>• Taking cultural elements without permission</li>
                  <li>• Ignoring sacred or ceremonial significance</li>
                  <li>• Profiting without benefiting the originating culture</li>
                  <li>• Misrepresenting or stereotyping cultures</li>
                  <li>• Using "exotic" or fetishizing language</li>
                  <li>• Treating traditions as costumes or trends</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">When in Doubt</h4>
              </div>
              <p className="text-sm text-yellow-700">
                Ask yourself: Am I learning about and honoring this culture, or am I just taking what I like? When
                unsure, research the cultural significance and consider reaching out to community members for guidance.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Specific Guidelines */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Specific Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sellers */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">For Sellers</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">✅ Do:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Share the story and cultural significance</li>
                    <li>• Use authentic, respectful descriptions</li>
                    <li>• Credit artisans and cultural origins</li>
                    <li>• Provide care instructions for traditional items</li>
                    <li>• Be transparent about item authenticity</li>
                    <li>• Educate buyers about appropriate use</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-red-700 mb-2">❌ Don't:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Misrepresent cultural origins</li>
                    <li>• Use stereotypical or exotic language</li>
                    <li>• Sell sacred items as fashion accessories</li>
                    <li>• Make false authenticity claims</li>
                    <li>• Ignore cultural context in descriptions</li>
                    <li>• Appropriate designs without permission</li>
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            {/* Buyers */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">For Buyers</Badge>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">✅ Do:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Research the cultural significance</li>
                    <li>• Ask respectful questions about items</li>
                    <li>• Support authentic cultural sellers</li>
                    <li>• Wear items with understanding and respect</li>
                    <li>• Share knowledge responsibly</li>
                    <li>• Report inappropriate content</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-red-700 mb-2">❌ Don't:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Wear sacred or ceremonial items casually</li>
                    <li>• Make assumptions about cultural practices</li>
                    <li>• Use items as costumes or for mockery</li>
                    <li>• Ignore seller guidance about appropriate use</li>
                    <li>• Spread misinformation about cultures</li>
                    <li>• Support obvious cultural appropriation</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reporting and Moderation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-600" />
              Reporting and Moderation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Our community relies on members to help maintain these standards. If you see content that violates our
              guidelines:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">How to Report</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Use the "Report" button on items, profiles, or reviews</li>
                  <li>• Select the appropriate violation type</li>
                  <li>• Provide specific details about the issue</li>
                  <li>• Include evidence if available</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Our Response</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• All reports reviewed within 24-48 hours</li>
                  <li>• Cultural consultants involved in sensitive cases</li>
                  <li>• Educational outreach before enforcement</li>
                  <li>• Transparent communication about decisions</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Cultural Sensitivity Team</h4>
              <p className="text-sm text-blue-700">
                Our moderation team includes cultural consultants from various backgrounds who help ensure respectful
                representation and provide education rather than just enforcement.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Consequences */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enforcement and Consequences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We believe in education first, but violations may result in:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 border rounded-lg">
                  <Badge variant="outline" className="mb-2">
                    First Offense
                  </Badge>
                  <ul className="text-sm space-y-1">
                    <li>• Educational outreach</li>
                    <li>• Content editing requirements</li>
                    <li>• Cultural sensitivity resources</li>
                  </ul>
                </div>
                <div className="p-3 border rounded-lg">
                  <Badge variant="secondary" className="mb-2">
                    Repeated Violations
                  </Badge>
                  <ul className="text-sm space-y-1">
                    <li>• Temporary restrictions</li>
                    <li>• Required cultural education</li>
                    <li>• Supervised selling period</li>
                  </ul>
                </div>
                <div className="p-3 border rounded-lg">
                  <Badge variant="destructive" className="mb-2">
                    Severe Violations
                  </Badge>
                  <ul className="text-sm space-y-1">
                    <li>• Account suspension</li>
                    <li>• Permanent platform removal</li>
                    <li>• Legal action if applicable</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Questions or Concerns?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              We're here to help you navigate cultural appreciation respectfully. If you have questions about whether
              something is appropriate or need guidance on cultural context:
            </p>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/cultural-resources">Cultural Resources</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/community">Join Community Discussions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
