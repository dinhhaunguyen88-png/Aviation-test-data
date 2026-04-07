# Phase 03: Backend API
Status: ✅ Complete
Dependencies: Phase 02

## Objective
Xây dựng REST API với FastAPI để serve dữ liệu aviation cho frontend dashboard.

## Requirements
### Functional
- [x] API lấy danh sách airports (có pagination, filter)
- [x] API lấy chi tiết 1 airport (kèm runways, frequencies)
- [x] API lấy airports theo bounding box (cho map)
- [x] API lấy routes từ/đến 1 airport
- [x] API thống kê tổng quan (KPIs)
- [x] API tìm kiếm airport (ICAO, IATA, tên)
- [x] API lấy data freshness info

### Non-Functional
- [x] Response time < 200ms cho mọi API
- [x] CORS enabled cho frontend
- [x] API documentation tự động (Swagger)
- [x] Error handling chuẩn

## Implementation Steps
1. [x] Tạo Pydantic schemas (response models) → `api/schemas/aviation.py`
2. [x] `GET /api/airports` - List airports (pagination, filter by country/type/continent/scheduled)
3. [x] `GET /api/airports/{ident}` - Airport detail + runways + frequencies
4. [x] `GET /api/airports/map?bounds=...` - Airports trong map viewport
5. [x] `GET /api/airports/search?q=...` - Search by ICAO/IATA/name/municipality/keywords
6. [x] `GET /api/routes/{airport}` - Routes lookup (outbound + inbound with airline names)
7. [x] `GET /api/stats` - Dashboard KPIs (totals, top country)
8. [x] `GET /api/stats/countries` - Airports per country (for charts)
9. [x] `GET /api/stats/types` - Airports by type (for pie chart)
10. [x] `GET /api/data-freshness` - Data source status
11. [x] CORS middleware (already configured)
12. [x] Error handling + response models (Pydantic) + global exception handler

## Files Created/Modified
- `api/schemas/aviation.py` - Pydantic response models (NEW)
- `api/routers/airports.py` - Airport endpoints (NEW)
- `api/routers/routes.py` - Route endpoints (NEW)
- `api/routers/stats.py` - Statistics endpoints (NEW)
- `api/routers/data.py` - Data freshness endpoint (NEW)
- `api/main.py` - Register routers + error handler (MODIFIED)

## Test Results ✅
- [x] Swagger UI hiển thị tất cả endpoints
- [x] GET /api/airports?limit=3 → trả về 3 records (85,061 total)
- [x] GET /api/airports/VVNB → Noi Bai International Airport + 2 runways + 16 frequencies
- [x] GET /api/airports/search?q=hanoi → 11 kết quả (airports + heliports ở Hà Nội)
- [x] GET /api/airports/map?north=22&south=20&east=106&west=105 → 5 airports miền Bắc VN
- [x] GET /api/routes/HAN → 102 outbound + 102 inbound routes
- [x] GET /api/stats → 85,061 airports, 47,756 runways, 67,663 routes, top: US (32,452)
- [x] GET /api/stats/countries → Top 5: US, BR, JP, CA, AU
- [x] GET /api/stats/types → 7 types (small_airport 50%, heliport 27%, closed 15%...)
- [x] GET /api/data-freshness → 252,084 total records, 38.54 MB database
- [x] CORS cho phép request từ localhost:3000

---
Next Phase: [Phase 04 - Frontend UI](./phase-04-frontend.md)
