# 🎨 DESIGN: Aviation Data Dashboard

Ngày tạo: 2026-04-06
Dựa trên: [aviation_dashboard_spec.md](specs/aviation_dashboard_spec.md)

---

## 1. Cách Lưu Thông Tin (Database - SQLite)

> 💡 Giống Excel có nhiều Sheet, mỗi Sheet lưu 1 loại thông tin.
> App này cần lưu: Sân bay, Đường băng, Tần số liên lạc, Tuyến bay, Hãng bay, Quốc gia, Vùng.

### 1.1 Sơ đồ dữ liệu tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│  🌍 COUNTRIES (Quốc gia) - 249 records                         │
│  ├── id (số thứ tự)                                            │
│  ├── code (mã 2 chữ: VN, US, JP...)                           │
│  ├── name (tên: Vietnam, United States...)                     │
│  ├── continent (châu lục: AS, EU, NA...)                       │
│  └── wikipedia_link                                            │
└───────────────────────────────┬─────────────────────────────────┘
                                │ 1 quốc gia có nhiều vùng
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  📍 REGIONS (Vùng/Tỉnh) - 3,942 records                       │
│  ├── id                                                        │
│  ├── code (VN-SG, US-CA...)                                    │
│  ├── local_code (SG, CA...)                                    │
│  ├── name (Ho Chi Minh, California...)                         │
│  ├── continent                                                 │
│  ├── iso_country → FK tới COUNTRIES                            │
│  └── wikipedia_link                                            │
└───────────────────────────────┬─────────────────────────────────┘
                                │ 1 vùng có nhiều sân bay
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  ✈️ AIRPORTS (Sân bay) - 85,061 records                        │
│  ├── id (số thứ tự)                                            │
│  ├── ident (mã ICAO: VVTS, KJFK...)                           │
│  ├── type (loại: large_airport, small_airport, heliport...)    │
│  ├── name (tên: Tan Son Nhat, JFK...)                          │
│  ├── latitude_deg, longitude_deg (tọa độ GPS)                  │
│  ├── elevation_ft (độ cao so với mặt biển)                     │
│  ├── continent, iso_country → FK tới COUNTRIES                 │
│  ├── iso_region → FK tới REGIONS                               │
│  ├── municipality (thành phố)                                  │
│  ├── scheduled_service (có bay thương mại: yes/no)             │
│  ├── gps_code, iata_code, local_code (các mã khác)            │
│  ├── home_link, wikipedia_link                                 │
│  └── keywords (từ khóa tìm kiếm)                              │
└──────────┬──────────────────────────────────┬───────────────────┘
           │ 1 sân bay có nhiều đường băng     │ 1 sân bay có nhiều tần số
           ▼                                   ▼
┌──────────────────────────┐    ┌──────────────────────────────────┐
│  🛬 RUNWAYS - 47,756     │    │  📡 FREQUENCIES - 30,241         │
│  ├── id                  │    │  ├── id                          │
│  ├── airport_ref → FK    │    │  ├── airport_ref → FK            │
│  ├── airport_ident       │    │  ├── airport_ident               │
│  ├── length_ft           │    │  ├── type (TWR, GND, APP...)     │
│  ├── width_ft            │    │  ├── description                 │
│  ├── surface (asphalt..) │    │  └── frequency_mhz              │
│  ├── lighted (0/1)       │    └──────────────────────────────────┘
│  ├── closed (0/1)        │
│  ├── le_ident, he_ident  │
│  ├── le_latitude_deg...  │
│  ├── le_elevation_ft     │
│  ├── le_heading_degT     │
│  └── (tương tự cho he_*) │
└──────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🧭 NAVAIDS (Đài dẫn đường) - 11,010 records                  │
│  ├── id, filename, ident, name                                  │
│  ├── type (VOR, NDB, DME...)                                   │
│  ├── frequency_khz                                             │
│  ├── latitude_deg, longitude_deg, elevation_ft                  │
│  ├── iso_country                                               │
│  ├── associated_airport → FK tới AIRPORTS                      │
│  └── power, usageType, dme_*                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🏢 AIRLINES (Hãng bay - OpenFlights) - 6,161 records          │
│  ├── airline_id                                                 │
│  ├── name, alias                                               │
│  ├── iata (mã 2 chữ: VN, AA...)                               │
│  ├── icao (mã 3 chữ: HVN, AAL...)                             │
│  ├── callsign                                                  │
│  ├── country                                                   │
│  └── active (Y/N)                                              │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  🛫 ROUTES (Tuyến bay - OpenFlights) - 67,662 records          │
│  ├── airline (mã hãng bay)                                     │
│  ├── airline_id → FK tới AIRLINES                              │
│  ├── source_airport (mã sân bay đi)                            │
│  ├── source_airport_id                                         │
│  ├── dest_airport (mã sân bay đến)                             │
│  ├── dest_airport_id                                           │
│  ├── codeshare (Y/N)                                           │
│  ├── stops (số điểm dừng)                                     │
│  └── equipment (loại máy bay)                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 SQL Schema chi tiết

