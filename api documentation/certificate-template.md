## Certificate Templates API

### create upload background path

POST https://ai.alviongs.com/webhook/v1/nibog/certificate-templates/upload-background

Payload

Content-Type: multipart/form-data
Payload: Form data with file

Response (201 Created)

```json
[
  {
    "success": true,
    "file_path": "/images/certificatetemplates/template_1749795583929_376.jpeg",
    "filename": "template_1749795583929_376.jpeg"
  }
]
```

### Create Certificate Template

**POST** https://ai.alviongs.com/webhook/v1/nibog/certificate-templates/create

Payload

```json
{
  "name": "Participation Certificate",
  "description": "General participation certificate for all events",
  "type": "participation",
  "background_image": "/images/certificatetemplates/template_1749795583929_376.jpeg",
  "paper_size": "a4",
  "orientation": "landscape",
  "fields": [
    {
      "id": "1",
      "name": "Participant Name",
      "type": "text",
      "required": true,
      "x": 50,
      "y": 40,
      "font_size": 24,
      "font_family": "Arial",
      "color": "#000000"
    }
  ]
}
```

Response (201 Created)

```json
[
  {
    "id": 2,
    "name": "Participation Certificate",
    "description": "General participation certificate for all events",
    "type": "participation",
    "background_image": "/images/certificatetemplates/template_1749795583929_376.jpeg",
    "paper_size": "a4",
    "orientation": "landscape",
    "fields": [
      {
        "x": 50,
        "y": 40,
        "id": "1",
        "name": "Participant Name",
        "type": "text",
        "color": "#000000",
        "required": true,
        "font_size": 24,
        "font_family": "Arial"
      }
    ],
    "is_active": true,
    "created_at": "2025-06-13T06:25:20.361Z",
    "updated_at": "2025-06-13T06:25:20.361Z"
  }
]
```

### Get All Certificate Templates

**GET** https://ai.alviongs.com/webhook/v1/nibog/certificate-templates/get-all

Response (200 OK)

```json
[
  {
    "id": 2,
    "name": "Participation Certificate",
    "description": "General participation certificate for all events",
    "type": "participation",
    "background_image": "/images/certificatetemplates/template_1749795583929_376.jpeg",
    "paper_size": "a4",
    "orientation": "landscape",
    "fields": [
      {
        "x": 50,
        "y": 40,
        "id": "1",
        "name": "Participant Name",
        "type": "text",
        "color": "#000000",
        "required": true,
        "font_size": 24,
        "font_family": "Arial"
      }
    ],
    "is_active": true,
    "created_at": "2025-06-13T06:25:20.361Z",
    "updated_at": "2025-06-13T06:25:20.361Z"
  }
]
```

### Get Certificate Template by ID

**POST** https://ai.alviongs.com/webhook/v1/nibog/certificate-templates/get

Payload

```json
{
  "id": 2
}
```

Response (200 OK)

```json
[
  {
    "id": 2,
    "name": "Participation Certificate",
    "description": "General participation certificate for all events",
    "type": "participation",
    "background_image": "/images/certificatetemplates/template_1749795583929_376.jpeg",
    "paper_size": "a4",
    "orientation": "landscape",
    "fields": [
      {
        "x": 50,
        "y": 40,
        "id": "1",
        "name": "Participant Name",
        "type": "text",
        "color": "#000000",
        "required": true,
        "font_size": 24,
        "font_family": "Arial"
      }
    ],
    "is_active": true,
    "created_at": "2025-06-13T06:25:20.361Z",
    "updated_at": "2025-06-13T06:25:20.361Z"
  }
]
```

### Update Certificate Template

**POST** https://ai.alviongs.com/webhook/v1/nibog/certificate-templates/update

Payload

```json
{
  "id": 2,
  "name": "Updated Participation Certificate",
  "description": "Updated description for participation certificate",
  "type": "participation",
  "background_image": "/images/certificatetemplates/template_1749795583929_376.jpeg",
  "paper_size": "a4",
  "orientation": "portrait",
  "fields": [
    {
      "x": 50,
      "y": 40,
      "id": "1",
      "name": "Participant Name",
      "type": "text",
      "color": "#000000",
      "required": true,
      "font_size": 26,
      "font_family": "Arial"
    },
    {
      "x": 50,
      "y": 50,
      "id": "2",
      "name": "Event Name",
      "type": "text",
      "color": "#000000",
      "required": true,
      "font_size": 20,
      "font_family": "Arial"
    }
  ],
  "is_active": true
}
```

