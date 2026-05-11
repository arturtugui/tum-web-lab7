# API Testing Guide — Postman Examples

> Test all endpoints with proper request/response bodies and status codes.

**Terminology:** "body" is the HTTP term for request/response payload data.

---

## Setup: Get a Token First

All endpoints (except `/token`) require a Bearer token.

### 1. Get Owner Token

**Request:**

```
POST http://localhost:3000/auth/token
Content-Type: application/json

{
  "role": "owner"
}
```

**Response (201 Created):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoib3duZXIiLCJpYXQiOjE3Nzg0ODU2MzYsImV4cCI6MTc3ODQ4NTY5Nn0.BAEApqcHTCQTTb6F3C3i2FTmjIAQEHIZs36KsSUev-Q"
}
```

**In Postman:**

- Set Authorization tab → Bearer Token → paste the token value
- Or add header manually: `Authorization: Bearer <token>`

### 2. Get Viewer Token (for testing read-only access)

**Request:**

```
POST http://localhost:3000/auth/token
Content-Type: application/json

{
  "role": "viewer"
}
```

**Response (201 Created):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Endpoints Testing

### ✅ GET /items — Retrieve all items (paginated)

**Access:** All roles + token required

**Request:**

```
GET http://localhost:3000/items?limit=10&offset=0
Authorization: Bearer <token>
```

**Query Parameters:**

- `limit` (optional, default 10) — how many items to return
- `offset` (optional, default 0) — how many to skip

**Response (200 OK):**

```json
{
  "items": [
    {
      "id": 1,
      "title": "The Boys",
      "category": "series",
      "status": "in_progress",
      "coverUrl": "https://image.tmdb.org/...",
      "isHidden": false
    },
    {
      "id": 2,
      "title": "Apex Legends",
      "category": "game",
      "status": "in_progress",
      "rating": 9,
      "coverUrl": "https://cdn.cloudflare..."
    }
  ],
  "total": 7,
  "limit": 10,
  "offset": 0
}
```

**Test cases:**

- ✅ With owner token → 200 OK (returns items)
- ✅ With viewer token → 200 OK (returns items)
- ❌ Without token → 401 Unauthorized

---

### ✅ GET /items/:id — Retrieve single item by ID

**Access:** All roles + token required

**Request:**

```
GET http://localhost:3000/items/1
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "id": 1,
  "title": "The Boys",
  "category": "series",
  "status": "in_progress",
  "coverUrl": "https://image.tmdb.org/...",
  "isHidden": false
}
```

**Error Response (404 Not Found):**

```json
{
  "error": "Item with id 999 not found"
}
```

**Test cases:**

- ✅ Valid ID with token → 200 OK
- ❌ Invalid ID with token → 404 Not Found
- ❌ Without token → 401 Unauthorized

---

### ✅ POST /items — Create new item

**Access:** Owner only + token required

**Request:**

```
POST http://localhost:3000/items
Content-Type: application/json
Authorization: Bearer <owner_token>

{
  "id": 8,
  "title": "Demon Slayer",
  "category": "anime",
  "status": "planned",
  "rating": 9,
  "coverUrl": "https://example.com/image.jpg",
  "notes": "Amazing animation",
  "episodes": 26
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "item": {
    "id": 8,
    "title": "Demon Slayer",
    "category": "anime",
    "status": "planned",
    "rating": 9,
    "coverUrl": "https://example.com/image.jpg",
    "notes": "Amazing animation",
    "episodes": 26
  }
}
```

**Error Response (400 Bad Request) — missing required fields:**

```json
{
  "error": "Missing required fields: id, title, category, status"
}
```

**Test cases:**

- ✅ Owner token + valid body → 201 Created
- ❌ Owner token + missing fields → 400 Bad Request
- ❌ Viewer token + valid body → 403 Forbidden
- ❌ Without token → 401 Unauthorized

---

### ✅ PUT /items/:id — Replace entire item

**Access:** Owner only + token required

**Request:**

```
PUT http://localhost:3000/items/1
Content-Type: application/json
Authorization: Bearer <owner_token>

