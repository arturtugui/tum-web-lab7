# Concepts — Role Context (Lab 6) & Backend (Lab 7)

> Covers what's left for Lab 6 (role system) and everything new for Lab 7 (Express, JWT, Docker, REST, Swagger).

---

## PART 1 — Lab 6: RoleContext

### What it is

A global context that holds the current role (`'owner'` or `'viewer'`) and a function to toggle it. It's global because role affects unrelated components — `Navbar` (Add button) and `ItemCard` (Edit/Delete buttons) — making prop drilling impractical.

### Structure

```jsx
// src/context/RoleContext.jsx
import { createContext, useContext, useState } from 'react'

const RoleContext = createContext(null)

export function RoleProvider({ children }) {
  const [role, setRole] = useState('owner') // default: owner

  const toggleRole = () => {
    setRole(prev => prev === 'owner' ? 'viewer' : 'owner')
  }

  return (
    <RoleContext.Provider value={{ role, toggleRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
```

### How components use it

```jsx
// Navbar — shows/hides Add button
const { role, toggleRole } = useRole()
{role === 'owner' && <button onClick={handleOpenAddForm}>Add</button>}
<button onClick={toggleRole}>Switch to {role === 'owner' ? 'Viewer' : 'Owner'}</button>

// ItemCard — shows/hides Edit and Delete buttons
const { role } = useRole()
{role === 'owner' && <button onClick={onEdit}>Edit</button>}
{role === 'owner' && <button onClick={onDelete}>Delete</button>}
```

### Where it wraps

```jsx
// main.jsx or App.jsx — alongside CollectionProvider and ThemeProvider
<RoleProvider>
  <CollectionProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </CollectionProvider>
</RoleProvider>
```

**Think of it like:** a simple feature flag stored globally. No reducer needed — it's just one value that flips between two states.

---

## PART 2 — Lab 7: Backend Concepts

---

### 1. What is a REST API?

A REST API is a server that listens for HTTP requests and responds with data (usually JSON). Each URL + HTTP method combination maps to one operation.

```
GET    /items        → read all items
POST   /items        → create a new item
GET    /items/:id    → read one item
PUT    /items/:id    → replace one item
DELETE /items/:id    → delete one item
```

**Think of it like:** a set of functions you call over the network instead of locally. The URL is the function name, the HTTP method is the action type, and the body is the argument.

---

### 2. Express.js — The Server Framework

Express is a minimal Node.js framework for building HTTP servers. It handles routing (which URL maps to which function) and middleware (code that runs between request and response).

```js
import express from 'express'
const app = express()

app.use(express.json()) // parse JSON request bodies

app.get('/items', (req, res) => {
  res.json({ items: [] }) // send JSON response
})

app.listen(3000, () => console.log('Server running on port 3000'))
```

**Key concepts:**
- `req` — the incoming request (has `req.body`, `req.params`, `req.query`, `req.headers`)
- `res` — the outgoing response (`res.json()`, `res.status(404).json({...})`)
- `app.get/post/put/patch/delete` — register a route handler
- Middleware — a function that runs before your route handler (e.g. auth check)

---

### 3. HTTP Status Codes

The server tells the client what happened via a numeric status code.

| Code | Meaning | When to use |
|------|---------|-------------|
| `200` | OK | Successful GET, PUT, PATCH |
| `201` | Created | Successful POST (new item created) |
| `400` | Bad Request | Missing/invalid fields in body |
| `401` | Unauthorized | No token or invalid token |
| `403` | Forbidden | Valid token but wrong role (viewer trying to delete) |
| `404` | Not Found | Item with that ID doesn't exist |
| `500` | Server Error | Unexpected crash |

```js
res.status(201).json({ message: 'Item created', item })
res.status(404).json({ error: 'Item not found' })
```

**Consistent Error Response Format:**
Always return errors in a predictable structure so clients can handle them uniformly:
```js
// Good
res.status(400).json({ error: 'Invalid role. Must be "owner" or "viewer"' })
res.status(404).json({ error: 'Item not found', itemId })

// Avoid raw errors
res.status(500).json(new Error('...'))
```

**Input Validation:**
Validate request data before processing:
```js
if (!['owner', 'viewer'].includes(req.body.role)) {
  return res.status(400).json({ error: 'Invalid role' })
}
```

---

### 4. JWT — JSON Web Tokens

A JWT is a signed token the server gives to the client. The client sends it back with every request to prove who it is.

**Structure:** `header.payload.signature` — three base64-encoded parts joined by dots.

