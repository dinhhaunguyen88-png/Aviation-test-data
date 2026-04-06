# Phase 04: Frontend UI
Status: ⬜ Pending
Dependencies: Phase 03

## Objective
Xây dựng giao diện dashboard với bản đồ tương tác, biểu đồ thống kê, tìm kiếm và chi tiết sân bay.

## Requirements
### Functional
- [ ] Sidebar navigation (Home, Map, Stats, Search, Routes, Data)
- [ ] Interactive world map hiển thị sân bay
- [ ] Map clustering cho performance (85K markers)
- [ ] Click marker → popup chi tiết airport
- [ ] Dashboard KPI cards (tổng airports, runways, airlines, routes)
- [ ] Bar chart: Top 20 countries by airports
- [ ] Pie chart: Airport types distribution
- [ ] Search bar với autocomplete
- [ ] Airport detail page (info + runways + frequencies)
- [ ] Routes viewer (from/to airport)
- [ ] Data freshness status page

### Non-Functional
- [ ] Dark theme (aviation style: dark blue/navy)
- [ ] Responsive (desktop + tablet)
- [ ] Map smooth zoom/pan (60fps)
- [ ] Page load < 2 giây

## Implementation Steps
1. [ ] Tạo layout component (Sidebar + Main content)
2. [ ] Design dark aviation theme (colors, fonts, spacing)
3. [ ] Tạo Sidebar navigation component
4. [ ] Tạo KPI Card component (reusable)
5. [ ] Trang Home: Dashboard overview với KPI cards + mini charts
6. [ ] Trang Map: Full-screen interactive map (Leaflet)
7. [ ] Map markers với clustering (react-leaflet-cluster)
8. [ ] Map popup component (airport info preview)
9. [ ] Trang Stats: Charts page (bar, pie, line charts)
10. [ ] Trang Search: Search bar + results list + filters
11. [ ] Trang Airport Detail: Full info + runways table + frequencies
12. [ ] Trang Routes: From/To selector + route visualization trên map
13. [ ] Trang Data Monitor: Data freshness status cards
14. [ ] Loading states + skeleton screens
15. [ ] Error states + empty states

## Files to Create/Modify
### Layout & Navigation
- `dashboard/src/app/layout.tsx` - Root layout (dark theme)
- `dashboard/src/components/Sidebar.tsx` - Navigation sidebar
- `dashboard/src/components/KPICard.tsx` - Stat card component

### Pages
- `dashboard/src/app/page.tsx` - Home/Dashboard
- `dashboard/src/app/map/page.tsx` - Interactive map
- `dashboard/src/app/stats/page.tsx` - Charts & statistics
- `dashboard/src/app/search/page.tsx` - Search airports
- `dashboard/src/app/airport/[ident]/page.tsx` - Airport detail
- `dashboard/src/app/routes/page.tsx` - Routes viewer
- `dashboard/src/app/data/page.tsx` - Data freshness

### Components
- `dashboard/src/components/AirportMap.tsx` - Leaflet map wrapper
- `dashboard/src/components/MapMarker.tsx` - Custom map marker
- `dashboard/src/components/AirportPopup.tsx` - Map popup
- `dashboard/src/components/SearchBar.tsx` - Search input
- `dashboard/src/components/Charts/BarChart.tsx`
- `dashboard/src/components/Charts/PieChart.tsx`

### Utils
- `dashboard/src/lib/api.ts` - API client (axios)
- `dashboard/src/lib/types.ts` - TypeScript types

## Test Criteria
- [ ] Sidebar navigation hoạt động (click → chuyển trang)
- [ ] Map hiển thị markers (zoom test: world → country → city)
- [ ] Click marker → popup hiển thị thông tin đúng
- [ ] Charts render data chính xác
- [ ] Search trả về kết quả correct
- [ ] Responsive trên màn hình 1024px trở lên
- [ ] Dark theme consistent toàn app

## Notes
- Leaflet cần dynamic import (no SSR) trong Next.js
- Map clustering quan trọng: 85K markers sẽ crash nếu render hết
- Dùng SWR hoặc React Query cho data fetching + caching
- Chart colors dùng brand palette (aviation blue, amber, emerald)

---
Next Phase: [Phase 05 - Integration & Polish](./phase-05-integration.md)
