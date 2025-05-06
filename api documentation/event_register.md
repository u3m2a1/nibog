POST https://ai.alviongs.com/webhook/v1/nibog/event-game-slots/create

Payload


{
  "title": "Spring Carnival",
  "description": "A fun-filled day with games and activities.",
  "city_id": 25,
  "venue_id": 13,
  "event_date": "2025-05-10",
  "status": "Published",
  "created_at": "2025-04-28T10:00:00",
  "updated_at": "2025-04-29T15:00:00",
  "games": [
    {
      "game_id": 2,
      "custom_title": "Mini Golf Challenge",
      "custom_description": "Try to score a hole-in-one!",
      "custom_price": 5.00,
      "start_time": "10:00:00",
      "end_time": "11:30:00",
      "slot_price": 5.00,
      "max_participants": 20,
      "created_at": "2025-04-28T10:05:00",
      "updated_at": "2025-04-29T15:05:00"
    },
    {
      "game_id": 2,
      "custom_title": "Ball Pit Bonanza",
      "custom_description": "Dive into fun!",
      "custom_price": 3.50,
      "start_time": "12:00:00",
      "end_time": "13:00:00",
      "slot_price": 3.50,
      "max_participants": 15,
      "created_at": "2025-04-28T10:10:00",
      "updated_at": "2025-04-29T15:10:00"
    }
  ]
}









GET https://ai.alviongs.com/webhook/v1/nibog/event-game-slots/get-all

[
    {
        "event_id": 1,
        "event_title": "Spring Carnival",
        "event_description": "A fun-filled day with games and activities.",
        "event_date": "2025-05-10T00:00:00.000Z",
        "event_status": "Published",
        "event_created_at": "2025-05-05T06:50:57.431Z",
        "event_updated_at": "2025-05-05T06:50:57.431Z",
        "city_id": 1,
        "city_name": "Hyderbad",
        "state": "AP",
        "city_is_active": true,
        "city_created_at": "2025-05-05T06:30:15.838Z",
        "city_updated_at": "2025-05-05T06:30:15.838Z",
        "venue_id": 1,
        "venue_name": "KPHB",
        "venue_address": "218 North Texas blvd",
        "venue_capacity": 3000,
        "venue_is_active": true,
        "venue_created_at": "2025-05-05T06:31:00.910Z",
        "venue_updated_at": "2025-05-05T06:31:00.910Z",
        "games": [
            {
                "game_id": 2,
                "game_title": "Running race",
                "game_description": "asdf",
                "min_age": 5,
                "max_age": 32,
                "game_duration_minutes": 60,
                "categories": [
                    "asdf",
                    "dsafsa",
                    "dsafasdgfa"
                ],
                "custom_title": "Mini Golf Challenge",
                "custom_description": "Try to score a hole-in-one!",
                "custom_price": 5,
                "start_time": "10:00:00",
                "end_time": "11:30:00",
                "slot_price": 5,
                "max_participants": 20
            }
        ]
    },
    {
        "event_id": 2,
        "event_title": "sjasd",
        "event_description": "sadfasd",
        "event_date": "2025-05-22T00:00:00.000Z",
        "event_status": "Published",
        "event_created_at": "2025-05-05T06:53:03.135Z",
        "event_updated_at": "2025-05-05T06:53:03.135Z",
        "city_id": 1,
        "city_name": "Hyderbad",
        "state": "AP",
        "city_is_active": true,
        "city_created_at": "2025-05-05T06:30:15.838Z",
        "city_updated_at": "2025-05-05T06:30:15.838Z",
        "venue_id": 1,
        "venue_name": "KPHB",
        "venue_address": "218 North Texas blvd",
        "venue_capacity": 3000,
        "venue_is_active": true,
        "venue_created_at": "2025-05-05T06:31:00.910Z",
        "venue_updated_at": "2025-05-05T06:31:00.910Z",
        "games": [
            {
                "game_id": 2,
                "game_title": "Running race",
                "game_description": "asdf",
                "min_age": 5,
                "max_age": 32,
                "game_duration_minutes": 60,
                "categories": [
                    "asdf",
                    "dsafsa",
                    "dsafasdgfa"
                ],
                "custom_title": "Running race",
                "custom_description": "asdf",
                "custom_price": 799,
                "start_time": "10:00:00",
                "end_time": "11:30:00",
                "slot_price": 799,
                "max_participants": 12
            }
        ]
    }
]



POST https://ai.alviongs.com/webhook/v1/nibog/event-game-slots/get

payload

{
  "id": 1
}



response



