import React, { useState } from 'react';
import { 
  Shield, 
  Truck, 
  CheckCircle2, 
  Compass
} from 'lucide-react';

export default function WelcomeScreen({ onSelectRole }) {
  const [selectedRole, setSelectedRole] = useState('Citizen');

  const handleEnter = () => {
    if (onSelectRole) {
      onSelectRole(selectedRole);
    }
  };

  return (
    <div className="min-h-screen h-auto overflow-y-auto pb-20 w-full bg-slate-950 font-sans text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white relative px-4 sm:px-6">
      {/* Background Decorative Glow (non-fixed, non-clipping) */}
      <div className="w-[800px] h-[300px] bg-gradient-to-b from-sky-600/15 via-blue-600/5 to-transparent blur-3xl pointer-events-none mx-auto -mb-[300px]" />

      {/* Top National Branding Bar */}
      <header className="w-full max-w-5xl mx-auto py-4 border-b border-slate-800/80 bg-slate-950/80 rounded-2xl px-5 my-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-lg shadow-inner">
            🛡️
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-sky-400">
              Government Public Safety Initiative
            </div>
            <div className="text-sm font-black text-white tracking-tight">
              RakshaPath Mobility Network
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            National Grid Active
          </span>
        </div>
      </header>

      {/* Hero Content & Role Selection */}
      <main className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center z-10 space-y-8">
        {/* Title & Mission Statement */}
        <div className="text-center space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '8s' }} />
            Disaster Evacuation & Corridor Logistics Platform
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            RakshaPath
          </h1>
          <p className="text-lg sm:text-xl font-medium text-slate-300 tracking-normal">
            National Emergency Mobility Network
          </p>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
            AI-powered risk-weighted routing to navigate citizens safely around urban flooding, road damage, and debris chokepoints directly to verified relief shelters.
          </p>
        </div>

        {/* STAGE 1: ROLE SELECTION CARDS */}
        <div className="w-full max-w-3xl space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
            Select Your Role to Enter
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role 1: Citizen */}
            <div
              onClick={() => setSelectedRole('Citizen')}
              className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                selectedRole === 'Citizen'
                  ? 'bg-gradient-to-b from-sky-950/70 to-slate-900 border-sky-400 shadow-xl shadow-sky-500/20 ring-2 ring-sky-500/40'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <Shield className="w-6 h-6" />
                  </div>
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                    selectedRole === 'Citizen'
                      ? 'border-sky-400 bg-sky-500 text-white'
                      : 'border-slate-600 bg-slate-800'
                  }`}>
                    {selectedRole === 'Citizen' && '✓'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">Citizen Evacuation</h3>
                  <div className="text-xs font-medium text-sky-400">Public Safety & Safe Shelter Navigation</div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Find the safest dry route to nearby relief shelters, monitor road waterlogging levels, and get step-by-step directions to stay safe.
                </p>

                <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Safe road corridors bypassing high water</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Verified relief shelters with bed availability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>One-click GPS device location support</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                <span className={selectedRole === 'Citizen' ? 'text-sky-300 font-bold' : 'text-slate-500'}>
                  {selectedRole === 'Citizen' ? '● Active Selection' : 'Click to Select'}
                </span>
                <span className="text-sky-400">Standard Access</span>
              </div>
            </div>

            {/* Role 2: Field Responder / Evaluator */}
            <div
              onClick={() => setSelectedRole('Field Responder / Evaluator')}
              className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                selectedRole === 'Field Responder / Evaluator'
                  ? 'bg-gradient-to-b from-amber-950/50 to-slate-900 border-amber-400 shadow-xl shadow-amber-500/20 ring-2 ring-amber-500/40'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Truck className="w-6 h-6" />
                  </div>
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                    selectedRole === 'Field Responder / Evaluator'
                      ? 'border-amber-400 bg-amber-500 text-white'
                      : 'border-slate-600 bg-slate-800'
                  }`}>
                    {selectedRole === 'Field Responder / Evaluator' && '✓'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">Field Responder / Evaluator</h3>
                  <div className="text-xs font-medium text-amber-400">NDRF / SDRF Logistics & Road Calibration</div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Calibrate real-time water depth, road damage, and debris levels. Deploy heavy rescue units, flood boats, and report road hazards.
                </p>

                <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Heavy vehicle clearance profiles (NDRF Truck, Boats)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Live physical hazard multiplier calibration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Direct road blockage and hazard reporting</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                <span className={selectedRole === 'Field Responder / Evaluator' ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                  {selectedRole === 'Field Responder / Evaluator' ? '● Active Selection' : 'Click to Select'}
                </span>
                <span className="text-amber-400">Command Console</span>
              </div>
            </div>
          </div>
        </div>

        {/* LARGE CENTERED PROMINENT ACTION BUTTON DIRECTLY BELOW CARDS */}
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
          <button
            type="button"
            onClick={handleEnter}
            className="mt-8 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg shadow-blue-600/40 cursor-pointer flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 w-full"
          >
            <span>Enter Command Center</span>
            <span>&rarr;</span>
          </button>
          <p className="text-xs text-slate-400 mt-2.5 text-center">
            Proceeding as: <strong className="text-sky-300 font-semibold">{selectedRole}</strong>
          </p>
        </div>
      </main>

      {/* Bottom Infrastructure Metric Strip */}
      <footer className="w-full max-w-5xl mx-auto border-t border-slate-800/80 bg-slate-950/80 rounded-2xl px-6 py-4 mt-12 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <strong>50+</strong> Verified Shelters
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <strong>7</strong> Metropolitan Regions
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <strong>A*</strong> Dynamic Risk Routing
            </span>
          </div>

          <div className="text-slate-500 text-[11px]">
            RakshaPath National Emergency Mobility System • 100% Free Public Safety Platform
          </div>
        </div>
      </footer>
    </div>
  );
}
