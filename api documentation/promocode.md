## create promocode

POST https://ai.alviongs.com/webhook/v1/nibog/promocode/create

payload

{

  "promo_code": "NIBOG25",
  "type": "percentage",
  "value": 25,
  "valid_from": "2025-01-01T00:00:00Z",
  "valid_to": "2025-12-31T23:59:59Z",
  "usage_limit": 1000,
  "minimum_purchase_amount": 1000,
  "maximum_discount_amount": 500,
  "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
  "events": [
    {
      "id": 1,
      "games_id": [4, 5]
    },
    {
      "id": 2,
      "games_id": []
    },
    {
      "id": 3,
      "games_id": [6]
    }
  ]
}

response

[
    {
        "headers": {
            "host": "localhost",
            "x-real-ip": "49.204.161.191",
            "x-real-port": "20435",
            "x-forwarded-for": "49.204.161.191",
            "remote-host": "49.204.161.191",
            "connection": "upgrade",
            "content-length": "511",
            "content-type": "application/json",
            "user-agent": "PostmanRuntime/7.44.0",
            "accept": "*/*",
            "postman-token": "5001030b-d7fd-48b1-a440-89044bac40a4",
            "accept-encoding": "gzip, deflate, br"
        },
        "params": {},
        "query": {},
        "body": {
            "promo_code": "NIBOG25",
            "type": "percentage",
            "value": 25,
            "valid_from": "2025-01-01T00:00:00Z",
            "valid_to": "2025-12-31T23:59:59Z",
            "usage_limit": 1000,
            "minimum_purchase_amount": 1000,
            "maximum_discount_amount": 500,
            "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
            "events": [
                {
                    "id": 1,
                    "games_id": [
                        4,
                        5
                    ]
                },
                {
                    "id": 2,
                    "games_id": []
                },
                {
                    "id": 3,
                    "games_id": [
                        6
                    ]
                }
            ]
        },
    }
]


## get promocode by id and status

GET https://ai.alviongs.com/webhook/v1/nibog/promocode/get-by-status
{
    "id": 1,
    "is_active": true
}

response

[
  {
    "id": 1,
    "promo_code": "NIBOG25",
    "type": "percentage",
    "value": 25,
    "valid_from": "2025-01-01",
    "valid_to": "2025-12-31",
    "usage_limit": 1000,
    "usage_count": 0,
    "minimum_purchase_amount": 1000,
    "maximum_discount_amount": 500,
    "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
    "created_at": "2025-05-07T18:41:35.185Z",
    "updated_at": "2025-05-07T18:41:35.185Z"
  }
]


## get promocode by id

GET https://ai.alviongs.com/webhook/v1/nibog/promocode/get
{
    "id": 1
}

response


[
  {
    "promo_data": {
      "events": [
        {
          "games": [
            {
              "id": 2,
              "max_age": 26,
              "min_age": 7,
              "game_name": "Obstacle Course",
              "is_active": true,
              "categories": [
                "running race",
                "vally ball"
              ],
              "description": "A fun physical activity with various obstacles.",
              "duration_minutes": 60
            },
            {
              "id": 4,
              "max_age": 15,
              "min_age": 5,
              "game_name": "Baby Crawling",
              "is_active": true,
              "categories": [
                "Family Events",
                "Kids Activities",
                "Baby Competitions"
              ],
              "description": "Baby Crawling Race is a fun and lighthearted game where babies compete by crawling toward a finish line, cheered on by excited parents and spectators. The goal is simple: the first baby to crawl across the line wins! It’s a playful event often held at family gatherings or community festivals, bringing lots of laughter and unforgettable moments.",
              "duration_minutes": 120
            }
          ],
          "event_details": {
            "id": 11,
            "title": "Spring Carnival",
            "status": "Published",
            "city_id": 1,
            "venue_id": 1,
            "event_date": "2025-05-10",
            "description": "A fun-filled day with games and activities."
          }
        }
      ],
      "promo_details": {
        "id": 4,
        "type": "percentage",
        "value": 5,
        "valid_to": "2025-06-30T23:59:59",
        "is_active": true,
        "created_at": "2025-06-05T21:04:41.586422",
        "promo_code": "test",
        "updated_at": "2025-06-05T21:04:41.586422",
        "valid_from": "2025-06-01T00:00:00",
        "description": "wertyuiop",
        "usage_count": 0,
        "usage_limit": 100,
        "maximum_discount_amount": 200,
        "minimum_purchase_amount": 50
      }
    }
  }
]




## get all promocode

GET https://ai.alviongs.com/webhook/v1/nibog/promocode/get-all

response

[
  {
    "id": 1,
    "promo_code": "NIBOG25",
    "type": "percentage",
    "value": 25,
    "valid_from": "2025-01-01",
    "valid_to": "2025-12-31",
    "usage_limit": 1000,
    "usage_count": 0,
    "minimum_purchase_amount": 1000,
    "maximum_discount_amount": 500,
    "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
    "created_at": "2025-05-07T18:41:35.185Z",
    "updated_at": "2025-05-07T18:41:35.185Z"
  }
]



GET https://ai.alviongs.com/webhook/v1/nibog/promocode/get-all

response

