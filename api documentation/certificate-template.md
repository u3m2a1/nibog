## Certificate Templates API

### Create Certificate Template

**POST** https://ai.alviongs.com/webhook/v1/nibog/certificate-templates/create

Payload

```json
 {
  "name": "Winner Certificate",
  "description": "Certificate awarded to winners of the event",
  "type": "winner",
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
  ],
  "appreciation_text": "For achieving {achievement} in {event_name}. Your dedication, talent, and outstanding performance at NIBOG have distinguished you among the best. Congratulations on this remarkable achievement from the entire NIBOG team!"
}
```

Response (201 Created)

```json
[
  {
    "id": 20,
    "name": "Winner Certificate",
    "description": "Certificate awarded to winners of the event",
    "type": "winner",
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
    "created_at": "2025-06-16T02:26:05.240Z",
    "updated_at": "2025-06-16T02:26:05.240Z",
    "appreciation_text": "For achieving {achievement} in {event_name}. Your dedication, talent, and outstanding performance at NIBOG have distinguished you among the best. Congratulations on this remarkable achievement from the entire NIBOG team!"
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

### Generate Single Certificate

**POST** https://ai.alviongs.com/webhook/v1/nibog/certificate/generate-single

Payload

```json
{
  "template_id": 25,
  "event_id": 11,
  "game_id": 2,
  "user_id": 4, // This could be null or omitted if backend does lookup
  "parent_id": 35, // The parent_id from participants data
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
    "id": 5,
    "template_id": 25,
    "event_id": 11,
    "game_id": 2,
    "user_id": 4,
    "child_id": 5,
    "certificate_data": {
      "city_name": "Hyderabad",
      "event_name": "Spring Carnival",
      "venue_name": "NIBOG Stadium",
      "certificate_number": "CERT-1750082715606-ITGGYL"
    },
    "pdf_url": null,
    "status": "generated",
    "generated_at": "2025-06-16T08:41:30.702Z",
    "sent_at": null,
    "downloaded_at": null,
    "parent_email": "saarah",
    "parent_name": "sarah@example.com"
  }
]

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

**GET** https://ai.alviongs.com/webhook/v1/nibog/events/participants?event_id=11

Response (200 OK)

