# Phase 03: Backend API
Status: ⬜ Pending
Dependencies: Phase 02

## Objective
Xây dựng REST API với FastAPI để serve dữ liệu aviation cho frontend dashboard.

## Requirements
### Functional
- [ ] API lấy danh sách airports (có pagination, filter)
- [ ] API lấy chi tiết 1 airport (kèm runways, frequencies)
- [ ] API lấy airports theo bounding box (cho map)
- [ ] API lấy routes từ/đến 1 airport
- [ ] API thống kê tổng quan (KPIs)
- [ ] API tìm kiếm airport (ICAO, IATA, tên)
- [ ] API lấy data freshness info

### Non-Functional
- [ ] Response time < 200ms cho mọi API
- [ ] CORS enabled cho frontend
- [ ] API documentation tự động (Swagger)
- [ ] Error handling chuẩn

## Implementation Steps
1. [ ] Tạo API router structure (airports, routes, stats, search)
2. [ ] `GET /api/airports` - List airports (pagination, filter by country/type)
3. [ ] `GET /api/airports/{ident}` - Airport detail + runways + frequencies
4. [ ] `GET /api/airports/map?bounds=...` - Airports trong map viewport
5. [ ] `GET /api/airports/search?q=...` - Search by ICAO/IATA/name
6. [ ] `GET /api/routes?from=...&to=...` - Routes lookup
7. [ ] `GET /api/stats` - Dashboard KPIs (totals, by country, by type)
8. [ ] `GET /api/stats/countries` - Airports per country (for charts)
9. [ ] `GET /api/stats/types` - Airports by type (for pie chart)
10. [ ] `GET /api/data-freshness` - Data source status
11. [ ] Setup CORS middleware
12. [ ] Error handling + response models (Pydantic)

## Files to Create/Modify
- `api/routers/airports.py` - Airport endpoints
- `api/routers/routes.py` - Route endpoints
- `api/routers/stats.py` - Statistics endpoints
- `api/routers/search.py` - Search endpoint
- `api/schemas.py` - Pydantic response models
- `api/main.py` - Register routers + CORS

## Test Criteria
- [ ] Swagger UI hiển thị tất cả endpoints
- [ ] GET /api/airports?limit=20 trả về 20 records
- [ ] GET /api/airports/VVNB trả về Noi Bai Airport
- [ ] GET /api/airports/search?q=hanoi trả về kết quả
- [ ] GET /api/stats trả về KPI numbers
- [ ] CORS cho phép request từ localhost:3000

## Notes
- Dùng dependency injection cho database session
- Map viewport query dùng lat/lon bounding box
- Search dùng LIKE query (đủ nhanh với SQLite cho 85K records)
- Pagination mặc định: limit=50, offset=0

---
Next Phase: [Phase 04 - Frontend UI](./phase-04-frontend.md)
