"""
Aviation Dashboard - Airport Endpoints
GET /api/airports         - List airports (pagination, filter)
GET /api/airports/search  - Search by ICAO/IATA/name
GET /api/airports/map     - Map markers by bounding box
GET /api/airports/{ident} - Airport detail + runways + frequencies
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import case, func

from database import get_db
from models.aviation import Airport, Runway, AirportFrequency
from schemas.aviation import (
    AirportListItem,
    AirportListResponse,
    AirportDetailResponse,
    AirportMapMarker,
    AirportMapResponse,
    RunwayResponse,
    FrequencyResponse,
    PaginationMeta,
)
from config import settings

router = APIRouter(prefix="/api/airports", tags=["Airports"])


# ── GET /api/airports ─────────────────────────
@router.get("", response_model=AirportListResponse)
async def list_airports(
    limit: int = Query(default=50, ge=1, le=200, description="Items per page"),
    offset: int = Query(default=0, ge=0, description="Skip N items"),
    country: str | None = Query(default=None, description="Filter by ISO country code (e.g. US, VN)"),
    type: str | None = Query(default=None, description="Filter by type (large_airport, medium_airport, small_airport, heliport, closed)"),
    continent: str | None = Query(default=None, description="Filter by continent (NA, SA, EU, AF, AS, OC, AN)"),
    scheduled: str | None = Query(default=None, description="Filter by scheduled service (yes/no)"),
    db: Session = Depends(get_db),
):
    """List airports with pagination and optional filters."""
    query = db.query(Airport)

    # Apply filters
    if country:
        query = query.filter(Airport.iso_country == country.upper())
    if type:
        query = query.filter(Airport.type == type)
    if continent:
        query = query.filter(Airport.continent == continent.upper())
    if scheduled:
        query = query.filter(Airport.scheduled_service == scheduled.lower())

    # Get total count before pagination
    total = query.count()

    # Apply pagination
    airports = query.order_by(Airport.name).offset(offset).limit(limit).all()

    return AirportListResponse(
        data=[AirportListItem.model_validate(a) for a in airports],
        pagination=PaginationMeta(
            total=total,
            limit=limit,
            offset=offset,
            has_more=(offset + limit) < total,
        ),
    )


# ── GET /api/airports/search ─────────────────
@router.get("/search", response_model=AirportListResponse)
async def search_airports(
    q: str = Query(..., min_length=2, max_length=100, description="Search query (ICAO, IATA, or airport name)"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    country: str | None = Query(default=None, description="Filter by ISO country code (e.g. US, VN)"),
    type: str | None = Query(default=None, description="Filter by type (large_airport, medium_airport, small_airport, heliport, closed)"),
    db: Session = Depends(get_db),
):
    """Search airports by ICAO/IATA/code, name, municipality, or keywords."""
    search_term = q.strip()
    lower_term = search_term.lower()
    upper_term = search_term.upper()
    upper_prefix = f"{upper_term}%"
    upper_contains = f"%{upper_term}%"
    lower_prefix = f"{lower_term}%"
    lower_contains = f"%{lower_term}%"
    lower_word_contains = f"% {lower_term}%"

    ident_value = func.upper(func.coalesce(Airport.ident, ""))
    iata_value = func.upper(func.coalesce(Airport.iata_code, ""))
    gps_value = func.upper(func.coalesce(Airport.gps_code, ""))
    name_value = func.lower(func.coalesce(Airport.name, ""))
    municipality_value = func.lower(func.coalesce(Airport.municipality, ""))
    keywords_value = func.lower(func.coalesce(Airport.keywords, ""))

    query = db.query(Airport).filter(
        (ident_value.like(upper_contains))
        | (iata_value.like(upper_contains))
        | (gps_value.like(upper_contains))
        | (name_value.like(lower_contains))
        | (municipality_value.like(lower_contains))
        | (keywords_value.like(lower_contains))
    )

    if country:
        query = query.filter(Airport.iso_country == country.upper())
    if type:
        query = query.filter(Airport.type == type)

    relevance_rank = case(
        (Airport.ident == upper_term, 130),
        (Airport.iata_code == upper_term, 125),
        (Airport.gps_code == upper_term, 120),
        (ident_value.like(upper_prefix), 115),
        (iata_value.like(upper_prefix), 110),
        (gps_value.like(upper_prefix), 105),
        (name_value == lower_term, 100),
        (municipality_value == lower_term, 95),
        (name_value.like(lower_prefix), 90),
        (municipality_value.like(lower_prefix), 85),
        (keywords_value.like(lower_prefix), 80),
        (name_value.like(lower_word_contains), 75),
        (municipality_value.like(lower_word_contains), 70),
        (name_value.like(lower_contains), 65),
        (municipality_value.like(lower_contains), 60),
        (keywords_value.like(lower_contains), 55),
        else_=0,
    )
    scheduled_rank = case((Airport.scheduled_service == "yes", 1), else_=0)
    type_rank = case(
        (Airport.type == "large_airport", 5),
        (Airport.type == "medium_airport", 4),
        (Airport.type == "small_airport", 3),
        (Airport.type == "heliport", 2),
        (Airport.type == "seaplane_base", 1),
        else_=0,
    )

    total = query.count()
    airports = (
        query.order_by(
            relevance_rank.desc(),
            scheduled_rank.desc(),
            type_rank.desc(),
            Airport.name.asc(),
        )
        .offset(offset)
        .limit(limit)
        .all()
    )

    return AirportListResponse(
        data=[AirportListItem.model_validate(a) for a in airports],
        pagination=PaginationMeta(
            total=total,
            limit=limit,
            offset=offset,
            has_more=(offset + limit) < total,
        ),
    )


# ── GET /api/airports/map ────────────────────
@router.get("/map", response_model=AirportMapResponse)
async def map_airports(
    north: float = Query(..., ge=-90, le=90, description="North latitude boundary"),
    south: float = Query(..., ge=-90, le=90, description="South latitude boundary"),
    east: float = Query(..., ge=-180, le=180, description="East longitude boundary"),
    west: float = Query(..., ge=-180, le=180, description="West longitude boundary"),
    types: str | None = Query(default=None, description="Comma-separated types to include (e.g. large_airport,medium_airport)"),
    limit: int = Query(default=500, ge=1, le=2000, description="Max markers to return"),
    db: Session = Depends(get_db),
):
    """Get airport markers within a map bounding box."""
    query = db.query(Airport).filter(
        Airport.latitude_deg.isnot(None),
        Airport.longitude_deg.isnot(None),
        Airport.latitude_deg.between(south, north),
        Airport.longitude_deg.between(west, east),
    )

    if types:
        type_list = [t.strip() for t in types.split(",")]
        query = query.filter(Airport.type.in_(type_list))

    # Prioritize larger airports when limit is applied
    airports = (
        query.order_by(
            Airport.type.desc()  # large > medium > small
        )
        .limit(limit)
        .all()
    )

    return AirportMapResponse(
        data=[AirportMapMarker.model_validate(a) for a in airports],
        count=len(airports),
    )


# ── GET /api/airports/{ident} ────────────────
@router.get("/{ident}", response_model=AirportDetailResponse)
async def get_airport(
    ident: str,
    db: Session = Depends(get_db),
):
    """Get detailed info for a single airport, including runways and frequencies."""
    airport = db.query(Airport).filter(Airport.ident == ident.upper()).first()

    if not airport:
        # Try by IATA code as fallback
        airport = db.query(Airport).filter(Airport.iata_code == ident.upper()).first()

    if not airport:
        raise HTTPException(status_code=404, detail=f"Airport '{ident}' not found")

    # Fetch related data
    runways = db.query(Runway).filter(Runway.airport_ident == airport.ident).all()
    frequencies = db.query(AirportFrequency).filter(AirportFrequency.airport_ident == airport.ident).all()

    # Build response
    airport_data = AirportDetailResponse.model_validate(airport)
    airport_data.runways = [RunwayResponse.model_validate(r) for r in runways]
    airport_data.frequencies = [FrequencyResponse.model_validate(f) for f in frequencies]

    return airport_data
