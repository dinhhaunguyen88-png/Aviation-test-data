"""
Aviation Dashboard - Data Freshness Endpoint
GET /api/data-freshness - Database info and data sources status
"""

import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.aviation import Airport, Runway, AirportFrequency, Navaid, Country, Region, Airline, Route
from schemas.aviation import DataFreshnessResponse, DataSourceInfo
from config import settings

router = APIRouter(tags=["Data"])


@router.get("/api/data-freshness", response_model=DataFreshnessResponse)
async def data_freshness(db: Session = Depends(get_db)):
    """Get database info and data source details."""
    # Database file size
    db_path = str(settings.DB_PATH)
    db_size_mb = 0.0
    if os.path.exists(db_path):
        db_size_mb = round(os.path.getsize(db_path) / (1024 * 1024), 2)

    # Row counts per table
    table_counts = {
        "countries": db.query(func.count(Country.id)).scalar() or 0,
        "regions": db.query(func.count(Region.id)).scalar() or 0,
        "airports": db.query(func.count(Airport.id)).scalar() or 0,
        "runways": db.query(func.count(Runway.id)).scalar() or 0,
        "airport_frequencies": db.query(func.count(AirportFrequency.id)).scalar() or 0,
        "navaids": db.query(func.count(Navaid.id)).scalar() or 0,
        "airlines": db.query(func.count(Airline.airline_id)).scalar() or 0,
        "routes": db.query(func.count(Route.id)).scalar() or 0,
    }

    total_records = sum(table_counts.values())

    sources = [
        DataSourceInfo(name="Countries", table="countries", row_count=table_counts["countries"], source="OurAirports"),
        DataSourceInfo(name="Regions", table="regions", row_count=table_counts["regions"], source="OurAirports"),
        DataSourceInfo(name="Airports", table="airports", row_count=table_counts["airports"], source="OurAirports"),
        DataSourceInfo(name="Runways", table="runways", row_count=table_counts["runways"], source="OurAirports"),
        DataSourceInfo(name="Frequencies", table="airport_frequencies", row_count=table_counts["airport_frequencies"], source="OurAirports"),
        DataSourceInfo(name="Navaids", table="navaids", row_count=table_counts["navaids"], source="OurAirports"),
        DataSourceInfo(name="Airlines", table="airlines", row_count=table_counts["airlines"], source="OpenFlights"),
        DataSourceInfo(name="Routes", table="routes", row_count=table_counts["routes"], source="OpenFlights"),
    ]

    return DataFreshnessResponse(
        database_path=db_path,
        database_size_mb=db_size_mb,
        total_records=total_records,
        sources=sources,
    )