**The flow:**
1. Client sends `POST /token` with `{ role: 'owner' }`
2. Server creates and signs a token: `{ role: 'owner', exp: ... }`
3. Client stores the token and sends it in every request header:
   `Authorization: Bearer <token>`
4. Server verifies the signature and reads the role
5. Server allows or denies the operation based on role

```js
import jwt from 'jsonwebtoken'

// Generate token
const token = jwt.sign(
  { role: 'owner' },        // payload
  process.env.JWT_SECRET,   // secret key
  { expiresIn: '1m' }       // expiration
)

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET)
console.log(decoded.role) // 'owner'
```

**Think of it like:** a signed ID card. The server stamps it, and anyone can read it — but only the server can verify it's genuine (because only the server knows the secret key).

**⚠️ Security Note:**
- Always use a **strong JWT_SECRET** in production (not `'somesecretkey'`). Generate one:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Store `JWT_SECRET` in environment variables, never commit to git
- Consider token refresh strategies for production (current 1-minute expiry is fine for this demo)

---

### 5. Middleware — Auth Guard

Middleware is a function that runs before your route handler. You use it to verify the JWT before allowing access to protected routes.

```js
// middleware/auth.js
export function authenticate(req, res, next) {
  const header = req.headers['authorization'] // "Bearer <token>"
  const token = header?.split(' ')[1]

  if (!token) return res.status(401).json({ error: 'No token provided' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // attach decoded payload to request
    next()             // continue to route handler
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// Usage on a route
app.get('/items', authenticate, (req, res) => {
  // req.user.role is available here
  res.json({ items })
})
```

**Think of it like:** a security guard at the door. `next()` means "let them through."

---

### 6. Pagination

Instead of returning all items at once, you return a slice based on query parameters.

```
GET /items?limit=10&offset=0   → items 1–10
GET /items?limit=10&offset=10  → items 11–20
```

```js
app.get('/items', authenticate, (req, res) => {
  const limit = parseInt(req.query.limit) || 10
  const offset = parseInt(req.query.offset) || 0

  const slice = items.slice(offset, offset + limit)

  res.json({
    items: slice,
    total: items.length,
    limit,
    offset
  })
})
```

**Think of it like:** SQL's `LIMIT` and `OFFSET`. You never dump an entire table in one query.

---

### 7. Docker

Docker packages your app into a container — a self-contained environment that runs the same everywhere regardless of the host machine.

**Two files you need:**

`Dockerfile` — recipe for building the image:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

`docker-compose.yml` — how to run it:
```yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
```

**Common commands:**
```bash
docker compose up        # build and start
docker compose down      # stop
docker compose up --build  # rebuild after code changes
```

**Think of it like:** a VM but lightweight. Your app, Node.js, and all dependencies are bundled together. "Works on my machine" becomes "works everywhere."

---

### 8. Swagger — API Documentation

Swagger UI is an interactive web page that documents your API and lets you test it directly in the browser, available at `/api-docs`.

You describe each route using JSDoc-style comments:

```js
/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get all items
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of items
 */
app.get('/items', authenticate, getItems)
```

Setup:
```js
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'

const specs = swaggerJsdoc({ definition: { openapi: '3.0.0', info: { title: 'PIT API', version: '1.0.0' } }, apis: ['./routes/*.js'] })
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
```

---

### 9. CORS

By default browsers block requests from one origin (e.g. `localhost:5173` — your React app) to another (e.g. `localhost:3000` — your API). CORS headers tell the browser it's allowed.

```js
import cors from 'cors'
app.use(cors({ origin: 'http://localhost:5173' })) // development
```

One line. Without it your frontend can't talk to your backend.

**⚠️ Production Note:**
Hardcoding the origin is fine for development, but in production use environment variables:
```js
app.use(cors({ origin: process.env.CORS_ORIGIN }))
```
Never allow all origins (`origin: '*'`) in production — it's a security risk.

---

### 10. Replacing localStorage with API calls (Lab 6 integration)

In Lab 6 all CRUD operations dispatch to `useReducer`. In Lab 7 integration, you add an API layer that calls the backend first, then dispatches on success.

```js
// src/services/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function fetchItems(token, limit = 20, offset = 0) {
  const res = await fetch(`${BASE_URL}/items?limit=${limit}&offset=${offset}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

export async function createItem(token, item) {
  const res = await fetch(`${BASE_URL}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(item)
  })
  return res.json()
}
```

**Think of it like:** swapping the storage engine. The React state and UI don't change — only where the data comes from and goes to.
