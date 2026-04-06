"""
Aviation Dashboard - Data Import Script
Downloads CSV files from OurAirports/OpenFlights and imports into SQLite.

Usage:
    python -m scripts.import_data          # Download + Import
    python -m scripts.import_data --local  # Import from existing CSV files
"""

import sys
import time
import logging
from pathlib import Path
from io import StringIO

import pandas as pd
import requests
from sqlalchemy import text

# Add parent dir to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config import settings
from database import engine, Base
from models.aviation import (
    Country, Region, Airport, Runway,
    AirportFrequency, Navaid, Airline, Route,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)


# ─── CSV Download ────────────────────────────
def download_csv(name: str, url: str, save_dir: Path) -> Path:
    """Download a CSV file from URL, return local path."""
    save_path = save_dir / f"{name}.csv"

    if save_path.exists():
        size_mb = save_path.stat().st_size / (1024 * 1024)
        log.info(f"  ✓ {name}.csv already exists ({size_mb:.1f} MB), skipping download")
        return save_path

    log.info(f"  ↓ Downloading {name}...")
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    save_path.write_text(resp.text, encoding="utf-8")

    size_mb = save_path.stat().st_size / (1024 * 1024)
    log.info(f"  ✓ {name}.csv saved ({size_mb:.1f} MB)")
    return save_path


def download_all() -> Path:
    """Download all CSV data sources."""
    csv_dir = settings.DATA_DIR / "csv"
    csv_dir.mkdir(parents=True, exist_ok=True)

    log.info("📥 Downloading data sources...")

    for name, url in settings.DATA_SOURCES.items():
        try:
            download_csv(name, url, csv_dir)
        except Exception as e:
            log.error(f"  ✗ Failed to download {name}: {e}")

    return csv_dir


# ─── CSV Readers ─────────────────────────────
def clean_value(val):
    """Convert \\N and empty strings to None."""
    if pd.isna(val):
        return None
    if isinstance(val, str):
        val = val.strip()
        if val in ("\\N", "", "N/A", "-"):
            return None
    return val


def read_ourairports_csv(filepath: Path) -> pd.DataFrame:
    """Read OurAirports CSV (has headers)."""
    df = pd.read_csv(filepath, encoding="utf-8", dtype=str, keep_default_na=False)
    return df.map(clean_value)


def read_openflights_dat(filepath: Path, columns: list[str]) -> pd.DataFrame:
    """Read OpenFlights .dat file (no headers, backslash-N for null)."""
    df = pd.read_csv(
        filepath,
        header=None,
        names=columns,
        encoding="utf-8",
        dtype=str,
        keep_default_na=False,
        na_values=["\\N"],
    )
    return df.map(clean_value)


# ─── Import Functions ────────────────────────
def import_countries(csv_dir: Path):
    """Import countries.csv → countries table."""
    filepath = csv_dir / "countries.csv"
    if not filepath.exists():
        log.warning("  ⚠ countries.csv not found, skipping")
        return

    df = read_ourairports_csv(filepath)
    records = df.to_dict("records")

    with engine.begin() as conn:
        conn.execute(text("DELETE FROM countries"))
        for r in records:
            conn.execute(
                text("""INSERT INTO countries (id, code, name, continent, wikipedia_link, keywords)
                        VALUES (:id, :code, :name, :continent, :wikipedia_link, :keywords)"""),
                r,
            )

    log.info(f"  ✓ countries: {len(records)} rows")


def import_regions(csv_dir: Path):
    """Import regions.csv → regions table."""
    filepath = csv_dir / "regions.csv"
    if not filepath.exists():
        log.warning("  ⚠ regions.csv not found, skipping")
        return

    df = read_ourairports_csv(filepath)
    records = df.to_dict("records")

    with engine.begin() as conn:
        conn.execute(text("DELETE FROM regions"))
        for r in records:
            conn.execute(
                text("""INSERT INTO regions (id, code, local_code, name, continent, iso_country, wikipedia_link, keywords)
                        VALUES (:id, :code, :local_code, :name, :continent, :iso_country, :wikipedia_link, :keywords)"""),
                r,
            )

    log.info(f"  ✓ regions: {len(records)} rows")


