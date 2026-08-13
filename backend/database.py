"""
Typeform 3D Engine - SQLite Database Configuration & Session Manager
Custom ORM Database Engine Setup for Scaler AI Labs Assignment.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from typing import Generator

# Local SQLite storage database file path
SQLALCHEMY_DATABASE_URL = "sqlite:///./typeform.db"

# Create SQLAlchemy engine with multi-thread support for FastAPI workers
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# Configured thread-safe session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base class for modern SQLAlchemy 2.0 ORM models
class Base(DeclarativeBase):
    pass

def get_db() -> Generator:
    """
    FastAPI dependency that provides a transactional database session per HTTP request
    and automatically cleans up resources after response completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
