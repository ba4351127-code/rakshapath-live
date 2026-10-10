import React from 'react';
import { Route, Clock, AlertOctagon, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function TelemetryCards({ routeData, vehicleType }) {
  if (!routeData || !routeData.safe_corridor) {
    return (
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span>No evacuation corridor calculated yet. Click <strong>"Calculate Safe Evacuation Route"</strong> on the left.</span>
      </div>
    );
  }

  const { safe_corridor, shortest_naive, is_detour_advised, safety_status } = routeData;
  const naiveDist = shortest_naive?.total_distance_km || safe_corridor.total_distance_km;
  const detourDiff = Number((safe_corridor.total_distance_km - naiveDist).toFixed(2));
  const naiveRisk = shortest_naive?.average_risk_multiplier || 1.0;
  const riskSaved = Number((naiveRisk - safe_corridor.average_risk_multiplier).toFixed(1));

  return (
    <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-col gap-2 z-10 shadow-sm">
      {/* 4 Route Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* Distance Card */}
        <div className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 flex-shrink-0">
            <Route className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Distance</div>
            <div className="text-base font-bold text-white tracking-tight">{safe_corridor.total_distance_km} km</div>
            <div className="text-[10px] text-slate-400 truncate">
              {is_detour_advised ? `+${detourDiff} km detour` : 'Direct corridor'}
            </div>
          </div>
        </div>

        {/* Travel Time Card */}
        <div className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Estimated Transit Time</div>
            <div className="text-base font-bold text-white tracking-tight">{safe_corridor.estimated_transit_time_min} mins</div>
            <div className="text-[10px] text-slate-400 truncate">{vehicleType} profile</div>
          </div>
        </div>

        {/* Danger Multiplier Card */}
        <div className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex-shrink-0">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Risk Multiplier</div>
            <div className="text-base font-bold text-white tracking-tight">{safe_corridor.average_risk_multiplier}x</div>
            <div className="text-[10px] text-emerald-400 truncate">
              {is_detour_advised ? `-${riskSaved}x vs blocked path` : 'Normal baseline'}
            </div>
          </div>
        </div>

        {/* Safety Grade Status Card */}
        <div className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
          <div className={`p-2 rounded-lg border flex-shrink-0 ${
            safe_corridor.is_fully_passable
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Safety Grade</div>
            <div className="text-xs font-bold text-white truncate">{safety_status || 'SECURED'}</div>
            <div className={`text-[10px] font-semibold ${
              safe_corridor.is_fully_passable ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {safe_corridor.is_fully_passable ? '🟢 Passable' : '🔴 Caution Advised'}
            </div>
          </div>
        </div>
      </div>

      {/* Advisory Alert Banner when Detour is Active */}
      {is_detour_advised && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Safer Route Found:</strong> Direct road crosses hazardous water/damage ({naiveRisk}x risk). RakshaPath secured an elevated detour corridor.
          </span>
        </div>
      )}
    </div>
  );
}
