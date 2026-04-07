# Airport Enrichment Schema Spec

## 1. Purpose
Define a compact schema for enriching airport search/detail results with:
- Vietnam airport metadata
- airline service summaries, with Vietjet as the first supported airline
- operational notes such as terminal or check-in changes

This spec is designed to fit the current project structure:
- base airport data from `data/csv/airports.csv`
- airline and route data from `data/csv/airlines.csv` and `data/csv/routes.csv`
- existing API endpoints in `api/routers/airports.py` and `api/routers/routes.py`

## 2. Scope
### In scope
- CSV schemas for curated and derived enrichment data
- API response additions for airport search and airport detail
- minimal rules for deriving Vietjet airport service summaries

### Out of scope
- frontend layout details
- full ETL implementation details
- live scraping or direct third-party sync

## 3. Data Model Overview
Use three enrichment layers:

1. `airport_enrichments.csv`
- Curated airport-level metadata
- Best for Vietnam airport labels, operator, official links, airport map links

2. `airport_airline_services.csv`
- Derived airport + airline summary
- Best for Vietjet route counts and top destinations

3. `airport_operational_notes.csv`
- Curated time-sensitive notes
- Best for terminal, hall, and check-in instructions

## 4. CSV Schemas
### 4.1 `airport_enrichments.csv`
One row per airport.

| Column | Type | Required | Notes |
|---|---|---:|---|
| `airport_ident` | string(10) | yes | Primary key. Must match `airports.ident` |
| `iata_code` | string(3) | no | Denormalized for lookup |
| `iso_country` | string(2) | yes | Example: `VN` |
| `local_name` | string(200) | no | Local or Vietnamese airport name |
| `city_served` | string(120) | no | Main city served |
| `province_name` | string(120) | no | Province or municipality |
| `airport_class` | enum | yes | `international`, `domestic`, `mixed`, `military_civil` |
| `operator_code` | enum | no | `ACV`, `PRIVATE`, `MILITARY`, `OTHER` |
| `operator_name` | string(200) | no | Full operator name |
| `timezone` | string(64) | no | Example: `Asia/Ho_Chi_Minh` |
| `utc_offset` | string(6) | no | Example: `+07:00` |
| `official_site_url` | text | no | Official airport or operator website |
| `official_page_url` | text | no | Official airport page |
| `airport_map_url` | text | no | Terminal or airport map |
| `flight_info_url` | text | no | Passenger information page |
| `transport_info_url` | text | no | Transport or parking info |
| `terminal_summary` | text | no | Short terminal summary |
| `transport_summary` | text | no | Short transport summary |
| `parking_summary` | text | no | Short parking summary |
| `seo_keywords` | text | no | Search support keywords |
| `active` | boolean | yes | Default `true` |
| `source_name` | string(120) | yes | Example: `ACV` |
| `source_url` | text | no | Source reference |
| `verified_at` | datetime | yes | ISO 8601 |
| `updated_at` | datetime | yes | ISO 8601 |

### 4.2 `airport_airline_services.csv`
One row per airport and airline pair.

| Column | Type | Required | Notes |
|---|---|---:|---|
| `airport_ident` | string(10) | yes | Primary key part. Must match `airports.ident` |
| `airline_iata` | string(3) | yes | Primary key part. Example: `VJ` |
| `airline_icao` | string(4) | no | Example: `VJC` |
| `airline_name` | string(200) | yes | Example: `VietJet Air` |
| `is_active` | boolean | yes | Airline service active at this airport |
| `service_type` | enum | yes | `scheduled`, `seasonal`, `charter`, `unknown` |
| `domestic_route_count` | int | yes | Unique domestic destinations |
| `international_route_count` | int | yes | Unique international destinations |
| `outbound_route_count` | int | yes | Total outbound rows |
| `inbound_route_count` | int | yes | Total inbound rows |
| `unique_destination_count` | int | yes | Unique outbound destinations |
| `top_destinations` | text | no | Pipe-delimited IATA or ICAO codes |
| `top_domestic_destinations` | text | no | Pipe-delimited codes |
| `top_international_destinations` | text | no | Pipe-delimited codes |
| `route_map_url` | text | no | Airline route map |
| `booking_url` | text | no | Airline booking page |
| `flight_status_url` | text | no | Airline flight status page |
| `source_snapshot_date` | date | yes | Snapshot date of derived network |
| `derived_from` | string(120) | yes | Example: `routes.csv + airlines.csv` |
| `verified_at` | datetime | yes | ISO 8601 |

### 4.3 `airport_operational_notes.csv`
One row per operational note.