```sql
-- ==========================================
-- TABLE: countries
-- ==========================================
CREATE TABLE countries (
    id INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,        -- 'VN', 'US'
    name TEXT NOT NULL,               -- 'Vietnam'
    continent TEXT,                   -- 'AS', 'EU', 'NA'
    wikipedia_link TEXT,
    keywords TEXT
);
CREATE INDEX idx_countries_code ON countries(code);
CREATE INDEX idx_countries_continent ON countries(continent);

-- ==========================================
-- TABLE: regions
-- ==========================================
CREATE TABLE regions (
    id INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,        -- 'VN-SG'
    local_code TEXT,                  -- 'SG'
    name TEXT NOT NULL,               -- 'Ho Chi Minh'
    continent TEXT,
    iso_country TEXT NOT NULL,        -- FK → countries.code
    wikipedia_link TEXT,
    keywords TEXT
);
CREATE INDEX idx_regions_country ON regions(iso_country);

-- ==========================================
-- TABLE: airports (BẢNG CHÍNH)
-- ==========================================
CREATE TABLE airports (
    id INTEGER PRIMARY KEY,
    ident TEXT NOT NULL UNIQUE,       -- ICAO code: 'VVTS'
    type TEXT NOT NULL,               -- 'large_airport', 'small_airport', 'heliport'
    name TEXT NOT NULL,               -- 'Tan Son Nhat International Airport'
    latitude_deg REAL,
    longitude_deg REAL,
    elevation_ft INTEGER,
    continent TEXT,
    iso_country TEXT,                 -- FK → countries.code
    iso_region TEXT,                  -- FK → regions.code
    municipality TEXT,                -- 'Ho Chi Minh City'
    scheduled_service TEXT,           -- 'yes'/'no'
    gps_code TEXT,
    iata_code TEXT,                   -- 'SGN'
    local_code TEXT,
    home_link TEXT,
    wikipedia_link TEXT,
    keywords TEXT
);
CREATE INDEX idx_airports_ident ON airports(ident);
CREATE INDEX idx_airports_iata ON airports(iata_code);
CREATE INDEX idx_airports_type ON airports(type);
CREATE INDEX idx_airports_country ON airports(iso_country);
CREATE INDEX idx_airports_coords ON airports(latitude_deg, longitude_deg);
CREATE INDEX idx_airports_name ON airports(name);
CREATE INDEX idx_airports_scheduled ON airports(scheduled_service);

-- ==========================================
-- TABLE: runways
-- ==========================================
CREATE TABLE runways (
    id INTEGER PRIMARY KEY,
    airport_ref INTEGER,              -- FK → airports.id
    airport_ident TEXT,               -- FK → airports.ident
    length_ft INTEGER,
    width_ft INTEGER,
    surface TEXT,                     -- 'ASP', 'CON', 'GRS'
    lighted INTEGER DEFAULT 0,       -- 0/1
    closed INTEGER DEFAULT 0,        -- 0/1
    le_ident TEXT,                    -- '09L'
    le_latitude_deg REAL,
    le_longitude_deg REAL,
    le_elevation_ft INTEGER,
    le_heading_degT REAL,
    le_displaced_threshold_ft INTEGER,
    he_ident TEXT,                    -- '27R'
    he_latitude_deg REAL,
    he_longitude_deg REAL,
    he_elevation_ft INTEGER,
    he_heading_degT REAL,
    he_displaced_threshold_ft INTEGER
);
CREATE INDEX idx_runways_airport ON runways(airport_ref);
CREATE INDEX idx_runways_ident ON runways(airport_ident);

-- ==========================================
-- TABLE: frequencies
-- ==========================================
CREATE TABLE frequencies (
    id INTEGER PRIMARY KEY,
    airport_ref INTEGER,              -- FK → airports.id
    airport_ident TEXT,               -- FK → airports.ident
    type TEXT,                        -- 'TWR', 'GND', 'APP', 'ATIS'
    description TEXT,
    frequency_mhz REAL
);
CREATE INDEX idx_freq_airport ON frequencies(airport_ref);
CREATE INDEX idx_freq_ident ON frequencies(airport_ident);

-- ==========================================
-- TABLE: navaids
-- ==========================================
CREATE TABLE navaids (
    id INTEGER PRIMARY KEY,
    filename TEXT,
    ident TEXT,
    name TEXT,
    type TEXT,                        -- 'VOR', 'NDB', 'DME'
    frequency_khz REAL,
    latitude_deg REAL,
    longitude_deg REAL,
    elevation_ft INTEGER,
    iso_country TEXT,
    dme_frequency_khz REAL,
    dme_channel TEXT,
    dme_latitude_deg REAL,
    dme_longitude_deg REAL,
    dme_elevation_ft INTEGER,
    slaved_variation_deg REAL,
    magnetic_variation_deg REAL,
    usageType TEXT,
    power TEXT,
    associated_airport TEXT           -- FK → airports.ident
);
CREATE INDEX idx_navaids_airport ON navaids(associated_airport);
CREATE INDEX idx_navaids_country ON navaids(iso_country);

-- ==========================================
-- TABLE: airlines (từ OpenFlights)
-- ==========================================
CREATE TABLE airlines (
    airline_id INTEGER PRIMARY KEY,
    name TEXT,
    alias TEXT,
    iata TEXT,                        -- 'VN', 'AA'
    icao TEXT,                        -- 'HVN', 'AAL'
    callsign TEXT,
    country TEXT,
    active TEXT                       -- 'Y'/'N'
);
CREATE INDEX idx_airlines_iata ON airlines(iata);
CREATE INDEX idx_airlines_icao ON airlines(icao);

-- ==========================================
-- TABLE: routes (từ OpenFlights)
-- ==========================================
CREATE TABLE routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    airline TEXT,
    airline_id INTEGER,
    source_airport TEXT,              -- 'SGN'
    source_airport_id INTEGER,
    dest_airport TEXT,                -- 'HAN'
    dest_airport_id INTEGER,
    codeshare TEXT,                   -- 'Y'/NULL
    stops INTEGER DEFAULT 0,
    equipment TEXT                    -- '320 321'
);
CREATE INDEX idx_routes_source ON routes(source_airport);
CREATE INDEX idx_routes_dest ON routes(dest_airport);
CREATE INDEX idx_routes_airline ON routes(airline_id);
```

