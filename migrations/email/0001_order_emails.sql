CREATE TABLE IF NOT EXISTS order_emails (
  event_key TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('confirmed', 'ready')),
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  lease_until INTEGER NOT NULL DEFAULT 0,
  provider_id TEXT,
  accepted_at INTEGER,
  delivery_status TEXT,
  error TEXT,
  UNIQUE (order_id, kind)
);