[
    {
        "event_id": 11,
        "event_title": "Spring Carnival",
        "event_description": "A fun-filled day with games and activities.",
        "event_date": "2025-05-10T00:00:00.000Z",
        "event_status": "Published",
        "event_created_at": "2025-05-05T10:15:15.750Z",
        "event_updated_at": "2025-05-05T10:15:15.750Z",
        "city_id": 1,
        "city_name": "Hyderbad",
        "state": "AP",
        "city_is_active": true,
        "city_created_at": "2025-05-05T06:30:15.838Z",
        "city_updated_at": "2025-05-05T06:30:15.838Z",
        "venue_id": 1,
        "venue_name": "KPHB",
        "venue_address": "218 North Texas blvd",
        "venue_capacity": 3000,
        "venue_is_active": true,
        "venue_created_at": "2025-05-05T06:31:00.910Z",
        "venue_updated_at": "2025-05-05T06:31:00.910Z",
        "games": [
            {
                "game_id": 2,
                "game_title": "Running race",
                "game_description": "asdf",
                "min_age": 5,
                "max_age": 32,
                "game_duration_minutes": 60,
                "categories": [
                    "asdf",
                    "dsafsa",
                    "dsafasdgfa"
                ],
                "custom_title": "Mini Golf Challenge",
                "custom_description": "Try to score a hole-in-one!",
                "custom_price": 5,
                "start_time": "10:00:00",
                "end_time": "11:30:00",
                "slot_price": 5,
                "max_participants": 20
            }
        ]
    }
]











Delete https://ai.alviongs.com/webhook/v1/nibog/event-game-slots/delete

payload

{
  "id": 1
}


response

[
  {
    "success": true
  }
]












POST https://ai.alviongs.com/webhook/v1/nibog/event-game-slots/update


payload

{
    "id":"11",
  "title": "Spring Carnival",
  "description": "A fun-filled day with games and activities.",
  "city_id": 1,
  "venue_id": 1,
  "event_date": "2025-05-10",
  "status": "Published",
  "created_at": "2025-04-28T10:00:00",
  "updated_at": "2025-04-29T15:00:00",
  "games": [
    {
      "game_id": 3,
      "custom_title": "Mini Golf Challenge",
      "custom_description": "Try to score a hole-in-one!",
      "custom_price": 5.00,
      "start_time": "10:00:00",
      "end_time": "11:30:00",
      "slot_price": 5.00,
      "max_participants": 20,
      "created_at": "2025-04-28T10:05:00",
      "updated_at": "2025-04-29T15:05:00"
    }
  ]
}





response


[
  {
    "success": true
  }
]









POST https://ai.alviongs.com/webhook/v1/nibog/event-game-slots/getbycityid

payload

{
  "city_id": 1
}


response


[
    {
        "event_id": 11,
        "event_title": "Spring Carnival",
        "event_description": "A fun-filled day with games and activities.",
        "event_date": "2025-05-10T00:00:00.000Z",
        "event_status": "Published",
        "event_created_at": "2025-05-05T10:15:15.750Z",
        "event_updated_at": "2025-05-05T10:15:15.750Z",
        "city_id": 1,
        "city_name": "Hyderbad",
        "state": "AP",
        "city_is_active": true,
        "city_created_at": "2025-05-05T06:30:15.838Z",
        "city_updated_at": "2025-05-05T06:30:15.838Z",
        "venue_id": 1,
        "venue_name": "KPHB",
        "venue_address": "218 North Texas blvd",
        "venue_capacity": 3000,
        "venue_is_active": true,
        "venue_created_at": "2025-05-05T06:31:00.910Z",
        "venue_updated_at": "2025-05-05T06:31:00.910Z",
        "games": [
            {
                "game_id": 4,
                "game_title": "Baby Crawling",
                "game_description": "Baby Crawling Race is a fun and lighthearted game where babies compete by crawling toward a finish line, cheered on by excited parents and spectators. The goal is simple: the first baby to crawl across the line wins! It’s a playful event often held at family gatherings or community festivals, bringing lots of laughter and unforgettable moments.",
                "min_age": 5,
                "max_age": 15,
                "game_duration_minutes": 120,
                "categories": [
                    "Family Events",
                    "Kids Activities",
                    "Baby Competitions"
                ],
                "custom_title": "Baby Crawling",
                "custom_description": "Baby Crawling Race is a fun and lighthearted game where babies compete by crawling toward a finish line, cheered on by excited parents and spectators. The goal is simple: the first baby to crawl across the line wins! It’s a playful event often held at family gatherings or community festivals, bringing lots of laughter and unforgettable moments.",
                "custom_price": 799,
                "start_time": "10:00:00",
                "end_time": "11:30:00",
                "slot_price": 799,
                "max_participants": 12
            },
            {
                "game_id": 2,
                "game_title": "Running race",
                "game_description": "asdf",
                "min_age": 5,
                "max_age": 32,
                "game_duration_minutes": 60,
                "categories": [
                    "asdf",
                    "dsafsa",
                    "dsafasdgfa"
                ],
                "custom_title": "Running race",
                "custom_description": "asdf",
                "custom_price": 799,
                "start_time": "10:00:00",
                "end_time": "11:30:00",
                "slot_price": 799,
                "max_participants": 12
            }
        ]
    }
]




