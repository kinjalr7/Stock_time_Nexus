"""
Phase 1: Persistence Layer
Replaces in-memory lists with a real SQLite database using the built-in sqlite3 module.
All portfolio holdings and watchlist stocks are persisted across server restarts.
"""
import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.environ.get("DB_PATH", "stock_nexus.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def db_cursor():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        yield cursor
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Create all tables if they don't exist."""
    with db_cursor() as cur:
        # Users table (already created by auth.py, ensure compatible)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT UNIQUE
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS logins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                ip TEXT
            )
        """)

        # Portfolio holdings — persisted across restarts
        cur.execute("""
            CREATE TABLE IF NOT EXISTS model_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                model_type TEXT NOT NULL,
                mae REAL,
                rmse REAL,
                r2 REAL,
                trained_at TEXT,
                UNIQUE(symbol, model_type)
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_model_metrics_symbol ON model_metrics(symbol)")

        # Portfolio holdings — persisted across restarts
        cur.execute("""
            CREATE TABLE IF NOT EXISTS portfolio_holdings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL DEFAULT 'demo',
                symbol TEXT NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 0,
                avg_price REAL NOT NULL DEFAULT 0,
                UNIQUE(username, symbol)
            )
        """)

        # Watchlist stocks
        cur.execute("""
            CREATE TABLE IF NOT EXISTS watchlist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL DEFAULT 'demo',
                symbol TEXT NOT NULL,
                UNIQUE(username, symbol)
            )
        """)

        # Orders table (persisted)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL DEFAULT 'demo',
                symbol TEXT NOT NULL,
                start_price REAL NOT NULL,
                end_price REAL NOT NULL,
                quantity INTEGER NOT NULL,
                strategy TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'active',
                created_at REAL NOT NULL
            )
        """)

    # Seed demo holdings if empty
    _seed_demo_data()


def _seed_demo_data():
    with db_cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM portfolio_holdings WHERE username = 'demo'")
        if cur.fetchone()[0] == 0:
            demo_holdings = [
                ("demo", "AAPL", 10, 180.0),
                ("demo", "TSLA", 5, 250.0),
                ("demo", "MSFT", 8, 370.0),
                ("demo", "NVDA", 3, 800.0),
            ]
            cur.executemany(
                "INSERT OR IGNORE INTO portfolio_holdings (username, symbol, quantity, avg_price) VALUES (?, ?, ?, ?)",
                demo_holdings,
            )

        cur.execute("SELECT COUNT(*) FROM watchlist WHERE username = 'demo'")
        if cur.fetchone()[0] == 0:
            watchlist_symbols = [
                ("demo", "AAPL"),
                ("demo", "TSLA"),
                ("demo", "MSFT"),
                ("demo", "GOOGL"),
                ("demo", "NVDA"),
                ("demo", "META"),
                ("demo", "AMZN"),
            ]
            cur.executemany(
                "INSERT OR IGNORE INTO watchlist (username, symbol) VALUES (?, ?)",
                watchlist_symbols,
            )
