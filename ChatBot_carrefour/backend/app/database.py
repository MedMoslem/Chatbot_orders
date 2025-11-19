import sqlite3

def get_db():
    conn = sqlite3.connect("orders.db")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product TEXT,
            quantity INTEGER,
            status TEXT DEFAULT 'pending'
        )
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
