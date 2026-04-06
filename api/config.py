"""
Aviation Dashboard - Configuration
Settings and environment variables.
"""

import os
from pathlib import Path


class Settings:
    """Application settings loaded from environment variables."""

    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent
    PROJECT_ROOT: Path = BASE_DIR.parent
    DATA_DIR: Path = PROJECT_ROOT / "data"
    DB_PATH: Path = DATA_DIR / "aviation.db"

    # Database
    DATABASE_URL: str = f"sqlite:///{DB_PATH}"

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # API
    DEFAULT_PAGE_SIZE: int = 50
    MAX_PAGE_SIZE: int = 200

    # Data Sources
    DATA_SOURCES: dict[str, str] = {
        "airports": "https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv",
        "runways": "https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/runways.csv",
        "frequencies": "https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airport-frequencies.csv",
        "countries": "https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/countries.csv",
        "regions": "https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/regions.csv",
        "navaids": "https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/navaids.csv",
        "airlines": "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat",
        "routes": "https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat",
    }

    def __init__(self):
        # Create data directory if it doesn't exist
        self.DATA_DIR.mkdir(parents=True, exist_ok=True)

        # Override from environment
        if db_url := os.getenv("DATABASE_URL"):
            self.DATABASE_URL = db_url

        if cors := os.getenv("CORS_ORIGINS"):
            self.CORS_ORIGINS = [o.strip() for o in cors.split(",")]


settings = Settings()
