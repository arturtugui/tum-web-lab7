# Roadmap — Remaining Lab 6 + Full Lab 7

> Lab 6 is almost done. Only the role system remains.
> Lab 7 is a separate repo built from scratch, then connected back to Lab 6.

---

## LAB 6 — Remaining Work

### Stage 8 — Role System
**Branch:** `stage/8-roles`

Simulate owner/viewer roles using a dedicated `RoleContext`. In Lab 7 this will be replaced by real JWT roles.

**Tasks:**
- Create `src/context/RoleContext.jsx`:
  - Holds `role` (`'owner'` | `'viewer'`) as `useState`
  - Exposes `toggleRole` function
  - Exports `useRole()` custom hook
- Wrap app in `<RoleProvider>` in `main.jsx` (outermost wrapper)
- In `Navbar.jsx`:
  - Read `role` and `toggleRole` from `useRole()`
  - Show Add button only when `role === 'owner'`
  - Add a toggle button: "Switch to Viewer" / "Switch to Owner"
- In `ItemCard.jsx`:
  - Read `role` from `useRole()`
  - Show Edit and Delete buttons only when `role === 'owner'`

**Deliverable:** Toggling to viewer hides all edit controls. App is fully read-only in viewer mode.

---

## LAB 7 — Backend (Separate Repo: `tum-web-lab7`)

---

### Stage B1 — Project Setup & Basic Server
**Branch:** `stage/b1-setup`

Initialize the repo and get a basic Express server running.

**Tasks:**
- `npm init -y`, install dependencies:
  ```
  npm install express cors dotenv jsonwebtoken swagger-ui-express swagger-jsdoc
  npm install --save-dev nodemon
  ```
- Create folder structure:
  ```
  backend/
  ├── server.js
  ├── .env
  ├── .gitignore           # include node_modules and .env
  ├── middleware/
  │   └── auth.js
  ├── routes/
  │   ├── auth.js
  │   └── items.js
  ├── controllers/
  │   ├── authController.js
  │   └── itemsController.js
  ├── data/
  │   └── store.js         # in-memory items array
  └── swagger.js
  ```
- Write `server.js` — basic Express app, import routes, `app.listen(3000)`
- Add `dev` script in `package.json`: `"dev": "nodemon server.js"`
- Add `.env` with `JWT_SECRET=somesecretkey` and `PORT=3000`

**Deliverable:** `npm run dev` starts the server, `GET http://localhost:3000` returns a response.

---

### Stage B2 — JSON File Storage
**Branch:** `stage/b2-store`

Define the data model and create persistent JSON file storage that survives server restarts.

**Tasks:**
- In `data/store.js`:
  - Export `loadItems()` — async function that reads `data/items.json` file, returns parsed items array
  - Export `saveItems(items)` — async function that writes items array to `data/items.json`
  - Handle file read/write errors gracefully
- Create `data/items.json` with seed data:
  - Start with 3–4 test items matching Lab 6 data model
  - Each item has: `id`, `title`, `category`, `status`, `rating`, `coverUrl`, `notes`, `isHidden`, + category-specific fields
  - Use `crypto.randomUUID()` for ID generation
- In `controllers/itemsController.js`:
  - Write async functions: `getAllItems`, `getItemById`, `createItem`, `updateItem`, `deleteItem`, `hideItem`, `unhideItem`
  - Each function must `loadItems()` before operating, then `saveItems()` after mutations
  - `getAllItems` supports `limit` and `offset` parameters and returns `{ items, total, limit, offset }`

**Deliverable:** Controller functions work correctly. Data persists in `data/items.json` and survives server restarts.

**✅ Benefit:**
JSON file storage is simple, requires no database, and persists data. Sufficient for development and demos.

---

### Stage B3 — JWT Authentication
**Branch:** `stage/b3-auth`

Implement the `/token` endpoint and the auth middleware.

**Tasks:**
- In `routes/auth.js`:
  - `POST /token` — accepts `{ role: 'owner' | 'viewer' }` in body
  - Validates role is one of the two allowed values
  - Returns `{ token: '...' }` signed with `JWT_SECRET`, expires in `1m`
- In `middleware/auth.js`:
  - Extract token from `Authorization: Bearer <token>` header
  - Verify with `jwt.verify()`
  - Attach decoded payload to `req.user`
  - Return `401` if missing, `401` if invalid/expired
- In `controllers/authController.js`:
  - Move token generation logic here (keep routes thin)

**Deliverable:** `POST /token` returns a JWT. Sending it in the header grants access (verified manually with a tool like Postman or curl).

---

### Stage B4 — CRUD Routes
**Branch:** `stage/b4-routes`

Wire up all item endpoints with authentication and role-based authorization.

**Tasks:**
- In `routes/items.js`, create all routes behind `authenticate` middleware:
  - `GET /items` — all roles, supports `?limit=&offset=`
  - `GET /items/:id` — all roles
  - `POST /items` — owner only
  - `PUT /items/:id` — owner only
  - `PATCH /items/:id` — owner only (partial update)
  - `DELETE /items/:id` — owner only
  - `PATCH /items/:id/hide` — owner only
  - `PATCH /items/:id/unhide` — owner only
- Add role check inside routes or as a second middleware:
  ```js
  if (req.user.role !== 'owner') return res.status(403).json({ error: 'Forbidden' })
  ```
