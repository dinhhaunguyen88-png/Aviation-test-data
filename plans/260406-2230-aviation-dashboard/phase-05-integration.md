# Phase 05: Integration & Polish
Status: ⬜ Pending
Dependencies: Phase 04

## Objective
Kết nối frontend với backend, tối ưu performance, polish UI/UX.

## Requirements
### Functional
- [ ] Tất cả pages fetch data từ API thật
- [ ] Map viewport query hoạt động (chỉ load airports trong view)
- [ ] Search autocomplete real-time
- [ ] Routes hiển thị đường bay trên map

### Non-Functional
- [ ] First Contentful Paint < 1.5s
- [ ] Map interaction smooth (no lag khi zoom/pan)
- [ ] API response cached (SWR/React Query)

## Implementation Steps
1. [ ] Kết nối tất cả pages với API endpoints
2. [ ] Implement map viewport-based loading (chỉ fetch airports trong view)
3. [ ] Implement search debounce (300ms)
4. [ ] Add loading skeletons cho mọi data-dependent component
5. [ ] Add error boundaries cho từng page
6. [ ] Optimize map marker clustering performance
7. [ ] Add route polylines trên map (from → to airport)
8. [ ] Polish animations & transitions (hover, click, page change)

## Files to Create/Modify
- `dashboard/src/lib/api.ts` - Finalize API calls
- `dashboard/src/hooks/useAirports.ts` - Custom hook
- `dashboard/src/hooks/useStats.ts` - Custom hook
- `dashboard/src/components/LoadingSkeleton.tsx`
- `dashboard/src/components/ErrorBoundary.tsx`

## Test Criteria
- [ ] Navigate toàn app không có console errors
- [ ] Map zoom từ world → single airport smooth
- [ ] Search "VVNB" → thấy Noi Bai Airport
- [ ] Routes VVNB → VVTS hiển thị đường bay
- [ ] Offline/slow network → hiển thị loading/error states

## Notes
- Map viewport query: gửi bounds (SW lat/lon, NE lat/lon) lên API
- Debounce search input để giảm API calls
- Cache data 5 phút (SWR stale-while-revalidate)

---
Next Phase: [Phase 06 - Testing & Deploy](./phase-06-testing.md)
