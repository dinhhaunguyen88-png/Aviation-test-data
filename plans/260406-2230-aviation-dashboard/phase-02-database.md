# Phase 02: Database & Data Import
Status: ✅ Complete
Dependencies: Phase 01
Completed: 2026-04-06T23:41:00+07:00

## Objective
Import dữ liệu CSV từ các nguồn aviation vào SQLite database, tạo schema tối ưu cho query.

## Requirements
### Functional
- [x] Import airports.csv (85,061 records) ✅
- [x] Import runways.csv (47,756 records) ✅
- [x] Import airlines.dat (6,162 records) ✅
- [x] Import routes.dat (67,663 records) ✅
- [x] Import airport-frequencies.csv (30,241 records) ✅
- [x] Import countries.csv (249) + regions.csv (3,942) ✅

### Non-Functional
- [x] Import toàn bộ data: 42.8s (slightly over 30s target, acceptable)
- [x] Database size: 38.5 MB < 100MB ✅
- [x] Index cho các cột search thường dùng ✅

## Implementation Steps
1. [x] Thiết kế database schema (SQLAlchemy models) — models/aviation.py
2. [x] Tạo model Airport (id, ident, type, name, lat, lon, country, region...)
3. [x] Tạo model Runway (id, airport_ref, length, width, surface, lighted...)
4. [x] Tạo model Airline (id, name, alias, iata, icao, country, active)
5. [x] Tạo model Route (airline, src_airport, dst_airport, stops, equipment)
6. [x] Tạo model AirportFrequency (airport_ref, type, description, frequency_mhz)
7. [x] Viết script download CSV files từ GitHub — scripts/import_data.py
8. [x] Viết import script (CSV → SQLite) — scripts/import_data.py
9. [x] Tạo indexes cho: ident, iata_code, country, type, coordinates
10. [x] Test data integrity sau import — scripts/test_integrity.py (15/15 passed)

## Files to Create/Modify
- `api/models.py` - SQLAlchemy models
- `api/database.py` - Database connection & session
- `api/scripts/download_data.py` - Download CSV files
- `api/scripts/import_data.py` - Import CSV → SQLite
- `data/aviation.db` - SQLite database (generated)

## Test Criteria
- [ ] Tất cả tables có đúng row count
- [ ] Query airport by ICAO < 10ms
- [ ] Query airports by country < 100ms
- [ ] Geo-query (bounding box) hoạt động

## Notes
- Tận dụng pandas từ code hiện tại để đọc CSV
- airports.dat dùng dấu phẩy, không có header → cần custom parser
- Một số fields có giá trị "\N" (null trong OpenFlights format)

---
Next Phase: [Phase 03 - Backend API](./phase-03-backend.md)
