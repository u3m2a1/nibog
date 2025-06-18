## create event

POST https://ai.alviongs.com/webhook/v1/nibog/event/create

Payload

{
    "title" : "Playtime Fiesta",
    "description" : "A fun-filled games.",
    "city_id" : 2,
    "venue_id" : 1,
    "event_date" : "2025-07-30",
    "status" : "Published"
}

Response (201 Created)

[
  {
    "id": 17,
    "title": "Playtime Fiesta",
    "description": "A fun-filled games.",
    "city_id": 2,
    "venue_id": 2,
    "event_date": "2025-07-30T00:00:00.000Z",
    "status": "Published",
    "created_at": "2025-06-08T07:56:52.731Z",
    "updated_at": "2025-06-08T07:56:52.731Z"
  }
]

## get event

POST https://ai.alviongs.com/webhook/v1/nibog/event/get
{
    "id": 17
}

Response (200 OK)

[
  {
    "id": 17,
    "title": "Playtime Fiesta",
    "description": "A fun-filled games.",
    "city_id": 2,
    "venue_id": 2,
    "event_date": "2025-07-30T00:00:00.000Z",
    "status": "Published",
    "created_at": "2025-06-08T07:56:52.731Z",
    "updated_at": "2025-06-08T07:56:52.731Z"
  }
]

## get all events

GET https://ai.alviongs.com/webhook/v1/nibog/event/get-all

Response (200 OK)

[
  {
    "id": 11,
    "title": "Spring Carnival",
    "description": "A fun-filled day with games and activities.",
    "city_id": 1,
    "venue_id": 1,
    "event_date": "2025-05-10T00:00:00.000Z",
    "status": "Published",
    "created_at": "2025-05-05T10:15:15.750Z",
    "updated_at": "2025-05-05T10:15:15.750Z"
  },
  {
    "id": 12,
    "title": "Friday Fun Bonanza",
    "description": "Hyderabad Biggest event",
    "city_id": 1,
    "venue_id": 1,
    "event_date": "2025-06-30T00:00:00.000Z",
    "status": "Published",
    "created_at": "2025-05-31T10:28:02.579Z",
    "updated_at": "2025-05-31T10:28:02.579Z"
  },
  {
    "id": 16,
    "title": "Spring Carnival",
    "description": "A fun-filled day with games and activities.",
    "city_id": 2,
    "venue_id": 2,
    "event_date": "2025-05-10T00:00:00.000Z",
    "status": "Published",
    "created_at": "2025-06-03T11:41:10.804Z",
    "updated_at": "2025-06-03T11:41:10.804Z"
  },
  {
    "id": 17,
    "title": "Playtime Fiesta",
    "description": "A fun-filled games.",
    "city_id": 2,
    "venue_id": 2,
    "event_date": "2025-07-30T00:00:00.000Z",
    "status": "Published",
    "created_at": "2025-06-08T07:56:52.731Z",
    "updated_at": "2025-06-08T07:56:52.731Z"
  }
]

## update event

POST https://ai.alviongs.com/webhook/v1/nibog/event/update

payload

{
    "id": 17,
    "title": "Playtime Fiesta",
    "description": "A fun-filled games.",
    "city_id": 2,
    "venue_id": 2,
    "event_date": "2025-07-30",
    "status": "Published"
}

response

[
  {
    "id": 17,
    "title": "Playtime Fiesta",
    "description": "A fun-filled games.",
    "city_id": 2,
    "venue_id": 2,
    "event_date": "2025-07-30T00:00:00.000Z",
    "status": "Published",
    "created_at": "2025-06-08T07:56:52.731Z",
    "updated_at": "2025-06-08T07:56:52.731Z"
  }
]

## delete event

POST https://ai.alviongs.com/webhook/v1/nibog/event/delete
{
    "id": 17
}

response

[
  {
    "success": true
  }
]

## Get Upcoming Events 

GET https://ai.alviongs.com/webhook/v1/nibog/events/upcoming-events

Response (200 OK)

[
  {
    "id": 12,
    "title": "Friday Fun Bonanza",
    "description": "Hyderabad Biggest event",
    "city_id": 1,
    "venue_id": 1,
    "event_date": "2025-06-29T18:30:00.000Z",
    "status": "Published",
    "created_at": "2025-05-31T04:58:02.579Z",
    "updated_at": "2025-05-31T04:58:02.579Z"
  },
  {
    "id": 21,
    "title": "Mini Miracles Marathon",
    "description": "A fun-filled race for babies and toddlers! Whether they crawl or toddle, every little step is a big win. Parents are welcome to cheer or join in. Smiles, giggles, and medals guaranteed!",
    "city_id": 1,
    "venue_id": 1,
    "event_date": "2025-06-29T18:30:00.000Z",
    "status": "Published",
    "created_at": "2025-06-09T04:02:40.122Z",
    "updated_at": "2025-06-09T04:02:40.122Z"
  },
  {
    "id": 24,
    "title": "Friday Fun Bonanza (Copy)",
    "description": "Hyderabad Biggest event",
    "city_id": 1,
    "venue_id": 1,
    "event_date": "2025-07-06T18:30:00.000Z",
    "status": "Published",
    "created_at": "2025-06-09T05:44:45.103Z",
    "updated_at": "2025-06-09T05:44:45.103Z"
  },
  {
    "id": 17,
    "title": "Playtime Fiesta",
    "description": "A fun-filled games.",
    "city_id": 2,
    "venue_id": 2,
    "event_date": "2025-07-29T18:30:00.000Z",
    "status": "Published",
    "created_at": "2025-06-08T02:26:52.731Z",
    "updated_at": "2025-06-08T02:26:52.731Z"
  },
  {
    "id": 16,
    "title": "LaughFest Carnival",
    "description": "A fun-filled games.",
    "city_id": 2,
    "venue_id": 2,
    "event_date": "2025-07-29T18:30:00.000Z",
    "status": "Published",
    "created_at": "2025-06-03T06:11:10.804Z",
    "updated_at": "2025-06-03T06:11:10.804Z"
  }
]