[
  {
    "id": 1,
    "promo_code": "NIBOG25",
    "type": "percentage",
    "value": 25,
    "valid_from": "2025-01-01",
    "valid_to": "2025-12-31",
    "usage_limit": 1000,
    "usage_count": 0,
    "minimum_purchase_amount": 1000,
    "maximum_discount_amount": 500,
    "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
    "created_at": "2025-05-07T18:41:35.185Z",
    "updated_at": "2025-05-07T18:41:35.185Z"
  }
]


## update promocode

POST https://ai.alviongs.com/webhook/v1/nibog/promocode/update

payload

{
  "id": 42,  // ← promo_code ID from DB
  "promo_code": "NIBOG25",
  "type": "percentage",
  "value": 25,
  "valid_from": "2025-01-01T00:00:00Z",
  "valid_to": "2025-12-31T23:59:59Z",
  "usage_limit": 1000,
  "minimum_purchase_amount": 1000,
  "maximum_discount_amount": 500,
  "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
  "events": [
    {
      "id": 1,
      "games_id": [4, 5]
    },
    {
      "id": 2,
      "games_id": []
    },
    {
      "id": 3,
      "games_id": [6]
    }
  ]
}

response

[
  {
    "id": 11,
    "promo_code": "NIBOG25",
    "type": "percentage",
    "value": "25.00",
    "valid_from": "2025-01-01T00:00:00.000Z",
    "valid_to": "2025-12-31T00:00:00.000Z",
    "usage_limit": 1000,
    "usage_count": 0,
    "minimum_purchase_amount": "1000.00",
    "maximum_discount_amount": "500.00",
    "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
    "created_at": "2025-06-06T07:27:09.932Z",
    "updated_at": "2025-06-06T07:27:09.932Z",
    "is_active": false
  }
]



## delete promocode

POST https://ai.alviongs.com/webhook/v1/nibog/promocode/delete
{
    "id": 1
}

response

[
  {
    "success": true
  }
]


## get promocode by code

GET https://ai.alviongs.com/webhook/v1/nibog/promocode/get-by-code

payload

{
    "promo_code": "NIBOG25"
}

response

[
  {
    "id": 1,
    "promo_code": "NIBOG25",
    "type": "percentage",
    "value": 25,
    "valid_from": "2025-01-01",
    "valid_to": "2025-12-31",
    "usage_limit": 1000,
    "usage_count": 0,
    "minimum_purchase_amount": 1000,
    "maximum_discount_amount": 500,
    "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
    "created_at": "2025-05-07T18:41:35.185Z", 
    "updated_at": "2025-05-07T18:41:35.185Z"
  }
]


## get promocode by event id

GET https://ai.alviongs.com/webhook/v1/nibog/promocode/get-by-event
{
    "event_id": 1
}

response

[
  {
    "id": 1,
    "promo_code": "NIBOG25",
    "type": "percentage",
    "value": 25,
    "valid_from": "2025-01-01",
    "valid_to": "2025-12-31",
    "usage_limit": 1000,
    "usage_count": 0,
    "minimum_purchase_amount": 1000,
    "maximum_discount_amount": 500,
    "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
    "created_at": "2025-05-07T18:41:35.185Z",
    "updated_at": "2025-05-07T18:41:35.185Z"
  }
]


## get promocode by game id

GET https://ai.alviongs.com/webhook/v1/nibog/promocode/get-by-game
{
    "game_id": 1
}

response

[
  {
    "id": 1,
    "promo_code": "NIBOG25",
    "type": "percentage",
    "value": 25,
    "valid_from": "2025-01-01",
      "valid_to": "2025-12-31",
    "usage_limit": 1000,
    "minimum_purchase_amount": 1000,
    "maximum_discount_amount": 500,
    "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
    "created_at": "2025-05-07T18:41:35.185Z",
    "updated_at": "2025-05-07T18:41:35.185Z"
  }
]

## update promocode status

PUT https://ai.alviongs.com/webhook/v1/nibog/promocode/update-status
{
    "id": 1,
    "is_active": false
}

response

[
  {
    "id": 1,
    "promo_code": "NIBOG25",
    "type": "percentage",
    "value": 25,
    "valid_from": "2025-01-01",
    "valid_to": "2025-12-31", 
    "usage_limit": 1000,
    "minimum_purchase_amount": 1000,
    "maximum_discount_amount": 500,
    "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
    "created_at": "2025-05-07T18:41:35.185Z",
    "updated_at": "2025-05-07T18:41:35.185Z"
  }
]

## get promocode by status

GET https://ai.alviongs.com/webhook/v1/nibog/promocode/get-by-status
{
    "is_active": true
}

response

[
  {
    "id": 1,
    "promo_code": "NIBOG25",
    "type": "percentage",
    "value": 25,
    "valid_from": "2025-01-01",
    "valid_to": "2025-12-31",
    "usage_limit": 1000,
    "minimum_purchase_amount": 1000,
    "maximum_discount_amount": 500,
    "description": "25% off on all NIBOG events. Maximum discount of ₹500.",
    "created_at": "2025-05-07T18:41:35.185Z",
    "updated_at": "2025-05-07T18:41:35.185Z"
  }
]


















