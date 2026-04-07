# ✈️ Aviation Data Dashboard

Interactive web dashboard for exploring **85,000+ airports**, routes, runways, and aviation data worldwide.

![Dashboard](https://img.shields.io/badge/Status-Live-brightgreen) ![Python](https://img.shields.io/badge/Python-3.12+-blue) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

- **📊 Dashboard** — Live KPIs, bar charts, pie charts from 252K+ records
- **🗺️ Interactive Map** — 85K airports on dark tiles with type filters
- **🔍 Airport Search** — By ICAO/IATA/name with debounce and filters
- **✈️ Route Explorer** — Outbound/inbound flights for any airport
- **📡 Data Monitor** — API health, database size, source attribution
- **📈 Statistics** — Top 20 countries, airport type distribution

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy, SQLite |
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Charts | Recharts |
| Map | Leaflet + React-Leaflet |
| Caching | SWR (stale-while-revalidate) |
| Data | OurAirports + OpenFlights |

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- npm

### 1. Clone & Setup Database

```bash
git clone <repo-url>
cd Test-data-aviation

# Install Python deps
cd api
pip install -r requirements.txt

# Import data (downloads CSVs + populates SQLite)
python scripts/import_data.py
```

### 2. Start Backend

```bash
cd api
python -m uvicorn main:app --reload --port 8000
```

API docs available at http://localhost:8000/docs

### 3. Start Frontend

```bash
cd dashboard
npm install
npm run dev
```

Dashboard available at http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/airports` | List airports (pagination + filters) |
| GET | `/api/airports/search?q=` | Search airports |
| GET | `/api/airports/map` | Map viewport markers |
| GET | `/api/airports/{ident}` | Airport detail + runways + frequencies |
| GET | `/api/routes/{airport}` | Outbound/inbound routes |
| GET | `/api/stats` | Overview statistics |
| GET | `/api/stats/countries` | Airports by country |
| GET | `/api/stats/types` | Airports by type |
| GET | `/api/data-freshness` | Database info + sources |

## Testing

```bash
# Backend API tests (16 tests)
cd api
python -m pytest tests/ -v

# Frontend build check
cd dashboard
npm run build
```

## Project Structure

```
Test-data-aviation/
├── api/                    # FastAPI backend
│   ├── main.py             # App entry point
│   ├── routers/            # API route handlers
│   ├── models/             # SQLAlchemy models
│   ├── schemas/            # Pydantic schemas
│   ├── tests/              # Pytest test suite
│   └── config.py           # Settings
├── dashboard/              # Next.js frontend
│   └── src/
│       ├── app/            # Pages (App Router)
│       ├── components/     # Reusable UI components
│       ├── hooks/          # SWR data hooks
│       ├── lib/            # API client + utilities
│       └── types/          # TypeScript interfaces
├── data/                   # SQLite database
└── plans/                  # Development plans
```

## Data Sources

- **[OurAirports](https://ourairports.com)** — Airports, runways, frequencies, navaids, countries, regions
- **[OpenFlights](https://openflights.org)** — Airlines and routes

## License

MIT