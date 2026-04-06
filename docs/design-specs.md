# Design Specifications - Aviation Data Dashboard

> Tài liệu này chứa **tất cả thông số thiết kế** để `/code` implement chính xác.
> Mockup tham khảo: `docs/mockups/dashboard.png`

---

## 🎨 Color Palette

### Background Colors
| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Background Primary | `#0a0f1e` | `--bg-primary` | Nền chính toàn app |
| Background Secondary | `#111827` | `--bg-secondary` | Card backgrounds |
| Background Tertiary | `#1e293b` | `--bg-tertiary` | Hover, active states |
| Background Glass | `rgba(17, 24, 39, 0.8)` | `--bg-glass` | Glassmorphism cards |
| Background Elevated | `#1a2332` | `--bg-elevated` | Sidebar, modals |

### Accent Colors
| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Sky Blue | `#38bdf8` | `--accent-sky` | Primary CTA, links, active states |
| Sky Blue Dark | `#0ea5e9` | `--accent-sky-dark` | Hover state cho primary |
| Sky Blue Glow | `rgba(56, 189, 248, 0.15)` | `--accent-sky-glow` | Glow effect |
| Amber | `#f59e0b` | `--accent-amber` | Warnings, highlights |
| Emerald | `#10b981` | `--accent-emerald` | Success, positive |
| Rose | `#f43f5e` | `--accent-rose` | Error, destructive |
| Violet | `#8b5cf6` | `--accent-violet` | Routes, special items |
| Cyan | `#06b6d4` | `--accent-cyan` | Seaplane, secondary info |

### Airport Type Colors (Dùng cho markers + charts)
| Airport Type | Color | Hex | Marker Size |
|-------------|-------|-----|------------|
| large_airport | Sky Blue | `#38bdf8` | 12px |
| medium_airport | Emerald | `#10b981` | 9px |
| small_airport | Amber | `#f59e0b` | 6px |
| heliport | Violet | `#8b5cf6` | 6px |
| seaplane_base | Cyan | `#06b6d4` | 6px |
| closed | Slate | `#64748b` | 5px |
| balloonport | Rose | `#f43f5e` | 5px |

### Text Colors
| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Text Primary | `#f1f5f9` | `--text-primary` | Headings, body |
| Text Secondary | `#94a3b8` | `--text-secondary` | Labels, muted |
| Text Muted | `#64748b` | `--text-muted` | Disabled, placeholders |
| Text Inverse | `#0f172a` | `--text-inverse` | Text on light bg |

### Border & Divider
| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Border | `#1e293b` | `--border` | Card borders, dividers |
| Border Hover | `#334155` | `--border-hover` | Hover state borders |
| Border Active | `#38bdf8` | `--border-active` | Focus, active borders |

---

## 📝 Typography