- Use correct status codes for every response (200, 201, 400, 401, 403, 404)

**Deliverable:** All endpoints work correctly. Viewer token can only GET. Owner token can do everything.

---

### Stage B5 — Swagger Documentation
**Branch:** `stage/b5-swagger`

Add interactive API documentation at `/api-docs`.

**Tasks:**
- Set up `swagger.js` with `swagger-jsdoc` config (openapi 3.0, title, version)
- Mount `swagger-ui-express` in `server.js` at `/api-docs`
- Add JSDoc `@swagger` comments to every route in `routes/auth.js` and `routes/items.js`:
  - Document request body shape
  - Document query parameters (limit, offset)
  - Document all possible responses (200, 201, 400, 401, 403, 404)
  - Add `securitySchemes` for Bearer token so Swagger UI has an "Authorize" button

**Deliverable:** `http://localhost:3000/api-docs` shows full interactive documentation. You can test all endpoints from the browser.

---

### Stage B6 — Docker
**Branch:** `stage/b6-docker`

Containerize the backend so it runs anywhere.

**Tasks:**
- Write `Dockerfile`:
  ```dockerfile
  FROM node:20-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm install
  COPY . .
  EXPOSE 3000
  CMD ["node", "server.js"]
  ```
- Write `docker-compose.yml`:
  ```yaml
  services:
    api:
      build: .
      ports:
        - "3000:3000"
      env_file:
        - .env
  ```
- Add `.dockerignore`: `node_modules`, `.env`
- Test: `docker compose up --build` starts the server correctly
- Verify Swagger is accessible at `http://localhost:3000/api-docs` from inside Docker

**Deliverable:** Entire backend runs via `docker compose up`. No Node.js installation needed on the host.

---

### Stage B7 — CORS & Lab 6 Connection
**Branch:** `stage/b7-integration`

Allow the React frontend to call the backend, then wire up Lab 6 to use the API.

**Tasks (backend):**
- Add CORS in `server.js`:
  ```js
  app.use(cors({ origin: 'http://localhost:5173' })) // dev
  ```
- Test that a fetch from the React app doesn't get blocked

**Tasks (Lab 6 frontend — new branch in `tum-web-lab6`):**
- Create `src/services/api.js` — fetch wrapper with Authorization header for all operations
- Create `src/services/tokenService.js` — handles storing and retrieving the JWT token:
  - Store token in `localStorage` (key: `pit-token`) or `sessionStorage` for the session
  - Provide helpers: `getToken()`, `setToken(token)`, `clearToken()`
  - Consider token expiration: fetch a new token if current one is expired or about to expire
- Update `CollectionContext.jsx`:
  - On mount: call `GET /items` to load initial data instead of localStorage
  - `ADD_ITEM` → `POST /items` then dispatch
  - `EDIT_ITEM` → `PUT /items/:id` then dispatch
  - `DELETE_ITEM` → `DELETE /items/:id` then dispatch
  - `HIDE_ITEM` → `PATCH /items/:id/hide` then dispatch
- Add a simple token gate in the app — on first load call `POST /token` with the current role to get a JWT and store it
- Handle loading and error states visibly in the UI (show spinner while fetching, display errors)
- Decide on token storage strategy:
  - `localStorage`: persists across browser closes (user stays logged in)
  - `sessionStorage`: cleared when browser closes (user logs out on close)
  - In-memory only: cleared on page refresh (most secure but less convenient)

**Deliverable:** Lab 6 frontend reads and writes data through the Lab 7 API. localStorage is no longer the source of truth.

---

### Stage B7.5 — Basic Testing (Optional)
**Branch:** `stage/b7.5-tests`

Add simple test coverage for the API to catch regressions.

**Tasks:**
- Install testing framework:
  ```bash
  npm install --save-dev jest supertest
  ```
- Create `tests/` folder with test files:
  ```
  tests/
  ├── auth.test.js       # Test /token endpoint, JWT generation
  ├── items.test.js      # Test CRUD operations, role-based access
  └── middleware.test.js # Test auth middleware
  ```
- Write basic tests:
  - Owner token can POST, PUT, DELETE
  - Viewer token can only GET
  - Missing token returns 401
  - Invalid item ID returns 404
  - Pagination works correctly
- Add test script to `package.json`: `"test": "jest"`

**Deliverable:** `npm test` runs all tests and reports results. Not strictly required by the assignment, but good practice for reliability.

---

## Summary

| Stage | Repo | Branch | Key Feature |
|-------|------|--------|-------------|
| 8 | lab6 | `stage/8-roles` | RoleContext, owner/viewer UI |
| B1 | lab7 | `stage/b1-setup` | Express server running |
| B2 | lab7 | `stage/b2-store` | In-memory store + controller functions |
| B3 | lab7 | `stage/b3-auth` | JWT `/token` endpoint + auth middleware |
| B4 | lab7 | `stage/b4-routes` | Full CRUD routes with role protection |
| B5 | lab7 | `stage/b5-swagger` | Swagger UI at `/api-docs` |
| B6 | lab7 | `stage/b6-docker` | Docker + docker-compose |
| B7 | lab7+lab6 | `stage/b7-integration` | CORS + frontend connected to backend |
| B7.5 | lab7 | `stage/b7.5-tests` | Basic Jest + supertest coverage (optional) |
