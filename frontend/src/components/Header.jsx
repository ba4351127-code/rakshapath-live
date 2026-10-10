import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, AlertTriangle, Navigation, LogOut, UserCheck } from 'lucide-react';
import { searchLocations } from '../services/api';

const CITY_PRESETS = [
  { label: 'Delhi NCR', node: 'DEL_HQ', state: 'Delhi NCR', district: 'Central Delhi' },
  { label: 'Lucknow', node: 'UP_SGPGI_LKO', state: 'Uttar Pradesh', district: 'Lucknow' },
  { label: 'Agra', node: 'UP_AGRA_HOSP', state: 'Uttar Pradesh', district: 'Agra' },
  { label: 'Varanasi', node: 'UP_BHU_TRAUMA', state: 'Uttar Pradesh', district: 'Varanasi' },
  { label: 'Dehradun', node: 'UK_DEHRADUN_HQ', state: 'Uttarakhand', district: 'Dehradun' },
  { label: 'Mumbai', node: 'MH_MUMBAI_HQ', state: 'Maharashtra', district: 'Mumbai' },
  { label: 'Patna', node: 'BR_AIIMS_PATNA', state: 'Bihar', district: 'Patna' },
  { label: 'Kolkata', node: 'WB_SSKM_HOSPITAL', state: 'West Bengal', district: 'Kolkata' }
];

export default function Header({
  selectedState,
  onSelectCity,
  onUseLocation,
  onSimulateFlood,
  onSelectSearchNode,
  userRole,
  onSwitchRole
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocations(searchQuery.trim(), selectedState);
      setSearchResults(results);
      setDropdownOpen(results.length > 0);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedState]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-col gap-2.5 z-10 shadow-md">
      {/* Search Bar & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
        {/* Search Input with Autocomplete */}
        <div className="relative flex-1 w-full" ref={dropdownRef}>
          <div className="flex items-center px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl shadow-inner focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location, landmark, or hospital (e.g. AIIMS Delhi, SGPGI Lucknow, Agra Fort, KEM Mumbai)..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            {isSearching && (
              <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {dropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl py-1 z-50">
              {searchResults.map((node) => (
                <button
                  key={node.id}
                  onClick={() => {
                    onSelectSearchNode(node);
                    setDropdownOpen(false);
                    setSearchQuery(node.name);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-800 transition-colors flex items-center justify-between border-b border-slate-800 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-200">{node.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {node.district}, {node.state}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 font-medium">
                    {node.category || 'Hub'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Quick GPS Geolocation Button */}
          <button
            onClick={onUseLocation}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
            title="Snap to nearest emergency hub from device location"
          >
            <Navigation className="w-3.5 h-3.5 text-sky-400" />
            <span className="whitespace-nowrap">Use My Device Location</span>
          </button>

          {/* Flood Simulation Button */}
          <button
            onClick={onSimulateFlood}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
            title="Simulate 85cm waterlogging on primary route"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span className="whitespace-nowrap">Test Flood Warning</span>
          </button>

          {/* Switch Role Button */}
          {onSwitchRole && (
            <button
              onClick={onSwitchRole}
              className="hidden lg:flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold transition-all active:scale-95"
              title="Return to Welcome Screen to switch role"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span className="whitespace-nowrap">Switch Role</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Metropolitan City Presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
        <span className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap mr-1">
          Quick Jump:
        </span>
        {CITY_PRESETS.map((city) => (
          <button
            key={city.label}
            onClick={() => onSelectCity(city)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all whitespace-nowrap shadow-sm ${
              selectedState === city.state
                ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            📍 {city.label}
          </button>
        ))}
      </div>
    </header>
  );
}
