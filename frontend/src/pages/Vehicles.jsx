import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Truck, Trash2, ChevronDown } from 'lucide-react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const API_BASE = 'http://localhost:5000/api';
const VEHICLE_STATUSES = ['All', 'Available', 'On Trip', 'In Shop', 'Retired'];
const VEHICLE_TYPES = ['Truck', 'Van', 'Bus', 'Trailer', 'Tanker', 'Pickup'];

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    registrationNumber: '',
    model: '',
    type: 'Truck',
    maxLoadCapacity: '',
    odometer: '',
    acquisitionCost: '',
  });

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search) params.search = search;

      const res = await axios.get(`${API_BASE}/vehicles`, {
        headers: getAuthHeaders(),
        params,
      });
      setVehicles(res.data);
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      await axios.post(`${API_BASE}/vehicles`, {
        ...form,
        maxLoadCapacity: Number(form.maxLoadCapacity),
        odometer: Number(form.odometer) || 0,
        acquisitionCost: Number(form.acquisitionCost),
      }, { headers: getAuthHeaders() });

      setShowModal(false);
      setForm({
        registrationNumber: '',
        model: '',
        type: 'Truck',
        maxLoadCapacity: '',
        odometer: '',
        acquisitionCost: '',
      });
      fetchVehicles();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE}/vehicles/${id}`, { status: newStatus }, { headers: getAuthHeaders() });
      fetchVehicles();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await axios.delete(`${API_BASE}/vehicles/${id}`, { headers: getAuthHeaders() });
      fetchVehicles();
    } catch (err) {
      console.error('Failed to delete vehicle:', err);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const formatNumber = (val) =>
    new Intl.NumberFormat('en-US').format(val);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            Vehicle Registry
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Manage and monitor your fleet vehicles
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium text-sm
                     shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5
                     transition-all duration-200 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search by registration or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                       bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100
                       placeholder:text-surface-400 dark:placeholder:text-surface-500
                       focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
                       transition-all duration-200 text-sm"
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-1.5">
          {VEHICLE_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200
                ${
                  statusFilter === s
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                    : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-800">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Registration
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Model
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Max Load (kg)
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Odometer
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Acq. Cost
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-surface-400">
                      <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                      <span className="text-sm">Loading vehicles...</span>
                    </div>
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-surface-400">
                      <Truck className="w-10 h-10 stroke-1" />
                      <div>
                        <p className="font-medium text-surface-600 dark:text-surface-300">No vehicles found</p>
                        <p className="text-sm mt-1">Add a vehicle or adjust your filters</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                vehicles.map((v, idx) => (
                  <tr
                    key={v._id}
                    className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors duration-150"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <td className="px-5 py-3.5 font-semibold text-surface-900 dark:text-surface-100 whitespace-nowrap">
                      {v.registrationNumber}
                    </td>
                    <td className="px-5 py-3.5 text-surface-700 dark:text-surface-300 whitespace-nowrap">
                      {v.model}
                    </td>
                    <td className="px-5 py-3.5 text-surface-600 dark:text-surface-400 whitespace-nowrap">
                      {v.type}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-surface-700 dark:text-surface-300 whitespace-nowrap">
                      {formatNumber(v.maxLoadCapacity)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-surface-700 dark:text-surface-300 whitespace-nowrap">
                      {formatNumber(v.odometer)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-surface-700 dark:text-surface-300 whitespace-nowrap">
                      {formatCurrency(v.acquisitionCost)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status dropdown */}
                        <div className="relative">
                          <select
                            value={v.status}
                            onChange={(e) => handleStatusChange(v._id, e.target.value)}
                            className="appearance-none pl-2.5 pr-7 py-1.5 text-xs rounded-lg border border-surface-200 dark:border-surface-700
                                       bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300
                                       focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer transition-all duration-200"
                          >
                            {['Available', 'On Trip', 'In Shop', 'Retired'].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400 pointer-events-none" />
                        </div>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(v._id)}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                          title="Delete vehicle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && vehicles.length > 0 && (
          <div className="px-5 py-3 border-t border-surface-200 dark:border-surface-800 text-xs text-surface-500 dark:text-surface-400">
            Showing {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setFormError(''); }} title="Add New Vehicle">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-fade-in">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                Registration Number *
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={form.registrationNumber}
                onChange={handleFormChange}
                required
                placeholder="e.g. TN-01-AB-1234"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                           bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100
                           placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30
                           focus:border-primary-500 transition-all duration-200 text-sm"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                Model *
              </label>
              <input
                type="text"
                name="model"
                value={form.model}
                onChange={handleFormChange}
                required
                placeholder="e.g. Tata Ace"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                           bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100
                           placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30
                           focus:border-primary-500 transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                Type *
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleFormChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                           bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100
                           focus:outline-none focus:ring-2 focus:ring-primary-500/30
                           focus:border-primary-500 transition-all duration-200 text-sm"
              >
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                Max Load Capacity (kg) *
              </label>
              <input
                type="number"
                name="maxLoadCapacity"
                value={form.maxLoadCapacity}
                onChange={handleFormChange}
                required
                min="0"
                placeholder="e.g. 5000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                           bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100
                           placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30
                           focus:border-primary-500 transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                Odometer
              </label>
              <input
                type="number"
                name="odometer"
                value={form.odometer}
                onChange={handleFormChange}
                min="0"
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                           bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100
                           placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30
                           focus:border-primary-500 transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                Acquisition Cost ($) *
              </label>
              <input
                type="number"
                name="acquisitionCost"
                value={form.acquisitionCost}
                onChange={handleFormChange}
                required
                min="0"
                placeholder="e.g. 35000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                           bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100
                           placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30
                           focus:border-primary-500 transition-all duration-200 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowModal(false); setFormError(''); }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400
                         hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary-600 to-primary-500 text-white
                         shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {submitting ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
