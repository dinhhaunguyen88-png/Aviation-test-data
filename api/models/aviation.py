"""
Aviation Dashboard - SQLAlchemy Models
Defines all database tables matching DESIGN.md schema.
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    Index,
)
from database import Base


# ─── Countries ───────────────────────────────
class Country(Base):
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True)
    code = Column(String(2), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    continent = Column(String(2))
    wikipedia_link = Column(Text)
    keywords = Column(Text)

    def __repr__(self):
        return f"<Country {self.code}: {self.name}>"


# ─── Regions ─────────────────────────────────
class Region(Base):
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True)
    code = Column(String(10), unique=True, nullable=False, index=True)
    local_code = Column(String(10))
    name = Column(String(200), nullable=False)
    continent = Column(String(2))
    iso_country = Column(String(2), index=True)
    wikipedia_link = Column(Text)
    keywords = Column(Text)

    def __repr__(self):
        return f"<Region {self.code}: {self.name}>"


# ─── Airports ────────────────────────────────
class Airport(Base):
    __tablename__ = "airports"

    id = Column(Integer, primary_key=True)
    ident = Column(String(10), unique=True, nullable=False)
    type = Column(String(20), nullable=False)
    name = Column(String(200), nullable=False)
    latitude_deg = Column(Float)
    longitude_deg = Column(Float)
    elevation_ft = Column(Integer)
    continent = Column(String(2))
    iso_country = Column(String(2))
    iso_region = Column(String(10))
    municipality = Column(String(100))
    scheduled_service = Column(String(3))
    gps_code = Column(String(10))
    iata_code = Column(String(3))
    local_code = Column(String(10))
    home_link = Column(Text)
    wikipedia_link = Column(Text)
    keywords = Column(Text)

    # Indexes for common queries
    __table_args__ = (
        Index("ix_airports_ident", "ident"),
        Index("ix_airports_iata", "iata_code"),
        Index("ix_airports_type", "type"),
        Index("ix_airports_country", "iso_country"),
        Index("ix_airports_continent", "continent"),
        Index("ix_airports_coords", "latitude_deg", "longitude_deg"),
        Index("ix_airports_scheduled", "scheduled_service"),
        Index("ix_airports_name", "name"),
    )

    def __repr__(self):
        return f"<Airport {self.ident}: {self.name}>"


# ─── Runways ─────────────────────────────────
class Runway(Base):
    __tablename__ = "runways"

    id = Column(Integer, primary_key=True)
    airport_ref = Column(Integer, index=True)
    airport_ident = Column(String(10), index=True)
    length_ft = Column(Integer)
    width_ft = Column(Integer)
    surface = Column(String(50))
    lighted = Column(Integer, default=0)
    closed = Column(Integer, default=0)
    le_ident = Column(String(10))
    le_latitude_deg = Column(Float)
    le_longitude_deg = Column(Float)
    le_elevation_ft = Column(Float)
    le_heading_degT = Column(Float)
    le_displaced_threshold_ft = Column(Float)
    he_ident = Column(String(10))
    he_latitude_deg = Column(Float)
    he_longitude_deg = Column(Float)
    he_elevation_ft = Column(Float)
    he_heading_degT = Column(Float)
    he_displaced_threshold_ft = Column(Float)

    def __repr__(self):
        return f"<Runway {self.airport_ident}: {self.le_ident}/{self.he_ident}>"


# ─── Airport Frequencies ─────────────────────
class AirportFrequency(Base):
    __tablename__ = "airport_frequencies"

    id = Column(Integer, primary_key=True)
    airport_ref = Column(Integer, index=True)
    airport_ident = Column(String(10), index=True)
    type = Column(String(20))
    description = Column(String(200))
    frequency_mhz = Column(Float)

    def __repr__(self):
        return f"<Frequency {self.airport_ident}: {self.type} {self.frequency_mhz}>"


# ─── Navaids ─────────────────────────────────
class Navaid(Base):
    __tablename__ = "navaids"

    id = Column(Integer, primary_key=True)
    filename = Column(String(50))
    ident = Column(String(10), index=True)
    name = Column(String(100))
    type = Column(String(10))
    frequency_khz = Column(Float)
    latitude_deg = Column(Float)
    longitude_deg = Column(Float)
    elevation_ft = Column(Integer)
    iso_country = Column(String(2), index=True)
    dme_frequency_khz = Column(Float)
    dme_channel = Column(String(10))
    dme_latitude_deg = Column(Float)
    dme_longitude_deg = Column(Float)
    dme_elevation_ft = Column(Integer)
    slaved_variation_deg = Column(Float)
    magnetic_variation_deg = Column(Float)
    usageType = Column(String(20))
    power = Column(String(10))
    associated_airport = Column(String(10))

    def __repr__(self):
        return f"<Navaid {self.ident}: {self.name}>"


# ─── Airlines ────────────────────────────────
class Airline(Base):
    __tablename__ = "airlines"

    airline_id = Column(Integer, primary_key=True)
    name = Column(String(200))
    alias = Column(String(200))
    iata = Column(String(3), index=True)
    icao = Column(String(4), index=True)
    callsign = Column(String(100))
    country = Column(String(100))
    active = Column(String(1))

    def __repr__(self):
        return f"<Airline {self.icao}: {self.name}>"


# ─── Routes ──────────────────────────────────
class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    airline = Column(String(3))
    airline_id = Column(Integer)
    source_airport = Column(String(4))
    source_airport_id = Column(Integer)
    dest_airport = Column(String(4))
    dest_airport_id = Column(Integer)
    codeshare = Column(String(1))
    stops = Column(Integer, default=0)
    equipment = Column(String(100))

    __table_args__ = (
        Index("ix_routes_source", "source_airport"),
        Index("ix_routes_dest", "dest_airport"),
        Index("ix_routes_airline", "airline"),
    )

    def __repr__(self):
        return f"<Route {self.source_airport} → {self.dest_airport}>"
