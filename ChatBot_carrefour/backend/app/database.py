import sqlite3
from datetime import datetime

def get_db():
    conn = sqlite3.connect("orders.db")
    conn.row_factory = sqlite3.Row  # Allow accessing columns by name
    
    # Create tables
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product TEXT,
            quantity INTEGER,
            status TEXT DEFAULT 'pending'
        );
        
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER,
            role TEXT,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions (id)
        );
    """)
    return conn

def create_order(product, quantity):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO orders (product, quantity) VALUES (?, ?)",
        (product, quantity)
    )
    conn.commit()
    order_id = cursor.lastrowid
    conn.close()
    return order_id

# Session Management
def create_session(title="New Chat"):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO sessions (title) VALUES (?)", (title,))
    conn.commit()
    session_id = cursor.lastrowid
    conn.close()
    return session_id

def get_sessions():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sessions ORDER BY created_at DESC")
    sessions = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return sessions

def get_session(session_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def delete_session(session_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
    cursor.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    conn.commit()
    conn.close()

# Message Management
def add_message(session_id, role, content):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)",
        (session_id, role, content)
    )
    conn.commit()
    conn.close()

def get_session_messages(session_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at ASC",
        (session_id,)
    )
    messages = [dict(row) for row in cursor.fetchall()]
    conn.close()
    # Map 'content' to 'message' key to match existing frontend expectation if needed,
    # but better to standardize. For now let's return as is and adapt main.py
    return [{"role": m["role"], "message": m["content"]} for m in messages]

def update_session_title(session_id, title):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE sessions SET title = ? WHERE id = ?", (title, session_id))
    conn.commit()
    conn.close()
