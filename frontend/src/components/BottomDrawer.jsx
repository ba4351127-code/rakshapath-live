import React, { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ListOrdered, 
  Scale, 
  ShieldCheck, 
  FileText, 
  Check, 
  Send 
} from 'lucide-react';
import { createIncident } from '../services/api';

export default function BottomDrawer({
  routeData,
  selectedState,
  selectedDistrict,
  units,
  onIncidentReported
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('directions');

  // Form State for reporting incidents
  const [formTitle, setFormTitle] = useState('Waterlogging on Main Road');
  const [formType, setFormType] = useState('Flooding / Waterlogging');
  const [formSev, setFormSev] = useState('High');
  const [formWater, setFormWater] = useState(50);
  const [formDamage, setFormDamage] = useState(6.0);
  const [formDebris, setFormDebris] = useState(4.0);
  const [formDesc, setFormDesc] = useState('Rising water levels encroaching highway.');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
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
  const segments = safeCorridor?.segments || [];
  const recommendedUnits = routeData?.recommended_units || [];

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/80 shadow-2xl transition-all duration-300 pointer-events-auto flex flex-col ${
        isOpen ? 'h-80 sm:h-96' : 'h-11'
      }`}
    >
      {/* Drawer Top Tab Bar */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-slate-800 bg-slate-950/80">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { setActiveTab('directions'); setIsOpen(true); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'directions' && isOpen
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Step-by-Step Directions</span>
            {segments.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
                {segments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('comparison'); setIsOpen(true); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'comparison' && isOpen
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Route Safety Comparison</span>
          </button>

          <button
            onClick={() => { setActiveTab('units'); setIsOpen(true); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'units' && isOpen
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Nearby Rescue Vehicles & ETAs</span>
          </button>

          <button
            onClick={() => { setActiveTab('report'); setIsOpen(true); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'report' && isOpen
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Report Road Hazard</span>
          </button>
        </div>

        {/* Expand / Minimize Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
        >
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          <span className="hidden sm:inline">{isOpen ? 'Minimize' : 'View Analysis'}</span>
        </button>
      </div>

      {/* Drawer Content Area */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto p-4 text-xs text-slate-300">
          {/* TAB 1: DIRECTIONS */}
          {activeTab === 'directions' && (
            <div>
              <h3 className="font-bold text-white text-sm mb-3">
                Turn-by-Turn Safe Corridor ({segments.length} Road Segments)
              </h3>
              {segments.length === 0 ? (
                <p className="text-slate-400">No active route selected. Choose start and safe shelter to view waypoints.</p>
              ) : (
                <div className="space-y-2">
                  {segments.map((seg, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-[11px]">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-200">{seg.road_name}</div>
                          <div className="text-[11px] text-slate-400">
                            Distance: <strong className="text-slate-300">{seg.distance_km} km</strong> • Transit: <strong className="text-slate-300">{seg.transit_time_min} mins</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[11px] text-slate-400">Water Depth: <strong>{seg.water_depth_cm} cm</strong></div>
                          <div className="text-[11px] text-slate-400">Danger: <strong>{seg.risk_multiplier}x</strong></div>
                        </div>
                        <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                          {seg.grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMPARATIVE SAFETY ANALYTICS */}
          {activeTab === 'comparison' && (
            <div>
              <h3 className="font-bold text-white text-sm mb-3">
                Algorithmic Comparison: Risk-Weighted A* vs. Blocked Direct Road
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Safe Route Card */}
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-700/40 space-y-2">
                  <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                    <span>✅ RakshaPath Safe Route</span>
                  </h4>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Distance:</span>
                      <strong className="text-white">{safeCorridor?.total_distance_km || 0} km</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Average Danger Factor:</span>
                      <strong className="text-white">{safeCorridor?.average_risk_multiplier || 1.0}x</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Maximum Hazard Encountered:</span>
                      <strong className="text-white">{safeCorridor?.max_risk_multiplier || 1.0}x</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Est. Transit Time:</span>
                      <strong className="text-white">{safeCorridor?.estimated_transit_time_min || 0} mins</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Road Status:</span>
                      <strong className="text-emerald-400">
                        {safeCorridor?.is_fully_passable ? '✅ Fully Open & Safe' : '⚠️ Caution Advised'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Compromised Direct Road Card */}
                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-700/40 space-y-2">
                  <h4 className="font-bold text-rose-400 text-sm flex items-center gap-2">
                    <span>❌ Blocked Direct Road</span>
                  </h4>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Distance:</span>
                      <strong className="text-white">{shortestNaive?.total_distance_km || 0} km</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Average Danger Factor:</span>
                      <strong className="text-white">{shortestNaive?.average_risk_multiplier || 1.0}x</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Maximum Hazard Encountered:</span>
                      <strong className="text-white">{shortestNaive?.max_risk_multiplier || 1.0}x</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Est. Transit Time:</span>
                      <strong className="text-white">{shortestNaive?.estimated_transit_time_min || 0} mins</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Road Status:</span>
                      <strong className="text-rose-400">
                        {shortestNaive?.is_fully_passable ? 'Passable' : '❌ Impassable due to Water / Damage'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RESCUE UNITS */}
          {activeTab === 'units' && (
            <div>
              <h3 className="font-bold text-white text-sm mb-3">
                Nearby Available Rescue Vehicles ({selectedState})
              </h3>
              {recommendedUnits.length > 0 ? (
                <div className="space-y-2">
                  {recommendedUnits.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white">
                          🚑 {item.unit.name} <span className="text-slate-400 text-xs">({item.unit.unit_type})</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Water Clearance Limit: <strong>{item.unit.water_clearance_cm} cm</strong> • Contact Line: <code>{item.unit.contact}</code>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-400">{item.distance_to_target_km} km</div>
                        <div className="text-[11px] text-slate-400">ETA: {item.eta_minutes} mins</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {units.map((u, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white">🚑 {u.name}</div>
                        <div className="text-[11px] text-slate-400">
                          Asset: {u.unit_type} • District: {u.district} • Contact: {u.contact}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        {u.status || 'Available'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REPORT ROAD HAZARD FORM */}
          {activeTab === 'report' && (
            <div className="max-w-2xl">
              <h3 className="font-bold text-white text-sm mb-2">Report a Road Problem (Flooding, Landslide, Fallen Trees)</h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Your report logs directly into the RakshaPath emergency registry to alert other responders and reroute mobility corridors.
              </p>

              {submitSuccess && (
                <div className="mb-3 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Thank you! Your road problem report has been submitted to assist citizens and rescue teams.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Problem Title</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Problem Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="Flooding / Waterlogging">Flooding / Waterlogging</option>
                      <option value="Landslide / Rockfall">Landslide / Rockfall</option>
                      <option value="Debris & Fallen Trees">Debris & Fallen Trees</option>
                      <option value="Bridge Blocked / Damaged">Bridge Blocked / Damaged</option>
                      <option value="Electrical Hazard">Electrical Hazard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Water Depth (cm)</label>
                    <input
                      type="number"
                      min="0"
                      value={formWater}
                      onChange={(e) => setFormWater(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Road Damage (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={formDamage}
                      onChange={(e) => setFormDamage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Debris Level (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={formDebris}
                      onChange={(e) => setFormDebris(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Details & Road Description</label>
                  <textarea
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting Report...' : 'Send Incident Report'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