Response (200 OK)

```json
[
  {
    "success": true
  }
]
```

### Delete Certificate Template

**POST** https://ai.alviongs.com/webhook/v1/nibog/certificate-templates/delete

Payload

```json
{
  "id": 2
}
```

Response (200 OK)

```json
{
  "success": true
}
```

### Get Certificate Templates by Type

**POST** https://ai.alviongs.com/webhook/v1/nibog/certificate-templates/by-type

Payload

```json
{
  "type": "participation"
}
```

Response (200 OK)

```json
[
  {
    "id": 3,
    "name": "Participation Certificate",
    "description": "General participation certificate for all events",
    "type": "participation",
    "background_image": "/images/certificatetemplates/template_1749795583929_376.jpeg",
    "paper_size": "a4",
    "orientation": "landscape",
    "fields": [
      {
        "x": 50,
        "y": 40,
        "id": "1",
        "name": "Participant Name",
        "type": "text",
        "color": "#000000",
        "required": true,
        "font_size": 24,
        "font_family": "Arial"
      }
    ],
    "is_active": true,
    "created_at": "2025-06-13T07:09:05.042Z",
    "updated_at": "2025-06-13T07:09:05.043Z"
  }
]
```

---

## Certificate Generation APIs

### Generate Certificates (Bulk)

**POST** https://ai.alviongs.com/webhook/v1/nibog/certificates/generate

Payload

```json
{
  "template_id": 2,
  "event_id": 5,
  "game_id": 3,
  "certificate_type": "participation",
  "include_no_shows": false,
  "participants": [
    {
      "user_id": 10,
      "child_id": 15,
      "participant_name": "John Doe",
      "additional_data": {
        "position": "1st Place",
        "score": "95"
      }
    },
    {
      "user_id": 11,
      "child_id": 16,
      "participant_name": "Jane Smith",
      "additional_data": {
        "position": "2nd Place",
        "score": "90"
      }
    }
  ]
}
```

Response (201 Created)

```json
{
  "success": true,
  "generated_count": 2,
  "failed_count": 0,
  "certificates": [
    {
      "id": 1,
      "template_id": 2,
      "event_id": 5,
      "game_id": 3,
      "user_id": 10,
      "child_id": 15,
      "certificate_data": {
        "participant_name": "John Doe",
        "event_name": "Baby Olympics 2025",
        "date": "2025-06-13",
        "position": "1st Place",
        "score": "95"
      },
      "pdf_url": "https://storage.example.com/certificates/cert_1.pdf",
      "status": "generated",
      "generated_at": "2025-06-13T06:30:00Z"
    },
    {
      "id": 2,
      "template_id": 2,
      "event_id": 5,
      "game_id": 3,
      "user_id": 11,
      "child_id": 16,
      "certificate_data": {
        "participant_name": "Jane Smith",
        "event_name": "Baby Olympics 2025",
        "date": "2025-06-13",
        "position": "2nd Place",
        "score": "90"
      },
      "pdf_url": "https://storage.example.com/certificates/cert_2.pdf",
      "status": "generated",
      "generated_at": "2025-06-13T06:30:00Z"
    }
  ]
}
```

### Generate Single Certificate

**POST** https://ai.alviongs.com/webhook/v1/nibog/certificates/generate-single

Payload

```json
{
  "template_id": 3,
  "event_id": 11,
  "game_id": 2,
  "user_id": 4,
  "child_id": 5,
  "certificate_data": {
    "participant_name": "John Doe",
    "event_name": "Baby Olympics 2025",
    "date": "2025-06-13",
    "position": "1st Place",
    "score": "95"
  }
}
```

Response (201 Created)

```json
[
  {
    "id": 1,
    "template_id": 2,
    "event_id": 5,
    "game_id": 3,
    "user_id": 10,
    "child_id": 15,
    "certificate_data": {
      "participant_name": "John Doe",
      "event_name": "Baby Olympics 2025",
      "date": "2025-06-13",
      "position": "1st Place",
      "score": "95"
    },
    "pdf_url": "https://storage.example.com/certificates/cert_1.pdf",
    "status": "generated",
    "generated_at": "2025-06-13T06:30:00Z"
  }
]
```