### 1.3 Data Import Flow

```
┌──────────────────┐     ┌───────────────────┐     ┌──────────────┐
│   CSV Files      │     │  Python Script    │     │   SQLite DB  │
│  (from URLs)     │ ──▶ │  import_data.py   │ ──▶ │  aviation.db │
│                  │     │  (Pandas + SQL)   │     │              │
│ airports.csv     │     │                   │     │ 8 tables     │
│ runways.csv      │     │ 1. Download CSV   │     │ ~250K rows   │
│ frequencies.csv  │     │ 2. Clean data     │     │ ~50MB        │
│ countries.csv    │     │ 3. Create tables  │     │              │
│ regions.csv      │     │ 4. Insert rows    │     │              │
│ navaids.csv      │     │ 5. Create indexes │     │              │
│ airlines.dat     │     │                   │     │              │
│ routes.dat       │     │                   │     │              │
└──────────────────┘     └───────────────────┘     └──────────────┘
```

---

## 2. Thiết Kế API (Cửa Giao Tiếp Backend)

> 💡 API giống như "menu nhà hàng" - Frontend gọi món (request), Backend phục vụ (response).

### 2.1 Danh sách API Endpoints

| # | Method | Endpoint | Mô tả | Response |
|---|--------|----------|--------|----------|
| 1 | GET | `/api/airports` | Danh sách sân bay (phân trang) | Danh sách + tổng |
| 2 | GET | `/api/airports/{ident}` | Chi tiết 1 sân bay + runways + freq | Object đầy đủ |
| 3 | GET | `/api/airports/map` | Sân bay trong viewport bản đồ | Tọa độ + tên |
| 4 | GET | `/api/airports/search` | Tìm kiếm theo ICAO/IATA/tên | Kết quả tìm |
| 5 | GET | `/api/routes` | Tuyến bay từ/đến sân bay | Danh sách routes |
| 6 | GET | `/api/routes/{airport}` | Routes của 1 sân bay cụ thể | Routes + airlines |
| 7 | GET | `/api/stats/overview` | KPIs tổng quan dashboard | Số liệu tổng |
| 8 | GET | `/api/stats/countries` | Sân bay theo quốc gia | Top countries |
| 9 | GET | `/api/stats/types` | Sân bay theo loại | Phân loại |
| 10 | GET | `/api/stats/continents` | Sân bay theo châu lục | Chart data |
| 11 | GET | `/api/data-freshness` | Trạng thái nguồn dữ liệu | Last updated |
| 12 | GET | `/api/health` | Kiểm tra server hoạt động | OK/Error |

### 2.2 Chi tiết API Request/Response

#### API 1: GET `/api/airports`
```
Request:
  ?page=1              (trang, mặc định 1)
  &limit=50            (số sân bay/trang, mặc định 50, max 200)
  &type=large_airport  (lọc theo loại)
  &country=VN          (lọc theo quốc gia)
  &continent=AS        (lọc theo châu lục)
  &scheduled=yes       (chỉ sân bay thương mại)
  &sort=name           (sắp xếp)
  &order=asc           (chiều sắp xếp)

Response:
{
  "total": 85061,
  "page": 1,
  "limit": 50,
  "data": [
    {
      "id": 26599,
      "ident": "VVTS",
      "type": "large_airport",
      "name": "Tan Son Nhat International Airport",
      "latitude_deg": 10.8188,
      "longitude_deg": 106.652,
      "elevation_ft": 33,
      "iso_country": "VN",
      "municipality": "Ho Chi Minh City",
      "iata_code": "SGN",
      "scheduled_service": "yes"
    }
  ]
}
```

#### API 3: GET `/api/airports/map`
```
Request:
  ?bounds=10.5,106.0,11.0,107.0   (lat_min,lng_min,lat_max,lng_max)
  &zoom=10                        (mức zoom bản đồ)
  &type=large_airport,medium_airport  (lọc loại, optional)

Response:
{
  "count": 15,
  "data": [
    {
      "id": 26599,
      "ident": "VVTS",
      "name": "Tan Son Nhat",
      "type": "large_airport",
      "lat": 10.8188,
      "lng": 106.652,
      "iata": "SGN"
    }
  ]
}
```

