# Web Programming Laboratory 7 - Back-end

## 📋 Quick Overview

**Lab 7** is a **REST API backend** for managing a personal collection of movies, series, games, manga, and more from [Lab 6](https://github.com/arturtugui/tum-web-lab6). Built with **Express.js**, secured with **JWT authentication**, and featuring **role-based access control** (owner vs viewer). The API is documented with **Swagger/OpenAPI**, containerized with **Docker**, and stores data persistently in **JSON**.

---

## 🛠️ Tech Stack

| Technology     | Purpose                        |
| -------------- | ------------------------------ |
| **Node.js**    | JavaScript runtime environment |
| **Express.js** | HTTP server framework          |

---

## 🔗 Frontend Connection

This backend powers the Lab 6 frontend collection manager.

**Frontend Repository:** [tum-web-lab6](https://github.com/arturtugui/tum-web-lab6)  
**Frontend URL (dev):** http://localhost:5173  
**Backend URL (dev):** http://localhost:3000  
**API Docs:** http://localhost:3000/api-docs

---

## 🏗️ Express.js Architecture

In Express.js, the request-response cycle follows this pipeline:

```
Request → Route → Middleware (auth) → Controller → Store → Response
```

### 1. **Request**

The **starting point**. This is the data packet sent by the client (browser) to your server. It contains:

- **URL** (path to resource)
- **Method** (GET, POST, PUT, PATCH, DELETE)
- **Headers** (including `Authorization: Bearer <token>`)
- **Body** (optional, for POST/PUT/PATCH operations)

Example:

```http
POST /items HTTP/1.1
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{ "title": "Breaking Bad", "category": "series", "status": "completed" }
```

### 2. **Route**

The **traffic cop**. Routes map incoming URLs + methods to the appropriate **Controller**.

**File:** [`routes/itemRoutes.js`](routes/itemRoutes.js)

Routes don't contain business logic—they only specify:

- **Which URL path** (e.g., `/items`, `/items/:id`)
- **Which HTTP method** (GET, POST, etc.)
- **Which middleware to apply** (e.g., `authenticate`, `requireOwner`)
- **Which controller function** to call

Example from `itemRoutes.js`:

```javascript
router.get("/items", authenticate, getAllItems); // GET → read
router.post("/items", authenticate, requireOwner, addItem); // POST → create (owner only)
router.delete("/items/:id", authenticate, requireOwner, deleteItem); // DELETE (owner only)
```

### 3. **Middleware (Auth)**

The **security guards**. Middleware functions run _before_ the controller, checking permissions and modifying the request if needed.

**File:** [`middleware/authMiddleware.js`](middleware/authMiddleware.js)

Two middleware functions:

#### `authenticate(req, res, next)`

- Extracts **Bearer token** from `Authorization` header
- Verifies JWT signature using `JWT_SECRET`
- Checks token **expiration** (must not be expired)
- Attaches decoded user object (`{ role, iat, exp }`) to `req.user`
- Calls `next()` to proceed, or sends **401 Unauthorized** if invalid

#### `requireOwner(req, res, next)`

- Checks if `req.user.role === 'owner'`
- Calls `next()` if owner, or sends **403 Forbidden** if viewer
- Used on all write operations (POST, PUT, PATCH, DELETE)

**Key Insight:** Authentication (token valid?) is separate from Authorization (user's role).

- **Viewer** can read (GET) but not write
- **Owner** can do both read and write

### 4. **Controller**

The **brain**. Contains business logic and orchestrates the request handling.

**File:** [`controllers/itemsController.js`](controllers/itemsController.js), [`controllers/authController.js`](controllers/authController.js)

Controllers:

- ✅ Validate input (e.g., required fields, data format)
- ✅ Call the **Store** to read/write data
- ✅ Handle errors gracefully (try/catch)
- ✅ Send the HTTP response with correct status code

Example (from `itemsController.js`):

```javascript
export async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    await store.loadItems();
    // ... validation & deletion logic ...
    await store.saveItems(updatedItems);
    res.status(204).send(); // Controller sends response
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item" });
  }
}
```

### 5. **Store (Data Access)**

The **librarian**. The only part of code that talks directly to files or databases.

**File:** [`data/store.js`](data/store.js)

Two functions:

- `loadItems()` — Reads and parses `data/items.json`, returns array
- `saveItems(items)` — Writes array to `data/items.json`

Handles file I/O errors and is the single source of truth for data persistence.

### 6. **Response**

The **finish line**. The server sends back:

- **Status Code** (e.g., 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Error)
- **Body** (usually JSON)
- **Headers** (Content-Type, etc.)

Example responses:

```json
// 200 OK - Success
{ "items": [...], "total": 15, "limit": 10, "offset": 0 }

// 201 Created - Resource created
{ "token": "eyJhbGc..." }

// 401 Unauthorized - No token or invalid token
{ "error": "No token provided" }

// 403 Forbidden - Viewer trying to write
{ "error": "Forbidden: Only owners can perform this action" }

// 404 Not Found - Item doesn't exist
{ "error": "Item with id 123 not found" }
```

---

## 📁 Project Structure

```
tum-web-lab7/
├── server.js                      # Entry point - starts Express server
├── swagger.js                     # OpenAPI 3.0 schema definition
├── package.json                  # Dependencies & scripts
├── .env                          # Configuration (JWT_SECRET, PORT, CORS_ORIGIN)
├── .dockerignore                 # Files to exclude from Docker image
├── Dockerfile                    # Container setup
├── docker-compose.yml            # Orchestration configuration
│
├── middleware/
│   └── authMiddleware.js         # authenticate() and requireOwner()
│
├── routes/
│   ├── authRoutes.js             # POST /auth/token
│   └── itemRoutes.js             # All /items endpoints (GET, POST, PUT, PATCH, DELETE)
│
├── controllers/
│   ├── authController.js         # generateToken() business logic
│   └── itemsController.js        # CRUD operations: get, add, update, delete, hide/unhide
│
├── data/
│   ├── store.js                  # loadItems() and saveItems() functions
│   └── items.json                # Persistent data file
│
└── useful-docs/
    └── lab_7/                    # Assignment specifications and notes
```

---

## 🔌 API Endpoints Reference

### **Authentication**

| Method | Endpoint      | Description        | Auth Required |
| ------ | ------------- | ------------------ | ------------- |
| `POST` | `/auth/token` | Generate JWT token | ❌ No         |

**Request Body:**

```json
{ "role": "owner" } // or "viewer"
```

**Response (201 Created):**

```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

Token expires in **1 minute** (configurable in `controllers/authController.js`).

---

### **Items (Collection Management)**

| Method   | Endpoint            | Description                | Access     | Auth |
| -------- | ------------------- | -------------------------- | ---------- | ---- |
| `GET`    | `/items`            | List all items (paginated) | All roles  | ✅   |
| `GET`    | `/items/:id`        | Get single item by ID      | All roles  | ✅   |
| `POST`   | `/items`            | Create new item            | Owner only | ✅   |
| `PUT`    | `/items/:id`        | Update full item           | Owner only | ✅   |
| `PATCH`  | `/items/:id`        | Partial update item        | Owner only | ✅   |
| `DELETE` | `/items/:id`        | Delete item                | Owner only | ✅   |
| `PATCH`  | `/items/:id/hide`   | Mark item as hidden        | Owner only | ✅   |
| `PATCH`  | `/items/:id/unhide` | Mark item as visible       | Owner only | ✅   |

#### **GET /items** (Pagination)

**Query Parameters:**

```
?limit=10&offset=0
```

**Response (200 OK):**

```json
{
  "items": [
    {
      "id": 1,
      "title": "Breaking Bad",
      "category": "series",
      "status": "completed",
      "rating": 10,
      "coverUrl": "https://...",
      "notes": "Amazing show",
      "isHidden": false
    }
  ],
  "total": 42,
  "limit": 10,
  "offset": 0
}
```

#### **POST /items** (Create - Owner Only)

**Request Body (Required fields: id, title, category, status):**

```json
{
  "id": 123,
  "title": "The Matrix",
  "category": "movie",
  "status": "completed",
  "rating": 9,
  "coverUrl": "https://...",
  "notes": "Sci-fi classic"
}
```

**Response (201 Created):**

```json
{ "item": { ...same as above } }
```

---

## 🔐 Authentication & Authorization

### **Token Lifecycle**

1. **Client calls:** `POST /auth/token` with `{ "role": "owner" }`
2. **Server generates:** JWT with role claim and 1-minute expiry
3. **Client stores:** JWT in `sessionStorage` (clears on browser close)
4. **Client sends:** Token in all subsequent requests: `Authorization: Bearer <token>`
5. **Server verifies:**
   - ✅ Signature is valid (hasn't been tampered with)
   - ✅ Token hasn't expired
6. **Server attaches:** User data to `req.user = { role, iat, exp }`

### **Roles & Permissions**

| Action             | Owner | Viewer |
| ------------------ | ----- | ------ |
| Read (GET)         | ✅    | ✅     |
| Create (POST)      | ✅    | ❌ 403 |
| Update (PUT/PATCH) | ✅    | ❌ 403 |
| Delete (DELETE)    | ✅    | ❌ 403 |
| Hide/Unhide        | ✅    | ❌ 403 |

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+ ([download](https://nodejs.org/))
- npm (comes with Node.js)

### **Local Development**

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create `.env` file** (copy from `.env.example` or create manually):

   ```env
   JWT_SECRET=your-secret-key-here
   PORT=3000
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

   Server runs on http://localhost:3000 with auto-reload on file changes.

4. **View API documentation:**
   Open http://localhost:3000/api-docs in browser (interactive Swagger UI)

### **Testing Endpoints**

Using the Swagger UI at http://localhost:3000/api-docs:

1. **Get a token:**
   - Click "POST /auth/token"
   - Click "Try it out"
   - Enter `{ "role": "owner" }`
   - Click "Execute"
   - Copy the token

2. **Use the token for other endpoints:**
   - Click "Authorize" button (top-right)
   - Paste: `Bearer <your-token-here>`
   - Click "Authorize"
   - Now you can test GET, POST, DELETE etc. with auth

3. **Test role-based access:**
   - Get a `viewer` token
   - Try to POST a new item → should get 403 Forbidden ✅

---

## 🐳 Docker Deployment

### **Prerequisites**

- Docker ([download](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

### **Run with Docker**

```bash
docker compose up --build
```

This:

1. Builds a Node.js container from the `Dockerfile`
2. Installs dependencies
3. Starts the server on port 3000
4. Mounts `./data` volume for data persistence

Server accessible at http://localhost:3000 and http://localhost:3000/api-docs

**Stop the container:**

```bash
docker compose down
```

**View logs:**

```bash
docker compose logs -f
```

---

## 📊 Data Model (Item Schema)

All items conform to this schema (defined in `swagger.js`):

```json
{
  "id": 1, // Unique identifier (required)
  "title": "Breaking Bad", // Item name (required)
  "category": "series", // Enum: movie, series, anime, game, manga, comic, book, album, youtube (required)
  "status": "completed", // Enum: planned, in_progress, completed, dropped (required)
  "rating": 9, // Optional, 1-10
  "coverUrl": "https://...", // Optional, image URL
  "notes": "Amazing show", // Optional, user notes
  "isHidden": false // Boolean, default false
}
```

---

## 🧪 Example cURL Commands

### **Get a token:**

```bash
curl -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"role":"owner"}'
```

### **List items (with token):**

```bash
curl -X GET "http://localhost:3000/items?limit=10&offset=0" \
  -H "Authorization: Bearer <your-token>"
```

### **Create item (owner only):**

```bash
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "id": 1,
    "title": "Inception",
    "category": "movie",
    "status": "completed",
    "rating": 10
  }'
```

### **Viewer trying to create (should fail with 403):**

```bash
# Get viewer token first
VIEWER_TOKEN=$(curl -s -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"role":"viewer"}' | jq -r '.token')

# Try to create item (will fail with 403)
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VIEWER_TOKEN" \
  -d '{"id": 2, "title": "Test", "category": "movie", "status": "planned"}'
```

---

## 📝 Key Implementation Notes

1. **Stateless Auth** — No sessions stored on server; all info in JWT
2. **File Storage** — JSON file-based; suitable for demo; swap with MongoDB/PostgreSQL for production
3. **Separation of Concerns** — Routes ≠ Controllers ≠ Store
4. **ES6 Modules** — Uses modern JavaScript (`import`/`export`)
5. **Async/Await** — File operations use `fs/promises` (clean async code)
6. **Error Handling** — Consistent try/catch in controllers; appropriate status codes
7. **CORS** — Configured for `localhost:5173` (React frontend); adjust `CORS_ORIGIN` in `.env` for production

---

## 🔧 Configuration

Edit `.env` to customize:

```env
JWT_SECRET=your-secret-key                    # Used to sign tokens (change in production!)
PORT=3000                                      # Server port
CORS_ORIGIN=http://localhost:5173            # Frontend URL (React dev server)
```

For token expiry, edit `controllers/authController.js`:

```javascript
{
  expiresIn: "1m";
} // Change '1m' to desired expiry (e.g., '7d' for 7 days)
```

---