### Font Families
```css
--font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

### Font Scale
| Element | Font | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|------|--------|-------------|---------------|-------|
| Hero Number | Inter | 42px (2.625rem) | 700 | 1 | -0.02em | KPI big numbers |
| H1 | Inter | 30px (1.875rem) | 700 | 1.2 | -0.02em | Page titles |
| H2 | Inter | 24px (1.5rem) | 600 | 1.3 | -0.01em | Section titles |
| H3 | Inter | 20px (1.25rem) | 600 | 1.4 | 0 | Card titles |
| H4 | Inter | 16px (1rem) | 600 | 1.5 | 0 | Subsection titles |
| Body | Inter | 16px (1rem) | 400 | 1.6 | 0 | Paragraphs |
| Body Small | Inter | 14px (0.875rem) | 400 | 1.5 | 0 | Table content |
| Caption | Inter | 12px (0.75rem) | 500 | 1.4 | 0.05em | Labels, badges |
| Code/ICAO | JetBrains Mono | 14px | 500 | 1.4 | 0.05em | Airport codes, data |

---

## 📐 Spacing System (8px base)

| Name | Value | CSS Variable | Usage |
|------|-------|-------------|-------|
| 1 | 4px | `--space-1` | Icon-text gap |
| 2 | 8px | `--space-2` | Tight spacing |
| 3 | 12px | `--space-3` | Inside small cards |
| 4 | 16px | `--space-4` | Default padding |
| 5 | 20px | `--space-5` | Card inner padding |
| 6 | 24px | `--space-6` | Section gaps |
| 8 | 32px | `--space-8` | Between sections |
| 10 | 40px | `--space-10` | Page margins |
| 12 | 48px | `--space-12` | Large sections |

---

## 🔲 Border Radius

| Name | Value | CSS Variable | Usage |
|------|-------|-------------|-------|
| sm | 6px | `--radius-sm` | Buttons, inputs, badges |
| md | 8px | `--radius-md` | Small cards, tooltips |
| lg | 12px | `--radius-lg` | Cards, modals |
| xl | 16px | `--radius-xl` | Large cards, containers |
| full | 9999px | `--radius-full` | Pills, avatars, dots |

---

## 🌫️ Shadows & Effects

| Name | Value | Usage |
|------|-------|-------|
| Shadow SM | `0 1px 3px rgba(0, 0, 0, 0.3)` | Subtle elevation |
| Shadow MD | `0 4px 6px rgba(0, 0, 0, 0.25)` | Cards |
| Shadow LG | `0 10px 25px rgba(0, 0, 0, 0.35)` | Modals, dropdowns |
| Shadow Glow Sky | `0 0 20px rgba(56, 189, 248, 0.2)` | Active card, selected |
| Shadow Glow Amber | `0 0 15px rgba(245, 158, 11, 0.15)` | Warning highlight |
| Backdrop Blur | `backdrop-filter: blur(16px)` | Glassmorphism cards |
| Glass Border | `border: 1px solid rgba(255,255,255,0.08)` | Glass card border |

---

## 📱 Breakpoints

| Name | Width | Layout Changes |
|------|-------|---------------|
| Mobile | < 768px | Sidebar → hamburger, 1 column, stacked cards |
| Tablet | 768px - 1023px | Sidebar → collapsed (icons only, 64px), 2 column |
| Desktop | 1024px - 1439px | Full sidebar (240px), 3-4 column grid |
| Wide | ≥ 1440px | Full sidebar, max-width content (1200px) |

---

## ✨ Animations & Transitions

| Name | Duration | Easing | CSS | Usage |
|------|----------|--------|-----|-------|
| Hover | 150ms | ease-out | `transition: all 150ms ease-out` | Button hover, card hover |
| Focus | 200ms | ease-in-out | `transition: all 200ms ease-in-out` | Input focus, tab switch |
| Slide | 300ms | cubic-bezier(0.4, 0, 0.2, 1) | `transition: transform 300ms ...` | Sidebar, panels |
| Fade In | 400ms | ease-out | `opacity 0→1, translateY 10→0` | Cards appear on load |
| Chart | 800ms | ease-in-out | Custom | Chart bars/slices animate in |
| Counter | 1000ms | ease-out | CountUp animation | KPI numbers counting up |
| Map Marker | 300ms | ease-out | Scale 0→1, opacity 0→1 | Markers appear on map |

### Stagger Animation (Cards xuất hiện lần lượt)
```css
.stat-card:nth-child(1) { animation-delay: 0ms; }
.stat-card:nth-child(2) { animation-delay: 100ms; }
.stat-card:nth-child(3) { animation-delay: 200ms; }
.stat-card:nth-child(4) { animation-delay: 300ms; }
```

---

## 🖼️ Component Specifications

### 1. Sidebar Navigation
```
Width: 240px (desktop) / 64px (tablet) / hidden (mobile)
Background: #0a0f1e
Border-right: 1px solid #1e293b

Logo area:
  Height: 64px
  Padding: 16px
  Icon: ✈️ plane icon, 24px, white
  Title: "AviDash", Inter 18px bold, #f1f5f9 (hidden on tablet)

Menu items:
  Height: 44px
  Padding: 12px 16px
  Icon: 20px, #94a3b8 (default) / #38bdf8 (active)
  Text: Inter 14px 500, #94a3b8 (default) / #f1f5f9 (active)
  Active indicator: 3px sky blue bar on left border
  Hover: background #1e293b
  Border-radius: 8px (with 8px margin sides)
  
Gap between items: 4px
```

### 2. KPI Stat Card
```
Layout: 4 cards in row (grid, gap 16px)
Min-width per card: 200px
Padding: 20px
Background: rgba(17, 24, 39, 0.8)
Backdrop-filter: blur(16px)
Border: 1px solid rgba(255,255,255,0.08)
Border-radius: 12px
Hover: border-color rgba(56, 189, 248, 0.3), shadow glow

