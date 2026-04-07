# Phase 04: Frontend UI
Status: ✅ Complete
Dependencies: Phase 03

## Objective
Xây dựng giao diện dashboard với bản đồ tương tác, biểu đồ thống kê, tìm kiếm và chi tiết sân bay.

## Requirements
### Functional
- [x] Sidebar navigation (Home, Map, Stats, Search, Routes, Data)
- [x] Interactive world map hiển thị sân bay
- [x] Map type filters cho performance (Large/Medium/Small/Heliport/Seaplane)
- [x] Click marker → popup chi tiết airport
- [x] Dashboard KPI cards (tổng airports, runways, airlines, routes)
- [x] Bar chart: Top 10/20 countries by airports
- [x] Pie chart: Airport types distribution
- [x] Search bar với debounce + type filter
- [x] Airport detail page (info + runways + frequencies)
- [x] Routes viewer (outbound/inbound tabs)
- [x] Data freshness status page

### Non-Functional
- [x] Dark theme (aviation style: dark blue/navy)
- [x] Responsive (desktop + tablet layout)
- [x] Map smooth zoom/pan with dark CARTO tiles
- [x] Page load < 2 giây

## Implementation Steps
1. [x] Update TypeScript types to match backend API schemas
2. [x] Update API client to match backend endpoints
3. [x] Tạo layout component (Sidebar + Main content)
4. [x] Tạo Sidebar navigation component
5. [x] Tạo KPI Card component (reusable)
6. [x] Trang Dashboard: KPI cards + mini bar chart + pie chart + quick links
7. [x] Trang Map: Full-screen interactive Leaflet map (dark CARTO tiles)
8. [x] Map markers with viewport-based loading + type filters
9. [x] Map popup component (airport info + link to detail)
10. [x] MapEvents component (debounced viewport change detection)
11. [x] Trang Stats: Full charts page (bar + pie + KPI cards)
12. [x] Trang Search: Search bar + type filter + results table
13. [x] Trang Airport Detail: Info grid + runways table + frequencies table
14. [x] Trang Routes: From/To search + outbound/inbound tabs + routes table
15. [x] Trang Data Monitor: API health + DB size + sources table + attribution

## Files Created/Modified
### Layout & Navigation
- `dashboard/src/app/layout.tsx` - Root layout with Sidebar (MODIFIED)
- `dashboard/src/components/Sidebar.tsx` - Navigation sidebar (NEW)
- `dashboard/src/components/KPICard.tsx` - Stat card component (NEW)

### Pages
- `dashboard/src/app/page.tsx` - Dashboard with live API data (MODIFIED)
- `dashboard/src/app/map/page.tsx` - Interactive world map (NEW)
- `dashboard/src/app/stats/page.tsx` - Charts & statistics (NEW)
- `dashboard/src/app/search/page.tsx` - Search airports (NEW)
- `dashboard/src/app/airport/[ident]/page.tsx` - Airport detail (NEW)
- `dashboard/src/app/routes/page.tsx` - Routes viewer (NEW)
- `dashboard/src/app/data/page.tsx` - Data freshness (NEW)

### Components
- `dashboard/src/components/MapEvents.tsx` - Map viewport events (NEW)

### Utils
- `dashboard/src/lib/api.ts` - API client aligned with backend (MODIFIED)
- `dashboard/src/lib/utils.ts` - Debounce fix (MODIFIED)
- `dashboard/src/types/airport.ts` - Types aligned with backend schemas (MODIFIED)

## Test Results ✅
- [x] `npm run build` → 0 errors, all 7 routes compiled
- [x] Dashboard: KPI cards show live data (85,061 airports, 47,756 runways)
- [x] Dashboard: Bar chart shows Top 10 countries (US, BR, JP, CA, AU...)
- [x] Dashboard: Pie chart shows 7 types with percentages
- [x] Map: 1000 markers rendered on dark CARTO tiles
- [x] Map: Type filters (Large/Medium active by default)
- [x] Stats: Full bar chart (20 countries) + donut chart with legend
- [x] Search: "Noi Bai" → VVNB/HAN, Large Airport, Hanoi (Soc Son)
- [x] Airport Detail: VVNB → 8 info cards, 2 runways, 16 frequencies
- [x] Routes: HAN → 102 outbound, 102 inbound with airline names
- [x] Data: API Healthy, 38.5 MB, 252,084 records, 8 data sources
- [x] Sidebar navigation active state works across all pages
- [x] Dark theme consistent across all pages

---
Next Phase: [Phase 05 - Integration & Polish](./phase-05-integration.md)
