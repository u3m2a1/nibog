"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Save, Upload } from "lucide-react"

export default function SettingsPage() {
  // General settings
  const [siteName, setSiteName] = useState("NIBOG - New India Baby Olympics Games")
  const [siteTagline, setSiteTagline] = useState("India's Biggest Baby Games")
  const [contactEmail, setContactEmail] = useState("info@nibog.in")
  const [contactPhone, setContactPhone] = useState("+91 9876543210")
  const [address, setAddress] = useState("Gachibowli Indoor Stadium, Hyderabad, Telangana 500032")

  // Social media settings
  const [facebook, setFacebook] = useState("https://facebook.com/nibog")
  const [instagram, setInstagram] = useState("https://instagram.com/nibog")
  const [twitter, setTwitter] = useState("https://twitter.com/nibog")
  const [youtube, setYoutube] = useState("https://youtube.com/nibog")

  // Email settings
  const [smtpHost, setSmtpHost] = useState("smtp.example.com")
  const [smtpPort, setSmtpPort] = useState("587")
  const [smtpUser, setSmtpUser] = useState("notifications@nibog.in")
  const [smtpPassword, setSmtpPassword] = useState("********")
  const [senderName, setSenderName] = useState("NIBOG Team")
  const [senderEmail, setSenderEmail] = useState("notifications@nibog.in")

  // Notification settings
  const [bookingConfirmation, setBookingConfirmation] = useState(true)
  const [paymentConfirmation, setPaymentConfirmation] = useState(true)
  const [bookingReminder, setBookingReminder] = useState(true)
  const [eventUpdates, setEventUpdates] = useState(true)
  const [adminNewBooking, setAdminNewBooking] = useState(true)
  const [adminNewPayment, setAdminNewPayment] = useState(true)

  // Payment settings
  const [currency, setCurrency] = useState("INR")
  const [razorpayKey, setRazorpayKey] = useState("rzp_test_*************")
  const [razorpaySecret, setRazorpaySecret] = useState("*************************")
  const [testMode, setTestMode] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your NIBOG platform settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure the basic information for your NIBOG platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input
                  id="site-name"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-tagline">Site Tagline</Label>
                <Input
                  id="site-tagline"
                  value={siteTagline}
                  onChange={(e) => setSiteTagline(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Contact Phone</Label>
                <Input
                  id="contact-phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <div className="flex items-center gap-4">
                  <img
                    src="/placeholder.svg?height=50&width=200&text=NIBOG+Logo"
                    alt="NIBOG Logo"
                    className="h-12 w-auto"
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Logo
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="favicon">Favicon</Label>
                <div className="flex items-center gap-4">
                  <img
                    src="/placeholder.svg?height=32&width=32&text=N"
                    alt="NIBOG Favicon"
                    className="h-8 w-8"
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Favicon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* Social Media Settings */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Settings</CardTitle>
              <CardDescription>
                Configure your NIBOG social media accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure your NIBOG email settings for notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input
                  id="smtp-host"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input
                  id="smtp-port"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-user">SMTP Username</Label>
                <Input
                  id="smtp-user"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-password">SMTP Password</Label>
                <Input
                  id="smtp-password"
                  type="password"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                />
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <Label htmlFor="sender-name">Sender Name</Label>
                <Input
                  id="sender-name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender-email">Sender Email</Label>
                <Input
                  id="sender-email"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                />
              </div>
              <div className="mt-4">
                <Button variant="outline">Test Email Configuration</Button>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure which notifications are sent to users and administrators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">User Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="booking-confirmation">Booking Confirmation</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email when a booking is confirmed
                    </p>
                  </div>
                  <Switch
                    id="booking-confirmation"
                    checked={bookingConfirmation}
                    onCheckedChange={setBookingConfirmation}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="payment-confirmation">Payment Confirmation</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email when a payment is processed
                    </p>
                  </div>
                  <Switch
                    id="payment-confirmation"
                    checked={paymentConfirmation}
                    onCheckedChange={setPaymentConfirmation}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="booking-reminder">Booking Reminder</Label>
                    <p className="text-sm text-muted-foreground">
                      Send reminder email 24 hours before the event
                    </p>
                  </div>
                  <Switch
                    id="booking-reminder"
                    checked={bookingReminder}
                    onCheckedChange={setBookingReminder}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="event-updates">Event Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email when there are updates to a booked event
                    </p>
                  </div>
                  <Switch
                    id="event-updates"
                    checked={eventUpdates}
                    onCheckedChange={setEventUpdates}
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <h3 className="text-lg font-medium">Admin Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="admin-new-booking">New Booking</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email to admin when a new booking is made
                    </p>
                  </div>
                  <Switch
                    id="admin-new-booking"
                    checked={adminNewBooking}
                    onCheckedChange={setAdminNewBooking}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="admin-new-payment">New Payment</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email to admin when a new payment is received
                    </p>
                  </div>
                  <Switch
                    id="admin-new-payment"
                    checked={adminNewPayment}
                    onCheckedChange={setAdminNewPayment}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure your NIBOG payment gateway settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="razorpay-key">Razorpay API Key</Label>
                <Input
                  id="razorpay-key"
                  value={razorpayKey}
                  onChange={(e) => setRazorpayKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="razorpay-secret">Razorpay Secret Key</Label>
                <Input
                  id="razorpay-secret"
                  type="password"
                  value={razorpaySecret}
                  onChange={(e) => setRazorpaySecret(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 pt-4">
                <Switch id="test-mode" checked={testMode} onCheckedChange={setTestMode} />
                <Label htmlFor="test-mode">Enable Test Mode</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                When test mode is enabled, payments will be processed through the Razorpay test
                environment. No real transactions will occur.
              </p>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