### Send Certificates via Email

**POST** https://ai.alviongs.com/webhook/v1/nibog/certificates/send-email

Payload

```json
{
  "certificate_ids": [1, 2, 3],
  "email_subject": "Your NIBOG Certificate",
  "email_message": "Congratulations! Please find your certificate attached."
}
```

Response (200 OK)

```json
{
  "success": true,
  "sent_count": 3,
  "failed_count": 0,
  "email_logs": [
    {
      "certificate_id": 1,
      "recipient_email": "parent1@example.com",
      "status": "sent",
      "sent_at": "2025-06-13T06:35:00Z"
    },
    {
      "certificate_id": 2,
      "recipient_email": "parent2@example.com",
      "status": "sent",
      "sent_at": "2025-06-13T06:35:00Z"
    },
    {
      "certificate_id": 3,
      "recipient_email": "parent3@example.com",
      "status": "sent",
      "sent_at": "2025-06-13T06:35:00Z"
    }
  ]
}
```

### Download Certificate PDF

**GET** https://ai.alviongs.com/webhook/v1/nibog/certificates/download/{certificate_id}

**Example**: GET https://ai.alviongs.com/webhook/v1/nibog/certificates/download/0

Response: 
[
  {
    "html": "\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    @page { \n      size: a4 landscape; \n      margin: 0; \n    }\n    body { \n      margin: 0; \n      font-family: Arial; \n      width: 100%;\n      height: 100vh;\n    }\n    .certificate-container {\n      width: 100%;\n      height: 100vh;\n      background-image: url('https://nibog.in/images/certificatetemplates/template_1749795583929_376.jpeg');\n      background-size: cover;\n      background-position: center;\n      background-repeat: no-repeat;\n      position: relative;\n    }\n    .field { \n      position: absolute; \n      text-align: center; \n    }\n  </style>\n</head>\n<body>\n  <div class=\"certificate-container\">\n    \n        <div class=\"field\" style=\"\n          left: 50%; \n          top: 40%; \n          font-size: 24px;\n          color: #000000;\n          font-family: 'Arial', sans-serif;\n          font-weight: bold;\n        \">\n          Alice Doe\n        </div>\n      \n  </div>\n</body>\n</html>\n",
    "certificate_id": 0,
    "filename": "certificate_0_1749813379294.pdf",
    "pdf_path": "/certificates/certificate_0_1749813379294.pdf",
    "full_path": "public/certificates/certificate_0_1749813379294.pdf"
  }
]

### Get Certificate Generation Status

**GET** https://ai.alviongs.com/webhook/v1/nibog/certificates/status/{event_id}

**Example**: GET https://ai.alviongs.com/webhook/v1/nibog/certificates/status/5

Response (200 OK)

```json
{
  "event_id": 5,
  "total_participants": 50,
  "certificates_generated": 45,
  "certificates_sent": 30,
  "certificates_downloaded": 15,
  "generation_status": "completed",
  "last_generated_at": "2025-06-13T06:30:00Z"
}
```

### Get Event Participants for Certificate Generation

**GET** https://ai.alviongs.com/webhook/v1/nibog/events/{event_id}/participants-for-certificates

**Example**: GET https://ai.alviongs.com/webhook/v1/nibog/events/5/participants-for-certificates

Response (200 OK)

```json
{
  "event_id": 5,
  "event_name": "Baby Olympics 2025",
  "participants": [
    {
      "user_id": 10,
      "child_id": 15,
      "user_name": "Parent Name",
      "user_email": "parent@example.com",
      "child_name": "John Doe",
      "child_age": 24,
      "game_id": 3,
      "game_name": "Baby Crawling",
      "attendance_status": "attended",
      "position": null,
      "score": null
    },
    {
      "user_id": 11,
      "child_id": 16,
      "user_name": "Another Parent",
      "user_email": "parent2@example.com",
      "child_name": "Jane Smith",
      "child_age": 26,
      "game_id": 3,
      "game_name": "Baby Crawling",
      "attendance_status": "attended",
      "position": null,
      "score": null
    }
  ]
}
```





