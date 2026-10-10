// API Service Client for RakshaPath FastAPI Backend

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function fetchStates() {
  try {
    const res = await fetch(`${API_BASE}/api/states`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API error fetchStates:', err);
  }
  return {
    "Delhi NCR": ["Central Delhi", "South Delhi", "Mayur Vihar", "Rohini", "Dwarka"],
    "Uttar Pradesh": ["Lucknow", "Agra", "Varanasi", "Kanpur", "Prayagraj", "Greater Noida"],
    "Uttarakhand": ["Dehradun", "Rishikesh", "Haridwar", "Chamoli", "Kedarnath Valley"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
    "Bihar": ["Patna"],
    "West Bengal": ["Kolkata", "Howrah"],
    "Assam": ["Guwahati"],
    "Gujarat": ["Ahmedabad", "Gandhinagar"]
  };
}

export async function fetchNodes(state = '') {
  try {
    const url = state ? `${API_BASE}/api/nodes?state=${encodeURIComponent(state)}` : `${API_BASE}/api/nodes`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API error fetchNodes:', err);
  }
  return [];
}

export async function fetchShelters(state = '', district = '') {
  try {
    let url = `${API_BASE}/api/shelters`;
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    if (district && district !== 'All Districts') params.append('district', district);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API error fetchShelters:', err);
  }
  return [];
}

export async function fetchHazards(state = '') {
  try {
    const url = state ? `${API_BASE}/api/hazards?state=${encodeURIComponent(state)}` : `${API_BASE}/api/hazards`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API error fetchHazards:', err);
  }
  return [];
}

export async function fetchUnits(state = '') {
  try {
    const url = state ? `${API_BASE}/api/units?state=${encodeURIComponent(state)}` : `${API_BASE}/api/units`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API error fetchUnits:', err);
  }
  return [];
}

export async function searchLocations(query, state = '') {
  try {
    let url = `${API_BASE}/api/search?q=${encodeURIComponent(query)}`;
    if (state) url += `&state=${encodeURIComponent(state)}`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API error searchLocations:', err);
  }
  return [];
}

export async function findNearestNode(lat, lon, state = null) {
  try {
    const res = await fetch(`${API_BASE}/api/nearest-node`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lon, state })
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API error findNearestNode:', err);
  }
  return null;
}

export async function evaluateHazardRisk(waterDepth, damage, debris, vehicleType) {
  try {
    const res = await fetch(`${API_BASE}/api/hazards/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        water_depth_cm: Number(waterDepth),
        damage_level: Number(damage),
        debris_level: Number(debris),
        vehicle_type: vehicleType
      })
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API error evaluateHazardRisk:', err);
  }
  return {
    risk_multiplier: 1.0,
    grade: 'SAFE',
    color: '#10b981',
    is_passable: true,
    effective_speed_kmh: 50.0
  };
}

export async function calculateRoute(source, target, vehicleType, waterDepth, damage, debris) {
  try {
    const res = await fetch(`${API_BASE}/api/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source,
        target,
        vehicle_type: vehicleType,
        override_water_depth_cm: Number(waterDepth),
        override_damage_level: Number(damage),
        override_debris_level: Number(debris)
      })
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('API error calculateRoute:', err);
  }
  return null;
}

export async function createIncident(incidentData) {
  try {
    const res = await fetch(`${API_BASE}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidentData)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('API error createIncident:', err);
  }
  return null;
}

export async function resetNetworkGrid() {
  try {
    const res = await fetch(`${API_BASE}/api/reset-network`, { method: 'POST' });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API error resetNetworkGrid:', err);
  }
  return null;
}
