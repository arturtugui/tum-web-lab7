🎯 Personal Interest Tracker — A unified shelf where I log everything I'm into: movies, series, anime, videogames, manga, comics, books, music albums and YouTube channels. Friends can browse my lists but only I can add, edit, hide or remove entries.

I think it will also fit Lab 7 because I would have 2 roles: Visitors (friends) can browse the lists but only I (Admin) can add, edit, remove entries. In Lab 7, the role system becomes JWT-based and data moves to a backend API.

**Entities:** Interest item with shared base fields + category-specific ones:

- **Base:** id, title, category (movie|series|anime|game|manga|comic|book|album|youtube), status (planned|in_progress|completed|dropped), rating (1–10 or null), coverUrl, notes, **isHidden** (false by default)
- **movie|series|anime** → genres, episodes
- **game** → platform, developer
- **manga|comic** → author, chapters
- **book** → author, pages
- **album** → artist, year
- **youtube** → channelUrl, uploadFrequency

**Views:**

1. **Grid view** (main): All items displayed uniformly as cards with image + title + category badge + status + rating
2. **Detail view** (optional): Click item to see full details with category-specific fields in a structured layout
3. **Edit form** (modal): Shows only fields relevant to that item's category

**State breakdown:** (no Redux, RTK or Zustand!)

- Interest collection (add, edit, hide, remove) — global, using `useReducer + useContext`
- Current role (owner/viewer) — global, using `useContext`
- Active category tab — local, using `useState` in FilterBar
- UI theme (light/dark) — global, using `useContext + localStorage`
- Modal state (add/edit form open?) — local, using `useState` in App
- Search input / active filters — local, using `useState` in FilterBar
- Collection persistence — `localStorage`, synced on every dispatch

**Scope Note (Lab 6 vs Lab 7):**

- **Lab 6 (this):** Frontend-only, localStorage storage, role simulation (toggle button)
- **Lab 7 (next):** Backend API, JWT authentication with real roles/permissions, data fetches from server instead of localStorage
