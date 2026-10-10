# 🛡️ RakshaPath
### National Emergency Mobility Network • Production Full-Stack Architecture

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900.svg)](https://leafletjs.com/)
[![NetworkX](https://img.shields.io/badge/NetworkX-A*_Routing-orange.svg)](https://networkx.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**RakshaPath** is an autonomous tactical emergency routing system built for disaster management authorities (NDRF, SDRF, EMS, Civil Defense) and citizens. It computes **risk-weighted safe corridors** across floodwaters, landslide rubble, and damaged roadways using physical hazard penalty models and NetworkX A* algorithms.

Migrated to a production-ready **Full-Stack Architecture** featuring a high-performance **FastAPI REST Backend** and an immersive **React + Vite + Tailwind CSS + Leaflet GIS Frontend**.

---

## 🌟 Key Features

1. **Risk-Weighted A* Corridor Algorithm**:
   - Compares physical road distances against composite hazard multipliers.
   - Dynamically reroutes rescue teams around submerged bridges and damaged roadways while contrasting against naive direct routes.

2. **Physical Hazard Engine & Vehicle Profiles**:
   - Accounts for water inundation depth (cm), structural roadway damage (0–10), and debris obstruction (0–10).
   - Dynamic asset profiles: *Ambulance, Rescue Truck, Flood Rescue Boat, Quick Relief Jeep, Evacuation Bus*.

3. **Immersive GIS-First Map Interface (React + Leaflet)**:
   - Full-viewport interactive OpenStreetMap topology map free of watermarks or API keys.
   - Live color-coded infrastructure markers: *Hospitals, Shelters, NDRF Bases, Command Centers, Helipads*.
   - Dynamic danger zones with pulsating hazard radius rings.
   - High-visibility emerald safe corridor polyline contrasted with dashed red blocked routes.

4. **Floating Telemetry HUD & Search Header**:
   - Real-time corridor telemetry cards: *Safe Route Distance, Est. Travel Time, Road Danger Factor, Corridor Safety Status*.
   - Landmark search with instant autocomplete (AIIMS Delhi, SGPGI Lucknow, Agra Fort, KEM Mumbai).
   - 1-Click *"Use My Device Location"* GPS resolver snapping to the nearest emergency hub.
   - Quick metropolitan city jumpers (*Delhi NCR, Lucknow, Agra, Varanasi, Dehradun, Mumbai, Patna, Kolkata*).

5. **Docked Control Drawer & Multi-Tab Analysis**:
   - State & District hierarchy selectors with guaranteed fallbacks.
   - Real-time physics hazard calibration sliders with instant risk evaluation.
   - Turn-by-turn waypoint breakdown with individual segment risk and transit estimates.
   - Algorithmic safety comparison table (Safe A* vs. Blocked Direct Road).
   - Dispatched rescue units with reaching ETAs and water clearance limits.
   - Interactive road hazard transmission form.

---

## 📂 Project Structure

```
RakshaPath/
├── requirements.txt           # Unified Python dependencies
├── backend/
│   ├── main.py                # FastAPI REST application with CORS enabled
│   ├── router.py              # Multi-state NetworkX A* emergency corridor graph
│   ├── hazard_engine.py       # Physics-based risk multiplier models
│   ├── database.py            # SQLite ORM models (RescueUnits & Incidents) + Auto-seeder
│   ├── schemas.py             # Pydantic v2 data models for requests & responses
│   └── requirements.txt       # Dedicated backend dependencies for Render/Docker
└── frontend/
    ├── index.html             # Application entry point with Leaflet & Inter fonts
    ├── vite.config.js         # Vite configuration with /api backend proxy
    ├── tailwind.config.js     # Tailwind CSS theme configuration
    ├── postcss.config.js      # PostCSS configuration
    ├── package.json           # Node.js dependencies and build scripts
    └── src/
        ├── main.jsx           # React DOM root
        ├── App.jsx            # Main GIS application container
        ├── index.css          # Tailwind CSS and Leaflet custom styles
        ├── services/
        │   └── api.js         # Frontend REST API client
        └── components/
            ├── Header.jsx         # Floating brand bar, search & city presets
            ├── TelemetryCards.jsx # Route HUD metrics cards
            ├── Sidebar.jsx        # Docked location, vehicle & hazard controls
            ├── MapView.jsx        # Leaflet OpenStreetMap interactive viewport
            └── BottomDrawer.jsx   # Directions, comparison, fleet & report tabs
```

---

## 🚀 Quick Start Guide

### 1. Start the FastAPI Backend
```bash
# From project root
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
API runs at `http://localhost:8000` (Interactive Swagger docs at `http://localhost:8000/docs`).

### 2. Start the React Frontend
```bash
# In the frontend directory
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🌐 Production Deployment

- **Backend (Render / Railway / Fly.io):**
  - Root directory: `backend` (or root)
  - Build command: `pip install -r backend/requirements.txt`
  - Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

- **Frontend (Vercel / Netlify / Cloudflare Pages):**
  - Root directory: `frontend`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variable: `VITE_API_URL=https://your-backend-api.onrender.com`

---

## 🛡️ License
Distributed under the MIT License. Built for national disaster resilience.
