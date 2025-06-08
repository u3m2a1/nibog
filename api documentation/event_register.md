POST https://ai.alviongs.com/webhook/v1/nibog/event-registration/create

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

## get all events

GET https://ai.alviongs.com/webhook/v1/nibog/event-registration/get-all

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
    "city_name": "Hyderabad",
    "state": "Telangana",
    "city_is_active": true,
    "city_created_at": "2025-05-05T06:30:15.838Z",
    "city_updated_at": "2025-05-05T06:30:15.838Z",
    "venue_id": 1,
    "venue_name": "NIBOG Stadium",
    "venue_address": "123 Elm Street",
    "venue_capacity": 5000,
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
        "game_id": 11,
        "game_title": "Hurdle Toddle",
        "game_description": "Lets play like there's no tomorrow.",
        "min_age": 13,
        "max_age": 84,
        "game_duration_minutes": 60,
        "categories": [
          "olympics",
          "physical",
          "competition"
        ],
        "custom_title": "Ball Pit Adventure",
        "custom_description": "A fun and colorful ball pit experience for toddlers.",
        "custom_price": 15,
        "start_time": "10:00:00",
        "end_time": "11:30:00",
        "slot_price": 5,
        "max_participants": 20
      },
      {
        "game_id": 11,
        "game_title": "Hurdle Toddle",
        "game_description": "Lets play like there's no tomorrow.",
        "min_age": 13,
        "max_age": 84,
        "game_duration_minutes": 60,
        "categories": [
          "olympics",
          "physical",
          "competition"
        ],
        "custom_title": "Ball Pit Adventure",
        "custom_description": "A fun and colorful ball pit experience for toddlers.",
        "custom_price": 15,
        "start_time": "10:00:00",
        "end_time": "11:30:00",
        "slot_price": 5,
        "max_participants": 20
      }
    ]
  },
  {
    "event_id": 19,
    "event_title": "Spring Carnival",
    "event_description": "A fun-filled day with games and activities.",
    "event_date": "2025-05-10T00:00:00.000Z",
    "event_status": "Published",
    "event_created_at": "2025-06-08T09:35:22.637Z",
    "event_updated_at": "2025-06-08T09:35:22.637Z",
    "city_id": 2,
    "city_name": "Vizag",
    "state": "AP",
    "city_is_active": true,
    "city_created_at": "2025-05-05T07:02:41.578Z",
    "city_updated_at": "2025-05-05T07:02:41.578Z",
    "venue_id": 2,
    "venue_name": "S3 Sports",
    "venue_address": "218 North Texas blvd",
    "venue_capacity": 5000,
    "venue_is_active": true,
    "venue_created_at": "2025-05-05T07:13:10.074Z",
    "venue_updated_at": "2025-05-05T07:13:10.074Z",
    "games": [
      {
        "game_id": 2,
        "game_title": "Obstacle Course",
        "game_description": "A fun physical activity with various obstacles.",
        "min_age": 7,
        "max_age": 26,
        "game_duration_minutes": 60,
        "categories": [
          "running race",
          "vally ball"
        ],
        "custom_title": "Mini Golf Challenge",
        "custom_description": "Try to score a hole-in-one!",
        "custom_price": 5,
        "start_time": "10:00:00",
        "end_time": "11:30:00",
        "slot_price": 5,
        "max_participants": 20
      },
      {
        "game_id": 2,
        "game_title": "Obstacle Course",
        "game_description": "A fun physical activity with various obstacles.",
        "min_age": 7,
        "max_age": 26,
        "game_duration_minutes": 60,
        "categories": [
          "running race",
          "vally ball"
        ],
        "custom_title": "Mini Golf Challenge",
        "custom_description": "Try to score a hole-in-one!",
        "custom_price": 5,
        "start_time": "10:00:00",
        "end_time": "11:30:00",
        "slot_price": 5,
        "max_participants": 20
      },
      {
        "game_id": 2,
        "game_title": "Obstacle Course",
        "game_description": "A fun physical activity with various obstacles.",
        "min_age": 7,
        "max_age": 26,
        "game_duration_minutes": 60,
        "categories": [
          "running race",
          "vally ball"
        ],
        "custom_title": "Ball Pit Bonanza",
        "custom_description": "Dive into fun!",
        "custom_price": 3.5,
        "start_time": "12:00:00",
        "end_time": "13:00:00",
        "slot_price": 3.5,
        "max_participants": 15
      },
      {
        "game_id": 2,
        "game_title": "Obstacle Course",
        "game_description": "A fun physical activity with various obstacles.",
        "min_age": 7,
        "max_age": 26,
        "game_duration_minutes": 60,
        "categories": [
          "running race",
          "vally ball"
        ],
        "custom_title": "Ball Pit Bonanza",
        "custom_description": "Dive into fun!",
        "custom_price": 3.5,
        "start_time": "12:00:00",
        "end_time": "13:00:00",
        "slot_price": 3.5,
        "max_participants": 15
      }
    ]
  },
  {
    "event_id": 12,
    "event_title": "Friday Fun Bonanza",
    "event_description": "Hyderabad Biggest event",
    "event_date": "2025-06-30T00:00:00.000Z",
    "event_status": "Published",
    "event_created_at": "2025-05-31T10:28:02.579Z",
    "event_updated_at": "2025-05-31T10:28:02.579Z",
    "city_id": 1,
    "city_name": "Hyderabad",
    "state": "Telangana",
    "city_is_active": true,
    "city_created_at": "2025-05-05T06:30:15.838Z",
    "city_updated_at": "2025-05-05T06:30:15.838Z",
    "venue_id": 1,
    "venue_name": "NIBOG Stadium",
    "venue_address": "123 Elm Street",
    "venue_capacity": 5000,
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
      }
    ]
  },
  {
    "event_id": 16,
    "event_title": "LaughFest Carnival",
    "event_description": "A fun-filled games.",
    "event_date": "2025-07-30T00:00:00.000Z",
    "event_status": "Published",
    "event_created_at": "2025-06-03T11:41:10.804Z",
    "event_updated_at": "2025-06-03T11:41:10.804Z",
    "city_id": 2,
    "city_name": "Vizag",
    "state": "AP",
    "city_is_active": true,
    "city_created_at": "2025-05-05T07:02:41.578Z",
    "city_updated_at": "2025-05-05T07:02:41.578Z",
    "venue_id": 2,
    "venue_name": "S3 Sports",
    "venue_address": "218 North Texas blvd",
    "venue_capacity": 5000,
    "venue_is_active": true,
    "venue_created_at": "2025-05-05T07:13:10.074Z",
    "venue_updated_at": "2025-05-05T07:13:10.074Z",
    "games": [
      {
        "game_id": 2,
        "game_title": "Obstacle Course",
        "game_description": "A fun physical activity with various obstacles.",
        "min_age": 7,
        "max_age": 26,
        "game_duration_minutes": 60,
        "categories": [
          "running race",
          "vally ball"
        ],
        "custom_title": "Mini Golf Challenge",
        "custom_description": "Try to score a hole-in-one!",
        "custom_price": 5,
        "start_time": "10:00:00",
        "end_time": "11:30:00",
        "slot_price": 5,
        "max_participants": 20
      },
      {
        "game_id": 2,
        "game_title": "Obstacle Course",
        "game_description": "A fun physical activity with various obstacles.",
        "min_age": 7,
        "max_age": 26,
        "game_duration_minutes": 60,
        "categories": [
          "running race",
          "vally ball"
        ],
        "custom_title": "Ball Pit Bonanza",
        "custom_description": "Dive into fun!",
        "custom_price": 3.5,
        "start_time": "12:00:00",
        "end_time": "13:00:00",
        "slot_price": 3.5,
        "max_participants": 15
      }
    ]
  },
  {
    "event_id": 17,
    "event_title": "Playtime Fiesta",
    "event_description": "A fun-filled games.",
    "event_date": "2025-07-30T00:00:00.000Z",
    "event_status": "Published",
    "event_created_at": "2025-06-08T07:56:52.731Z",
    "event_updated_at": "2025-06-08T07:56:52.731Z",
    "city_id": 2,
    "city_name": "Vizag",
    "state": "AP",
    "city_is_active": true,
    "city_created_at": "2025-05-05T07:02:41.578Z",
    "city_updated_at": "2025-05-05T07:02:41.578Z",
    "venue_id": 2,
    "venue_name": "S3 Sports",
    "venue_address": "218 North Texas blvd",
    "venue_capacity": 5000,
    "venue_is_active": true,
    "venue_created_at": "2025-05-05T07:13:10.074Z",
    "venue_updated_at": "2025-05-05T07:13:10.074Z",
    "games": [
      {
        "game_id": null,
        "game_title": null,
        "game_description": null,
        "min_age": null,
        "max_age": null,
        "game_duration_minutes": null,
        "categories": null,
        "custom_title": null,
        "custom_description": null,
        "custom_price": null,
        "start_time": null,
        "end_time": null,
        "slot_price": null,
        "max_participants": null
      }
    ]
  }
]
## get event


POST https://ai.alviongs.com/webhook/v1/nibog/event-registration/get

payload

{
  "id": 1
}



response 200 OK



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

## delete event


Delete https://ai.alviongs.com/webhook/v1/nibog/event-registration/delete

payload

{
  "id": 1
}


response 200 OK

[
  {
    "success": true
  }
]

## update event

POST https://ai.alviongs.com/webhook/v1/nibog/event-registration/update


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

response 200 OK


[
  {
    "success": true
  }
]

## get event by city id


POST https://ai.alviongs.com/webhook/v1/nibog/event-registration/getbycityid

payload

{
  "city_id": 1
}


response 200 OK


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