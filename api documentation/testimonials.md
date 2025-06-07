## create testimonial

POST https://ai.alviongs.com/webhook/v1/nibog/testimonials/create

payload

{
  "name": "Harikrishna",
  "city_id": 2,
  "event_id": 16,
  "rating": 5,
  "testimonial": "The annual NIBOG game has been a huge hit with my kids. They love competing in different challenges and games, and it's been great for their confidence and self-esteem. I love that they're learning important life skills like perseverance and determination while they're having fun.",
  "status_id": 1,
  "date": "2025-10-15"
}

response

[
  {
    "id": 2,
    "name": "Harikrishna",
    "city_id": 2,
    "event_id": 16,
    "rating": 5,
    "testimonial": "The annual NIBOG game has been a huge hit with my kids. They love competing in different challenges and games, and it's been great for their confidence and self-esteem. I love that they're learning important life skills like perseverance and determination while they're having fun.",
    "status_id": 1,
    "date": "2025-10-15T00:00:00.000Z",
    "created_at": "2025-06-06T18:01:27.103Z",
    "updated_at": "2025-06-06T18:01:27.103Z"
  }
]

## get testimonial by id  

POST https://ai.alviongs.com/webhook/v1/nibog/testimonials/get
{
    "id": 2
}

response

[
  {
    "id": 2,
    "name": "Harikrishna",
    "city_id": 2,
    "event_id": 16,
    "rating": 5,
    "testimonial": "The annual NIBOG game has been a huge hit with my kids. They love competing in different challenges and games, and it's been great for their confidence and self-esteem. I love that they're learning important life skills like perseverance and determination while they're having fun.",
    "status_id": 1,
    "date": "2025-10-15T00:00:00.000Z",
    "created_at": "2025-06-06T18:01:27.103Z",
    "updated_at": "2025-06-06T18:01:27.103Z"
  }
]

## get all testimonials

GET https://ai.alviongs.com/webhook/v1/nibog/testimonials/get-all

response

[
  {
    "id": 1,
    "name": "Harikrishna",
    "city_id": 1,
    "event_id": 1,
    "rating": 5,    
    "testimonial": "The annual NIBOG game has been a huge hit with my kids. They love competing in different challenges and games, and it's been great for their confidence and self-esteem. I love that they're learning important life skills like perseverance and determination while they're having fun.",
    "status_id": 1,
    "date": "2025-10-15", 
    "created_at": "2025-10-15T10:00:00.000Z",
    "updated_at": "2025-10-15T10:00:00.000Z"
  }
] 

## update testimonial

PUT https://ai.alviongs.com/webhook/v1/nibog/testimonials/update
{
    "id": 1,
    "name": "Harikrishna",
    "city_id": 1,
    "event_id": 1,
    "rating": 5,
    "testimonial": "The annual NIBOG game has been a huge hit with my kids. They love competing in different challenges and games, and it's been great for their confidence and self-esteem. I love that they're learning important life skills like perseverance and determination while they're having fun.",
    "status_id": 1,
    "date": "2025-10-15"
}

response

[
  {
    "id": 1,
    "name": "Harikrishna",
    "city_id": 1,
    "event_id": 1,
    "rating": 5,    
    "testimonial": "The annual NIBOG game has been a huge hit with my kids. They love competing in different challenges and games, and it's been great for their confidence and self-esteem. I love that they're learning important life skills like perseverance and determination while they're having fun.",
    "status_id": 1,
    "date": "2025-10-15", 
    "created_at": "2025-10-15T10:00:00.000Z",
    "updated_at": "2025-10-15T10:00:00.000Z"
  }
] 

## delete testimonial

DELETE https://ai.alviongs.com/webhook/v1/nibog/testimonials/delete
{
    "id": 1
}

response

[
  {
    "success": true
  }
] 
