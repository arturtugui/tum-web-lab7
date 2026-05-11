# Backend Architecture — Component Responsibilities

> Reference doc. Before writing any code, check here to know what each file is allowed to do.

---

## Overview — Who Does What

| File | Role | Sends HTTP response? | Throws errors? |
|------|------|----------------------|----------------|
| `server.js` | Entry point, wires everything together | Only the global error handler | No |
| `routes/*.js` | Traffic map — URL → controller function | No | No |
| `middleware/authMiddleware.js` | Security gate — validates JWT | Yes (401 only) | No |
| `controllers/*.js` | Decision maker — business logic + response | Yes (all status codes) | No |
| `data/store.js` | Data layer — read/write JSON file | No | Yes (data errors) |

---

## Each Component In Detail

---

### `server.js` — Entry Point

**Role:** Boots the app, registers middleware and routes, starts the listener.

**Allowed to:**
- Import and mount routes (`app.use(authRoutes)`, `app.use('/items', itemsRoutes)`)
- Register global middleware (`express.json()`, `cors()`)
- Register the **global error handler** (the only place in server.js that touches `res`)
- Call `app.listen()`

**Not allowed to:**
- Contain route logic (`app.get('/items', ...)` directly here)
- Contain business logic
- Send responses (except through the global error handler)

**Global error handler (lives here):**
```js
app.use((err, req, res, next) => {
  const status = err.status || 500
  res.status(status).json({ error: err.message || 'Internal Server Error' })
})
```
This catches any error passed via `next(err)` from controllers or middleware.

---

### `routes/*.js` — Traffic Map

**Role:** Map a URL + HTTP method to a controller function. Nothing else.

**Allowed to:**
- Import controller functions
- Import middleware (`authenticate`, `requireOwner`)
- Register routes: `router.get('/', authenticate, getAllItems)`

**Not allowed to:**
- Call `res.status().json()` — that's the controller's job
- Contain any logic (validation, data access, token generation)
- Have try/catch blocks

**What it looks like:**
```js
router.post('/token', getToken)
router.get('/', authenticate, getAllItems)
router.post('/', authenticate, requireOwner, addItem)
router.delete('/:id', authenticate, requireOwner, deleteItem)
```

---

### `middleware/authMiddleware.js` — Security Gate

**Role:** Verify the JWT before the request reaches the controller. Two separate middleware functions live here.

#### `authenticate` — Verifies the token exists and is valid
**Allowed to send:** `401 Unauthorized` only
**Allowed to:** Call `next()` if valid, call `next(err)` or `res.status(401)` if not
**Not allowed to:** Check roles, touch data, send any other status code

```js
// Valid token → attaches req.user = { role, iat, exp } and calls next()
// Missing/invalid/expired token → 401
```

#### `requireOwner` — Checks the role from the decoded token
**Allowed to send:** `403 Forbidden` only
**Allowed to:** Call `next()` if role is `'owner'`, send `403` if not
**Not allowed to:** Verify the token (that's authenticate's job), send any other status code

```js
export function requireOwner(req, res, next) {
  if (req.user?.role !== 'owner') {
    return res.status(403).json({ error: 'Forbidden: owner role required' })
  }
  next()
}
```

**Usage in routes:**
```js
router.delete('/:id', authenticate, requireOwner, deleteItem)
//                     ^ validates token  ^ checks role   ^ runs if both pass
```

---

### `controllers/*.js` — Decision Maker

**Role:** Contains all business logic. Reads from the store, makes decisions, sends the final HTTP response.

**Allowed to:**
- Call store functions (`loadItems`, `saveItems`)
- Send any HTTP response (`res.status(200).json(...)`, `res.status(404).json(...)`)
- Validate request input (`req.body`, `req.params`, `req.query`)
- Read `req.user` (set by middleware)

**Not allowed to:**
- Call `next()` — controllers are always the final stop
- Access `req.headers` for auth (middleware already handled that)
- Throw errors that bubble up — catch them and send a response instead

**Status codes owned by controllers:**

| Code | When |
|------|------|
| `200 OK` | Successful GET, PUT, PATCH |
| `201 Created` | Successful POST |
| `400 Bad Request` | Missing or invalid fields in request body |
| `404 Not Found` | Item with given ID doesn't exist |
| `500 Server Error` | Unexpected failure (store read/write error) |

**What it looks like:**
```js
export async function getAllItems(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 20
    const offset = parseInt(req.query.offset) || 0
    const items = await loadItems()
    const slice = items.slice(offset, offset + limit)
    res.status(200).json({ items: slice, total: items.length, limit, offset })
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve items' })
  }
}
```

---

### `data/store.js` — Data Layer

**Role:** Read and write data to `items.json`. Pure I/O — no business logic, no HTTP.

**Allowed to:**
- Read/write the JSON file
- Throw errors when I/O fails (controllers catch these)
- Return raw data arrays

**Not allowed to:**
- Touch `req` or `res`
- Know anything about HTTP status codes or roles
- Contain business logic (filtering, validation)

**Note on current implementation:** `saveItems` silently swallows errors (only `console.error`). It should throw so the controller can catch it and return a `500`:
```js
export async function saveItems(items) {
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), 'utf-8')
  // let it throw naturally — controller will catch it
}
```

---

## Full Request Flow Examples

### `GET /items` (viewer token)
```
Request → authenticate (validates token, sets req.user) → getAllItems controller
→ loadItems() → slice by limit/offset → res.status(200).json(...)
```

### `DELETE /items/:id` (owner token)
```
Request → authenticate (validates token) → requireOwner (checks role)
→ deleteItem controller → loadItems() → splice → saveItems() → res.status(200).json(...)
```

### `DELETE /items/:id` (viewer token)
```
Request → authenticate (validates token) → requireOwner (role is viewer)
→ res.status(403).json({ error: 'Forbidden' })   ← stops here, controller never runs
```

### `POST /token` (no token needed)
```
Request → getToken controller → validate role → jwt.sign() → res.status(200).json({ token })
```

---

## Summary — Who Sends Which Status Codes

| Status Code | Who sends it |
|-------------|-------------|
| `200` | Controller |
| `201` | Controller |
| `400` | Controller (bad input) |
| `401` | `authenticate` middleware |
| `403` | `requireOwner` middleware |
| `404` | Controller (item not found) |
| `500` | Controller (store failure) or global error handler |
