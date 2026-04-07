"""
Aviation Dashboard - FastAPI Backend
Main entry point for the API server.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from routers import airports, routes, stats, data

app = FastAPI(
    title="Aviation Dashboard API",
    description="API for exploring 85K+ airports, routes, runways, and aviation data worldwide.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Middleware ──────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global Error Handler ────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch unhandled exceptions and return a clean JSON error."""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )


# ── Register Routers ────────────────────────
app.include_router(airports.router)
app.include_router(routes.router)
app.include_router(stats.router)
app.include_router(data.router)


# ── Health Check ─────────────────────────────
@app.get("/api/health", tags=["Health"])
async def health_check():
    """Check if the API server is running."""
    return {"status": "ok", "version": "1.0.0"}


# ── Root ─────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    """API root - shows available endpoints."""
    return {
        "name": "Aviation Dashboard API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": [
            "/api/health",
            "/api/airports",
            "/api/airports/{ident}",
            "/api/airports/search",
            "/api/airports/map",
            "/api/routes/{airport}",
            "/api/stats",
            "/api/stats/countries",
            "/api/stats/types",
            "/api/data-freshness",
        ],
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