#### API 4: GET `/api/airports/search`
```
Request:
  ?q=tan son nhat     (từ khóa tìm kiếm, min 2 chars)
  &limit=10           (giới hạn kết quả)

Response:
{
  "results": [
    {
      "ident": "VVTS",
      "name": "Tan Son Nhat International Airport",
      "iata_code": "SGN",
      "municipality": "Ho Chi Minh City",
      "iso_country": "VN",
      "type": "large_airport"
    }
  ]
}

💡 Tìm kiếm sẽ search trong: ident, iata_code, name, municipality, keywords
```

#### API 2: GET `/api/airports/{ident}`
```
Request: /api/airports/VVTS

Response:
{
  "airport": {
    "id": 26599,
    "ident": "VVTS",
    "name": "Tan Son Nhat International Airport",
    "type": "large_airport",
    "latitude_deg": 10.8188,
    "longitude_deg": 106.652,
    "elevation_ft": 33,
    "iso_country": "VN",
    "iso_region": "VN-SG",
    "municipality": "Ho Chi Minh City",
    "scheduled_service": "yes",
    "iata_code": "SGN",
    "home_link": "...",
    "wikipedia_link": "..."
  },
  "runways": [
    {
      "id": 238029,
      "length_ft": 12467,
      "width_ft": 148,
      "surface": "ASP",
      "lighted": 1,
      "closed": 0,
      "le_ident": "07L",
      "he_ident": "25R"
    }
  ],
  "frequencies": [
    {
      "type": "TWR",
      "description": "HOCHIMINH TWR",
      "frequency_mhz": 118.7
    }
  ],
  "country": {
    "code": "VN",
    "name": "Vietnam",
    "continent": "AS"
  }
}
```

#### API 7: GET `/api/stats/overview`
```
Response:
{
  "total_airports": 85061,
  "total_countries": 249,
  "total_runways": 47756,
  "total_routes": 67662,
  "total_airlines": 6161,
  "airports_by_type": {
    "large_airport": 610,
    "medium_airport": 4756,
    "small_airport": 38219,
    "heliport": 13528,
    "closed": 7891,
    "seaplane_base": 1131,
    "balloonport": 14
  },
  "top_countries": [
    { "code": "US", "name": "United States", "count": 23695 },
    { "code": "BR", "name": "Brazil", "count": 6090 },
    { "code": "CA", "name": "Canada", "count": 3145 }
  ]
}
```

### 2.3 Backend Architecture

```
backend/
├── main.py                    # FastAPI app entry point
├── config.py                  # Settings, DB path
├── database.py                # SQLAlchemy engine + session
├── models/                    # SQLAlchemy ORM models
│   ├── __init__.py
│   ├── airport.py
│   ├── runway.py
│   ├── frequency.py
│   ├── country.py
│   ├── region.py
│   ├── navaid.py
│   ├── airline.py
│   └── route.py
├── schemas/                   # Pydantic response schemas
│   ├── __init__.py
│   ├── airport.py
│   ├── stats.py
│   └── common.py
├── routers/                   # API route handlers
│   ├── __init__.py
│   ├── airports.py            # /api/airports/*
│   ├── routes.py              # /api/routes/*
│   ├── stats.py               # /api/stats/*
│   └── health.py              # /api/health, /api/data-freshness
├── services/                  # Business logic
│   ├── __init__.py
│   ├── airport_service.py
│   ├── stats_service.py
│   └── search_service.py
└── scripts/
    └── import_data.py         # CSV → SQLite importer
```

---

## 3. Danh Sách Màn Hình (Frontend)

> 💡 Mỗi "màn hình" là 1 trang mà user nhìn thấy khi dùng app.

### 3.1 Tổng quan các trang

| # | Trang | URL | Mục đích | Component chính |
|---|-------|-----|----------|-----------------|
| 1 | Dashboard | `/` | Tổng quan: KPIs, biểu đồ, bản đồ mini | StatsCards, Charts, MiniMap |
| 2 | Bản đồ | `/map` | Bản đồ sân bay toàn cầu (interactive) | LeafletMap, AirportPopup |
| 3 | Danh sách | `/airports` | Bảng danh sách + tìm kiếm/lọc | DataTable, SearchBar, Filters |
| 4 | Chi tiết | `/airports/[ident]` | Thông tin chi tiết sân bay | AirportDetail, RunwayList |
| 5 | Routes | `/routes` | Xem tuyến bay | RouteMap, RouteList |
| 6 | So sánh | `/compare` | So sánh 2 sân bay | CompareCards |

### 3.2 Layout chung

