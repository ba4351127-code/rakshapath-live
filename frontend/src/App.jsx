import React, { useState, useEffect, useCallback } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MapView from './components/MapView';
import DetailedReportSection from './components/DetailedReportSection';
import { 
  fetchStates, 
  fetchNodes, 
  fetchShelters, 
  fetchHazards, 
  fetchUnits, 
  findNearestNode, 
  evaluateHazardRisk, 
  calculateRoute, 
  resetNetworkGrid 
} from './services/api';

export default function App() {
  // STAGE 1: User Role & Onboarding State (null shows Welcome Screen)
  const [userRole, setUserRole] = useState(null);

  // Navigation & Hierarchy State
  const [statesData, setStatesData] = useState({});
  const [selectedState, setSelectedState] = useState('Delhi NCR');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');

  // Network Nodes & Selection
  const [allNodes, setAllNodes] = useState([]);
  const [originNodes, setOriginNodes] = useState([]);
  const [destNodes, setDestNodes] = useState([]);
  const [selectedOrigin, setSelectedOrigin] = useState('DEL_HQ');
  const [selectedDest, setSelectedDest] = useState('DEL_MAYUR_SHELTER');

  // Vehicle Profile
  const [vehicleType, setVehicleType] = useState('Ambulance');

  // Physical Hazard Calibration Sliders
  const [waterDepth, setWaterDepth] = useState(45);
  const [damageLevel, setDamageLevel] = useState(4.0);
  const [debrisLevel, setDebrisLevel] = useState(3.5);
  const [hazardEvaluation, setHazardEvaluation] = useState(null);

  // Active Incidents & Fleet
  const [hazards, setHazards] = useState([]);
  const [units, setUnits] = useState([]);

  // Computed Corridor Telemetry
  const [routeData, setRouteData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // 1. Initial Load: States, Districts, Hazards, Units
  useEffect(() => {
    async function initData() {
      const sData = await fetchStates();
      setStatesData(sData);
      const hList = await fetchHazards();
      setHazards(hList);
      const uList = await fetchUnits();
      setUnits(uList);
    }
    initData();
  }, []);

  // 2. Fetch Nodes & Shelters when State / District changes
  useEffect(() => {
    async function loadSectorNodes() {
      const nodes = await fetchNodes(selectedState);
      setAllNodes(nodes);

      // Filter Origins
      let filteredOrigins = nodes;
      if (selectedDistrict !== 'All Districts') {
        filteredOrigins = nodes.filter((n) => n.district === selectedDistrict);
        if (filteredOrigins.length === 0) filteredOrigins = nodes;
      }
      setOriginNodes(filteredOrigins);

      // Ensure valid origin selected
      if (!filteredOrigins.some((n) => n.id === selectedOrigin)) {
        if (filteredOrigins.length > 0) setSelectedOrigin(filteredOrigins[0].id);
      }

      // Fetch Dest Shelters
      const shelters = await fetchShelters(selectedState, selectedDistrict);
      const validDest = shelters.length > 0 ? shelters : nodes;
      setDestNodes(validDest);

      // Ensure valid destination selected
      if (!validDest.some((n) => n.id === selectedDest)) {
        const fallbackDest = validDest.find((n) => n.id !== selectedOrigin) || validDest[0];
        if (fallbackDest) setSelectedDest(fallbackDest.id);
      }
    }
    loadSectorNodes();
  }, [selectedState, selectedDistrict]);

  // 3. Evaluate Hazard Multiplier whenever sliders or vehicle changes
  useEffect(() => {
    async function updateHazardEval() {
      const evalResult = await evaluateHazardRisk(waterDepth, damageLevel, debrisLevel, vehicleType);
      setHazardEvaluation(evalResult);
    }
    updateHazardEval();
  }, [waterDepth, damageLevel, debrisLevel, vehicleType]);

  // 4. Compute Route Corridor Function
  const computeRoute = useCallback(async () => {
    if (!selectedOrigin || !selectedDest) return;
    setIsCalculating(true);
    const data = await calculateRoute(
      selectedOrigin,
      selectedDest,
      vehicleType,
      waterDepth,
      damageLevel,
      debrisLevel
    );
    if (data && data.success) {
      setRouteData(data);
    }
    setIsCalculating(false);
  }, [selectedOrigin, selectedDest, vehicleType, waterDepth, damageLevel, debrisLevel]);

  // Run initial route calculation once nodes are ready
  useEffect(() => {
    if (selectedOrigin && selectedDest) {
      computeRoute();
    }
  }, [selectedOrigin, selectedDest]);

  // Quick Metropolitan City Selection
  const handleSelectCity = (city) => {
    setSelectedState(city.state);
    setSelectedDistrict(city.district);
    setSelectedOrigin(city.node);
  };

  // 1-Click Device Location Resolution
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const nearest = await findNearestNode(latitude, longitude);
        if (nearest) {
          if (nearest.state) setSelectedState(nearest.state);
          if (nearest.district) setSelectedDistrict(nearest.district);
          setSelectedOrigin(nearest.id);
        }
      },
      async (err) => {
        console.warn('Geolocation fallback to default hub:', err);
        const nearest = await findNearestNode(28.6139, 77.2090);
        if (nearest) {
          setSelectedOrigin(nearest.id);
          setSelectedState(nearest.state || 'Delhi NCR');
        }
      }
    );
  };

  // Simulate Instant Flood Chokepoint Surge
  const handleSimulateFlood = () => {
    setWaterDepth(85);
  };

  // Set Origin from Autocomplete Search Result
  const handleSelectSearchNode = (node) => {
    if (node.state) setSelectedState(node.state);
    if (node.district) setSelectedDistrict(node.district);
    setSelectedOrigin(node.id);
  };

  // Reset Form to Baseline
  const handleResetForm = async () => {
    setWaterDepth(20);
    setDamageLevel(2.0);
    setDebrisLevel(1.5);
    setVehicleType('Ambulance');
    await resetNetworkGrid();
    const hList = await fetchHazards(selectedState);
    setHazards(hList);
    computeRoute();
  };

  // Refresh hazards after reporting
  const handleIncidentReported = async () => {
    const hList = await fetchHazards(selectedState);
    setHazards(hList);
    computeRoute();
  };

  // STAGE 1: Render Welcome Screen if no role has been chosen yet
  if (!userRole) {
    return (
      <div className="min-h-screen h-auto overflow-y-auto pb-20 w-full bg-slate-950 font-sans text-slate-100">
        <WelcomeScreen 
          onSelectRole={(role) => setUserRole(role)} 
        />
      </div>
    );
  }

  // STAGE 2 & STAGE 3: Main Dashboard Layout
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* STAGE 2 (LEFT): Scrollable Sidebar Control Panel */}
      <Sidebar
        statesData={statesData}
        selectedState={selectedState}
        onStateChange={(st) => { setSelectedState(st); setSelectedDistrict('All Districts'); }}
        selectedDistrict={selectedDistrict}
        onDistrictChange={(dist) => setSelectedDistrict(dist)}
        originNodes={originNodes}
        selectedOrigin={selectedOrigin}
        onOriginChange={(id) => setSelectedOrigin(id)}
        destNodes={destNodes}
        selectedDest={selectedDest}
        onDestChange={(id) => setSelectedDest(id)}
        vehicleType={vehicleType}
        onVehicleChange={(v) => setVehicleType(v)}
        waterDepth={waterDepth}
        onWaterDepthChange={(val) => setWaterDepth(val)}
        damageLevel={damageLevel}
        onDamageLevelChange={(val) => setDamageLevel(val)}
        debrisLevel={debrisLevel}
        onDebrisLevelChange={(val) => setDebrisLevel(val)}
        hazardEvaluation={hazardEvaluation}
        onCalculateRoute={computeRoute}
        isCalculating={isCalculating}
        onResetForm={handleResetForm}
        userRole={userRole}
        onSwitchRole={() => setUserRole(null)}
      />

      {/* STAGE 2 (RIGHT) & STAGE 3: Main Content Area (Header + Map + Dedicated Report Section Below Map) */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-950 relative">
        {/* Top Header Search, Quick Jumpers, Role Controls */}
        <Header
          selectedState={selectedState}
          onSelectCity={handleSelectCity}
          onUseLocation={handleUseLocation}
          onSimulateFlood={handleSimulateFlood}
          onSelectSearchNode={handleSelectSearchNode}
          userRole={userRole}
          onSwitchRole={() => setUserRole(null)}
        />

        {/* STAGE 2: Interactive Leaflet Map Canvas */}
        <div className="w-full h-[420px] lg:h-[480px] shrink-0 relative border-b border-slate-800">
          <MapView
            nodes={allNodes}
            hazards={hazards}
            units={units}
            routeData={routeData}
            selectedOrigin={selectedOrigin}
            selectedDest={selectedDest}
            selectedState={selectedState}
          />
        </div>

        {/* STAGE 3: Prominent Detailed Incident & Route Report Section directly underneath the map */}
        <DetailedReportSection
          routeData={routeData}
          vehicleType={vehicleType}
          waterDepth={waterDepth}
          damageLevel={damageLevel}
          debrisLevel={debrisLevel}
          selectedState={selectedState}
          selectedDistrict={selectedDistrict}
          units={units}
          onIncidentReported={handleIncidentReported}
          userRole={userRole}
        />
      </main>
    </div>
  );
}
