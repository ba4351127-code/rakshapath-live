from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ==========================================
# 1. INCIDENT SCHEMAS
# ==========================================
class IncidentCreate(BaseModel):
    title: str = Field(..., description="Title of the disaster or road obstruction incident", example="Brahmaputra Flood Surge")
    incident_type: str = Field(..., description="Category of hazard (Flood, Landslide, Debris, Bridge Washout)", example="Flood")
    severity: str = Field(default="High", description="Severity grade (Low, Medium, High, Critical)", example="High")
    state: str = Field(default="Delhi NCR", description="State or Union Territory", example="Assam")
    district: str = Field(default="Guwahati", description="District or municipal area", example="Guwahati")
    lat: float = Field(..., description="Latitude coordinate", example=26.1752)
    lon: float = Field(..., description="Longitude coordinate", example=91.6845)
    water_depth_cm: float = Field(default=45.0, ge=0.0, description="Water inundation depth in centimeters")
    damage_level: float = Field(default=4.0, ge=0.0, le=10.0, description="Roadway structural damage on 0-10 scale")
    debris_level: float = Field(default=3.0, ge=0.0, le=10.0, description="Physical debris obstruction on 0-10 scale")
    description: Optional[str] = Field(default="", description="Field situation notes", example="Rising water levels encroaching highway causeway")


class IncidentResponse(IncidentCreate):
    id: int
    status: str
    reported_at: str


# ==========================================
# 2. RESCUE UNIT SCHEMAS
# ==========================================
class RescueUnitCreate(BaseModel):
    name: str = Field(..., description="Name or identifier of rescue unit", example="NDRF Tactical Team 9")
    unit_type: str = Field(..., description="Asset type (Ambulance, NDRF Truck, Flood Boat, Rapid Response, Evacuation Bus)", example="NDRF Truck")
    state: str = Field(default="Delhi NCR", description="Operating state", example="Delhi NCR")
    district: str = Field(default="Central Delhi", description="Station district", example="Central Delhi")
    lat: float = Field(..., description="Latitude coordinate", example=28.6400)
    lon: float = Field(..., description="Longitude coordinate", example=77.2200)
    status: str = Field(default="Available", description="Operational readiness", example="Available")
    capacity: int = Field(default=6, ge=1, description="Passenger / patient capacity")
    contact: str = Field(default="TAC-SEC-9", description="Emergency radio or dispatch phone")
    water_clearance_cm: float = Field(default=80.0, ge=0.0, description="Maximum water wading clearance in cm")
    speed_kmh: float = Field(default=45.0, gt=0.0, description="Maximum safe cruising speed in km/h")


class RescueUnitResponse(RescueUnitCreate):
    id: int
    created_at: str


# ==========================================
# 3. HAZARD EVALUATION SCHEMAS
# ==========================================
class HazardEvalRequest(BaseModel):
    water_depth_cm: float = Field(default=0.0, ge=0.0, description="Water depth on road in centimeters")
    damage_level: float = Field(default=0.0, ge=0.0, le=10.0, description="Road structural damage level 0-10")
    debris_level: float = Field(default=0.0, ge=0.0, le=10.0, description="Debris obstruction level 0-10")
    vehicle_type: str = Field(default="Ambulance", description="Vehicle capability profile")


class HazardEvalResponse(BaseModel):
    risk_multiplier: float
    grade: str
    color: str
    is_passable: bool
    effective_speed_kmh: float


# ==========================================
# 4. LOCATION & ROUTING SCHEMAS
# ==========================================
class NearestNodeRequest(BaseModel):
    lat: float = Field(..., description="User GPS latitude coordinate", example=28.6139)
    lon: float = Field(..., description="User GPS longitude coordinate", example=77.2090)
    state: Optional[str] = Field(default=None, description="Optional state filter")


class RouteRequest(BaseModel):
    source: str = Field(..., description="Origin node identifier", example="DEL_HQ")
    target: str = Field(..., description="Destination safe shelter node identifier", example="DEL_MAYUR_SHELTER")
    vehicle_type: str = Field(default="Ambulance", description="Vehicle profile name")
    override_water_depth_cm: Optional[float] = Field(default=None, description="Simulation override for water depth")
    override_damage_level: Optional[float] = Field(default=None, description="Simulation override for road damage")
    override_debris_level: Optional[float] = Field(default=None, description="Simulation override for debris")


class RouteSegment(BaseModel):
    road_name: str
    distance_km: float
    water_depth_cm: float
    risk_multiplier: float
    grade: str
    transit_time_min: float


class CorridorWaypoint(BaseModel):
    id: str
    name: str
    lat: float
    lon: float
    state: Optional[str] = None
    district: Optional[str] = None
    category: Optional[str] = None


class SafeCorridorInfo(BaseModel):
    total_distance_km: float
    estimated_transit_time_min: float
    average_risk_multiplier: float
    max_risk_multiplier: float
    is_fully_passable: bool
    waypoints: List[Dict[str, Any]]
    segments: List[RouteSegment]


class RecommendedUnit(BaseModel):
    unit: Dict[str, Any]
    distance_to_target_km: float
    eta_minutes: float


class RouteResponse(BaseModel):
    success: bool
    vehicle_type: str
    source: Dict[str, Any]
    target: Dict[str, Any]
    safe_corridor: SafeCorridorInfo
    shortest_naive: Optional[Dict[str, Any]] = None
    is_detour_advised: bool
    safety_status: str
    recommended_units: List[RecommendedUnit] = []