```
┌──────────────────────────────────────────────────────────────────┐
│  ┌──────┐  ✈️ Aviation Dashboard           🔍 Search...   👤    │
│  │ Logo │                                                       │
├──┴──────┴────────────────────────────────────────────────────────┤
│  │          │                                                    │
│  │  📊      │   ┌──────────────────────────────────────────┐    │
│  │ Dashboard│   │                                          │    │
│  │          │   │        MAIN CONTENT AREA                 │    │
│  │  🗺️      │   │                                          │    │
│  │ Map      │   │   (Thay đổi theo trang đang xem)        │    │
│  │          │   │                                          │    │
│  │  📋      │   │                                          │    │
│  │ Airports │   │                                          │    │
│  │          │   │                                          │    │
│  │  ✈️      │   │                                          │    │
│  │ Routes   │   │                                          │    │
│  │          │   │                                          │    │
│  │  ──────  │   │                                          │    │
│  │          │   │                                          │    │
│  │  📡      │   └──────────────────────────────────────────┘    │
│  │ Data     │                                                    │
│  │ Status   │                                                    │
│  │          │                                                    │
└──┴──────────┴────────────────────────────────────────────────────┘
     Sidebar          Main Content (responsive)
     (240px)          (còn lại)
```

### 3.3 Chi tiết từng trang

#### 📊 Trang 1: Dashboard (`/`)

```
┌─────────────────────────────────────────────────────────────────┐
│                     📊 DASHBOARD                                │
├────────────┬────────────┬────────────┬──────────────────────────┤
│ ✈️ 85,061  │ 🌍 249     │ 🛬 47,756  │ 🛫 67,662               │
│  Airports  │  Countries │  Runways   │  Routes                 │
│  ▲ 120 new │            │            │                         │
├────────────┴────────────┴────────────┴──────────────────────────┤
│                                                                 │
│  ┌────────────────────────────┐ ┌──────────────────────────┐   │
│  │ 📊 Airports by Type        │ │ 🌍 Airports by Continent │   │
│  │  ████████████ Large: 610   │ │     ████ AS: 28%         │   │
│  │  ██████████ Medium: 4,756  │ │   ██████ NA: 32%         │   │
│  │  ████████ Small: 38,219    │ │    █████ EU: 20%         │   │
│  │  ██████ Heliport: 13,528   │ │     ███ AF: 10%          │   │
│  │  ████ Closed: 7,891        │ │      ██ SA: 6%           │   │
│  └────────────────────────────┘ │       █ OC: 4%           │   │
│                                 └──────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │       🗺️ Mini World Map (Clustered airports)            │   │
│  │       [Click to expand → /map]                           │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  🏆 Top 10 Countries                                     │   │
│  │  1. 🇺🇸 US: 23,695  ████████████████████                │   │
│  │  2. 🇧🇷 BR: 6,090   █████████                           │   │
│  │  3. 🇨🇦 CA: 3,145   ██████                              │   │
│  │  4. 🇦🇺 AU: 2,305   █████                               │   │
│  │  5. 🇩🇪 DE: 1,846   ████                                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

#### 🗺️ Trang 2: Bản đồ (`/map`)

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────┐                                        │
│  │ 🔍 Search airport.. │  🏷️ Type: [All ▼]  🌍 Country: [All ▼]│
│  └─────────────────────┘                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    ┌────────────────────────────────────────────────────────┐   │
│    │                                                        │   │
│    │              INTERACTIVE LEAFLET MAP                    │   │
│    │                                                        │   │
│    │    ○ ○   ●●     ○                                     │   │
│    │      ○ ○    ●      ○○                                 │   │
│    │   ○○    ○○●●●   ○○○                                   │   │
│    │      (42)        (127)                                  │   │
│    │                                                        │   │
│    │   ● = large_airport  ○ = medium  · = small            │   │
│    │   (42) = cluster with count                            │   │
│    │                                                        │   │
│    │   ┌──────────────────────────┐                        │   │
│    │   │ ✈️ VVTS - Tan Son Nhat   │  ← Airport popup      │   │
│    │   │ SGN · Ho Chi Minh City   │                        │   │
│    │   │ Type: Large Airport      │                        │   │
│    │   │ Elev: 33 ft · 2 Runways  │                        │   │
│    │   │ [View Details →]         │                        │   │
│    │   └──────────────────────────┘                        │   │
│    │                                                        │   │
│    │   [+][-]        Layer: [OpenStreetMap ▼]              │   │
│    └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Showing 1,234 airports in view                                │
└─────────────────────────────────────────────────────────────────┘
```

#### 📋 Trang 3: Danh sách (`/airports`)

```
┌─────────────────────────────────────────────────────────────────┐
│  📋 Airports                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 🔍 Search by ICAO, IATA, name, city...                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Filters: Type:[All▼] Country:[All▼] Continent:[All▼] Service:[All▼]│
│                                                                 │
│  ┌──────┬──────┬────────────────────┬──────┬────────┬──────┐   │
│  │ ICAO │ IATA │ Name               │ Type │Country │Elev  │   │
│  ├──────┼──────┼────────────────────┼──────┼────────┼──────┤   │
│  │ VVTS │ SGN  │ Tan Son Nhat Intl  │ 🔵   │ 🇻🇳 VN │ 33ft │   │
│  │ VVNB │ HAN  │ Noi Bai Intl       │ 🔵   │ 🇻🇳 VN │ 39ft │   │
│  │ VVDN │ DAD  │ Da Nang Intl       │ 🔵   │ 🇻🇳 VN │ 33ft │   │
│  │ KJFK │ JFK  │ John F Kennedy     │ 🔵   │ 🇺🇸 US │ 13ft │   │
│  │ EGLL │ LHR  │ London Heathrow    │ 🔵   │ 🇬🇧 GB │ 83ft │   │
│  └──────┴──────┴────────────────────┴──────┴────────┴──────┘   │
│                                                                 │
│  Showing 1-50 of 85,061  │ ◀ 1 2 3 4 5 ... 1702 ▶ │           │
└─────────────────────────────────────────────────────────────────┘
```

