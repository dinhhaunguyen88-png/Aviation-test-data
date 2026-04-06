# Phase 01: Project Setup
Status: ✅ Complete
Dependencies: None

## Objective
Khởi tạo project frontend (Next.js) và backend (FastAPI), cấu trúc folder, install dependencies.

## Requirements
### Functional
- [x] Next.js app chạy được trên localhost:3000
- [x] FastAPI server chạy được trên localhost:8000
- [x] Folder structure chuẩn cho cả frontend và backend

### Non-Functional
- [x] Hot reload hoạt động ở cả 2 sides
- [x] TypeScript enabled cho frontend
- [x] Python packages installed globally (no venv needed - already available)

## Implementation Steps
1. [x] Tạo Next.js app trong `dashboard/` folder
2. [x] Install frontend dependencies: leaflet, recharts, tailwindcss, axios, clsx
3. [x] Setup TailwindCSS với dark aviation theme (globals.css)
4. [x] Tạo FastAPI app trong `api/` folder
5. [x] Install backend dependencies: fastapi, uvicorn, sqlalchemy, pandas (already available)
6. [x] Tạo folder structure chuẩn (components, types, lib, models, routers, etc.)
7. [x] Setup .env.local cho frontend
8. [x] Verified both servers running

## Files Created
### Frontend (dashboard/)
- `dashboard/src/app/globals.css` - Dark aviation theme + glassmorphism + animations
- `dashboard/src/app/layout.tsx` - Root layout with Inter + JetBrains Mono
- `dashboard/src/app/page.tsx` - Welcome page with KPI cards + feature grid
- `dashboard/src/types/airport.ts` - TypeScript interfaces for all entities
- `dashboard/src/lib/api.ts` - API client with typed functions
- `dashboard/src/lib/utils.ts` - Formatters, color helpers, debounce
- `dashboard/.env.local` - Environment configuration

### Backend (api/)
- `api/main.py` - FastAPI entry point with CORS + health check
- `api/config.py` - Settings + data source URLs
- `api/database.py` - SQLAlchemy engine setup
- `api/requirements.txt` - Python dependencies
- `api/models/__init__.py` - Models package
- `api/schemas/__init__.py` - Schemas package
- `api/routers/__init__.py` - Routers package
- `api/services/__init__.py` - Services package
- `api/scripts/__init__.py` - Scripts package

### Data
- `data/README.md` - Data directory placeholder

## Test Criteria
- [x] `npm run dev` chạy thành công (dashboard/) → localhost:3000 ✅
- [x] `python -m uvicorn main:app --reload` chạy thành công (api/) → localhost:8000 ✅
- [x] Truy cập localhost:3000 → Thấy trang chào mừng với dark theme ✅
- [x] Truy cập localhost:8000/docs → Thấy Swagger UI ✅

---
Next Phase: [Phase 02 - Database & Data Import](./phase-02-database.md)
