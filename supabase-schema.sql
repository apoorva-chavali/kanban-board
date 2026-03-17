-- ============================================================
-- FLOW KANBAN BOARD — SUPABASE SCHEMA
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension (already enabled in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Team members (user-created teammates)
CREATE TABLE IF NOT EXISTS team_members (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  avatar_color text NOT NULL DEFAULT '#5b8df6',
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now()
);

-- Labels
CREATE TABLE IF NOT EXISTS labels (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  color       text NOT NULL DEFAULT '#5b8df6',
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       text NOT NULL,
  description text,
  status      text NOT NULL DEFAULT 'todo'
              CHECK (status IN ('todo', 'in_progress', 'in_review', 'done')),
  priority    text NOT NULL DEFAULT 'normal'
              CHECK (priority IN ('low', 'normal', 'high')),
  due_date    date,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now()
);

-- Task <-> Assignee junction
CREATE TABLE IF NOT EXISTS task_assignees (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  member_id   uuid NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(task_id, member_id)
);

-- Task <-> Label junction
CREATE TABLE IF NOT EXISTS task_labels (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  label_id    uuid NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(task_id, label_id)
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  content     text NOT NULL,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now()
);

-- Activity log
CREATE TABLE IF NOT EXISTS activity_logs (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action      text NOT NULL,  -- 'created', 'status_changed', 'commented', etc.
  old_value   text,
  new_value   text,
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS tasks_user_id_idx       ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx         ON tasks(status);
CREATE INDEX IF NOT EXISTS comments_task_id_idx     ON comments(task_id);
CREATE INDEX IF NOT EXISTS activity_task_id_idx     ON activity_logs(task_id);
CREATE INDEX IF NOT EXISTS task_assignees_task_idx  ON task_assignees(task_id);
CREATE INDEX IF NOT EXISTS task_labels_task_idx     ON task_labels(task_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels          ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignees  ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_labels     ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs   ENABLE ROW LEVEL SECURITY;

-- Tasks: users can only see/edit their own
CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Team members
CREATE POLICY "members_select" ON team_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "members_insert" ON team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "members_delete" ON team_members FOR DELETE USING (auth.uid() = user_id);

-- Labels
CREATE POLICY "labels_select" ON labels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "labels_insert" ON labels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "labels_delete" ON labels FOR DELETE USING (auth.uid() = user_id);

-- Task assignees
CREATE POLICY "task_assignees_select" ON task_assignees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "task_assignees_insert" ON task_assignees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "task_assignees_delete" ON task_assignees FOR DELETE USING (auth.uid() = user_id);

-- Task labels
CREATE POLICY "task_labels_select" ON task_labels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "task_labels_insert" ON task_labels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "task_labels_delete" ON task_labels FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "comments_select" ON comments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Activity logs
CREATE POLICY "activity_select" ON activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "activity_insert" ON activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