#### 🛫 Trang 4: Chi tiết sân bay (`/airports/[ident]`)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back    ✈️ VVTS - Tan Son Nhat International Airport        │
│                                                                 │
│  ┌──────────────────┐   ┌──────────────────────────────────┐   │
│  │   🗺️ Mini Map    │   │ 📍 Ho Chi Minh City, Vietnam     │   │
│  │   (pin on map)   │   │ 🌍 Region: VN-SG (Southeast)     │   │
│  │                  │   │ 📏 Elevation: 33 ft               │   │
│  │                  │   │ 🔵 Type: Large Airport            │   │
│  │                  │   │ ✅ Scheduled Service: Yes          │   │
│  │                  │   │ 📌 IATA: SGN  GPS: VVTS           │   │
│  │                  │   │ 🔗 Wikipedia | Website             │   │
│  └──────────────────┘   └──────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  🛬 RUNWAYS (2)                                          │   │
│  │  ┌────────┬───────┬──────┬────────┬───────┬───────────┐ │   │
│  │  │ Runway │Length │Width │Surface │Lighted│ Status    │ │   │
│  │  ├────────┼───────┼──────┼────────┼───────┼───────────┤ │   │
│  │  │07L/25R │12,467 │ 148  │ ASP    │  ✅   │ ✅ Open   │ │   │
│  │  │07R/25L │10,006 │ 148  │ ASP    │  ✅   │ ✅ Open   │ │   │
│  │  └────────┴───────┴──────┴────────┴───────┴───────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  📡 FREQUENCIES (8)                                      │   │
│  │  TWR  118.700  │  GND 121.800  │  APP 120.600           │   │
│  │  ATIS 127.500  │  DEP 125.600  │  ...                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ✈️ ROUTES FROM SGN (23 destinations)                    │   │
│  │  → HAN (Vietnam Airlines, VietJet)                       │   │
│  │  → NRT (Vietnam Airlines, ANA)                           │   │
│  │  → SIN (Singapore Airlines, Vietnam Airlines)            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Frontend Architecture

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (sidebar + header)
│   ├── page.tsx                  # Dashboard (/)
│   ├── map/
│   │   └── page.tsx              # Interactive map (/map)
│   ├── airports/
│   │   ├── page.tsx              # Airport list (/airports)
│   │   └── [ident]/
│   │       └── page.tsx          # Airport detail (/airports/VVTS)
│   ├── routes/
│   │   └── page.tsx              # Routes viewer (/routes)
│   └── globals.css               # TailwindCSS + custom styles
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   ├── Header.tsx            # Top bar + search
│   │   └── Footer.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx         # KPI card
│   │   ├── AirportTypeChart.tsx  # Bar chart
│   │   ├── ContinentChart.tsx    # Pie/donut chart
│   │   └── TopCountries.tsx      # Horizontal bar
│   ├── map/
│   │   ├── AirportMap.tsx        # Leaflet map wrapper
│   │   ├── AirportMarker.tsx     # Custom marker
│   │   ├── AirportPopup.tsx      # Click popup
│   │   └── MapControls.tsx       # Layer + filter controls
│   ├── airports/
│   │   ├── AirportTable.tsx      # Data table
│   │   ├── AirportFilters.tsx    # Filter bar
│   │   ├── AirportDetail.tsx     # Detail view
│   │   ├── RunwayCard.tsx        # Runway info card
│   │   └── FrequencyList.tsx     # Frequency list
│   ├── routes/
│   │   ├── RouteMap.tsx          # Route lines on map
│   │   └── RouteList.tsx         # Route list sidebar
│   └── ui/
│       ├── SearchBar.tsx         # Global search
│       ├── Pagination.tsx        # Table pagination
│       ├── LoadingSpinner.tsx    # Loading state
│       └── EmptyState.tsx        # No results
├── lib/
│   ├── api.ts                    # API client functions
│   └── utils.ts                  # Helpers, formatters
├── hooks/
│   ├── useAirports.ts            # Airport data hook
│   ├── useStats.ts               # Stats data hook
│   └── useDebounce.ts            # Search debounce
└── types/
    ├── airport.ts                # TypeScript interfaces
    ├── stats.ts
    └── route.ts
```

---

## 4. Luồng Hoạt Động (User Journeys)

> 💡 Đây là "hành trình" điển hình của người dùng khi dùng app.

### 4.1 Hành trình 1: Khám phá lần đầu

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 HÀNH TRÌNH 1: Analyst mở Dashboard lần đầu
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Mở app → Thấy Dashboard với KPIs nổi bật
   ↓
2️⃣ Nhìn bản đồ mini → Tò mò bấm vào "View Full Map"
   ↓
3️⃣ Thấy bản đồ toàn cầu → Zoom vào khu vực quan tâm
   ↓
4️⃣ Bấm vào 1 cluster → Zoom sâu hơn, thấy các sân bay
   ↓
5️⃣ Bấm vào 1 sân bay → Popup hiện lên: tên, mã, loại
   ↓
6️⃣ Bấm "View Details" → Xem chi tiết runway, frequency, routes
```

