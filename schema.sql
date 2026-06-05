CREATE TABLE IF NOT EXISTS knowledge_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    layer TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    summary TEXT NOT NULL,
    detail TEXT NOT NULL,
    device_or_unit TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_knowledge_layer ON knowledge_points(layer);
CREATE INDEX IF NOT EXISTS idx_knowledge_title ON knowledge_points(title);
CREATE UNIQUE INDEX IF NOT EXISTS idx_knowledge_layer_title ON knowledge_points(layer, title);
