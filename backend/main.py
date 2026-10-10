import os
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.database import init_db, get_db, Incident, RescueUnit
from backend.hazard_engine import calculate_hazard_risk, VEHICLE_PROFILES, haversine_distance_km
from backend.router import EmergencyRouter, NETWORK_NODES
from backend.schemas import (
    IncidentCreate,
    RescueUnitCreate,
    HazardEvalRequest,
    HazardEvalResponse,
    NearestNodeRequest,
    RouteRequest,
    RouteResponse
)

# Initialize database schema and initial multi-state seed data
init_db()

# Initialize FastAPI application
app = FastAPI(
    title="RakshaPath API",
    description="Production Emergency Mobility Network API computing risk-weighted safe corridors across India's hazard zones.",
    version="2.0.0"
)

# Enable CORS for frontend communication (supports Vite dev port 5173, production domains, and localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared Emergency Router Instance
router_engine = EmergencyRouter()


# ==========================================
# SYSTEM & HEALTH ENDPOINTS
# ==========================================
@app.get("/")
def root():
    return {
        "system": "RakshaPath Emergency Mobility Network API",
        "status": "OPERATIONAL",
        "version": "2.0.0",
        "active_states": list(router_engine.get_states().keys()),
        "total_nodes": len(NETWORK_NODES),
        "supported_vehicles": list(VEHICLE_PROFILES.keys())
    }


@app.get("/api/states")
def get_states():
    """Retrieve all available states and districts in RakshaPath."""
    return router_engine.get_states()


@app.get("/api/nodes")
def get_nodes(state: Optional[str] = Query(None)):
    """Retrieve emergency mobility network nodes, optionally filtered by state."""
    results = []
    for k, v in NETWORK_NODES.items():
        if state and v.get("state") != state:
            continue
        results.append({"id": k, **v})
    return results


@app.get("/api/shelters")
def list_shelters(state: Optional[str] = Query(None), district: Optional[str] = Query(None)):
    """Retrieve all emergency relief shelters and hospital destination hubs."""
    results = []
    for k, v in NETWORK_NODES.items():
        if state and v.get("state") != state:
            continue
        if district and district != "All Districts" and v.get("district") != district:
            continue
        if v.get("category") in ["Relief Shelter", "Hospital", "Command Center", "Helipad"]:
            results.append({"id": k, **v})
    if not results:
        for k, v in NETWORK_NODES.items():
            if v.get("category") in ["Relief Shelter", "Hospital"]:
                results.append({"id": k, **v})
    return results


@app.get("/api/search")
def search_locations(q: str = Query(...), state: Optional[str] = Query(None)):
    """Search matching landmark, city, state, or category."""
    return router_engine.search_nodes(q, state=state)


@app.post("/api/nearest-node")
def find_nearest_node(payload: NearestNodeRequest):
    """Find the nearest infrastructure node from user GPS coordinates."""
    res = router_engine.find_nearest_node(payload.lat, payload.lon, state=payload.state)
    if not res:
        raise HTTPException(status_code=404, detail="No nearby emergency node found.")
    return res