### 4.2 Hành trình 2: Tìm kiếm sân bay cụ thể

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 HÀNH TRÌNH 2: Tìm sân bay cụ thể
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Bấm ô Search trên Header
   ↓
2️⃣ Gõ "JFK" hoặc "KJFK" hoặc "John F Kennedy"
   ↓
3️⃣ Dropdown gợi ý hiện ra ngay (debounce 300ms)
   ↓
4️⃣ Bấm vào kết quả → Chuyển đến trang chi tiết
   ↓
5️⃣ Xem runways, frequencies, routes, vị trí trên bản đồ
```

### 4.3 Hành trình 3: Phân tích dữ liệu

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 HÀNH TRÌNH 3: Phân tích & so sánh
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Mở Dashboard → Xem biểu đồ "Airports by Type"
   ↓
2️⃣ Bấm vào "large_airport" trên biểu đồ → Filter tự động
   ↓
3️⃣ Chuyển sang trang Airports → Chỉ hiện sân bay lớn
   ↓
4️⃣ Lọc thêm theo Country = "VN" → Thấy 10 sân bay lớn ở VN
   ↓
5️⃣ Bấm vào 1 sân bay → Xem chi tiết runways, so sánh
```

### 4.4 Hành trình 4: Xem tuyến bay

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 HÀNH TRÌNH 4: Khám phá tuyến bay
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Mở trang Routes
   ↓
2️⃣ Chọn sân bay xuất phát: SGN (Tan Son Nhat)
   ↓
3️⃣ Bản đồ hiện các đường bay từ SGN → Các điểm đến
   ↓
4️⃣ Sidebar liệt kê: 23 routes, nhóm theo hãng bay
   ↓
5️⃣ Bấm vào 1 route → Highlight trên map + thông tin chi tiết
```

---

## 5. Checklist Kiểm Tra (Acceptance Criteria)

> 💡 "Làm sao biết tính năng đã XONG?" - Đây là checklist để kiểm tra.

### 5.1 Dashboard

```
✅ CHECKLIST: Trang Dashboard

Cơ bản:
  □ Hiển thị 4 KPI cards (airports, countries, runways, routes)
  □ Số liệu đúng với database
  □ Biểu đồ "Airports by Type" render ra đúng
  □ Biểu đồ "By Continent" render ra đúng
  □ Top 10 Countries hiển thị đúng
  □ Mini map hiển thị airport markers

Trải nghiệm:
  □ Load dưới 2 giây
  □ Cards có animation xuất hiện
  □ Hover vào chart có tooltip
  □ Click mini map → chuyển sang /map
  □ Responsive trên tablet (1024px)
```

### 5.2 Interactive Map

```
✅ CHECKLIST: Bản đồ tương tác

Cơ bản:
  □ Bản đồ render toàn cầu
  □ Airport markers hiển thị đúng vị trí
  □ Clustering hoạt động khi zoom ra
  □ Bấm marker → popup hiện thông tin
  □ Popup có link "View Details"

Lọc & Tìm:
  □ Filter theo type hoạt động
  □ Filter theo country hoạt động
  □ Search bar trên map hoạt động
  □ Kết hợp multiple filters

Performance:
  □ 60fps smooth khi pan/zoom
  □ Chỉ load airports trong viewport (lazy)
  □ Clustering giảm số markers
  □ API response < 200ms
```

### 5.3 Airport Search

```
✅ CHECKLIST: Tìm kiếm sân bay

Cơ bản:
  □ Gõ ICAO code (VVTS) → Tìm ra đúng
  □ Gõ IATA code (SGN) → Tìm ra đúng
  □ Gõ tên (Tan Son Nhat) → Tìm ra đúng
  □ Gõ thành phố (Ho Chi Minh) → Tìm ra đúng
  □ Kết quả hiện trong dropdown gợi ý

Edge cases:
  □ Gõ dưới 2 ký tự → Không tìm (tránh quá nhiều kết quả)
  □ Gõ text vô nghĩa → "No results found"
  □ Gõ nhanh → Debounce 300ms (không spam API)
  □ Case-insensitive (vjts, VJTS → đều ra)
```

### 5.4 Airport Detail

```
✅ CHECKLIST: Chi tiết sân bay

Cơ bản:
  □ Hiển thị đủ thông tin cơ bản (tên, mã, loại, vị trí)
  □ Bản đồ mini hiển thị pin đúng vị trí
  □ Danh sách runways đúng
  □ Danh sách frequencies đúng
  □ Routes từ sân bay đó (nếu có)

Nâng cao:
  □ Country flag/name hiển thị
  □ Link Wikipedia/website mở đúng tab mới
  □ Nút "Back" quay về trang trước
  □ URL shareable (/airports/VVTS)
