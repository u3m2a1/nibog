"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Mail, FileText, Loader2, Users, Award, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  EventParticipantsResponse,
  EventParticipant,
  CertificateTemplate,
  BulkGenerationProgress
} from "@/types/certificate"
import { getEventParticipants, generateBulkCertificates } from "@/services/certificateGenerationService"
import { getAllCertificateTemplates } from "@/services/certificateTemplateService"
import { generateCertificatePDF } from "@/services/certificatePdfService"

export default function EventCertificatesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const eventId = parseInt(params.id as string)

  // State
  const [eventData, setEventData] = useState<EventParticipantsResponse | null>(null)
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [gameFilter, setGameFilter] = useState<string>("all")

  // Loading states
  const [loading, setLoading] = useState(true)
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [bulkProgress, setBulkProgress] = useState<BulkGenerationProgress | null>(null)

  // Load data
  useEffect(() => {
    if (eventId) {
      loadEventParticipants()
      loadTemplates()
    }
  }, [eventId])

  const loadEventParticipants = async () => {
    try {
      setLoading(true)
      const data = await getEventParticipants(eventId)
      setEventData(data)
    } catch (error) {
      console.error('Error loading participants:', error)
      toast({
        title: "Error",
        description: "Failed to load event participants",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      setTemplatesLoading(true)
      const data = await getAllCertificateTemplates()
      setTemplates(data.filter(t => t.is_active))
    } catch (error) {
      console.error('Error loading templates:', error)
      toast({
        title: "Error",
        description: "Failed to load certificate templates",
        variant: "destructive"
      })
    } finally {
      setTemplatesLoading(false)
    }
  }

  // Filter participants
  const filteredParticipants = eventData?.participants.filter(participant => {
    const matchesSearch = participant.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (participant.child_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesGame = gameFilter === "all" || participant.game_id.toString() === gameFilter
    return matchesSearch && matchesGame
  }) || []

  // Get unique games
  const uniqueGames = eventData?.participants.reduce((acc, participant) => {
    if (!acc.find(g => g.id === participant.game_id)) {
      acc.push({ id: participant.game_id, name: participant.game_name })
    }
    return acc
  }, [] as Array<{ id: number; name: string }>) || []

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const participantIds = filteredParticipants.map(p => `${p.user_id}-${p.child_id || 0}`)
      setSelectedParticipants(new Set(participantIds))
    } else {
      setSelectedParticipants(new Set())
    }
  }

  const handleSelectParticipant = (participant: EventParticipant, checked: boolean) => {
    const participantId = `${participant.user_id}-${participant.child_id || 0}`
    const newSelected = new Set(selectedParticipants)

    if (checked) {
      newSelected.add(participantId)
    } else {
      newSelected.delete(participantId)
    }

    setSelectedParticipants(newSelected)
  }

  const handleBulkGenerate = async () => {
    if (!selectedTemplate || selectedParticipants.size === 0) {
      toast({
        title: "Error",
        description: "Please select a template and at least one participant",
        variant: "destructive"
      })
      return
    }

    const participantsToGenerate = filteredParticipants.filter(p =>
      selectedParticipants.has(`${p.user_id}-${p.child_id || 0}`)
    )

    try {
      setGenerating(true)
      setBulkProgress(null)

      const progress = await generateBulkCertificates(
        selectedTemplate,
        eventId,
        participantsToGenerate,
        undefined, // gameId - optional
        (progress) => setBulkProgress(progress)
      )

      toast({
        title: "Success",
        description: `Generated ${progress.completed} certificates successfully. ${progress.failed} failed.`,
        variant: progress.failed > 0 ? "destructive" : "default"
      })

      // Clear selections
      setSelectedParticipants(new Set())
    } catch (error) {
      console.error('Error generating certificates:', error)
      toast({
        title: "Error",
        description: "Failed to generate certificates",
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/events">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Event Certificates</h1>
            <p className="text-muted-foreground">Loading event data...</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading participants...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!eventData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/events">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Event Not Found</h1>
            <p className="text-muted-foreground">The requested event could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/events">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Certificates</h1>
          <p className="text-muted-foreground">
            Generate certificates for {eventData.event_name} participants
          </p>
        </div>
      </div>

      {/* Event Info */}
      <Card>
        <CardHeader>
          <CardTitle>Event Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Event Name</p>
              <p className="text-lg font-semibold">{eventData.event_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date</p>
              <p className="text-lg font-semibold">{eventData.event_date}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Venue</p>
              <p className="text-lg font-semibold">{eventData.venue_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Participants</p>
              <p className="text-lg font-semibold">{eventData.total_participants}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Certificates</CardTitle>
          <CardDescription>
            Select a template and participants to generate certificates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Certificate Template</Label>
              <Select
                value={selectedTemplate?.toString() || ""}
                onValueChange={(value) => setSelectedTemplate(parseInt(value))}
                disabled={templatesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={templatesLoading ? "Loading templates..." : "Select template"} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name} ({template.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleBulkGenerate}
                disabled={!selectedTemplate || selectedParticipants.size === 0 || generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Award className="mr-2 h-4 w-4" />
                    Generate Certificates ({selectedParticipants.size})
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Bulk Generation Progress */}
          {bulkProgress && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Generating certificates... {bulkProgress.completed + bulkProgress.failed} of {bulkProgress.total}
                    </span>
                    <span className="text-sm text-gray-500">{bulkProgress.current}</span>
                  </div>
                  <Progress
                    value={((bulkProgress.completed + bulkProgress.failed) / bulkProgress.total) * 100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">✓ {bulkProgress.completed} completed</span>
                    {bulkProgress.failed > 0 && (
                      <span className="text-red-600">✗ {bulkProgress.failed} failed</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Participants List */}
      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
          <CardDescription>
            Select participants to generate certificates for
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by game" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  {uniqueGames.map((game) => (
                    <SelectItem key={game.id} value={game.id.toString()}>
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Participants Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedParticipants.size === filteredParticipants.length && filteredParticipants.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Participant</TableHead>
                <TableHead>Game</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Booking</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.map((participant) => {
                const participantId = `${participant.user_id}-${participant.child_id || 0}`
                const isSelected = selectedParticipants.has(participantId)

                return (
                  <TableRow key={participantId}>
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectParticipant(participant, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {participant.child_name || participant.user_name}
                        </p>
                        <p className="text-sm text-gray-500">{participant.user_email}</p>
                        {participant.child_age_months && (
                          <p className="text-xs text-gray-400">
                            Age: {Math.floor(participant.child_age_months / 12)}y {participant.child_age_months % 12}m
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{participant.game_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={participant.attendance_status === 'present' ? 'default' : 'secondary'}
                      >
                        {participant.attendance_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={participant.booking_status === 'confirmed' ? 'default' : 'secondary'}
                      >
                        {participant.booking_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}

              {filteredParticipants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm || gameFilter !== "all"
                          ? "No participants match your search criteria"
                          : "No participants found for this event"
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
