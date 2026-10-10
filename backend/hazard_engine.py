import math
from typing import Dict, Any, Tuple


VEHICLE_PROFILES = {
    "Ambulance": {
        "max_water_clearance_cm": 30.0,
        "max_damage_tolerance": 5.0,
        "max_debris_tolerance": 4.0,
        "base_speed_kmh": 60.0,
        "is_amphibious": False,
        "description": "Standard Emergency Life Support Ambulance"
    },
    "NDRF Truck": {
        "max_water_clearance_cm": 85.0,
        "max_damage_tolerance": 8.0,
        "max_debris_tolerance": 7.5,
        "base_speed_kmh": 45.0,
        "is_amphibious": False,
        "description": "Heavy-duty All-Terrain Rescue Vehicle"
    },
    "Flood Boat": {
        "max_water_clearance_cm": 999.0,  # Thrives in deep water
        "min_water_depth_cm": 20.0,       # Needs water to float
        "max_damage_tolerance": 9.0,
        "max_debris_tolerance": 6.0,
        "base_speed_kmh": 25.0,
        "is_amphibious": True,
        "description": "Tactical Inflatable Water Rescue Craft"
    },
    "Rapid Response": {
        "max_water_clearance_cm": 45.0,
        "max_damage_tolerance": 6.5,
        "max_debris_tolerance": 5.5,
        "base_speed_kmh": 65.0,
        "is_amphibious": False,
        "description": "Light 4x4 Emergency Reconnaissance Unit"
    },
    "Evacuation Bus": {
        "max_water_clearance_cm": 40.0,
        "max_damage_tolerance": 4.0,
        "max_debris_tolerance": 3.0,
        "base_speed_kmh": 40.0,
        "is_amphibious": False,
        "description": "Mass Evacuation Civilian Transport"
    }
}


def calculate_water_risk(water_depth_cm: float, vehicle_type: str = "Ambulance") -> Tuple[float, bool]:
    """
    Calculate water risk multiplier and passability.
    Water hazards can hydroplane, submerge exhaust/intake, or wash away vehicles.
    """
    profile = VEHICLE_PROFILES.get(vehicle_type, VEHICLE_PROFILES["Ambulance"])
    
    # Special physics for watercraft
    if profile.get("is_amphibious"):
        min_depth = profile.get("min_water_depth_cm", 20.0)
        if water_depth_cm < min_depth:
            # Boat grounded in shallow or dry land
            return 100.0, False
        # Boat traverses deep water smoothly
        return 1.0 + max(0.0, (water_depth_cm - 80.0) * 0.005), True

    max_clearance = profile.get("max_water_clearance_cm", 30.0)
    
    if water_depth_cm <= 5.0:
        return 1.0, True
    elif water_depth_cm <= max_clearance * 0.5:
        # Minor wading, slight speed reduction
        mult = 1.0 + (water_depth_cm / max_clearance) * 0.8
        return mult, True
    elif water_depth_cm <= max_clearance:
        # Near max clearance - engine stall hazard
        mult = 1.5 + ((water_depth_cm - max_clearance * 0.5) / (max_clearance * 0.5)) * 3.5
        return mult, True
    elif water_depth_cm <= max_clearance * 1.3:
        # Critical depth - extreme hazard, likely impassable
        mult = 6.0 + (water_depth_cm - max_clearance) * 2.0
        return mult, False
    else:
        # Completely submerged / swept-away danger
        return 50.0 + (water_depth_cm * 2.0), False


def calculate_damage_risk(damage_level: float, vehicle_type: str = "Ambulance") -> Tuple[float, bool]:
    """
    Road structural damage (scale 0-10): potholes, cracked overpasses, subsidence.
    """
    profile = VEHICLE_PROFILES.get(vehicle_type, VEHICLE_PROFILES["Ambulance"])
    max_tolerance = profile.get("max_damage_tolerance", 5.0)
    
    norm_damage = min(10.0, max(0.0, damage_level))
    if norm_damage <= 1.0:
        return 1.0, True
    
    # Exponential friction penalty as structural damage climbs
    damage_mult = 1.0 + (norm_damage / 10.0) ** 1.6 * 5.0
    passable = norm_damage <= max_tolerance
    
    if not passable:
        damage_mult *= 3.0
    
    return damage_mult, passable


def calculate_debris_risk(debris_level: float, vehicle_type: str = "Ambulance") -> Tuple[float, bool]:
    """
    Debris & fallen obstacles (scale 0-10): uprooted trees, fallen wires, concrete rubble.
    """
    profile = VEHICLE_PROFILES.get(vehicle_type, VEHICLE_PROFILES["Ambulance"])
    max_tolerance = profile.get("max_debris_tolerance", 4.0)
    
    norm_debris = min(10.0, max(0.0, debris_level))
    if norm_debris <= 1.0:
        return 1.0, True
    
    debris_mult = 1.0 + (norm_debris / 10.0) ** 1.5 * 4.5
    passable = norm_debris <= max_tolerance
    
    if not passable:
        debris_mult *= 2.5
        
    return debris_mult, passable


def calculate_hazard_risk(
    water_depth_cm: float,
    damage_level: float,
    debris_level: float,
    vehicle_type: str = "Ambulance"
) -> Dict[str, Any]:
    """
    Master hazard calculation combining water depth, road damage, and debris.
    Returns composite risk multiplier, effective transit speed, passability status, and grade.
    """
    water_mult, water_passable = calculate_water_risk(water_depth_cm, vehicle_type)
    damage_mult, damage_passable = calculate_damage_risk(damage_level, vehicle_type)
    debris_mult, debris_passable = calculate_debris_risk(debris_level, vehicle_type)
    
    # Combined multiplier compounding risk factors
    base_compound = water_mult * (damage_mult ** 0.8) * (debris_mult ** 0.8)
    
    is_passable = water_passable and damage_passable and debris_passable
    
    # If not passable, penalize heavily so router steers clear unless no alternative exists
    risk_multiplier = round(base_compound if is_passable else base_compound * 15.0, 3)
    
    # Grade assignment
    if not is_passable or risk_multiplier > 12.0:
        grade = "IMPASSABLE"
        color = "#e63946"  # Red
    elif risk_multiplier > 4.0:
        grade = "HAZARDOUS"
        color = "#f4a261"  # Orange
    elif risk_multiplier > 1.8:
        grade = "CAUTION"
        color = "#e9c46a"  # Yellow
    else:
        grade = "SAFE"
        color = "#2a9d8f"  # Green
        
    profile = VEHICLE_PROFILES.get(vehicle_type, VEHICLE_PROFILES["Ambulance"])
    effective_speed = max(5.0, profile["base_speed_kmh"] / math.sqrt(risk_multiplier))
    
    return {
        "risk_multiplier": risk_multiplier,
        "is_passable": is_passable,
        "grade": grade,
        "color": color,
        "effective_speed_kmh": round(effective_speed, 1),
        "components": {
            "water_multiplier": round(water_mult, 2),
            "water_passable": water_passable,
            "damage_multiplier": round(damage_mult, 2),
            "damage_passable": damage_passable,
            "debris_multiplier": round(debris_mult, 2),
            "debris_passable": debris_passable
        }
    }


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine formula to compute great circle distance in kilometers."""
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c
