# Lab 6 — Implementation Details

This document describes exactly how the Lab 6 app in this workspace is built: stack, files, data model per category, page structure, modals, and a complete, precise inventory of runtime state (where it lives, how it's updated, and who consumes it).

---

**Repository path referenced:** `my-app/` (source in `my-app/src`)

## Stack & Tooling

- Framework: React (function components)
- Build: Vite (project created with Vite + React template)
- Styling: Plain CSS files, CSS custom properties (variables) in `src/styles/App.css`
- State: `useReducer` (collection) + 3x `useState` contexts (`FilterContext`, `UIContext`, `ThemeContext`) exposed via `createContext` hooks; `CollectionContext` exposes reducer state/dispatch
- Persistence: `localStorage` (key `pit-collection` for items; `pit-theme` for theme)

---

## Files of interest (source)

- `src/App.jsx` — App root; uses `useUI()` to show modal and item view
- `src/main.jsx` — Renders the app; wraps providers: `ThemeProvider`, `CollectionProvider`, `UIProvider`, `FilterProvider`
- `src/context/CollectionContext.jsx` — Provides `{ state, dispatch }` from `useReducer(reducer)`; saves to `localStorage`
- `src/context/FilterContext.jsx` — Provides `activeCategory`, `activeStatus`, `searchText` and setters
- `src/context/UIContext.jsx` — Provides modal/view state and actions: `openAddModal`, `openEditModal`, `closeModal`, `openItemView`, `closeItemView`
- `src/context/ThemeContext.jsx` — Provides `theme` and `toggleTheme`; writes `data-theme` to `<html>` and persists to `localStorage`
- `src/reducers/collectionReducer.js` — Reducer with `ADD_ITEM`, `EDIT_ITEM`, `HIDE_ITEM`, `UNHIDE_ITEM`, `DELETE_ITEM` actions
- `src/components/` — `Navbar.jsx`, `FilterBar.jsx`, `ItemList.jsx`, `ItemCard.jsx`, `ItemForm.jsx`, `ItemView.jsx` plus `.css` files
- `src/styles/App.css` — CSS variables and basic layout

---

## Data model

All items are stored as objects in `state.items` provided by `CollectionContext`. Example (base fields):

- `id` (number generated via `Date.now() + Math.random()` for new items; sample data uses numeric ids)
- `title` (string)
- `category` (string) — one of: `movie`, `series`, `anime`, `game`, `manga`, `comic`, `book`, `album`, `youtube`
- `status` (string) — one of: `planned`, `in_progress`, `completed`, `dropped`
- `rating` (number | null)
- `coverUrl` (string)
- `notes` (string)
- `isHidden` (boolean) — optional; `HIDE_ITEM` sets to `true`

Category-specific fields (implemented in `ItemForm` and displayed in `ItemView`):

- movie / series / anime
  - `genres` (string or array) — `ItemForm` accepts a string (comma-separated example convention)
  - `episodes` (number) — series/anime

- game
  - `platform` (string)
  - `developer` (string)

- manga / comic
  - `author` (string)
  - `chapters` (number)

- book
  - `author` (string)
  - `pages` (number)

- album
  - `artist` (string)
  - `year` (number)

- youtube
  - `channelUrl` (string)
  - `uploadFrequency` (string)

Notes:

- `ItemForm` dynamically adds/removes inputs according to `CATEGORY_FIELDS`.
- `ItemForm` cleans empty-string fields before dispatching `ADD_ITEM` / `EDIT_ITEM`.

---

## Page / Component structure and responsibilities

- `App.jsx`
  - Renders layout: `<Navbar />`, `<FilterBar />`, main grid with `<ItemList />`
  - Uses `useUI()` to render `<ItemForm />` and `<ItemView />` conditionally when `showModal` or `showItemView` are true

- `Navbar.jsx`
  - Shows app title, `+ Add` button (calls `openAddModal()` from `UIContext`), theme toggle (from `ThemeContext`), and a placeholder role button

- `FilterBar.jsx`
  - Reads and updates filters via `useFilter()`
  - Renders category tabs, status `<select>`, and search `<input>`

- `ItemList.jsx`
  - Reads items from `useCollection()` and filters via `useFilter()` values
  - Excludes `isHidden` items by default
  - Handles two empty states: (no items at all) and (no results after filtering)
  - Renders `ItemCard` for each item

- `ItemCard.jsx`
  - Small local state `menuOpen` for dropdown menu
  - Uses `useCollection()` dispatch to `HIDE_ITEM` and `DELETE_ITEM`
  - Uses `useUI()` to `openEditModal(item)` and `openItemView(item)`
  - Shows cover image, title, rating, badges for category & status, and optional notes

- `ItemForm.jsx` (modal)
  - Reads `modalMode` and `editingItem` from `UIContext`
  - Has `formData` local state for inputs and updates on change
  - Dynamically builds category-specific fields using `CATEGORY_FIELDS`
  - Validation: requires `title` and `coverUrl`
  - Submits `ADD_ITEM` or `EDIT_ITEM` via `dispatch` from `CollectionContext`
  - Generates `id` on add: `Date.now() + Math.random()`; preserves `id` on edit
  - Closes modal via `onClose()` from `UIContext`

- `ItemView.jsx` (detail modal)
  - Reads `viewingItem` from `UIContext` and shows all details including category-specific fields
  - Close via `closeItemView()`

---

## State inventory (precise)

This lists every runtime state, where it lives, initial value, how it's updated, and which components consume it.

1. Collection state

- Location: `src/context/CollectionContext.jsx` (`CollectionContext.Provider`)
- Shape: `{ items: Item[] }`
- Initial value: loaded from `localStorage` key `pit-collection` or `DEFAULT_ITEMS` sample array
- Update mechanism: `dispatch(action)` from `useCollection()` -> handled by `collectionReducer` in `src/reducers/collectionReducer.js`
- Actions supported: `ADD_ITEM`, `EDIT_ITEM`, `HIDE_ITEM`, `UNHIDE_ITEM`, `DELETE_ITEM` (reducer returns new state immutably)
- Persisted: yes — `useEffect` in provider writes `state.items` to `localStorage` on change
- Consumers: `ItemList` (read), `ItemCard` (dispatch), `ItemForm` (dispatch), `Navbar` (optionally for counts)

2. Filters

- Location: `src/context/FilterContext.jsx` (`FilterProvider`)
- Keys: `activeCategory` (default `'all'`), `activeStatus` (default `'all'`), `searchText` (default `''`)
- Update mechanism: setters `setActiveCategory`, `setActiveStatus`, `setSearchText` exposed by context
- Consumers: `FilterBar` (reads+updates), `ItemList` (reads)
- Notes: filters are global — they affect ItemList filtering; they are not persisted to `localStorage` (currently ephemeral)

3. UI modal / view state

- Location: `src/context/UIContext.jsx` (`UIProvider`)
- Keys / functions:
  - `showModal` (bool) — shows `ItemForm` modal
  - `modalMode` ("add" | "edit") — used by `ItemForm` to determine behavior
  - `editingItem` (Item | null) — item being edited; used to prefill `ItemForm`
  - `openAddModal()` — sets mode=`add`, editingItem=null, showModal=true
  - `openEditModal(item)` — sets mode=`edit`, editingItem=item, showModal=true
  - `closeModal()` — resets showModal & editingItem
  - `showItemView` (bool) — shows `ItemView`
  - `viewingItem` (Item | null) — item shown in `ItemView`
  - `openItemView(item)`, `closeItemView()`
- Consumers: `Navbar` (openAddModal), `ItemCard` (openEditModal, openItemView), `ItemForm` (reads modalMode, editingItem), `ItemView` (reads viewingItem)
- Persistence: not persisted; ephemeral UI state

4. Theme state

- Location: `src/context/ThemeContext.jsx` (`ThemeProvider`)
- Key: `theme` ("light" | "dark")
- Initial: `localStorage.pit-theme` if present, otherwise `'light'`
- Update: `toggleTheme()` toggles and writes `pit-theme` to `localStorage`; `useEffect` writes `data-theme` attribute on `<html>`
- Consumers: `Navbar` (toggle button), CSS uses `data-theme` attribute to apply variables

5. Local component state examples

- `ItemCard` — `menuOpen` boolean for dropdown
- `ItemForm` — `formData` for controlled inputs
- `ItemForm` — `initialState` populated from `editingItem` if editing

---

## Filtering & Search logic (exact)

- `ItemList` reads `state.items` and `useFilter()` values.
- Steps:
  1. Start from `state.items`
  2. Filter out `item.isHidden === true`
  3. If `activeCategory !== 'all'`, keep items with `item.category === activeCategory`
  4. If `activeStatus !== 'all'`, keep items with `item.status === activeStatus`
  5. If `searchText.trim()` not empty, case-insensitive substring match on `item.title`
- Two empty states implemented:
  - No items at all: show "No items yet — add your first interest to get started! 📦"
  - Items exist but filtered result is empty: show "No results match your filters. Try adjusting them. 🔍"

---

## Reducer behavior (edge cases and notes)

- `ADD_ITEM`: Appends payload to `items`. Payload must include `id` (ItemForm generates one). No duplication checks.
- `EDIT_ITEM`: Replaces item with same `id` (strict equality) with provided payload.
- `HIDE_ITEM` / `UNHIDE_ITEM`: Toggle `isHidden` boolean for matching `id`.
- `DELETE_ITEM`: Removes item by `id` permanently. `HIDE_ITEM` acts as soft-delete.
- Reducer logs actions to console for debugging.

Known limitations:

- No undo stack for delete/hide.
- `ADD_ITEM` uses `Date.now() + Math.random()` — not cryptographically unique but sufficient.

---

## Modal flows (user interactions)

- Add new item:
  1. User clicks `+ Add` in `Navbar` → calls `openAddModal()`
  2. `UIContext` sets `modalMode='add'`, `editingItem=null`, `showModal=true`
  3. `App.jsx` renders `<ItemForm />`; `ItemForm` uses default initial values
  4. On submit, `ItemForm` validates required fields and dispatches `ADD_ITEM` with payload
  5. `CollectionContext` reducer appends item, `CollectionProvider` saves to `localStorage`
  6. `ItemForm` calls `closeModal()`

- Edit item:
  1. User opens `ItemCard` menu → clicks `Edit` → `openEditModal(item)`
  2. `UIContext` sets `modalMode='edit'`, `editingItem=item`, `showModal=true`
  3. `ItemForm` initialises `formData` from `editingItem`
  4. On submit, `ItemForm` dispatches `EDIT_ITEM` with full updated item object
  5. Close modal

- View item details:
  1. User chooses `View` in `ItemCard` menu → `openItemView(item)`
  2. `App.jsx` renders `<ItemView />` bound to `viewingItem`
  3. Close via `closeItemView()`

---

## Recommendations / Notes for future work

- Add `UNDELETE` or archive list to recover deletes.
- Consider normalizing `genres` as an array consistently (ItemForm currently accepts text; ItemView JSON-stringifies objects).
- Add validation for category-specific numeric fields (ensure numbers, non-negative).
- Consider using UUIDs for `id` if collisions become a concern.
- Optionally persist filters and last open modal to `localStorage` if desired.

---

## Where to look in the code

- Collection context & reducer: `src/context/CollectionContext.jsx`, `src/reducers/collectionReducer.js`
- UI & modal state: `src/context/UIContext.jsx`
- Filters: `src/context/FilterContext.jsx` and `src/components/FilterBar.jsx`
- Forms: `src/components/ItemForm.jsx`
- Cards & list: `src/components/ItemCard.jsx`, `src/components/ItemList.jsx`
- Theme: `src/context/ThemeContext.jsx`, `src/styles/App.css`

---

If you'd like, I can now:

- run a small validation script to check all context exports and list where each hook is imported, or
- open a PR that replaces the deleted docs with this new `LAB_6_IMPLEMENTATION_DETAILS.md` and commit the change for review.

Which next action do you prefer? (validate imports / open PR / nothing)
