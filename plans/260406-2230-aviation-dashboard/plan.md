# Plan: Aviation Data Dashboard
Created: 2026-04-06T22:30:00+07:00
Status: 🟡 In Progress

## Overview
Xây dựng web dashboard tương tác để visualize dữ liệu aviation opensource.
Hiển thị 85K+ sân bay trên bản đồ, biểu đồ thống kê, tìm kiếm, xem routes và runway info.

## Target Users
- Team nhỏ 2-10 người (aviation enthusiasts/analysts)

## Tech Stack
- **Frontend:** Next.js 14 + React + Leaflet.js (bản đồ) + Recharts (biểu đồ)
- **Backend:** Python FastAPI (tận dụng code hiện tại)
- **Database:** SQLite (đơn giản, không cần setup server)
- **Styling:** TailwindCSS + Dark aviation theme
- **Data Source:** CSV files từ OurAirports, OpenFlights

## Tính năng
1. 🗺️ Bản đồ sân bay toàn cầu (interactive map)
2. 📊 Dashboard thống kê (charts & KPIs)
3. 🔍 Tìm kiếm & Filter (ICAO/IATA, quốc gia, loại)
4. ✈️ Routes Viewer (tuyến bay)
5. 🛬 Runway Info (chi tiết runway)
6. 📡 Data Freshness Monitor (theo dõi nguồn dữ liệu)

## Phases

| Phase | Name | Status | Tasks | Progress |
|-------|------|--------|-------|----------|
| 01 | Setup Environment | ✅ Complete | 8 | 100% |
| 02 | Database & Data Import | ✅ Complete | 10 | 100% |
| 03 | Backend API | ⬜ Pending | 12 | 0% |
| 04 | Frontend UI | ⬜ Pending | 15 | 0% |
| 05 | Integration & Polish | ⬜ Pending | 8 | 0% |
| 06 | Testing & Deploy | ⬜ Pending | 7 | 0% |

**Tổng:** 60 tasks | Ước tính: 4-6 sessions

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
