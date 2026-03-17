# Flow - Kanban Task Board

A polished, fully-featured Kanban board built with React + TypeScript and Supabase.

## Features

### Core
- 4-column Kanban board: **To Do → In Progress → In Review → Done**
- Drag-and-drop tasks between columns ([@dnd-kit](https://dndkit.com/))
- Guest authentication via Supabase anonymous sign-in (no email required)
- Full RLS - every user sees only their own data

### Advanced
- **Team Members & Assignees** - create teammates with custom colors, assign to tasks, see avatars on cards
- **Task Comments** - comment thread per task with timestamps and delete
- **Activity Log**  full history of status changes and comments per task
- **Labels / Tags** - create custom colored labels, assign multiple per task
- **Due Date Indicators** - visual urgency badges (overdue in red, due today in amber, upcoming in green)
- **Search & Filtering** - real-time search by title, filter by priority / assignee / label
- **Board Summary** - live stats in header (total tasks, completed, overdue)

---

## Local Setup

### 1. Clone & install
```bash
git clone <your-repo-url>
cd kanban-board
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Go to **SQL Editor** → paste the entire contents of `supabase-schema.sql` → **Run**
3. Go to **Authentication → Providers → Anonymous** → enable it
4. Go to **Project Settings → API** → copy your **Project URL** and **anon public** key

### 3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env`:
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Start dev server
```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173)

---

## Database Schema

See `supabase-schema.sql` for the full schema. Summary:

| Table | Purpose |
|---|---|
| `tasks` | Core task data with status, priority, due_date |
| `team_members` | User-created team members with avatar colors |
| `labels` | Custom colored labels |
| `task_assignees` | Junction: tasks ↔ team_members |
| `task_labels` | Junction: tasks ↔ labels |
| `comments` | Per-task comment thread |
| `activity_logs` | History of changes per task |

All tables have RLS enabled with `user_id = auth.uid()` policies.

---

## Tech Stack

- **React 18** + **TypeScript** - UI
- **Vite** - build tool
- **@dnd-kit** - drag and drop
- **Supabase** - database + anonymous auth + RLS
- **date-fns** - date formatting
- **lucide-react** - icons
- **CSS Modules** - scoped styling (no CSS framework)

---

## Security

- Only the **anon public key** is used in the frontend - never the service role key
- RLS policies on every table ensure strict data isolation between users
- `.env` is gitignored - never committed to source control
