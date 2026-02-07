"""Add recurrence column to tasks table."""
from sqlalchemy import text
from src.database import engine

def add_recurrence_column():
    """Add recurrence column to tasks table if it doesn't exist."""
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='tasks' AND column_name='recurrence'
        """))
        
        if result.fetchone() is None:
            # Add column
            conn.execute(text("""
                ALTER TABLE tasks 
                ADD COLUMN recurrence VARCHAR(100)
            """))
            conn.commit()
            print("✅ Added recurrence column to tasks table")
        else:
            print("✅ Recurrence column already exists")

if __name__ == "__main__":
    add_recurrence_column()
