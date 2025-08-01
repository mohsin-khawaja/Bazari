"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Upload, X, MapPin, Globe, Instagram, Twitter, Facebook } from "lucide-react"
import Link from "next/link"

const culturalBackgrounds = [
  "Pakistani",
  "Indian",
  "African",
  "Korean",
  "Mexican",
  "Moroccan",
  "Japanese",
  "Ethiopian",
  "Chinese",
  "Vietnamese",
  "Filipino",
  "Turkish",
  "Lebanese",
  "Nigerian",
  "Ghanaian",
  "Thai",
  "Indonesian",
  "Peruvian",
  "Brazilian",
  "Other",
]

const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Arabic",
  "Hindi",
  "Urdu",
  "Mandarin",
  "Japanese",
  "Korean",
  "Vietnamese",
  "Thai",
  "Other",
]

export default function EditProfilePage() {
  const [profileData, setProfileData] = useState({
    firstName: "Aisha",
    lastName: "Khan",
    username: "aisha_k",
    email: "aisha@example.com",
    bio: "Passionate about Pakistani and South Asian fashion. Sharing authentic pieces from my collection and family heritage. ✨",
    location: "Toronto, Canada",
    website: "https://aishastyle.com",
    instagram: "@aisha_style",
    twitter: "@aisha_k",
    facebook: "",
    phone: "+1 (555) 123-4567",
  })

  const [selectedCultures, setSelectedCultures] = useState(["Pakistani", "Indian", "South Asian"])
  const [selectedLanguages, setSelectedLanguages] = useState(["English", "Urdu", "Hindi"])
  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowMessages: true,
    showOnlineStatus: true,
    marketingEmails: true,
    orderUpdates: true,
  })

  const [verificationStatus, setVerificationStatus] = useState({
    email: true,
    phone: false,
    identity: false,
    seller: true,
  })

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const addCulture = (culture: string) => {
    if (!selectedCultures.includes(culture) && selectedCultures.length < 5) {
      setSelectedCultures((prev) => [...prev, culture])
    }
  }

  const removeCulture = (culture: string) => {
    setSelectedCultures((prev) => prev.filter((c) => c !== culture))
  }

  const addLanguage = (language: string) => {
    if (!selectedLanguages.includes(language) && selectedLanguages.length < 5) {
      setSelectedLanguages((prev) => [...prev, language])
    }
  }

  const removeLanguage = (language: string) => {
    setSelectedLanguages((prev) => prev.filter((l) => l !== language))
  }

  const handlePrivacyChange = (setting: string, value: boolean) => {
    setPrivacySettings((prev) => ({ ...prev, [setting]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/profile" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="font-semibold">Edit Profile</h1>
          <div></div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile" />
                    <AvatarFallback className="text-2xl">AK</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" className="mb-2 bg-transparent">
                      <Upload className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 5MB.</p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell people about yourself..."
                    value={profileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-muted-foreground">{profileData.bio.length}/500 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="City, Country"
                      value={profileData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Cultural Background */}
                <div className="space-y-2">
                  <Label>Cultural Background</Label>
                  <p className="text-sm text-muted-foreground">
                    Select cultures that represent your background or interests (max 5)
                  </p>

                  <Select onValueChange={addCulture}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add cultural background" />
                    </SelectTrigger>
                    <SelectContent>
                      {culturalBackgrounds
                        .filter((culture) => !selectedCultures.includes(culture))
                        .map((culture) => (
                          <SelectItem key={culture} value={culture}>
                            {culture}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <div className="flex flex-wrap gap-2">
                    {selectedCultures.map((culture) => (
                      <Badge key={culture} variant="secondary" className="cursor-pointer">
                        {culture}
                        <X className="h-3 w-3 ml-1" onClick={() => removeCulture(culture)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-2">
                  <Label>Languages</Label>
                  <p className="text-sm text-muted-foreground">Languages you speak (max 5)</p>

                  <Select onValueChange={addLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages
                        .filter((language) => !selectedLanguages.includes(language))
                        .map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <div className="flex flex-wrap gap-2">
                    {selectedLanguages.map((language) => (
                      <Badge key={language} variant="outline" className="cursor-pointer">
                        {language}
                        <X className="h-3 w-3 ml-1" onClick={() => removeLanguage(language)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <Label>Social Links</Label>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        placeholder="https://yourwebsite.com"
                        value={profileData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="instagram"
                          placeholder="@username"
                          value={profileData.instagram}
                          onChange={(e) => handleInputChange("instagram", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="twitter"
                          placeholder="@username"
                          value={profileData.twitter}
                          onChange={(e) => handleInputChange("twitter", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <div className="relative">
                        <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="facebook"
                          placeholder="facebook.com/username"
                          value={profileData.facebook}
                          onChange={(e) => handleInputChange("facebook", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Save Profile Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Verification</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Verify your account to build trust with buyers and sellers
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Verification */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${verificationStatus.email ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    <div>
                      <h3 className="font-medium">Email Verification</h3>
                      <p className="text-sm text-muted-foreground">Verify your email address</p>
                    </div>
                  </div>
                  {verificationStatus.email ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm">
                      Verify
                    </Button>
                  )}
                </div>

                {/* Phone Verification */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${verificationStatus.phone ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    <div>
                      <h3 className="font-medium">Phone Verification</h3>
                      <p className="text-sm text-muted-foreground">Verify your phone number</p>
                    </div>
                  </div>
                  {verificationStatus.phone ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm">
                      Verify
                    </Button>
                  )}
                </div>

                {/* Identity Verification */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${verificationStatus.identity ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    <div>
                      <h3 className="font-medium">Identity Verification</h3>
                      <p className="text-sm text-muted-foreground">Upload government ID for identity verification</p>
                    </div>
                  </div>
                  {verificationStatus.identity ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm">
                      Start Verification
                    </Button>
                  )}
                </div>

                {/* Seller Verification */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${verificationStatus.seller ? "bg-green-500" : "bg-gray-300"}`}
                    />
                    <div>
                      <h3 className="font-medium">Seller Verification</h3>
                      <p className="text-sm text-muted-foreground">Get verified as a trusted seller</p>
                    </div>
                  </div>
                  {verificationStatus.seller ? (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Verified Seller
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm">
                      Apply
                    </Button>
                  )}
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Verification Benefits</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Build trust with buyers and sellers</li>
                    <li>• Get priority in search results</li>
                    <li>• Access to seller analytics and tools</li>
                    <li>• Reduced transaction fees</li>
                    <li>• Special verification badges on your profile</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Control who can see your information and how you receive notifications
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Public Profile</h3>
                      <p className="text-sm text-muted-foreground">Make your profile visible to everyone</p>
                    </div>
                    <Switch
                      checked={privacySettings.profilePublic}
                      onCheckedChange={(checked) => handlePrivacyChange("profilePublic", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Show Email</h3>
                      <p className="text-sm text-muted-foreground">Display your email on your profile</p>
                    </div>
                    <Switch
                      checked={privacySettings.showEmail}
                      onCheckedChange={(checked) => handlePrivacyChange("showEmail", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Show Phone</h3>
                      <p className="text-sm text-muted-foreground">Display your phone number on your profile</p>
                    </div>
                    <Switch
                      checked={privacySettings.showPhone}
                      onCheckedChange={(checked) => handlePrivacyChange("showPhone", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Show Location</h3>
                      <p className="text-sm text-muted-foreground">Display your location on your profile</p>
                    </div>
                    <Switch
                      checked={privacySettings.showLocation}
                      onCheckedChange={(checked) => handlePrivacyChange("showLocation", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Allow Messages</h3>
                      <p className="text-sm text-muted-foreground">Let other users send you messages</p>
                    </div>
                    <Switch
                      checked={privacySettings.allowMessages}
                      onCheckedChange={(checked) => handlePrivacyChange("allowMessages", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Show Online Status</h3>
                      <p className="text-sm text-muted-foreground">Show when you're online</p>
                    </div>
                    <Switch
                      checked={privacySettings.showOnlineStatus}
                      onCheckedChange={(checked) => handlePrivacyChange("showOnlineStatus", checked)}
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Marketing Emails</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive emails about new features and promotions
                        </p>
                      </div>
                      <Switch
                        checked={privacySettings.marketingEmails}
                        onCheckedChange={(checked) => handlePrivacyChange("marketingEmails", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Order Updates</h4>
                        <p className="text-sm text-muted-foreground">Receive emails about your orders and sales</p>
                      </div>
                      <Switch
                        checked={privacySettings.orderUpdates}
                        onCheckedChange={(checked) => handlePrivacyChange("orderUpdates", checked)}
                      />
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Save Privacy Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <Button variant="outline" className="w-full bg-transparent">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Download My Data
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium text-destructive mb-4">Danger Zone</h3>
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                    >
                      Deactivate Account
                    </Button>
                    <Button variant="destructive" className="w-full">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