# ==========================================
# HAZARD ENDPOINTS
# ==========================================
@app.get("/api/hazards")
def list_hazards(state: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """Retrieve active disaster hazard zones and road blockages."""
    query = db.query(Incident).filter(Incident.status == "Active")
    if state:
        query = query.filter(Incident.state == state)
    return [inc.to_dict() for inc in query.all()]


@app.post("/api/hazards")
@app.post("/api/hazards/evaluate")
def evaluate_hazard(payload: HazardEvalRequest):
    """Evaluate hazard risk multipliers using physical models."""
    return calculate_hazard_risk(
        water_depth_cm=payload.water_depth_cm,
        damage_level=payload.damage_level,
        debris_level=payload.debris_level,
        vehicle_type=payload.vehicle_type
    )


# ==========================================
# ROUTING ENDPOINT
# ==========================================
@app.post("/api/route")
def calculate_route(payload: RouteRequest, db: Session = Depends(get_db)):
    """
    Compute safe emergency corridor using risk-weighted A* algorithm.
    Incorporates active incidents and optional simulation slider overrides.
    """
    if payload.source not in NETWORK_NODES:
        raise HTTPException(status_code=400, detail=f"Source node '{payload.source}' not recognized")
    if payload.target not in NETWORK_NODES:
        raise HTTPException(status_code=400, detail=f"Target node '{payload.target}' not recognized")

    # Fetch active incidents from database
    incidents = [inc.to_dict() for inc in db.query(Incident).filter(Incident.status == "Active").all()]

    # If simulation sliders are provided, synthesize an active hazard condition on intermediate nodes/edges
    if payload.override_water_depth_cm is not None or payload.override_damage_level is not None or payload.override_debris_level is not None:
        source_state = NETWORK_NODES[payload.source].get("state", "Delhi NCR")
        state_chokepoints = {
            "Delhi NCR": "DEL_YAMUNA",
            "Uttarakhand": "UK_DEVPRAYAG_CHOKE",
            "Assam": "ASM_SARAIGHAT_CHOKE",
            "Maharashtra": "MH_MITHI_CHOKE",
            "Uttar Pradesh": "UP_GOMTI_CHOKE",
            "Bihar": "BR_GANGA_BRIDGE_PATNA",
            "West Bengal": "WB_HOWRAH_RIVER_POST",
            "Gujarat": "GJ_SABARMATI_RESCUE_BASE"
        }
        target_choke = state_chokepoints.get(source_state, payload.source)
        choke_node = NETWORK_NODES.get(target_choke, NETWORK_NODES[payload.source])

        sim_incident = {
            "lat": choke_node["lat"],
            "lon": choke_node["lon"],
            "water_depth_cm": payload.override_water_depth_cm if payload.override_water_depth_cm is not None else 0.0,
            "damage_level": payload.override_damage_level if payload.override_damage_level is not None else 0.0,
            "debris_level": payload.override_debris_level if payload.override_debris_level is not None else 0.0,
        }
        incidents.append(sim_incident)

    # Apply hazards to graph
    router_engine.apply_hazards(incidents, vehicle_type=payload.vehicle_type)

    # Compute risk-weighted route via A*
    result = router_engine.find_safe_corridor(
        source=payload.source,
        target=payload.target,
        vehicle_type=payload.vehicle_type
    )

    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("error", "No route available"))

    # Recommend nearest capable rescue unit in the region
    dest_lat = NETWORK_NODES[payload.target]["lat"]
    dest_lon = NETWORK_NODES[payload.target]["lon"]
    dest_state = NETWORK_NODES[payload.target].get("state")
    
    unit_query = db.query(RescueUnit)
    if dest_state:
        unit_query = unit_query.filter(RescueUnit.state == dest_state)
    all_units = unit_query.all()
    if not all_units:
        all_units = db.query(RescueUnit).all()

    ranked_units = []
    for u in all_units:
        dist = haversine_distance_km(u.lat, u.lon, dest_lat, dest_lon)
        ranked_units.append({
            "unit": u.to_dict(),
            "distance_to_target_km": round(dist, 2),
            "eta_minutes": round((dist / max(10.0, u.speed_kmh)) * 60, 1)
        })
    ranked_units.sort(key=lambda x: x["distance_to_target_km"])

    result["recommended_units"] = ranked_units[:3]
    return result


# ==========================================
# INCIDENTS & RESCUE FLEET ENDPOINTS
# ==========================================
@app.get("/api/incidents")
def list_incidents(state: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """List disaster incidents, optionally filtered by state."""
    query = db.query(Incident).order_by(Incident.reported_at.desc())
    if state:
        query = query.filter(Incident.state == state)
    return [inc.to_dict() for inc in query.all()]


@app.post("/api/incidents")
def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    """Log a new emergency hazard incident."""
    new_inc = Incident(
        title=payload.title,
        incident_type=payload.incident_type,
        severity=payload.severity,
        state=payload.state,
        district=payload.district,
        lat=payload.lat,
        lon=payload.lon,
        water_depth_cm=payload.water_depth_cm,
        damage_level=payload.damage_level,
        debris_level=payload.debris_level,
        description=payload.description
    )
    db.add(new_inc)
    db.commit()
    db.refresh(new_inc)
    return {"message": "Incident reported successfully into RakshaPath network", "incident": new_inc.to_dict()}


@app.get("/api/units")
def list_rescue_units(state: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """List deployed rescue units and readiness, optionally filtered by state."""
    query = db.query(RescueUnit)
    if state:
        query = query.filter(RescueUnit.state == state)
    return [u.to_dict() for u in query.all()]


@app.post("/api/units")
def create_rescue_unit(payload: RescueUnitCreate, db: Session = Depends(get_db)):
    """Register a new rescue unit."""
    new_u = RescueUnit(
        name=payload.name,
        unit_type=payload.unit_type,
        state=payload.state,
        district=payload.district,
        lat=payload.lat,
        lon=payload.lon,
        status=payload.status,
        capacity=payload.capacity,
        contact=payload.contact,
        water_clearance_cm=payload.water_clearance_cm,
        speed_kmh=payload.speed_kmh
    )
    db.add(new_u)
    db.commit()
    db.refresh(new_u)
    return {"message": "Rescue unit registered", "unit": new_u.to_dict()}


@app.post("/api/reset-network")
def reset_network(db: Session = Depends(get_db)):
    """Reset network hazards and re-seed database with national baseline."""
    db.query(Incident).delete()
    db.query(RescueUnit).delete()
    db.commit()
    init_db()
    router_engine._build_base_network()
    return {"message": "RakshaPath network hazards and multi-state registries restored to baseline state."}
