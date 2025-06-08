## create baby game 
POST https://ai.alviongs.com/webhook/v1/nibog/babygame/create

{
  "game_name": "Baby Crawling",
  "game_description": "Let your little crawler compete in a fun and safe environment.",
  "min_age_months": 5,
  "max_age_months": 13,
  "duration_minutes": 60,
  "categories": ["olympics", "physical", "competition"],
  "is_active": true
}

Response (201 Created)

[
  {
    "id": 1,
    "game_name": "Obstacle Course",
    "description": "A fun physical activity with various obstacles.",
    "min_age": 7,
    "max_age": 26,
    "duration_minutes": 60,
    "categories": ["olympics", "physical", "competition"],
    "is_active": true,
    "created_at": "2025-04-27T00:57:08.538Z",
    "updated_at": "2025-04-27T00:57:08.538Z"
  }
]

## Get baby game list

GET https://ai.alviongs.com/webhook/v1/nibog/babygame/get-all

Response (200 OK)
[
  {
    "id": 1,
    "game_name": "Obstacle Course",
    "description": "A fun physical activity with various obstacles.",
    "min_age": 7,
    "max_age": 26,
    "duration_minutes": 60,
    "categories": [
      "running race",
      "vally ball"
    ],
    "is_active": true,
    "created_at": "2025-04-27T00:57:08.538Z",
    "updated_at": "2025-04-27T00:57:08.538Z"
  }
]

## Get baby game by id

POST https://ai.alviongs.com/webhook/v1/nibog/babygame/get
{
    "id": 1
}

Response (200 OK)
[
  {
    "id": 1,
    "game_name": "Obstacle Course",
    "description": "A fun physical activity with various obstacles.",
    "min_age": 7,
    "max_age": 26,
    "duration_minutes": 60,
    "categories": [
      "running race",
      "vally ball"
    ],
    "is_active": true,
    "created_at": "2025-04-27T00:57:08.5    38Z",
    "updated_at": "2025-04-27T00:57:08.538Z"
  }
]

## Update baby game

POST https://ai.alviongs.com/webhook/v1/nibog/babygame/update
{
  "id": 1,
  "game_name": "Obstacle Course",
  "description": "A fun physical activity with various obstacles.",
  "min_age": 7,
  "max_age": 26,
  "duration_minutes": 60,
  "categories": [
    "running race",
    "vally ball"
  ],
  "is_active": true
}

Response (200 OK)

[
  {
    "id": 1,
    "game_name": "Obstacle Course",
    "description": "A fun physical activity with various obstacles.",
    "min_age": 7,
    "max_age": 26,
    "duration_minutes": 60,
    "categories": [
      "running race",
      "vally ball"
    ],
    "is_active": true,
    "created_at": "2025-04-27T00:57:08.538Z",
    "updated_at": "2025-04-27T00:57:08.538Z"
  }
]

## Delete baby game

POST https://ai.alviongs.com/webhook/v1/nibog/babygame/delete
{
  "id": 1
}

Response (200 OK)

[
  {
    "success": true
  }
]






