"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes import auth_router, tasks_router, users_router, adk_agent_router

app = FastAPI(
    title="Todo API",
    description="Phase II Todo Full-Stack Web Application API with AI Agent",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(users_router)
app.include_router(adk_agent_router)


@app.on_event("startup")
def on_startup():
    """Initialize database on application startup."""
    try:
        from src.database import create_db_and_tables
        create_db_and_tables()
    except Exception as e:
        print(f"Warning: Could not initialize database: {e}")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Todo API v2.1.0"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}