def import_airports(csv_dir: Path):
    """Import airports.csv → airports table."""
    filepath = csv_dir / "airports.csv"
    if not filepath.exists():
        log.warning("  ⚠ airports.csv not found, skipping")
        return

    df = read_ourairports_csv(filepath)

    # Convert numeric columns
    for col in ["id", "elevation_ft"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    for col in ["latitude_deg", "longitude_deg"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    records = df.to_dict("records")

    with engine.begin() as conn:
        conn.execute(text("DELETE FROM airports"))
        for r in records:
            conn.execute(
                text("""INSERT INTO airports
                        (id, ident, type, name, latitude_deg, longitude_deg, elevation_ft,
                         continent, iso_country, iso_region, municipality, scheduled_service,
                         gps_code, iata_code, local_code, home_link, wikipedia_link, keywords)
                        VALUES (:id, :ident, :type, :name, :latitude_deg, :longitude_deg, :elevation_ft,
                                :continent, :iso_country, :iso_region, :municipality, :scheduled_service,
                                :gps_code, :iata_code, :local_code, :home_link, :wikipedia_link, :keywords)"""),
                r,
            )

    log.info(f"  ✓ airports: {len(records)} rows")


def import_runways(csv_dir: Path):
    """Import runways.csv → runways table."""
    filepath = csv_dir / "runways.csv"
    if not filepath.exists():
        log.warning("  ⚠ runways.csv not found, skipping")
        return

    df = read_ourairports_csv(filepath)

    # Convert numeric columns
    for col in ["id", "airport_ref", "length_ft", "width_ft", "lighted", "closed"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    for col in ["le_latitude_deg", "le_longitude_deg", "le_elevation_ft", "le_heading_degT",
                "le_displaced_threshold_ft", "he_latitude_deg", "he_longitude_deg",
                "he_elevation_ft", "he_heading_degT", "he_displaced_threshold_ft"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    records = df.to_dict("records")

    with engine.begin() as conn:
        conn.execute(text("DELETE FROM runways"))
        for r in records:
            conn.execute(
                text("""INSERT INTO runways
                        (id, airport_ref, airport_ident, length_ft, width_ft, surface, lighted, closed,
                         le_ident, le_latitude_deg, le_longitude_deg, le_elevation_ft, le_heading_degT,
                         le_displaced_threshold_ft, he_ident, he_latitude_deg, he_longitude_deg,
                         he_elevation_ft, he_heading_degT, he_displaced_threshold_ft)
                        VALUES (:id, :airport_ref, :airport_ident, :length_ft, :width_ft, :surface,
                                :lighted, :closed, :le_ident, :le_latitude_deg, :le_longitude_deg,
                                :le_elevation_ft, :le_heading_degT, :le_displaced_threshold_ft,
                                :he_ident, :he_latitude_deg, :he_longitude_deg, :he_elevation_ft,
                                :he_heading_degT, :he_displaced_threshold_ft)"""),
                r,
            )

    log.info(f"  ✓ runways: {len(records)} rows")


def import_frequencies(csv_dir: Path):
    """Import frequencies.csv → airport_frequencies table."""
    filepath = csv_dir / "frequencies.csv"
    if not filepath.exists():
        log.warning("  ⚠ frequencies.csv not found, skipping")
        return

    df = read_ourairports_csv(filepath)
    for col in ["id", "airport_ref"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df["frequency_mhz"] = pd.to_numeric(df["frequency_mhz"], errors="coerce")

    records = df.to_dict("records")

    with engine.begin() as conn:
        conn.execute(text("DELETE FROM airport_frequencies"))
        for r in records:
            conn.execute(
                text("""INSERT INTO airport_frequencies
                        (id, airport_ref, airport_ident, type, description, frequency_mhz)
                        VALUES (:id, :airport_ref, :airport_ident, :type, :description, :frequency_mhz)"""),
                r,
            )

    log.info(f"  ✓ frequencies: {len(records)} rows")


def import_navaids(csv_dir: Path):
    """Import navaids.csv → navaids table."""
    filepath = csv_dir / "navaids.csv"
    if not filepath.exists():
        log.warning("  ⚠ navaids.csv not found, skipping")
        return

    df = read_ourairports_csv(filepath)
    for col in ["id", "elevation_ft", "dme_elevation_ft"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    for col in ["frequency_khz", "latitude_deg", "longitude_deg",
                "dme_frequency_khz", "dme_latitude_deg", "dme_longitude_deg",
                "slaved_variation_deg", "magnetic_variation_deg"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    records = df.to_dict("records")

    with engine.begin() as conn:
        conn.execute(text("DELETE FROM navaids"))
        for r in records:
            conn.execute(
                text("""INSERT INTO navaids
                        (id, filename, ident, name, type, frequency_khz, latitude_deg, longitude_deg,
                         elevation_ft, iso_country, dme_frequency_khz, dme_channel, dme_latitude_deg,
                         dme_longitude_deg, dme_elevation_ft, slaved_variation_deg, magnetic_variation_deg,
                         usageType, power, associated_airport)
                        VALUES (:id, :filename, :ident, :name, :type, :frequency_khz, :latitude_deg,
                                :longitude_deg, :elevation_ft, :iso_country, :dme_frequency_khz,
                                :dme_channel, :dme_latitude_deg, :dme_longitude_deg, :dme_elevation_ft,
                                :slaved_variation_deg, :magnetic_variation_deg, :usageType, :power,
                                :associated_airport)"""),
                r,
            )

    log.info(f"  ✓ navaids: {len(records)} rows")


def import_airlines(csv_dir: Path):
    """Import airlines.dat → airlines table (OpenFlights format, no headers)."""
    filepath = csv_dir / "airlines.csv"
    if not filepath.exists():
        log.warning("  ⚠ airlines.csv not found, skipping")
        return

    columns = ["airline_id", "name", "alias", "iata", "icao", "callsign", "country", "active"]
    df = read_openflights_dat(filepath, columns)
    df["airline_id"] = pd.to_numeric(df["airline_id"], errors="coerce")
    df = df.dropna(subset=["airline_id"])
    df["airline_id"] = df["airline_id"].astype(int)

    records = df.to_dict("records")

    with engine.begin() as conn:
        conn.execute(text("DELETE FROM airlines"))
        for r in records:
            conn.execute(
                text("""INSERT OR IGNORE INTO airlines
                        (airline_id, name, alias, iata, icao, callsign, country, active)
                        VALUES (:airline_id, :name, :alias, :iata, :icao, :callsign, :country, :active)"""),
                r,
            )

    log.info(f"  ✓ airlines: {len(records)} rows")


def import_routes(csv_dir: Path):
    """Import routes.dat → routes table (OpenFlights format, no headers)."""
    filepath = csv_dir / "routes.csv"
    if not filepath.exists():
        log.warning("  ⚠ routes.csv not found, skipping")
        return

    columns = ["airline", "airline_id", "source_airport", "source_airport_id",
               "dest_airport", "dest_airport_id", "codeshare", "stops", "equipment"]
    df = read_openflights_dat(filepath, columns)

    df["airline_id"] = pd.to_numeric(df["airline_id"], errors="coerce")
    df["source_airport_id"] = pd.to_numeric(df["source_airport_id"], errors="coerce")
    df["dest_airport_id"] = pd.to_numeric(df["dest_airport_id"], errors="coerce")
    df["stops"] = pd.to_numeric(df["stops"], errors="coerce").fillna(0).astype(int)

    records = df.to_dict("records")

    with engine.begin() as conn:
        conn.execute(text("DELETE FROM routes"))
        for idx, r in enumerate(records):
            r["id"] = idx + 1
            conn.execute(
                text("""INSERT INTO routes
                        (id, airline, airline_id, source_airport, source_airport_id,
                         dest_airport, dest_airport_id, codeshare, stops, equipment)
                        VALUES (:id, :airline, :airline_id, :source_airport, :source_airport_id,
                                :dest_airport, :dest_airport_id, :codeshare, :stops, :equipment)"""),
                r,
            )

    log.info(f"  ✓ routes: {len(records)} rows")


# ─── Verify Data ─────────────────────────────
def verify_data():
    """Print row counts for all tables."""
    log.info("\n📊 Verification — Row counts:")

    tables = ["countries", "regions", "airports", "runways",
              "airport_frequencies", "navaids", "airlines", "routes"]

    with engine.connect() as conn:
        for table in tables:
            result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
            count = result.scalar()
            log.info(f"  {table}: {count:,} rows")

    # Test a specific query
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT ident, name, type FROM airports WHERE iata_code = 'SGN'")
        )
        row = result.fetchone()
        if row:
            log.info(f"\n🔍 Sample query (IATA=SGN): {row[0]} - {row[1]} ({row[2]})")
        else:
            log.info("\n🔍 Sample query (IATA=SGN): Not found")


# ─── Main ────────────────────────────────────
def main(local_only: bool = False):
    """Main import function."""
    start = time.time()

    log.info("=" * 60)
    log.info("✈️  Aviation Dashboard — Data Import")
    log.info("=" * 60)

    # Step 1: Download (or use local files)
    if local_only:
        csv_dir = settings.DATA_DIR / "csv"
        log.info(f"📂 Using local CSV files from {csv_dir}")
    else:
        csv_dir = download_all()

    # Step 2: Create tables
    log.info("\n🏗️  Creating database tables...")
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    log.info("  ✓ All tables created")

    # Step 3: Import data
    log.info("\n📥 Importing data...")
    import_countries(csv_dir)
    import_regions(csv_dir)
    import_airports(csv_dir)
    import_runways(csv_dir)
    import_frequencies(csv_dir)
    import_navaids(csv_dir)
    import_airlines(csv_dir)
    import_routes(csv_dir)

    # Step 4: Verify
    verify_data()

    elapsed = time.time() - start
    db_size = settings.DB_PATH.stat().st_size / (1024 * 1024)

    log.info(f"\n{'=' * 60}")
    log.info(f"✅ Import complete!")
    log.info(f"   ⏱️  Time: {elapsed:.1f}s")
    log.info(f"   💾 Database: {db_size:.1f} MB ({settings.DB_PATH})")
    log.info(f"{'=' * 60}")


if __name__ == "__main__":
    local = "--local" in sys.argv
    main(local_only=local)
