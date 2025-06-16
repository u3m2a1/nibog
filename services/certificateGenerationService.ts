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
    console.log('Fetching participants for event ID:', eventId);
    const response = await fetch(`/api/events/participants-for-certificates?event_id=${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.error || 'Failed to fetch event participants');
    }

    const result: EventParticipantsResponse = await response.json();
    console.log('Service received data:', result);
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
    const response = await fetch(`/api/certificates/download/${certificateId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to download certificate');
    }

    const result: CertificateDownloadResponse[] = await response.json();
    return result[0];
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
    progress.current = participant.child_name || participant.parent_name;
    
    if (onProgress) {
      onProgress({ ...progress });
    }

    try {
      // Generate certificate data
      const certificateData = {
        participant_name: participant.child_name || participant.parent_name,
        event_name: '', // Will be filled by backend
        event_date: '', // Will be filled by backend
        venue_name: '', // Will be filled by backend
        city_name: '', // Will be filled by backend
        certificate_number: `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        game_name: participant.game_name,
        attendance_status: participant.attendance_status
      };

      // Step 1: Extract game information from participant
      const gameName = participant.game_name;
      let gameId = participant.game_id;
      
      // Step 2: If game_id is a string, convert it to a number
      if (typeof gameId === 'string') {
        gameId = parseInt(gameId, 10);
      }
      
      // Step 3: If we have a game_name but no game_id, try to infer game_id from name
      // This assumes game names could be in format "Game Name (ID)" or contains an ID we can parse
      if (gameId === undefined && gameName) {
        // Try to extract a number from the game name if it contains digits
        const matches = gameName.match(/(\d+)/); // Look for numbers in the game name
        if (matches && matches[1]) {
          gameId = parseInt(matches[1], 10);
          console.log('Extracted game ID from name:', gameId);
        }
      }
      
      // This will help with debugging the game_id issue
      console.log('Game ID for certificate:', gameId, 'Type:', typeof gameId);
      console.log('Game Name:', gameName); 
      console.log('Participant data:', participant);
      
      // Get parent details for certificate generation
      // Note: Backend workflow will use parent_id to look up the correct user_id if needed
      const request: GenerateSingleCertificateRequest = {
        template_id: templateId,
        event_id: eventId,
        game_id: participant.game_id, // Use parsed game_id or null if undefined
        parent_id: participant.parent_id,
        child_id: participant.child_id,
        certificate_data: certificateData,
        user_id: participant.parent_id // The backend will validate/lookup the correct user_id
      };
      
      console.log('Certificate generation request:', request);

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
    participant_name: participant.child_name || participant.parent_name,
    event_name: '', // Will be filled by backend
    event_date: '', // Will be filled by backend
    venue_name: '', // Will be filled by backend
    city_name: '', // Will be filled by backend
    certificate_number: `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    game_name: participant.game_name,
    attendance_status: participant.attendance_status,
    email: participant.email,
    ...additionalData
  };
}