| Column | Type | Required | Notes |
|---|---|---:|---|
| `note_id` | string(40) | yes | Primary key |
| `airport_ident` | string(10) | yes | Must match `airports.ident` |
| `airline_iata` | string(3) | no | Example: `VJ` for Vietjet-only notes |
| `scope` | enum | yes | `airport`, `airline`, `route` |
| `note_type` | enum | yes | `terminal`, `checkin`, `baggage`, `security`, `transport`, `alert`, `info` |
| `title` | string(200) | yes | Short headline |
| `summary` | text | yes | Search-friendly summary |
| `details` | text | no | Full detail |
| `effective_from` | datetime | yes | ISO 8601 |
| `effective_to` | datetime | no | ISO 8601 |
| `priority` | int | yes | `1..5`, `1` highest |
| `is_active` | boolean | yes | Default `true` |
| `source_name` | string(120) | yes | Example: `CAAV` |
| `source_url` | text | no | Source reference |
| `verified_at` | datetime | yes | ISO 8601 |
| `updated_at` | datetime | yes | ISO 8601 |

## 5. Airline Key Rules
Use `airline_iata` as the route key for service summaries.

For Vietjet in the current dataset:
- `airline_iata = "VJ"` from `routes.csv`
- `airline_icao = "VJC"` from `airlines.csv`
- `airline_name = "VietJet Air"`

This avoids mismatches between route rows and airline metadata.

## 6. API Contract
### 6.1 Extend `GET /api/airports/search`
Current response stays backward compatible.

Add optional query parameter:
- `include`: comma-separated values from `enrichment`, `airline_services`, `notes`, `vietjet`

Recommended response shape per airport item:

```json
{
  "id": 123,
  "ident": "VVTS",
  "iata_code": "SGN",
  "name": "Tan Son Nhat International Airport",
  "municipality": "Ho Chi Minh City",
  "iso_country": "VN",
  "enrichment": {
    "local_name": "Cang hang khong quoc te Tan Son Nhat",
    "airport_class": "international",
    "operator_code": "ACV",
    "official_site_url": "https://example.com",
    "airport_map_url": "https://example.com/map",
    "verified_at": "2026-04-07T09:00:00+07:00"
  },
  "vietjet": {
    "served": true,
    "airline_iata": "VJ",
    "airline_icao": "VJC",
    "domestic_route_count": 18,
    "international_route_count": 7,
    "unique_destination_count": 22,
    "top_destinations": ["HAN", "DAD", "PQC"]
  },
  "notes": [
    {
      "note_id": "SGN-VJ-20260113-HALLA",
      "note_type": "checkin",
      "title": "Vietjet domestic check-in moved to Hall A, Terminal 1",
      "summary": "Applies from 2026-01-13",
      "priority": 1
    }
  ]
}
```

### 6.2 Extend `GET /api/airports/{ident}`
Add optional query parameter:
- `include`: same values as search

Add three optional fields to airport detail:
- `enrichment`
- `airline_services`
- `operational_notes`

### 6.3 Extend `GET /api/routes/{airport}`
Add optional query parameters:
- `airline`: airline IATA filter, example `VJ`
- `summary`: boolean, default `false`

When `summary=true`, add:

```json
{
  "summary": {
    "airline_iata": "VJ",
    "domestic_route_count": 18,
    "international_route_count": 7,
    "unique_destination_count": 22
  }
}
```

### 6.4 Optional dedicated endpoint
If lazy-loading is preferred, add:
- `GET /api/airports/{ident}/enrichment`

Response:

```json
{
  "airport_ident": "VVTS",
  "enrichment": {},
  "airline_services": [],
  "operational_notes": []
}
```

## 7. Derivation Rules
### `airport_enrichments.csv`
- Curated manually or from trusted official airport/operator sources
- Source attribution is required

### `airport_airline_services.csv`
- Derived from `routes.csv` and `airlines.csv`
- Group by `airport_ident + airline_iata`
- Count unique destinations for outbound route metrics
- Classify domestic vs international by comparing airport countries

### `airport_operational_notes.csv`
- Curated and time-bounded
- Only show records where `is_active = true`
- Active display window:
  - `effective_from <= now`
  - and `effective_to is null` or `now < effective_to`

## 8. Rollout Order
1. Add `airport_enrichments.csv` and expose `enrichment` in airport search/detail
2. Add `airline_services` summary for Vietjet using route-derived data
3. Add `airport_operational_notes.csv`
4. Add `include=` query support to keep payloads small

## 9. Acceptance Criteria
- Searching `SGN`, `HAN`, `DAD`, or `PQC` can return Vietnam-specific metadata
- Search results can show whether Vietjet serves the airport
- Airport detail can return official links and active operational notes
- Existing clients still work when `include` is omitted
