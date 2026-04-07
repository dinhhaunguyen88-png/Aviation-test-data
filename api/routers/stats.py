"""
Aviation Dashboard - Statistics Endpoints
GET /api/stats          - Dashboard KPIs overview
GET /api/stats/countries - Airports per country (for bar chart)
GET /api/stats/types     - Airports by type (for pie chart)
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.aviation import Airport, Runway, Airline, Route, Country, Navaid
from schemas.aviation import (
    StatsOverviewResponse,
    CountryStatItem,
    CountryStatsResponse,
    TypeStatItem,
    TypeStatsResponse,
)

router = APIRouter(prefix="/api/stats", tags=["Statistics"])


# ── GET /api/stats ───────────────────────────
@router.get("", response_model=StatsOverviewResponse)
async def stats_overview(db: Session = Depends(get_db)):
    """Dashboard KPI overview: total counts and top metrics."""
    total_airports = db.query(func.count(Airport.id)).scalar() or 0
    total_runways = db.query(func.count(Runway.id)).scalar() or 0
    total_airlines = db.query(func.count(Airline.airline_id)).scalar() or 0
    total_routes = db.query(func.count(Route.id)).scalar() or 0
    total_countries = db.query(func.count(Country.id)).scalar() or 0
    total_navaids = db.query(func.count(Navaid.id)).scalar() or 0

    scheduled = (
        db.query(func.count(Airport.id))
        .filter(Airport.scheduled_service == "yes")
        .scalar()
        or 0
    )

    # Top country by airport count
    top = (
        db.query(
            Airport.iso_country,
            func.count(Airport.id).label("cnt"),
        )
        .group_by(Airport.iso_country)
        .order_by(func.count(Airport.id).desc())
        .first()
    )

    return StatsOverviewResponse(
        total_airports=total_airports,
        total_runways=total_runways,
        total_airlines=total_airlines,
        total_routes=total_routes,
        total_countries=total_countries,
        total_navaids=total_navaids,
        airports_with_scheduled_service=scheduled,
        top_country=top[0] if top else None,
        top_country_count=top[1] if top else 0,
    )


# ── GET /api/stats/countries ─────────────────
@router.get("/countries", response_model=CountryStatsResponse)
async def stats_by_country(
    limit: int = Query(default=30, ge=1, le=249, description="Number of countries to return"),
    db: Session = Depends(get_db),
):
    """Airports per country, sorted by count descending. For bar/treemap charts."""
    results = (
        db.query(
            Airport.iso_country,
            Country.name.label("country_name"),
            func.count(Airport.id).label("airport_count"),
        )
        .outerjoin(Country, Airport.iso_country == Country.code)
        .group_by(Airport.iso_country)
        .order_by(func.count(Airport.id).desc())
        .limit(limit)
        .all()
    )

    total = db.query(func.count(func.distinct(Airport.iso_country))).scalar() or 0

    return CountryStatsResponse(
        data=[
            CountryStatItem(
                country_code=r.iso_country or "Unknown",
                country_name=r.country_name,
                airport_count=r.airport_count,
            )
            for r in results
        ],
        total_countries=total,
    )


# ── GET /api/stats/types ─────────────────────
@router.get("/types", response_model=TypeStatsResponse)
async def stats_by_type(db: Session = Depends(get_db)):
    """Airports by type. For pie/donut charts."""
    total = db.query(func.count(Airport.id)).scalar() or 1  # avoid div by 0

    results = (
        db.query(
            Airport.type,
            func.count(Airport.id).label("count"),
        )
        .group_by(Airport.type)
        .order_by(func.count(Airport.id).desc())
        .all()
    )

    return TypeStatsResponse(
        data=[
            TypeStatItem(
                type=r.type,
                count=r.count,
                percentage=round((r.count / total) * 100, 2),
            )
            for r in results
        ]
    )
