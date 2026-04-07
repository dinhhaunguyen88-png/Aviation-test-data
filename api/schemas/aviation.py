"""
Aviation Dashboard - Pydantic Response Schemas
Defines all API response models.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ─── Pagination ──────────────────────────────
class PaginationMeta(BaseModel):
    total: int
    limit: int
    offset: int
    has_more: bool


# ─── Country ─────────────────────────────────
class CountryResponse(BaseModel):
    id: int
    code: str
    name: str
    continent: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── Region ──────────────────────────────────
class RegionResponse(BaseModel):
    id: int
    code: str
    name: str
    iso_country: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── Airport (List) ─────────────────────────
class AirportListItem(BaseModel):
    id: int
    ident: str
    type: str
    name: str
    latitude_deg: Optional[float] = None
    longitude_deg: Optional[float] = None
    elevation_ft: Optional[int] = None
    continent: Optional[str] = None
    iso_country: Optional[str] = None
    iso_region: Optional[str] = None
    municipality: Optional[str] = None
    scheduled_service: Optional[str] = None
    iata_code: Optional[str] = None

    model_config = {"from_attributes": True}


class AirportListResponse(BaseModel):
    data: list[AirportListItem]
    pagination: PaginationMeta


# ─── Airport (Map marker) ───────────────────
class AirportMapMarker(BaseModel):
    id: int
    ident: str
    type: str
    name: str
    latitude_deg: float
    longitude_deg: float
    iata_code: Optional[str] = None
    iso_country: Optional[str] = None

    model_config = {"from_attributes": True}


class AirportMapResponse(BaseModel):
    data: list[AirportMapMarker]
    count: int


# ─── Runway ──────────────────────────────────
class RunwayResponse(BaseModel):
    id: int
    length_ft: Optional[int] = None
    width_ft: Optional[int] = None
    surface: Optional[str] = None
    lighted: Optional[int] = None
    closed: Optional[int] = None
    le_ident: Optional[str] = None
    he_ident: Optional[str] = None
    le_heading_degT: Optional[float] = None
    he_heading_degT: Optional[float] = None

    model_config = {"from_attributes": True}


# ─── Frequency ───────────────────────────────
class FrequencyResponse(BaseModel):
    id: int
    type: Optional[str] = None
    description: Optional[str] = None
    frequency_mhz: Optional[float] = None

    model_config = {"from_attributes": True}


# ─── Airport (Detail) ───────────────────────
class AirportDetailResponse(BaseModel):
    id: int
    ident: str
    type: str
    name: str
    latitude_deg: Optional[float] = None
    longitude_deg: Optional[float] = None
    elevation_ft: Optional[int] = None
    continent: Optional[str] = None
    iso_country: Optional[str] = None
    iso_region: Optional[str] = None
    municipality: Optional[str] = None
    scheduled_service: Optional[str] = None
    gps_code: Optional[str] = None
    iata_code: Optional[str] = None
    local_code: Optional[str] = None
    home_link: Optional[str] = None
    wikipedia_link: Optional[str] = None
    keywords: Optional[str] = None
    runways: list[RunwayResponse] = []
    frequencies: list[FrequencyResponse] = []

    model_config = {"from_attributes": True}


# ─── Airline ─────────────────────────────────
class AirlineResponse(BaseModel):
    airline_id: int
    name: Optional[str] = None
    iata: Optional[str] = None
    icao: Optional[str] = None
    callsign: Optional[str] = None
    country: Optional[str] = None
    active: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── Route ───────────────────────────────────
class RouteResponse(BaseModel):
    id: int
    airline: Optional[str] = None
    source_airport: Optional[str] = None
    dest_airport: Optional[str] = None
    codeshare: Optional[str] = None
    stops: Optional[int] = None
    equipment: Optional[str] = None

    model_config = {"from_attributes": True}


class RouteDetailResponse(BaseModel):
    """Route with airline name and airport names."""
    id: int
    airline_code: Optional[str] = None
    airline_name: Optional[str] = None
    source_airport: Optional[str] = None
    source_airport_name: Optional[str] = None
    dest_airport: Optional[str] = None
    dest_airport_name: Optional[str] = None
    stops: Optional[int] = None
    equipment: Optional[str] = None


class RoutesResponse(BaseModel):
    outbound: list[RouteDetailResponse] = []
    inbound: list[RouteDetailResponse] = []
    total_outbound: int = 0
    total_inbound: int = 0


# ─── Stats ───────────────────────────────────
class StatsOverviewResponse(BaseModel):
    total_airports: int
    total_runways: int
    total_airlines: int
    total_routes: int
    total_countries: int
    total_navaids: int
    airports_with_scheduled_service: int
    top_country: Optional[str] = None
    top_country_count: int = 0


class CountryStatItem(BaseModel):
    country_code: str
    country_name: Optional[str] = None
    airport_count: int


class CountryStatsResponse(BaseModel):
    data: list[CountryStatItem]
    total_countries: int


class TypeStatItem(BaseModel):
    type: str
    count: int
    percentage: float


class TypeStatsResponse(BaseModel):
    data: list[TypeStatItem]


# ─── Data Freshness ──────────────────────────
class DataSourceInfo(BaseModel):
    name: str
    table: str
    row_count: int
    source: str


class DataFreshnessResponse(BaseModel):
    database_path: str
    database_size_mb: float
    total_records: int
    sources: list[DataSourceInfo]


# ─── Error ───────────────────────────────────
class ErrorResponse(BaseModel):
    detail: str
    status_code: int = 400
