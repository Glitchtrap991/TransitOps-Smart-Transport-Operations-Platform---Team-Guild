import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Plus, MapPin, Filter, Play, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const API_BASE = 'http://localhost:5000/api';

const TRIP_STATUSES = ['All', 'Active', 'Pending', 'Completed', 'Cancelled'];

const emptyTripForm = {
  source: '',
  destination: '',
  vehicle: '',
  driver: '',
  cargoWeight: '',
  plannedDistance: '',
};

const emptyCompleteForm = {
  finalOdometer: '',
  fuelLiters: '',
  fuelCost: '',
};

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  
  const [tripForm, setTripForm] = useState(emptyTripForm);
  const [completeForm, setCompleteForm] = useState(emptyCompleteForm);
  
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ---------- Fetch Data ----------
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Filter mapping
      const params = new URLSearchParams();
      if (activeStatus === 'Active') params.set('status', 'Dispatched');
      else if (activeStatus === 'Pending') params.set('status', 'Draft');
      else if (activeStatus !== 'All') params.set('status', activeStatus);

      // Fetch Trips
      const res = await axios.get(`${API_BASE}/trips?${params.toString()}`);
      setTrips(res.data);
      
      // Fetch Available Vehicles and Drivers for dropdowns
      const [vehRes, drvRes] = await Promise.all([
        axios.get(`${API_BASE}/vehicles?status=Available`),
        axios.get(`${API_BASE}/drivers?status=Available`)
      ]);
      setVehicles(vehRes.data);
      setDrivers(drvRes.data);
      
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------- Create Trip ----------
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Dynamic validation for max weight
    const selectedVehicle = vehicles.find(v => v._id === tripForm.vehicle);
    if (selectedVehicle && Number(tripForm.cargoWeight) > selectedVehicle.maxLoadCapacity) {
      setFormError(`Cargo weight exceeds vehicle capacity (${selectedVehicle.maxLoadCapacity} kg).`);
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await axios.post(`${API_BASE}/trips`, tripForm);
      setTrips(prev => [data, ...prev]);
      setCreateModalOpen(false);
      setTripForm(emptyTripForm);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create trip');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Dispatch Trip ----------
  const handleDispatch = async (id) => {
    if (!window.confirm('Dispatch this trip now?')) return;
    try {
      const { data } = await axios.put(`${API_BASE}/trips/${id}/dispatch`);
      setTrips(prev => prev.map(t => t._id === id ? data : t));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispatch trip');
    }
  };

  // ---------- Complete Trip ----------
  const openCompleteModal = (id) => {
    setSelectedTripId(id);
    setCompleteForm(emptyCompleteForm);
    setFormError('');
    setCompleteModalOpen(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      setSubmitting(true);
      const { data } = await axios.put(`${API_BASE}/trips/${selectedTripId}/complete`, completeForm);
      setTrips(prev => prev.map(t => t._id === selectedTripId ? data : t));
      setCompleteModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to complete trip');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Cancel Trip ----------
  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this trip?')) return;
    try {
      const { data } = await axios.put(`${API_BASE}/trips/${id}/cancel`);
      setTrips(prev => prev.map(t => t._id === id ? data : t));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel trip');
    }
  };

  // Helper
  const inputClass = "w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500/30";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Trip Management
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Dispatch, track, and complete trips across your fleet.
          </p>
        </div>
        <button
          onClick={() => { setCreateModalOpen(true); setFormError(''); }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="h-5 w-5" />
          Create Trip
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/60 bg-white/60 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search routes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/50 py-3 pl-12 pr-4 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500/30"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="hidden h-5 w-5 text-slate-400 sm:block" />
          {TRIP_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                activeStatus === s
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-white/80 text-slate-600 border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/60 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50/50 dark:border-slate-700/60 dark:bg-slate-800/30">
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Route</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Vehicle</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Driver</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Cargo (kg)</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Distance (km)</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                      <span>Loading trips…</span>
                    </div>
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <MapPin className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                      <span className="text-base">No trips found. Create one to get started!</span>
                    </div>
                  </td>
                </tr>
              ) : (
                trips
                  .filter(t => search.trim() === '' || 
                    t.source.toLowerCase().includes(search.toLowerCase()) || 
                    t.destination.toLowerCase().includes(search.toLowerCase()))
                  .map((t) => (
                  <tr key={t._id} className="transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{t.source}</div>
                      <div className="text-xs text-slate-500">to {t.destination}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{t.vehicle?.registrationNumber}</div>
                      <div className="text-xs text-slate-500">{t.vehicle?.model}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{t.driver?.name}</div>
                      <div className="text-xs font-mono text-slate-500">{t.driver?.licenseNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">
                      {t.cargoWeight.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">
                      {t.plannedDistance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {t.status === 'Draft' && (
                          <>
                            <button
                              onClick={() => handleDispatch(t._id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-colors"
                            >
                              <Play className="h-3.5 w-3.5" /> Dispatch
                            </button>
                            <button
                              onClick={() => handleCancel(t._id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Cancel
                            </button>
                          </>
                        )}
                        {t.status === 'Dispatched' && (
                          <>
                            <button
                              onClick={() => openCompleteModal(t._id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                            </button>
                            <button
                              onClick={() => handleCancel(t._id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Cancel
                            </button>
                          </>
                        )}
                        {(t.status === 'Completed' || t.status === 'Cancelled') && (
                          <span className="text-xs text-slate-400 italic">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------- Create Trip Modal -------- */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Trip">
        <form onSubmit={handleCreateSubmit} className="space-y-5">
          {formError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-500/20">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Source</label>
              <input
                required
                value={tripForm.source}
                onChange={e => setTripForm({...tripForm, source: e.target.value})}
                className={inputClass}
                placeholder="e.g. Warehouse A"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Destination</label>
              <input
                required
                value={tripForm.destination}
                onChange={e => setTripForm({...tripForm, destination: e.target.value})}
                className={inputClass}
                placeholder="e.g. Client Site B"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Select Vehicle</label>
            <select
              required
              value={tripForm.vehicle}
              onChange={e => setTripForm({...tripForm, vehicle: e.target.value})}
              className={inputClass}
            >
              <option value="" disabled>-- Select Available Vehicle --</option>
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>
                  {v.registrationNumber} - {v.model} (Max: {v.maxLoadCapacity}kg)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Select Driver</label>
            <select
              required
              value={tripForm.driver}
              onChange={e => setTripForm({...tripForm, driver: e.target.value})}
              className={inputClass}
            >
              <option value="" disabled>-- Select Available Driver --</option>
              {drivers.map(d => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.licenseNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Cargo Wt. (kg)</label>
              <input
                required type="number" min="1"
                value={tripForm.cargoWeight}
                onChange={e => setTripForm({...tripForm, cargoWeight: e.target.value})}
                className={inputClass}
                placeholder="e.g. 500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Distance (km)</label>
              <input
                required type="number" min="1"
                value={tripForm.plannedDistance}
                onChange={e => setTripForm({...tripForm, plannedDistance: e.target.value})}
                className={inputClass}
                placeholder="e.g. 150"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 disabled:opacity-70 transition-all duration-200"
            >
              {submitting ? 'Creating...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </Modal>

      {/* -------- Complete Trip Modal -------- */}
      <Modal isOpen={completeModalOpen} onClose={() => setCompleteModalOpen(false)} title="Complete Trip & Log Fuel">
        <form onSubmit={handleCompleteSubmit} className="space-y-5">
          {formError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-500/20">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {formError}
            </div>
          )}
          
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Final Odometer Reading</label>
            <input
              required type="number" min="0"
              value={completeForm.finalOdometer}
              onChange={e => setCompleteForm({...completeForm, finalOdometer: e.target.value})}
              className={inputClass}
              placeholder="Enter current odometer reading"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Fuel Consumed (Liters)</label>
              <input
                type="number" min="0" step="0.1"
                value={completeForm.fuelLiters}
                onChange={e => setCompleteForm({...completeForm, fuelLiters: e.target.value})}
                className={inputClass}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Fuel Cost ($)</label>
              <input
                type="number" min="0" step="0.01"
                value={completeForm.fuelCost}
                onChange={e => setCompleteForm({...completeForm, fuelCost: e.target.value})}
                className={inputClass}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setCompleteModalOpen(false)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 disabled:opacity-70 transition-all duration-200"
            >
              {submitting ? 'Completing...' : 'Mark as Completed'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