{
  "id": 1,
  "title": "The Boys (Updated)",
  "category": "series",
  "status": "completed",
  "rating": 8,
  "coverUrl": "https://example.com/new.jpg",
  "notes": "Great season",
  "episodes": 4
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "item": {
    "id": 1,
    "title": "The Boys (Updated)",
    "category": "series",
    "status": "completed",
    "rating": 8,
    "coverUrl": "https://example.com/new.jpg",
    "notes": "Great season",
    "episodes": 4
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "error": "Item with id 999 not found"
}
```

**Test cases:**

- ✅ Owner token + valid ID → 200 OK (full replacement)
- ❌ Owner token + invalid ID → 404 Not Found
- ❌ Viewer token → 403 Forbidden
- ❌ Without token → 401 Unauthorized

---

### ✅ PATCH /items/:id — Partially update item

**Access:** Owner only + token required

**Request (update only specific fields):**

```
PATCH http://localhost:3000/items/1
Content-Type: application/json
Authorization: Bearer <owner_token>

{
  "status": "completed",
  "rating": 9
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "item": {
    "id": 1,
    "title": "The Boys",
    "category": "series",
    "status": "completed",
    "rating": 9,
    "coverUrl": "https://image.tmdb.org/...",
    "notes": "Great season",
    "episodes": 4
  }
}
```

**Note:** PATCH merges with existing data. Only send fields you want to change.

**Test cases:**

- ✅ Owner token + valid ID → 200 OK (partial update)
- ❌ Owner token + invalid ID → 404 Not Found
- ❌ Viewer token → 403 Forbidden
- ❌ Without token → 401 Unauthorized

---

### ✅ DELETE /items/:id — Delete item

**Access:** Owner only + token required

**Request:**

```
DELETE http://localhost:3000/items/1
Authorization: Bearer <owner_token>
```

**Response (204 No Content):**

```
(empty body — status 204 means "success, nothing to return")
```

**Error Response (404 Not Found):**

```json
{
  "error": "Item with id 999 not found"
}
```

**Test cases:**

- ✅ Owner token + valid ID → 204 No Content (no body returned)
- ❌ Owner token + invalid ID → 404 Not Found
- ❌ Viewer token → 403 Forbidden
- ❌ Without token → 401 Unauthorized

---

### ✅ PATCH /items/:id/hide — Hide item (soft-delete)

**Access:** Owner only + token required

**Request:**

```
PATCH http://localhost:3000/items/1/hide
Authorization: Bearer <owner_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "item": {
    "id": 1,
    "title": "The Boys",
    "category": "series",
    "status": "in_progress",
    "coverUrl": "https://image.tmdb.org/...",
    "isHidden": true
  }
}
```

**Note:** Item is not deleted, just marked hidden. GET /items will exclude hidden items by default.

**Test cases:**

- ✅ Owner token + valid ID → 200 OK
- ❌ Owner token + invalid ID → 404 Not Found
- ❌ Viewer token → 403 Forbidden
- ❌ Without token → 401 Unauthorized

---

### ✅ PATCH /items/:id/unhide — Unhide item

**Access:** Owner only + token required

**Request:**

```
PATCH http://localhost:3000/items/1/unhide
Authorization: Bearer <owner_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "item": {
    "id": 1,
    "title": "The Boys",
    "category": "series",
    "status": "in_progress",
    "coverUrl": "https://image.tmdb.org/...",
    "isHidden": false
  }
}
```

**Test cases:**

- ✅ Owner token + valid ID → 200 OK
- ❌ Owner token + invalid ID → 404 Not Found
- ❌ Viewer token → 403 Forbidden
- ❌ Without token → 401 Unauthorized

---

## Quick Reference: Status Codes

| Code  | Meaning      | When                                                      |
| ----- | ------------ | --------------------------------------------------------- |
| `200` | OK           | GET, PUT, PATCH, hide/unhide succeeded                    |
| `201` | Created      | POST succeeded (resource created)                         |
| `204` | No Content   | DELETE succeeded (nothing to return)                      |
| `400` | Bad Request  | Missing/invalid fields in request body                    |
| `401` | Unauthorized | No token or expired/invalid token                         |
| `403` | Forbidden    | Valid token but insufficient role (viewer tries to write) |
| `404` | Not Found    | Item ID doesn't exist                                     |
| `500` | Server Error | Unexpected error                                          |

---

## Postman Collection Tips

1. **Save tokens as variables:**
   - Get owner token → right-click response → "Set: ownerToken"
   - Use `{{ownerToken}}` in Authorization headers

2. **Test all 8 endpoints in sequence:**
   - Get token
   - GET all items
   - GET single item
   - POST new item
   - PUT to update
   - PATCH to partially update
   - Hide item
   - Unhide item
   - DELETE item

3. **Test with both owner and viewer tokens** to verify role-based access control
