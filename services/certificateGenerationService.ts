import {
  GeneratedCertificate,
  GenerateSingleCertificateRequest,
  EventParticipantsResponse,
  EventParticipant,
  CertificateDownloadResponse,
  BulkGenerationProgress
} from '@/types/certificate';

/**
 * Generate a single certificate
 */
export async function generateSingleCertificate(
  request: GenerateSingleCertificateRequest
): Promise<GeneratedCertificate> {
  try {
    const response = await fetch('/api/certificates/generate-single', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate certificate');
    }

    const result: GeneratedCertificate[] = await response.json();
    return result[0];
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
}

/**
 * Get event participants for certificate generation
 */
export async function getEventParticipants(eventId: number): Promise<EventParticipantsResponse> {
  try {
    const response = await fetch(`/api/events/participants-for-certificates?event_id=${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch event participants');
    }

    const result: EventParticipantsResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching participants:', error);
    throw error;
  }
}

/**
 * Download certificate HTML for PDF generation
 */
export async function downloadCertificateHTML(certificateId: number): Promise<CertificateDownloadResponse> {
  try {
    const response = await fetch(`/api/certificates/download?certificate_id=${certificateId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to download certificate');
    }

    const result: CertificateDownloadResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error downloading certificate:', error);
    throw error;
  }
}

/**
 * Generate bulk certificates (frontend implementation)
 */
export async function generateBulkCertificates(
  templateId: number,
  eventId: number,
  participants: EventParticipant[],
  gameId?: number,
  onProgress?: (progress: BulkGenerationProgress) => void
): Promise<BulkGenerationProgress> {
  const progress: BulkGenerationProgress = {
    total: participants.length,
    completed: 0,
    failed: 0,
    current: '',
    results: []
  };

  for (let i = 0; i < participants.length; i++) {
    const participant = participants[i];
    progress.current = participant.child_name || participant.user_name;
    
    if (onProgress) {
      onProgress({ ...progress });
    }

    try {
      // Generate certificate data
      const certificateData = {
        participant_name: participant.child_name || participant.user_name,
        event_name: '', // Will be filled by backend
        event_date: '', // Will be filled by backend
        venue_name: '', // Will be filled by backend
        city_name: '', // Will be filled by backend
        certificate_number: `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        game_name: participant.game_name,
        attendance_status: participant.attendance_status
      };

      const request: GenerateSingleCertificateRequest = {
        template_id: templateId,
        event_id: eventId,
        game_id: gameId,
        user_id: participant.user_id,
        child_id: participant.child_id,
        certificate_data: certificateData
      };

      const certificate = await generateSingleCertificate(request);
      
      progress.results.push({
        participant,
        success: true,
        certificate
      });
      progress.completed++;
    } catch (error) {
      progress.results.push({
        participant,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      progress.failed++;
    }

    // Small delay to prevent overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  progress.current = 'Completed';
  if (onProgress) {
    onProgress({ ...progress });
  }

  return progress;
}

/**
 * Retry failed certificate generations
 */
export async function retryFailedCertificates(
  templateId: number,
  eventId: number,
  failedResults: BulkGenerationProgress['results'],
  gameId?: number,
  onProgress?: (progress: BulkGenerationProgress) => void
): Promise<BulkGenerationProgress> {
  const failedParticipants = failedResults
    .filter(result => !result.success)
    .map(result => result.participant);

  return generateBulkCertificates(templateId, eventId, failedParticipants, gameId, onProgress);
}

/**
 * Get certificates for an event (if needed for status checking)
 */
export async function getEventCertificates(eventId: number): Promise<GeneratedCertificate[]> {
  try {
    // This would require a new API endpoint, but for now we can skip it
    // since we're handling bulk generation in frontend
    return [];
  } catch (error) {
    console.error('Error fetching event certificates:', error);
    throw error;
  }
}

/**
 * Generate certificate data for a participant
 */
export function generateCertificateDataForParticipant(
  participant: EventParticipant,
  additionalData?: Record<string, any>
) {
  return {
    participant_name: participant.child_name || participant.user_name,
    event_name: '', // Will be filled by backend
    event_date: '', // Will be filled by backend
    venue_name: '', // Will be filled by backend
    city_name: '', // Will be filled by backend
    certificate_number: `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    game_name: participant.game_name,
    attendance_status: participant.attendance_status,
    user_email: participant.user_email,
    ...additionalData
  };
}
