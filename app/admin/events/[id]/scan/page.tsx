"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import QrCodeScanner from "@/components/admin/qr-code-scanner"

// Mock event data - in a real app, this would come from an API
const getEventData = (id: string) => ({
  id,
  title: "Baby Sensory Play",
  date: "October 26, 2025",
  venue: "Kids Paradise",
  city: "Hyderabad",
})

export default function EventScanPage() {
  const params = useParams()
  const eventId = params.id as string
  const event = getEventData(eventId)
  
  const [scanHistory, setScanHistory] = useState<Array<{
    id: string
    timestamp: Date
    type: "entry" | "addon"
    bookingId: string
    addonId?: string
    success: boolean
    message: string
  }>>([])
  
  const handleScanSuccess = async (bookingId: string, type: "entry" | "addon", addonId?: string) => {
    try {
      // In a real app, this would be an API call
      // For entry scanning:
      // await fetch(`/api/admin/events/${eventId}/scan-entry/${bookingId}`, { method: "POST" })
      // For add-on scanning:
      // await fetch(`/api/admin/events/${eventId}/scan-addon/${bookingId}/${addonId}`, { method: "POST" })
      
      console.log(`Scan success: ${type} for booking ${bookingId}${addonId ? ` addon ${addonId}` : ''}`)
      
      // Add to scan history
      setScanHistory(prev => [
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date(),
          type,
          bookingId,
          addonId,
          success: true,
          message: type === "entry" 
            ? `Successfully marked attendance for booking ${bookingId}` 
            : `Successfully marked add-on ${addonId} as collected for booking ${bookingId}`
        },
        ...prev
      ])
    } catch (error) {
      console.error("Error processing scan:", error)
      
      // Add failed scan to history
      setScanHistory(prev => [
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date(),
          type,
          bookingId,
          addonId,
          success: false,
          message: "Failed to process scan. Please try again."
        },
        ...prev
      ])
    }
  }
  
  const handleScanError = (error: string) => {
    console.error("Scan error:", error)
    
    // Add to scan history for persistent errors
    if (error.includes("permission") || error.includes("not found")) {
      setScanHistory(prev => [
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date(),
          type: "entry", // Default
          bookingId: "unknown",
          success: false,
          message: `Scanner error: ${error}`
        },
        ...prev
      ])
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/events/${eventId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QR Scanner</h1>
          <p className="text-muted-foreground">
            {event.title} • {event.date} • {event.venue}, {event.city}
          </p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <QrCodeScanner 
            eventId={eventId} 
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
          />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Scan History</CardTitle>
              <CardDescription>Recent scans for this event</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {scanHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No scans yet. Start scanning QR codes to see the history here.
                  </p>
                ) : (
                  scanHistory.map(scan => (
                    <Alert key={scan.id} variant={scan.success ? "default" : "destructive"}>
                      {scan.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>
                        {scan.type === "entry" ? "Event Entry" : "Add-on Collection"} • {scan.timestamp.toLocaleTimeString()}
                      </AlertTitle>
                      <AlertDescription>{scan.message}</AlertDescription>
                    </Alert>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
