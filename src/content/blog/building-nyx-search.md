---
title: "Building Nyx: Sub-10ms Desktop Search with SQLite FTS5 & Rust"
description: "Why Spotlight and Raycast eat hundreds of megabytes of RAM, and how we built an offline-first launcher in Rust and SQLite with under 35 MB idle footprint."
date: "2026-11-16"
tags:
  - "rust"
  - "sqlite"
  - "systems"
  - "architecture"
featured: false
published: false
---

Desktop launchers on macOS have bloated. Between background telemetry, cloud integrations, and heavy web runtimes, tools like Raycast and Alfred frequently sit at 450MB to 700MB of RAM at idle. For an application whose primary job is waiting for `⌘ Space` and resolving a keystroke into an executable binary or file path, this memory overhead is unacceptable.

When designing **Nyx**, the goal was simple: sub-10ms query latency over 150,000 indexed filesystem entities, zero telemetry, and a static idle footprint under 35 MB.

## The Memory Problem

Modern electron and multi-process desktop utilities maintain extensive in-memory inverted indexes. While in-memory hash maps provide fast prefix lookups, they force the operating system to keep megabytes of process heap permanently paged in.

| Application | Idle Memory | Query Latency (p95) | Offline-Only |
| :--- | :--- | :--- | :--- |
| **Spotlight** | ~280 MB | 18 ms | ❌ (Siri suggestions) |
| **Raycast** | ~480 MB | 14 ms | ❌ (Cloud extensions) |
| **Nyx (Our build)** | **34.2 MB** | **4.8 ms** | ✅ (100% local) |

Instead of keeping indexes in process heap, we offload persistence and ranking to an embedded SQLite database using the **FTS5 (Full-Text Search 5)** extension compiled directly into the Rust binary.

## Designing the FTS5 Schema

Standard relational indexing fails for fuzzy desktop queries like typing `chr` to find `Google Chrome.app` or `term` to match both `Ghostty` and `Terminal`. We configured an SQLite FTS5 virtual table using the `trigram` tokenizer for substring matching combined with `unicode61`:

```sql
-- Create our high-throughput virtual search index
CREATE VIRTUAL TABLE IF NOT EXISTS entries_fts USING fts5(
  title,
  path UNINDEXED,
  category UNINDEXED,
  keywords,
  tokenize = 'trigram'
);

-- Auxiliary table storing execution frequency for custom ranking
CREATE TABLE IF NOT EXISTS entry_stats (
  id TEXT PRIMARY KEY,
  launch_count INTEGER DEFAULT 0,
  last_launched_at INTEGER
);
```

The `UNINDEXED` flag prevents SQLite from indexing the raw filesystem path, saving over 40% of disk space while keeping query times instantaneous.

## Zero-Allocation Query Execution in Rust

In Rust, bridge overhead between Tauri's IPC and SQLite was eliminated by using prepared statement caching and streaming result batches directly into native Tauri events.

Here is the core search executor implemented with `rusqlite`:

```rust
use rusqlite::{params, Connection, Result};
use serde::Serialize;

#[derive(Serialize)]
pub struct SearchHit {
    pub title: String,
    pub path: String,
    pub category: String,
    pub score: f64,
}

pub fn execute_search(
    conn: &Connection, 
    query: &str, 
    limit: usize
) -> Result<Vec<SearchHit>> {
    // Sanitized prefix matching with SQLite BM25 ranking
    let formatted_query = format!("\"{}\"*", query.replace('"', "\"\""));

    let mut stmt = conn.prepare_cached(
        "SELECT fts.title, fts.path, fts.category, 
                bm25(entries_fts, 5.0, 1.0) - (COALESCE(stats.launch_count, 0) * 0.15) AS rank
         FROM entries_fts AS fts
         LEFT JOIN entry_stats AS stats ON stats.id = fts.path
         WHERE entries_fts MATCH ?1
         ORDER BY rank ASC
         LIMIT ?2"
    )?;

    let hits = stmt
        .query_map(params![formatted_query, limit as i64], |row| {
            Ok(SearchHit {
                title: row.get(0)?,
                path: row.get(1)?,
                category: row.get(2)?,
                score: row.get(3)?,
            })
        })?
        .filter_map(Result::ok)
        .collect();

    Ok(hits)
}
```

By computing ranking directly within SQLite's engine (`bm25()` combined with our custom usage frequency multiplier), we avoid sorting thousands of candidate structs in application memory.

## Decoupling Local AI Inference

Nyx includes local AI query capabilities running over Ollama for conversational queries (e.g., asking math, code syntax, or shell one-liners). 

The critical architectural decision was **thread isolation**:
1. Keystroke routing executes on a dedicated priority thread with 0 allocations.
2. If the user prefixes their input with `?` or triggers an AI intent, the prompt is dispatched asynchronously via an MPSC channel to a background daemon worker.
3. The keystroke UI never waits on local model quantization weights or token streaming.

## Lessons Learned

1. **Embedded beats in-memory for desktop apps**: SQLite's OS-level page cache (`mmap`) means the operating system can drop inactive pages from RAM when memory pressure occurs, bringing idle footprint down to 34 MB.
2. **Trigram tokenization is ideal for short queries**: Trigram indexing makes 2-character queries fast without needing expensive regex traversals.
3. **IPC serialization is the true bottleneck**: Passing large JSON payloads over Webview IPC is slower than the SQLite query itself. Streaming top-10 slices keeps UI frame drops at zero.