Content:
  Row 1: Icon (36px, colored bg circle, opacity 0.15) + Label (12px, #94a3b8)
  Row 2: Number (42px, Inter Bold, #f1f5f9, count-up animation)
  Row 3: Subtitle/change (12px, #64748b, optional green/red arrow)

Accent color per card:
  Airports → sky blue #38bdf8
  Countries → emerald #10b981
  Runways → amber #f59e0b
  Routes → violet #8b5cf6
```

### 3. Chart Cards
```
Layout: 2 cards side-by-side (desktop), stacked (mobile)
Padding: 24px
Background: #111827
Border: 1px solid #1e293b
Border-radius: 12px

Title: Inter 16px 600, #f1f5f9, margin-bottom 16px

Chart area:
  Height: 250px (desktop) / 200px (mobile)
  Recharts with dark theme
  
Chart colors (bar chart):
  large_airport → #38bdf8
  medium_airport → #10b981
  small_airport → #f59e0b
  heliport → #8b5cf6
  closed → #64748b

Tooltip:
  Background: #1e293b
  Border: 1px solid #334155
  Border-radius: 8px
  Padding: 8px 12px
  Text: Inter 13px, #f1f5f9
```

### 4. Search Bar (Header)
```
Position: Header, right side
Width: 360px (desktop) / full width (mobile)
Height: 40px
Background: #1e293b
Border: 1px solid #334155
Border-radius: 8px
Padding: 8px 12px 8px 36px (left space for icon)

Icon: 🔍 16px, #64748b, position absolute left 12px
Placeholder: "Search airports...", Inter 14px, #64748b
Input text: Inter 14px, #f1f5f9

Focus state:
  Border: 1px solid #38bdf8
  Shadow: 0 0 0 3px rgba(56, 189, 248, 0.15)

Dropdown suggestions:
  Background: #1e293b
  Border: 1px solid #334155
  Border-radius: 8px
  Shadow: 0 10px 25px rgba(0,0,0,0.35)
  Max-height: 320px
  
  Each item:
    Padding: 10px 14px
    Hover: background #334155
    Layout: [ICAO code mono] [Airport name] [IATA badge] [Country flag]
```

### 5. Data Table (Airport List)
```
Background: #111827
Border: 1px solid #1e293b
Border-radius: 12px
Overflow: hidden

Header row:
  Background: #0a0f1e
  Height: 44px
  Text: Inter 12px 600 uppercase, #94a3b8
  Padding: 0 16px
  Border-bottom: 1px solid #1e293b

Body rows:
  Height: 48px
  Text: Inter 14px 400, #f1f5f9
  Padding: 0 16px
  Border-bottom: 1px solid rgba(30,41,59,0.5)
  Hover: background rgba(56, 189, 248, 0.05)
  
  ICAO/IATA columns: JetBrains Mono 14px 500, #38bdf8
  Type badge: 8px pill, colored per airport type
  Country: flag emoji + code

Pagination:
  Margin-top: 16px
  Padding: 12px 16px
  Text: Inter 13px, #94a3b8
  Buttons: 32px square, hover bg #1e293b
  Active page: bg #38bdf8, text white
```

### 6. Airport Popup (Map)
```
Width: 280px
Background: rgba(17, 24, 39, 0.95)
Backdrop-filter: blur(16px)
Border: 1px solid rgba(255,255,255,0.1)
Border-radius: 12px
Padding: 16px
Shadow: 0 10px 25px rgba(0,0,0,0.4)

Content:
  Title: Inter 15px 600, #f1f5f9 (airport name)
  Subtitle: JetBrains Mono 13px, #94a3b8 (IATA · City, Country)
  Info rows: Inter 13px, #94a3b8
  Divider: 1px solid #1e293b, margin 10px 0
  CTA button: "View Details →", Inter 13px 500, #38bdf8
    Hover: underline
```

### 7. Map Markers
```
Large airport: circle 12px, fill #38bdf8, stroke white 2px, glow
Medium airport: circle 9px, fill #10b981, stroke white 1px
Small airport: circle 6px, fill #f59e0b, no stroke
Heliport: diamond 6px, fill #8b5cf6
Closed: circle 5px, fill #64748b, opacity 0.6

Cluster: circle 32-48px, gradient sky blue, white text (count), shadow
  Cluster sizes:
  < 10: 32px
  10-99: 38px
  100-999: 44px
  1000+: 48px
```

---

## 🌍 Map Tile Style

```
Map provider: OpenStreetMap (default) 
Dark tile: CartoDB Dark Matter
URL: https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png

Alternative: Stadia Maps Dark
URL: https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png
```

---

## 📊 Chart Theme (Recharts)

```javascript
const chartTheme = {
  background: 'transparent',
  textColor: '#94a3b8',
  fontSize: 12,
  fontFamily: 'Inter',
  axis: {
    domain: { line: { stroke: '#1e293b' } },
    tick: { line: { stroke: '#334155' } },
    label: { fill: '#94a3b8' }
  },
  grid: {
    line: { stroke: '#1e293b', strokeDasharray: '3 3' }
  },
  tooltip: {
    container: {
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '8px',
      color: '#f1f5f9',
      fontSize: '13px'
    }
  }
};
```

---

## 📱 Responsive Behavior

### Desktop (≥1024px)
- Sidebar: 240px, full with text
- KPI cards: 4 columns
- Charts: 2 columns
- Map: full width
- Table: all columns visible

### Tablet (768px - 1023px)
- Sidebar: 64px, icons only
- KPI cards: 2 columns (2 rows)
- Charts: 1 column stacked
- Map: full width
- Table: horizontal scroll, sticky first column

### Mobile (<768px)
- Sidebar: hidden, hamburger menu → slide-out overlay
- KPI cards: 2 columns (2 rows) or swipeable carousel
- Charts: 1 column, reduced height
- Map: full width, simplified controls
- Table: card view instead of table

---

*Generated by AWF 4.0 - Visualize Phase*
*Reference: docs/DESIGN.md, docs/specs/aviation_dashboard_spec.md*
