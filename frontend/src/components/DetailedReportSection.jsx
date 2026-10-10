import React, { useState } from 'react';
import { 
  Route, 
  Clock, 
  AlertOctagon, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Navigation, 
  ListOrdered, 
  Scale, 
  Truck, 
  FileText, 
  Send, 
  Info,
  MapPin,
  Check
} from 'lucide-react';
import { createIncident } from '../services/api';

export default function DetailedReportSection({
  routeData,
  vehicleType,
  waterDepth,
  damageLevel,
  debrisLevel,
  selectedState,
  selectedDistrict,
  units,
  onIncidentReported,
  userRole
}) {
  const [activeTab, setActiveTab] = useState('directions');

  // Incident reporting form state
  const [formTitle, setFormTitle] = useState('Waterlogging on Main Road');
  const [formType, setFormType] = useState('Flooding / Waterlogging');
  const [formSev, setFormSev] = useState('High');
  const [formWater, setFormWater] = useState(waterDepth || 50);
  const [formDamage, setFormDamage] = useState(damageLevel || 5.0);
  const [formDebris, setFormDebris] = useState(debrisLevel || 4.0);
  const [formDesc, setFormDesc] = useState('Rising water levels encroaching highway corridor.');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newInc = {
      title: formTitle,
      incident_type: formType,
      severity: formSev,
      state: selectedState,
      district: selectedDistrict !== 'All Districts' ? selectedDistrict : 'Sector Zone',
      lat: routeData?.source?.lat || 28.6139,
      lon: routeData?.source?.lon || 77.2090,
      water_depth_cm: Number(formWater),
      damage_level: Number(formDamage),
      debris_level: Number(formDebris),
      description: formDesc
    };
    await createIncident(newInc);
    setIsSubmitting(false);
    setSubmitSuccess(true);
    if (onIncidentReported) onIncidentReported();
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  const safeCorridor = routeData?.safe_corridor;
  const shortestNaive = routeData?.shortest_naive;
  const isDetourAdvised = routeData?.is_detour_advised;
  const segments = safeCorridor?.segments || [];
  const recommendedUnits = routeData?.recommended_units || [];

  // Computed metric comparisons
  const safeDistance = safeCorridor ? safeCorridor.total_distance_km : 0;
  const naiveDistance = shortestNaive ? shortestNaive.total_distance_km : safeDistance;
  const detourDiff = Number((safeDistance - naiveDistance).toFixed(2));
  const safeRisk = safeCorridor ? safeCorridor.average_risk_multiplier : 1.0;
  const naiveRisk = shortestNaive ? shortestNaive.average_risk_multiplier : safeRisk;
  const riskSaved = Number((naiveRisk - safeRisk).toFixed(1));
  const transitTime = safeCorridor ? safeCorridor.estimated_transit_time_min : 0;
  const isPassable = safeCorridor ? safeCorridor.is_fully_passable : true;

  // Grade calculation
  const getSafetyGrade = () => {
    if (!safeCorridor) return 'Pending';
    if (safeRisk <= 1.5 && isPassable) return 'Grade A (Optimal Safe)';
    if (safeRisk <= 2.5 && isPassable) return 'Grade B (Elevated Caution)';
    if (isPassable) return 'Grade C (Moderate Risk)';
    return 'Grade D (Impassable / High Water)';
  };

  // Generate dynamic situational hazard mitigation advisory
  const getHazardMitigationNotes = () => {
    const notes = [];
    
    // Water depth analysis
    if (waterDepth <= 20) {
      notes.push(`Water Level Nominal: At ${waterDepth} cm, surface water depth is minimal and safe for standard transit.`);
    } else if (waterDepth <= 50) {
      notes.push(`Moderate Waterlogging: At ${waterDepth} cm, passenger sedans face engine stalling risk. Recommended for ${vehicleType} with elevated ground clearance.`);
    } else if (waterDepth <= 80) {
      notes.push(`Severe Flooding Alert: ${waterDepth} cm water detected along low-lying underpasses. Standard civilian vehicles must divert immediately; only heavy rescue units or high-chassis 4x4 vehicles can navigate safely.`);
    } else {
      notes.push(`Critical Submergence: ${waterDepth} cm water depth exceeds normal roadway limits. Amphibious flood boats or high-water tactical trucks required for safe extraction.`);
    }

    // Structural damage & debris
    if (damageLevel >= 5.0 || debrisLevel >= 5.0) {
      notes.push(`Road Surface & Obstruction Advisory: Road structural damage is rated at ${damageLevel}/10 and debris at ${debrisLevel}/10. Drive below 30 km/h and watch for fallen trees or fractured road margins.`);
    } else {
      notes.push(`Structural Road Status: Road surface integrity is stable (${damageLevel}/10 damage, ${debrisLevel}/10 debris index).`);
    }

    // Detour guidance
    if (isDetourAdvised) {
      notes.push(`Detour Guidance: The direct shortest route crosses severe hazard chokepoints (${naiveRisk}x risk score). RakshaPath algorithm routed an elevated safe detour (+${detourDiff} km) saving ${riskSaved}x risk exposure.`);
    } else {
      notes.push(`Corridor Status: Primary safe evacuation corridor is clear with no high-risk obstructions requiring detour.`);
    }

    return notes;
  };

  return (
    <section className="w-full bg-slate-900 border-t border-slate-800 p-4 sm:p-6 space-y-6 text-slate-100">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400"></div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Detailed Incident & Route Report
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time corridor telemetry, hazard mitigation assessment, and multi-agency response metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
            Role: <strong className="text-sky-400">{userRole || 'Citizen'}</strong>
          </span>
          {safeCorridor && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isPassable 
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isPassable ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
              {isPassable ? 'Passable Corridor' : 'Caution Advised'}
            </span>
          )}
        </div>
      </div>

      {/* STAGE 3.1: PROMINENT TELEMETRY METRICS GRID */}
      {safeCorridor ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Safe Distance */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Safe Corridor Distance
              </span>
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                <Route className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white tracking-tight">
                {safeDistance} <span className="text-sm font-semibold text-slate-400">km</span>
              </div>
              <div className="text-xs mt-1 text-slate-400">
                {isDetourAdvised ? (
                  <span className="text-amber-400 font-semibold">+{detourDiff} km safe detour</span>
                ) : (
                  <span className="text-emerald-400 font-semibold">Direct clear corridor</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Estimated Transit Time */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Estimated Transit Time
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white tracking-tight">
                {transitTime} <span className="text-sm font-semibold text-slate-400">mins</span>
              </div>
              <div className="text-xs mt-1 text-slate-400 truncate">
                Based on <strong className="text-slate-200">{vehicleType}</strong> speed
              </div>
            </div>
          </div>

          {/* Card 3: Hazard Risk Multiplier */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Risk Multiplier
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <AlertOctagon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white tracking-tight">
                {safeRisk}x
              </div>
              <div className="text-xs mt-1 text-slate-400">
                {isDetourAdvised && riskSaved > 0 ? (
                  <span className="text-emerald-400 font-semibold">-{riskSaved}x risk avoided</span>
                ) : (
                  <span className="text-slate-400">Baseline safety index</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 4: Corridor Safety Grade */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Corridor Safety Grade
              </span>
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                isPassable 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight truncate">
                {getSafetyGrade()}
              </div>
              <div className="text-xs mt-1 font-semibold">
                {isPassable ? (
                  <span className="text-emerald-400">● 100% Passable for {vehicleType}</span>
                ) : (
                  <span className="text-rose-400">● Extreme Caution / Wading Alert</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
          <Navigation className="w-8 h-8 text-sky-400 mx-auto animate-pulse" />
          <h3 className="text-sm font-bold text-white">No Corridor Calculated Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Choose your starting location and safe shelter on the left, adjust road danger sliders, and click <strong>"Calculate Safe Evacuation Route"</strong>.
          </p>
        </div>
      )}

      {/* STAGE 3.2: HAZARD MITIGATION NOTES & STRATEGIC ADVISORY */}
      {safeCorridor && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <Info className="w-4 h-4" />
            <span>Hazard Mitigation Notes & Operational Advisory</span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            {getHazardMitigationNotes().map((note, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-sky-400 font-bold">•</span>
                <span className="leading-relaxed">{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAGE 3.3: DETAILED TABS (DIRECTIONS, COMPARISON, FLEET, REPORT HAZARD) */}
      <div className="space-y-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('directions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'directions'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Step-by-Step Directions</span>
            {segments.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-bold">
                {segments.length} steps
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'comparison'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Route Safety Comparison</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('units')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'units'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Nearby Rescue Vehicles</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-bold">
              {recommendedUnits.length || units.length} active
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'report'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>Report Road Hazard</span>
          </button>
        </div>

        {/* Tab Content 1: Step-by-Step Directions */}
        {activeTab === 'directions' && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Turn-by-Turn Safe Corridor Waypoints
            </h3>
            {segments.length === 0 ? (
              <p className="text-xs text-slate-400">
                No route waypoints calculated yet. Click "Calculate Safe Evacuation Route" in the sidebar.
              </p>
            ) : (
              <div className="space-y-2">
                {segments.map((seg, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-sky-500/15 text-sky-400 font-bold flex items-center justify-center text-[11px] flex-shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {seg.from_node} → {seg.to_node}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Corridor segment distance: {seg.distance_km} km
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        seg.segment_risk_multiplier <= 1.5 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : seg.segment_risk_multiplier <= 3.0
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {seg.segment_risk_multiplier}x Risk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content 2: Route Safety Comparison */}
        {activeTab === 'comparison' && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Corridor Comparison: Safe RakshaPath vs Direct Blocked Route
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2 px-3">Metric Parameter</th>
                    <th className="py-2 px-3 text-emerald-400 font-bold">RakshaPath Safe Corridor</th>
                    <th className="py-2 px-3 text-rose-400 font-bold">Direct Blocked Shortest Path</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-slate-400">Total Distance</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-300">{safeDistance} km</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-300">{naiveDistance} km</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-slate-400">Estimated Transit Time</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-300">{transitTime} mins</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {shortestNaive?.estimated_transit_time_min ? `${shortestNaive.estimated_transit_time_min} mins` : 'Severely Delayed'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-slate-400">Hazard Risk Multiplier</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-300">{safeRisk}x (Secured)</td>
                    <td className="py-2.5 px-3 font-bold text-rose-400">{naiveRisk}x (Extreme Danger)</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-slate-400">Submerged Chokepoints Avoided</td>
                    <td className="py-2.5 px-3 text-emerald-300 font-semibold">
                      {isDetourAdvised ? 'All Waterlogged Intersections Cleared' : 'None Detected on Route'}
                    </td>
                    <td className="py-2.5 px-3 text-rose-400 font-semibold">Crosses Active High-Water Zone</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-slate-400">Overall Transit Verdict</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        RECOMMENDED SAFE CORRIDOR
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                        HAZARDOUS / DO NOT ENTER
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content 3: Nearby Rescue Vehicles */}
        {activeTab === 'units' && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Active Regional Emergency Response Fleet
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {(recommendedUnits.length > 0 ? recommendedUnits : units).slice(0, 6).map((unit, idx) => (
                <div
                  key={unit.id || idx}
                  className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white">{unit.name || unit.id}</div>
                      <div className="text-[11px] text-slate-400">
                        {unit.unit_type || 'Rescue Unit'} • {unit.base_station || 'Sector Hub'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {unit.status || 'Active Ready'}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      Speed: {unit.speed_kmh || 50} km/h
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 4: Report Road Hazard Form */}
        {activeTab === 'report' && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Report Real-Time Road Danger / Blockage
                </h3>
                <p className="text-[11px] text-slate-400">
                  Submitted incidents instantly update the national A* routing engine for all citizens and responders.
                </p>
              </div>
              <span className="text-[11px] text-sky-400 font-semibold">Sector: {selectedState}</span>
            </div>

            {submitSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Road hazard incident successfully logged! Network routing recalculating live corridors.</span>
              </div>
            )}

            <form onSubmit={handleSubmitIncident} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Incident Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Problem Category</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Flooding / Waterlogging">Flooding / Waterlogging</option>
                  <option value="Road Structural Damage">Road Structural Damage</option>
                  <option value="Tree / Debris Obstruction">Tree / Debris Obstruction</option>
                  <option value="Bridge Submerged">Bridge Submerged</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Water Depth (cm): {formWater} cm</label>
                <input
                  type="range"
                  min="0"
                  max="140"
                  value={formWater}
                  onChange={(e) => setFormWater(Number(e.target.value))}
                  className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Damage Level (0-10): {formDamage}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={formDamage}
                  onChange={(e) => setFormDamage(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-400 mb-1">Detailed Description & Landmark Notes</label>
                <textarea
                  rows="2"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
                  placeholder="Provide precise street names, nearby hospitals, or water level observations..."
                  required
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Submit Hazard to Network</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
