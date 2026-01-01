"""Database connection and session management."""
from sqlmodel import create_engine, SQLModel, Session
from src.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)


def create_db_and_tables():
    """Create all database tables."""
    SQLModel.metadata.create_all(engine)


def get_db():
    """Dependency to get database session."""
    with Session(engine) as session:
        yield session
