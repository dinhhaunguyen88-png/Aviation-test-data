"""
Aviation Dashboard - Route Endpoints
GET /api/routes/{airport} - Get routes from/to an airport
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models.aviation import Route, Airline, Airport
from schemas.aviation import RouteDetailResponse, RoutesResponse

router = APIRouter(prefix="/api/routes", tags=["Routes"])


@router.get("/{airport}", response_model=RoutesResponse)
async def get_routes(
    airport: str,
    db: Session = Depends(get_db),
):
    """Get all routes from/to an airport (by ICAO or IATA code)."""
    code = airport.strip().upper()

    # Verify airport exists
    airport_exists = db.query(Airport).filter(
        (Airport.ident == code) | (Airport.iata_code == code)
    ).first()

    if not airport_exists:
        raise HTTPException(status_code=404, detail=f"Airport '{code}' not found")

    # --- Outbound routes (FROM this airport) ---
    outbound_raw = (
        db.query(Route, Airline.name.label("airline_name"))
        .outerjoin(Airline, Route.airline == Airline.iata)
        .filter(
            (Route.source_airport == code)
            | (Route.source_airport == airport_exists.iata_code)
            | (Route.source_airport == airport_exists.ident)
        )
        .all()
    )

    outbound = []
    for route, airline_name in outbound_raw:
        # Get destination airport name
        dest = db.query(Airport.name).filter(
            (Airport.iata_code == route.dest_airport) | (Airport.ident == route.dest_airport)
        ).first()

        outbound.append(RouteDetailResponse(
            id=route.id,
            airline_code=route.airline,
            airline_name=airline_name,
            source_airport=route.source_airport,
            source_airport_name=airport_exists.name,
            dest_airport=route.dest_airport,
            dest_airport_name=dest.name if dest else None,
            stops=route.stops,
            equipment=route.equipment,
        ))

    # --- Inbound routes (TO this airport) ---
    inbound_raw = (
        db.query(Route, Airline.name.label("airline_name"))
        .outerjoin(Airline, Route.airline == Airline.iata)
        .filter(
            (Route.dest_airport == code)
            | (Route.dest_airport == airport_exists.iata_code)
            | (Route.dest_airport == airport_exists.ident)
        )
        .all()
    )

    inbound = []
    for route, airline_name in inbound_raw:
        # Get source airport name
        src = db.query(Airport.name).filter(
            (Airport.iata_code == route.source_airport) | (Airport.ident == route.source_airport)
        ).first()

        inbound.append(RouteDetailResponse(
            id=route.id,
            airline_code=route.airline,
            airline_name=airline_name,
            source_airport=route.source_airport,
            source_airport_name=src.name if src else None,
            dest_airport=route.dest_airport,
            dest_airport_name=airport_exists.name,
            stops=route.stops,
            equipment=route.equipment,
        ))

    return RoutesResponse(
        outbound=outbound,
        inbound=inbound,
        total_outbound=len(outbound),
        total_inbound=len(inbound),
    )
