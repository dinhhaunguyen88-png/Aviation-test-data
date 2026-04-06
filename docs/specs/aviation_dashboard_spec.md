# Aviation Data Dashboard - Specification

## 1. Executive Summary
Web dashboard tương tác để visualize dữ liệu aviation opensource.
Hiển thị 85K+ sân bay trên bản đồ thế giới, biểu đồ thống kê, tìm kiếm nâng cao.
Phục vụ team nhỏ 2-10 người (aviation enthusiasts/analysts).

## 2. User Stories
- Là 1 analyst, tôi muốn xem tất cả sân bay trên bản đồ để có cái nhìn tổng quan
- Là 1 analyst, tôi muốn tìm kiếm sân bay theo ICAO/IATA/tên để tìm nhanh
- Là 1 analyst, tôi muốn xem thống kê số sân bay theo quốc gia để so sánh
- Là 1 analyst, tôi muốn xem chi tiết runways của 1 sân bay để phân tích
- Là 1 analyst, tôi muốn xem routes giữa 2 sân bay để hiểu kết nối
- Là 1 team lead, tôi muốn biết data sources còn up-to-date không

## 3. Data Sources
| Source | File | Records | Update Frequency |
|--------|------|---------|-----------------|
| OurAirports | airports.csv | 85,061 | Daily |
| OurAirports | runways.csv | 47,756 | Daily |
| OurAirports | airport-frequencies.csv | 30,241 | Weekly |
| OurAirports | navaids.csv | 11,010 | Monthly |
| OurAirports | countries.csv | 249 | Rare |
| OurAirports | regions.csv | 3,942 | Monthly |
| OpenFlights | airports.dat | 7,697 | Legacy |
| OpenFlights | airlines.dat | 6,161 | Legacy |
| OpenFlights | routes.dat | 67,662 | Legacy |

## 4. Features
### Core (MVP)
1. 🗺️ Interactive World Map - Bản đồ sân bay toàn cầu với clustering
2. 📊 Dashboard KPIs - Tổng quan số liệu
3. 🔍 Search & Filter - Tìm kiếm sân bay theo nhiều tiêu chí
4. 📈 Statistics Charts - Biểu đồ phân tích

### Extended
5. ✈️ Routes Viewer - Xem tuyến bay
6. 🛬 Runway Details - Chi tiết đường băng
7. 📡 Data Freshness Monitor - Theo dõi nguồn dữ liệu

## 5. Tech Stack
- **Frontend:** Next.js 14, React, TypeScript, TailwindCSS, Leaflet.js, Recharts
- **Backend:** Python FastAPI, SQLAlchemy, Pandas
- **Database:** SQLite
- **Tools:** Git, GitHub Actions (existing CI)

## 6. UI Design
- **Theme:** Dark aviation (navy/dark blue base)
- **Layout:** Sidebar navigation + main content area
- **Colors:** Navy (#0f172a), Sky blue (#38bdf8), Amber (#f59e0b), Emerald (#10b981)
- **Font:** Inter / JetBrains Mono (for codes)
- **Style:** Modern dashboard, glassmorphism cards, smooth animations

## 7. API Contract
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/airports | List airports (pagination, filter) |
| GET | /api/airports/{ident} | Airport detail + runways |
| GET | /api/airports/map | Airports in map viewport |
| GET | /api/airports/search | Search by ICAO/IATA/name |
| GET | /api/routes | Routes from/to airport |
| GET | /api/stats | Dashboard KPIs |
| GET | /api/stats/countries | Airports by country |
| GET | /api/stats/types | Airports by type |
| GET | /api/data-freshness | Data source status |

## 8. Non-Functional Requirements
- Page load < 2 giây
- API response < 200ms
- Map 60fps smooth interaction
- Support Chrome, Firefox, Safari
- Responsive (desktop + tablet)
