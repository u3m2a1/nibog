## Create a Role

POST https://ai.alviongs.com/webhook/v1/nibog/role/create
Content-Type: application/json

{
  "name": "admin",
  "description": "Full-access administrator"
}

Response (201 Created)

json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "admin",
  "description": "Full-access administrator",
  "created_at": "2025-04-25T08:32:14.123Z",
  "updated_at": "2025-04-25T08:32:14.123Z"
}


## Get All Roles


GET https://ai.alviongs.com/webhook/vl/nibog/role/list

Response (201 Created)

[
    {
        "id": "7a4c5c4e-ddd8-468e-8881-8475dd88e012",
        "name": "ramu",
        "description": "Full-access administrator",
        "created_at": "2025-04-24T23:03:44.486Z",
        "updated_at": "2025-04-24T23:03:44.486Z"
    },
    {
        "id": "889cc494-fe89-48b7-a963-bc56fff43107",
        "name": "aunil",
        "description": "Full-access administrator",
        "created_at": "2025-04-24T23:04:43.052Z",
        "updated_at": "2025-04-24T23:04:43.052Z"
    }
]



## Get a Role

POST https://ai.alviongs.com/webhook/vl/nibog/role/get

Content-Type: application/json

{
    "id":"7a4c5c4e-ddd8-468e-8881-8475dd88e012"
}

Response (201 Created)

{
    "id": "7a4c5c4e-ddd8-468e-8881-8475dd88e012",
    "name": "ramu",
    "description": "Full-access administrator",
    "created_at": "2025-04-24T23:03:44.486Z",
    "updated_at": "2025-04-24T23:03:44.486Z"
}





## Update a Role

PUT https://ai.alviongs.com/webhook/vl/nibog/role/update
Content-Type: application/json

{
    "id":"7a4c5c4e-ddd8-468e-8881-8475dd88e012",
    "name":"suni",
    "description":"update test"
}

Response (201 Created)

[
  {
    "id": "7a4c5c4e-ddd8-468e-8881-8475dd88e012",
    "name": "suni",
    "description": "update test",
    "created_at": "2025-04-24T23:03:44.486Z",
    "updated_at": "2025-04-24T23:03:44.486Z"
  }
]



## Delete a Role

DELETE https://ai.alviongs.com/webhook/vl/nibog/role/delete

Content-Type: application/json

{
    "id":"7a4c5c4e-ddd8-468e-8881-8475dd88e012"
}

Response (201 Created)

[
  {
    "success": true
  }
]