```

---

## 6. Test Cases Design

> 💡 "Bài kiểm tra" viết sẵn TRƯỚC khi code, để biết code đúng chưa.

### TC-01: Dashboard loads correctly
```
Given: Server đang chạy, DB có dữ liệu
When:  Người dùng mở trang chủ (/)
Then:  ✓ 4 KPI cards hiển thị đúng số liệu
       ✓ Biểu đồ render trong 2 giây
       ✓ Mini map hiển thị ít nhất 100 markers
```

### TC-02: Airport search - ICAO code
```
Given: Người dùng ở bất kỳ trang nào
When:  Gõ "VVTS" vào ô search
Then:  ✓ Dropdown hiện "Tan Son Nhat International Airport"
       ✓ Kết quả hiện trong < 500ms
       ✓ Bấm vào → chuyển sang /airports/VVTS
```

### TC-03: Map viewport loading
```
Given: Người dùng đang ở trang /map
When:  Zoom vào khu vực Đông Nam Á
Then:  ✓ API gọi /api/airports/map với bounds đúng
       ✓ Markers hiển thị sân bay trong viewport
       ✓ Không load sân bay ngoài viewport
       ✓ Response < 200ms
```

### TC-04: Map clustering
```
Given: Bản đồ zoom level 3 (nhìn toàn cầu)
When:  Nhìn vào khu vực có nhiều sân bay (Mỹ, Châu Âu)
Then:  ✓ Các marker gom lại thành cluster
       ✓ Cluster hiện số lượng (42, 127...)
       ✓ Zoom vào cluster → tách ra thành markers nhỏ
```

### TC-05: Airport detail - full info
```
Given: Sân bay KJFK tồn tại trong DB
When:  Mở /airports/KJFK
Then:  ✓ Tên: "John F Kennedy International Airport"
       ✓ Hiện đủ runways (4 runways)
       ✓ Hiện frequencies
       ✓ Hiện routes
       ✓ Mini map pin đúng vị trí New York
```

### TC-06: Filters combination
```
Given: Người dùng ở trang /airports
When:  Chọn Type=large_airport AND Country=VN
Then:  ✓ Hiện đúng các sân bay lớn ở Việt Nam
       ✓ Tổng số = ~10 sân bay
       ✓ Reset filter → hiện lại toàn bộ
```

### TC-07: API error handling
```
Given: Backend tạm thời không khả dụng
When:  Frontend gọi API
Then:  ✓ Hiện thông báo lỗi thân thiện
       ✓ Không crash app
       ✓ Có nút "Retry"
```

### TC-08: Responsive design
```
Given: Người dùng mở trên tablet (1024px width)
When:  Duyệt tất cả các trang
Then:  ✓ Sidebar collapse thành hamburger menu
       ✓ Charts resize phù hợp
       ✓ Table scroll ngang nếu cần
       ✓ Map full width
```

---

## 7. Design Tokens (Hệ thống màu sắc & typography)

### Colors (Dark Aviation Theme)
```css
/* Background */
--bg-primary:    #0a0f1e;     /* Nền chính - dark navy */
--bg-secondary:  #111827;     /* Card background */
--bg-tertiary:   #1e293b;     /* Hover, active states */
--bg-glass:      rgba(17, 24, 39, 0.8); /* Glassmorphism */

/* Accent Colors */
--accent-sky:    #38bdf8;     /* Primary - Sky blue */
--accent-amber:  #f59e0b;     /* Warning, highlights */
--accent-emerald:#10b981;     /* Success, positive */
--accent-rose:   #f43f5e;     /* Error, negative */
--accent-violet: #8b5cf6;     /* Routes, special */

/* Text */
--text-primary:  #f1f5f9;     /* Main text */
--text-secondary:#94a3b8;     /* Muted text */
--text-muted:    #64748b;     /* Disabled text */

/* Airport Type Colors */
--airport-large: #38bdf8;     /* Large airport */
--airport-medium:#10b981;     /* Medium airport */
--airport-small: #f59e0b;     /* Small airport */
--airport-heli:  #8b5cf6;     /* Heliport */
--airport-closed:#64748b;     /* Closed */
--airport-sea:   #06b6d4;     /* Seaplane base */

/* Border & Effects */
--border:        #1e293b;
--glow-sky:      0 0 20px rgba(56, 189, 248, 0.3);
--glow-amber:    0 0 20px rgba(245, 158, 11, 0.3);
```

### Typography
```css
/* Fonts */
--font-display:  'Inter', sans-serif;      /* Headings, UI */
--font-mono:     'JetBrains Mono', mono;   /* ICAO codes, data */

/* Sizes */
--text-xs:   0.75rem;     /* 12px - labels */
--text-sm:   0.875rem;    /* 14px - body small */
--text-base: 1rem;        /* 16px - body */
--text-lg:   1.125rem;    /* 18px - subtitle */
--text-xl:   1.25rem;     /* 20px - heading */
--text-2xl:  1.5rem;      /* 24px - page title */
--text-3xl:  1.875rem;    /* 30px - KPI numbers */
--text-4xl:  2.25rem;     /* 36px - hero number */
```

---

*Tạo bởi AWF 4.0 - Design Phase*
*Dựa trên: [aviation_dashboard_spec.md](specs/aviation_dashboard_spec.md)*