```json
[
  {
    "event_date": "2025-05-09T18:30:00.000Z",
    "venue_name": "NIBOG Stadium",
    "total_participants": 18,
    "participants": [
      {
        "booking_id": 11,
        "booking_ref": "nibog",
        "parent_id": 35,
        "parent_name": "saarah",
        "email": "sarah@example.com",
        "additional_phone": "+916303727148",
        "child_id": 35,
        "child_name": "dimbuu",
        "date_of_birth": "2018-05-11T18:30:00.000Z",
        "gender": "Female",
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Baby Crawling"
      },
      {
        "booking_id": 11,
        "booking_ref": "nibog",
        "parent_id": 35,
        "parent_name": "saarah",
        "email": "sarah@example.com",
        "additional_phone": "+916303727148",
        "child_id": 35,
        "child_name": "dimbuu",
        "date_of_birth": "2018-05-11T18:30:00.000Z",
        "gender": "Female",
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Obstacle Course"
      },
      {
        "booking_id": 12,
        "booking_ref": "nibog",
        "parent_id": 36,
        "parent_name": "sneha",
        "email": "sneha@example.com",
        "additional_phone": "+916303727148",
        "child_id": 36,
        "child_name": "dimbuu",
        "date_of_birth": "2018-05-11T18:30:00.000Z",
        "gender": "Female",
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Baby Crawling"
      },
      {
        "booking_id": 12,
        "booking_ref": "nibog",
        "parent_id": 36,
        "parent_name": "sneha",
        "email": "sneha@example.com",
        "additional_phone": "+916303727148",
        "child_id": 36,
        "child_name": "dimbuu",
        "date_of_birth": "2018-05-11T18:30:00.000Z",
        "gender": "Female",
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Obstacle Course"
      },
      {
        "booking_id": 13,
        "booking_ref": "nibog",
        "parent_id": 38,
        "parent_name": "uma",
        "email": "umakallepally6543@gmail.com",
        "additional_phone": "+919346015886",
        "child_id": 38,
        "child_name": "uma",
        "date_of_birth": "2023-12-31T18:30:00.000Z",
        "gender": "Female",
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Hurdle Toddle"
      },
      {
        "booking_id": 14,
        "booking_ref": "nibog",
        "parent_id": 39,
        "parent_name": "uma",
        "email": "umakallepally6543@gmail.com",
        "additional_phone": "+919346015886",
        "child_id": 39,
        "child_name": "uma",
        "date_of_birth": "2023-12-31T18:30:00.000Z",
        "gender": "Female",
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Hurdle Toddle"
      },
      {
        "booking_id": 15,
        "booking_ref": "nibog",
        "parent_id": 40,
        "parent_name": "uma",
        "email": "umakallepally6543@gmail.com",
        "additional_phone": "+919346015886",
        "child_id": 40,
        "child_name": "uma",
        "date_of_birth": "2023-12-31T18:30:00.000Z",
        "gender": "Female",
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Hurdle Toddle"
      },
      {
        "booking_id": 16,
        "booking_ref": "nibog",
        "parent_id": 41,
        "parent_name": "uma",
        "email": "umakallepally6543@gmail.com",
        "additional_phone": "+919346015886",
        "child_id": 41,
        "child_name": "uma",
        "date_of_birth": "2024-01-09T18:30:00.000Z",
        "gender": "Female",
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Hurdle Toddle"
      },
      {
        "booking_id": 17,
        "booking_ref": "nibog",
        "parent_id": 42,
        "parent_name": "harshitha",
        "email": "harshitha@gmail.com",
        "additional_phone": "+919346015886",
        "child_id": 42,
        "child_name": "harsh",
        "date_of_birth": "2023-12-31T18:30:00.000Z",
        "gender": "Female",
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Hurdle Toddle"
      },
      {
        "booking_id": 18,
        "booking_ref": "nibog",
        "parent_id": 43,
        "parent_name": "xyz",
        "email": "xyz@email.com",
        "additional_phone": "+919346015886",
        "child_id": 43,
        "child_name": "uma",
        "date_of_birth": "2024-01-19T18:30:00.000Z",
        "gender": "Female",
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Hurdle Toddle"
      },
      {
        "booking_id": 19,
        "booking_ref": "nibog",
        "parent_id": 44,
        "parent_name": "harsh",
        "email": "harsh@gmail.com",
        "additional_phone": "+919346015886",
        "child_id": 44,
        "child_name": "uma",
        "date_of_birth": "2024-01-01T18:30:00.000Z",
        "gender": "Female",
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Hurdle Toddle"
      },
      {
        "booking_id": 20,
        "booking_ref": "nibog",
        "parent_id": 45,
        "parent_name": "harshitha",
        "email": "harsh@gmail.com",
        "additional_phone": "+919346015886",
        "child_id": 45,
        "child_name": "harsh",
        "date_of_birth": "2023-12-31T18:30:00.000Z",
        "gender": "Female",
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Hurdle Toddle"
      },
      {
        "booking_id": 21,
        "booking_ref": "nibog",
        "parent_id": 46,
        "parent_name": "harshitha",
        "email": "harsh@gmail.com",
        "additional_phone": "+919346015886",
        "child_id": 46,
        "child_name": "harsh",
        "date_of_birth": "2023-12-31T18:30:00.000Z",
        "gender": "Female",
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Hurdle Toddle"
      },
      {
        "booking_id": 22,
        "booking_ref": "nibog",
        "parent_id": 47,
        "parent_name": "uma",
        "email": "umakallepally6543@gmail.com",
        "additional_phone": "+919346015886",
        "child_id": 47,
        "child_name": "umaaa",
        "date_of_birth": "2024-12-31T18:30:00.000Z",
        "gender": "Female",
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Baby Crawling"
      },
      {
        "booking_id": 23,
        "booking_ref": "nibog",
        "parent_id": 48,
        "parent_name": "test",
        "email": "test@gmail.com",
        "additional_phone": "+919876543210",
        "child_id": 48,
        "child_name": "ytdusid",
        "date_of_birth": "2024-12-31T18:30:00.000Z",
        "gender": "Female",
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Baby Crawling"
      },
      {
        "booking_id": 24,
        "booking_ref": "nibog",
        "parent_id": 49,
        "parent_name": "test2",
        "email": "test@gmail.com",
        "additional_phone": "+919876543210",
        "child_id": 49,
        "child_name": "test",
        "date_of_birth": "2024-12-31T18:30:00.000Z",
        "gender": "Female",
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Baby Crawling"
      },
      {
        "booking_id": 25,
        "booking_ref": "nibog",
        "parent_id": 50,
        "parent_name": "sneha",
        "email": "sneha@example.com",
        "additional_phone": "+916303727148",
        "child_id": 50,
        "child_name": "dimbuu",
        "date_of_birth": "2018-05-11T18:30:00.000Z",
        "gender": "Female",
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Baby Crawling"
      },
      {
        "booking_id": 25,
        "booking_ref": "nibog",
        "parent_id": 50,
        "parent_name": "sneha",
        "email": "sneha@example.com",
        "additional_phone": "+916303727148",
        "child_id": 50,
        "child_name": "dimbuu",
        "date_of_birth": "2018-05-11T18:30:00.000Z",
        "gender": "Female",
        "event_title": "Spring Carnival",
        "event_date": "2025-05-09T18:30:00.000Z",
        "venue_name": "NIBOG Stadium",
        "game_name": "Obstacle Course"
      }
    ]
  }
]