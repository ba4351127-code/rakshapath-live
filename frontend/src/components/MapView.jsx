import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const STATE_CENTERS = {
  'Delhi NCR': [28.6200, 77.2300],
  'Uttar Pradesh': [26.8500, 80.9500],
  'Uttarakhand': [30.1500, 78.3500],
  'Maharashtra': [19.0500, 72.8800],
  'Bihar': [25.6000, 85.1400],
  'West Bengal': [22.5700, 88.3600],
  'Assam': [26.1550, 91.7500],
  'Gujarat': [23.0300, 72.5800]
};

export default function MapView({
  nodes,
  hazards,
  units,
  routeData,
  selectedOrigin,
  selectedDest,
  selectedState
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    markers: null,
    hazards: null,
    units: null,
    safeRoute: null,
    blockedRoute: null
  });

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter = STATE_CENTERS[selectedState] || [28.6139, 77.2090];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 11,
        zoomControl: false
      });

      // Standard OpenStreetMap Tiles (100% free, no watermark)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Add Zoom Control to Bottom-Right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Initialize layer groups
      layersRef.current.markers = L.layerGroup().addTo(map);
      layersRef.current.hazards = L.layerGroup().addTo(map);
      layersRef.current.units = L.layerGroup().addTo(map);
      layersRef.current.safeRoute = L.layerGroup().addTo(map);
      layersRef.current.blockedRoute = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      // Handle Resize smoothly
      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Pan to State Center when Selected State Changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedState) return;

    if (!routeData) {
      const center = STATE_CENTERS[selectedState] || [28.6139, 77.2090];
      const zoom = selectedState === 'Uttarakhand' ? 9 : 11;
      map.setView(center, zoom, { animate: true });
    }
  }, [selectedState, routeData]);

  // Update Infrastructure Nodes & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.markers) return;

    layersRef.current.markers.clearLayers();

    nodes.forEach((node) => {
      const isOrigin = node.id === selectedOrigin;
      const isDest = node.id === selectedDest;

      let markerColor = '#64748b'; // default slate
      let iconSymbol = '📍';

      if (isOrigin) {
        markerColor = '#0284c7'; // Sky Blue
        iconSymbol = '🚩';
      } else if (isDest) {
        markerColor = '#10b981'; // Emerald Green
        iconSymbol = '🏁';
      } else if (node.category === 'Hospital') {
        markerColor = '#ef4444'; // Red
        iconSymbol = '🏥';
      } else if (node.category === 'NDRF Base') {
        markerColor = '#1e40af'; // Blue
        iconSymbol = '🛡️';
      } else if (node.category === 'Relief Shelter') {
        markerColor = '#8b5cf6'; // Purple
        iconSymbol = '⛺';
      } else if (node.category === 'Helipad') {
        markerColor = '#06b6d4'; // Cyan
        iconSymbol = '🚁';
      }

      const customHtml = `
        <div style="
          background-color: ${markerColor};
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);
          font-size: 13px;
        ">
          ${iconSymbol}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-hub-icon',
        html: customHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      });

      const marker = L.marker([node.lat, node.lon], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: inherit;">
          <strong style="color: #ffffff; font-size: 13px;">${node.name}</strong><br/>
          <span style="color: #94a3b8; font-size: 11px;">Category: <strong>${node.category || 'Emergency Hub'}</strong></span><br/>
          <span style="color: #94a3b8; font-size: 11px;">District: ${node.district || 'N/A'}, ${node.state || ''}</span>
        </div>
      `);
      marker.addTo(layersRef.current.markers);
    });
  }, [nodes, selectedOrigin, selectedDest]);

  // Update Hazard Incidents
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.hazards) return;

    layersRef.current.hazards.clearLayers();

    hazards.forEach((inc) => {
      const circle = L.circleMarker([inc.lat, inc.lon], {
        radius: 14,
        fillColor: '#e11d48',
        color: '#f43f5e',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.45
      });

      circle.bindPopup(`
        <div style="font-family: inherit;">
          <strong style="color: #f43f5e; font-size: 13px;">🚨 ${inc.title}</strong><br/>
          <span style="color: #cbd5e1; font-size: 11px;">Type: <strong>${inc.incident_type}</strong> | Severity: <strong>${inc.severity}</strong></span><br/>
          <span style="color: #cbd5e1; font-size: 11px;">Water Depth: <strong>${inc.water_depth_cm} cm</strong></span><br/>
          <span style="color: #cbd5e1; font-size: 11px;">Road Damage: <strong>${inc.damage_level}/10</strong> | Debris: <strong>${inc.debris_level}/10</strong></span><br/>
          <em style="color: #94a3b8; font-size: 10px;">${inc.description || ''}</em>
        </div>
      `);
      circle.addTo(layersRef.current.hazards);
    });
  }, [hazards]);

  // Update Dispatched Rescue Fleet Units
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.units) return;

    layersRef.current.units.clearLayers();

    units.forEach((u) => {
      const unitHtml = `
        <div style="
          background-color: #065f46;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #34d399;
          box-shadow: 0 4px 6px rgba(0,0,0,0.4);
          font-size: 11px;
        ">
          🚑
        </div>
      `;

      const unitIcon = L.divIcon({
        className: 'custom-unit-icon',
        html: unitHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const m = L.marker([u.lat, u.lon], { icon: unitIcon });
      m.bindPopup(`
        <div>
          <strong style="color: #34d399;">🚑 ${u.name}</strong><br/>
          <span style="font-size: 11px; color: #94a3b8;">Asset: ${u.unit_type}</span><br/>
          <span style="font-size: 11px; color: #94a3b8;">Max Wading: ${u.water_clearance_cm} cm</span><br/>
          <span style="font-size: 11px; color: #94a3b8;">Contact: <code>${u.contact}</code></span>
        </div>
      `);
      m.addTo(layersRef.current.units);
    });
  }, [units]);

  // Update Route Polylines & Fit Bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersRef.current.safeRoute || !layersRef.current.blockedRoute) return;

    layersRef.current.safeRoute.clearLayers();
    layersRef.current.blockedRoute.clearLayers();

    if (!routeData) return;

    const allRoutePoints = [];

    // 1. Blocked Direct Route (Red Dashed) if Detour Advised
    if (routeData.is_detour_advised && routeData.shortest_naive?.waypoints) {
      const blockedCoords = routeData.shortest_naive.waypoints.map((wp) => [wp.lat, wp.lon]);
      if (blockedCoords.length > 1) {
        L.polyline(blockedCoords, {
          color: '#dc2626',
          weight: 4,
          opacity: 0.75,
          dashArray: '8, 8'
        }).bindTooltip('⚠️ Compromised Direct Road (Submerged / Blocked)').addTo(layersRef.current.blockedRoute);
        allRoutePoints.push(...blockedCoords);
      }
    }

    // 2. Recommended Safe Corridor (High Visibility Emerald Polyline)
    if (routeData.safe_corridor?.waypoints) {
      const safeCoords = routeData.safe_corridor.waypoints.map((wp) => [wp.lat, wp.lon]);
      if (safeCoords.length > 1) {
        L.polyline(safeCoords, {
          color: '#059669',
          weight: 6,
          opacity: 0.95
        }).bindTooltip('✅ RakshaPath Recommended Safe Route').addTo(layersRef.current.safeRoute);
        allRoutePoints.push(...safeCoords);
      }
    }

    // Pan & Fit bounds
    if (allRoutePoints.length > 0) {
      const bounds = L.latLngBounds(allRoutePoints);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [routeData]);

  return <div ref={mapContainerRef} className="w-full h-full relative" />;
}
