"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CertificateGenerator from "@/components/admin/certificate-generator"

// Mock event data - in a real app, this would come from an API
const getEventData = (id: string) => ({
  id,
  title: "Baby Sensory Play",
  date: "October 26, 2025",
  venue: "Kids Paradise",
  city: "Hyderabad",
  participantCount: 25,
  certificateHistory: [
    {
      id: "cert-batch-1",
      templateId: "cert-2",
      templateName: "Participation Certificate",
      generatedAt: "2025-10-26T15:30:00Z",
      sentAt: "2025-10-26T16:00:00Z",
      count: 25,
      sentCount: 23,
    }
  ]
})

export default function EventCertificatesPage() {
  const params = useParams()
  const eventId = params.id as string
  const event = getEventData(eventId)
  
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
          <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground">
            {event.title} • {event.date} • {event.venue}, {event.city}
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="generate">
        <TabsList>
          <TabsTrigger value="generate">Generate Certificates</TabsTrigger>
          <TabsTrigger value="history">Certificate History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="space-y-6">
          <CertificateGenerator 
            eventId={eventId}
            eventTitle={event.title}
            participantCount={event.participantCount}
          />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Generation History</CardTitle>
              <CardDescription>
                Previous certificate batches generated for this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              {event.certificateHistory.length > 0 ? (
                <div className="space-y-4">
                  {event.certificateHistory.map(batch => (
                    <div key={batch.id} className="rounded-md border p-4">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-medium">{batch.templateName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Generated: {new Date(batch.generatedAt).toLocaleString()}
                          </p>
                          {batch.sentAt && (
                            <p className="text-sm text-muted-foreground">
                              Sent: {new Date(batch.sentAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 sm:mt-0 sm:text-right">
                          <p className="text-sm">
                            <span className="font-medium">{batch.count}</span> certificates generated
                          </p>
                          {batch.sentCount > 0 && (
                            <p className="text-sm">
                              <span className="font-medium">{batch.sentCount}</span> certificates sent
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Download Batch
                        </Button>
                        {batch.sentCount < batch.count && (
                          <Button size="sm">
                            Resend Certificates
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No certificates have been generated for this event yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
