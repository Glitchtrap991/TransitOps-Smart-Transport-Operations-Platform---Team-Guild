import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Users, Trash2, ChevronDown } from 'lucide-react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const API_BASE = 'http://localhost:5000/api';
const DRIVER_STATUSES = ['All', 'Available', 'On Trip', 'Off Duty', 'Suspended'];
const LICENSE_CATEGORIES = ['A', 'B', 'C', 'D', 'E', 'CE', 'C1', 'D1'];

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Safety score progress bar component
function SafetyScoreBar({ score }) {
  let color = 'bg-emerald-500';
  let bgColor = 'bg-emerald-100 dark:bg-emerald-900/30';
  if (score < 50) {
    color = 'bg-red-500';
    bgColor = 'bg-red-100 dark:bg-red-900/30';
  } else if (score < 75) {
    color = 'bg-amber-500';
    bgColor = 'bg-amber-100 dark:bg-amber-900/30';
  } else if (score < 90) {
    color = 'bg-blue-500';
    bgColor = 'bg-blue-100 dark:bg-blue-900/30';
  }

  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex-1 h-2 rounded-full ${bgColor} min-w-[60px] max-w-[100px] overflow-hidden`}>
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-surface-600 dark:text-surface-400 tabular-nums w-8 text-right">
        {score}
      </span>
    </div>
  );
}

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    licenseNumber: '',
    licenseCategory: 'C',
    licenseExpiryDate: '',
    contactNumber: '',
    safetyScore: 100,
  });

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search) params.search = search;

      const res = await axios.get(`${API_BASE}/drivers`, {
        headers: getAuthHeaders(),
        params,
      });
      setDrivers(res.data);
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      await axios.post(`${API_BASE}/drivers`, {
        ...form,
        safetyScore: Number(form.safetyScore),
      }, { headers: getAuthHeaders() });

      setShowModal(false);
      setForm({
        name: '',
        licenseNumber: '',
        licenseCategory: 'C',
        licenseExpiryDate: '',
        contactNumber: '',
        safetyScore: 100,
      });
      fetchDrivers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create driver');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE}/drivers/${id}`, { status: newStatus }, { headers: getAuthHeaders() });
      fetchDrivers();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    try {
      await axios.delete(`${API_BASE}/drivers/${id}`, { headers: getAuthHeaders() });
      fetchDrivers();
    } catch (err) {
      console.error('Failed to delete driver:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            Driver Management
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Manage driver profiles and track safety scores
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium text-sm
                     shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5
                     transition-all duration-200 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Add Driver
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search by name or license number..."
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
          {DRIVER_STATUSES.map((s) => (
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
                  Name
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  License No.
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  Safety Score
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
                      <span className="text-sm">Loading drivers...</span>
                    </div>
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-surface-400">
                      <Users className="w-10 h-10 stroke-1" />
                      <div>
                        <p className="font-medium text-surface-600 dark:text-surface-300">No drivers found</p>
                        <p className="text-sm mt-1">Add a driver or adjust your filters</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                drivers.map((d, idx) => (
                  <tr
                    key={d._id}
                    className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors duration-150"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <td className="px-5 py-3.5 font-semibold text-surface-900 dark:text-surface-100 whitespace-nowrap">
                      {d.name}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-surface-700 dark:text-surface-300 whitespace-nowrap">
                      {d.licenseNumber}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 text-xs font-bold text-surface-700 dark:text-surface-300">
                        {d.licenseCategory}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-surface-600 dark:text-surface-400 whitespace-nowrap">
                      {formatDate(d.licenseExpiryDate)}
                    </td>
                    <td className="px-5 py-3.5 text-surface-600 dark:text-surface-400 whitespace-nowrap">
                      {d.contactNumber}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <SafetyScoreBar score={d.safetyScore} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status dropdown */}
                        <div className="relative">
                          <select
                            value={d.status}
                            onChange={(e) => handleStatusChange(d._id, e.target.value)}
                            className="appearance-none pl-2.5 pr-7 py-1.5 text-xs rounded-lg border border-surface-200 dark:border-surface-700
                                       bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300
                                       focus:outline-none focus:ring-2 focus:ring-primary-500/30 cursor-pointer transition-all duration-200"
                          >
                            {['Available', 'On Trip', 'Off Duty', 'Suspended'].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400 pointer-events-none" />
                        </div>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(d._id)}
                          className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                          title="Delete driver"
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
        {!loading && drivers.length > 0 && (
          <div className="px-5 py-3 border-t border-surface-200 dark:border-surface-800 text-xs text-surface-500 dark:text-surface-400">
            Showing {drivers.length} driver{drivers.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Add Driver Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setFormError(''); }} title="Add New Driver">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-fade-in">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                required
                placeholder="e.g. John Doe"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                           bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100
                           placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30
                           focus:border-primary-500 transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                License Number *
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={form.licenseNumber}
                onChange={handleFormChange}
                required
                placeholder="e.g. DL-1234567890"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                           bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100
                           placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30
                           focus:border-primary-500 transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                License Category *
              </label>
              <select
                name="licenseCategory"
                value={form.licenseCategory}
                onChange={handleFormChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                           bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100
                           focus:outline-none focus:ring-2 focus:ring-primary-500/30
                           focus:border-primary-500 transition-all duration-200 text-sm"
              >
                {LICENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                License Expiry Date *
              </label>
              <input
                type="date"
                name="licenseExpiryDate"
                value={form.licenseExpiryDate}
                onChange={handleFormChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                           bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100
                           focus:outline-none focus:ring-2 focus:ring-primary-500/30
                           focus:border-primary-500 transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                Contact Number *
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleFormChange}
                required
                placeholder="e.g. +91 9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                           bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100
                           placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30
                           focus:border-primary-500 transition-all duration-200 text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-surface-600 dark:text-surface-400 mb-1.5">
                Initial Safety Score (0-100)
              </label>
              <input
                type="number"
                name="safetyScore"
                value={form.safetyScore}
                onChange={handleFormChange}
                min="0"
                max="100"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                           bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100
                           focus:outline-none focus:ring-2 focus:ring-primary-500/30
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
              {submitting ? 'Adding...' : 'Add Driver'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
