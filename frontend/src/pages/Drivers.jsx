import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, Plus, Users, UserPlus, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/drivers`;
const STATUSES = ['All', 'Available', 'On Trip', 'Off Duty', 'Suspended'];
const LICENSE_CATEGORIES = ['A', 'B', 'C', 'D', 'E', 'CE', 'D1', 'C1'];

const emptyForm = {
  name: '',
  licenseNumber: '',
  licenseCategory: 'C',
  licenseExpiryDate: '',
  contactNumber: '',
  safetyScore: '100',
};

function SafetyScoreBar({ score }) {
  let color = 'bg-red-500';
  let bgColor = 'bg-red-100 dark:bg-red-900/30';
  if (score >= 80) {
    color = 'bg-emerald-500';
    bgColor = 'bg-emerald-100 dark:bg-emerald-900/30';
  } else if (score >= 50) {
    color = 'bg-amber-500';
    bgColor = 'bg-amber-100 dark:bg-amber-900/30';
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-20 overflow-hidden rounded-full ${bgColor}`}>
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
        {score}
      </span>
    </div>
  );
}

export default function Drivers() {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'All';
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch drivers with filters
  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const { data } = await axios.get(API_URL, { params });
      setDrivers(data);
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const debounce = setTimeout(fetchDrivers, 300);
    return () => clearTimeout(debounce);
  }, [fetchDrivers]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const processedDrivers = [...drivers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    
    if (sortConfig.key === 'licenseExpiryDate') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit new driver
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!form.name.trim() || !form.licenseNumber.trim() || !form.licenseExpiryDate || !form.contactNumber.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await axios.post(API_URL, {
        ...form,
        safetyScore: Number(form.safetyScore),
      });

      setDrivers((prev) => [...prev, data]);
      setForm(emptyForm);
      setModalOpen(false);
      toast.success('Driver created successfully.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create driver';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const inputClasses =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:border-indigo-400 transition-colors';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Driver Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage driver profiles, licenses, and safety scores.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-200"
        >
          <UserPlus className="h-4 w-4" />
          Add Driver
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or license number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 transition-colors"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                  Name
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                  License #
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                  Category
                </th>
                <th 
                  className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors group"
                  onClick={() => handleSort('licenseExpiryDate')}
                >
                  <div className="flex items-center gap-1">
                    Expiry Date <ArrowUpDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                  Contact
                </th>
                <th 
                  className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors group"
                  onClick={() => handleSort('safetyScore')}
                >
                  <div className="flex items-center gap-1">
                    Safety Score <ArrowUpDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600 dark:border-slate-600 dark:border-t-indigo-400" />
                      <span>Loading drivers...</span>
                    </div>
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                      <span>No drivers found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                processedDrivers.map((d, i) => (
                  <tr
                    key={d._id}
                    className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-800/20'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {d.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                      {d.licenseNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {d.licenseCategory}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {formatDate(d.licenseExpiryDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {d.contactNumber}
                    </td>
                    <td className="px-4 py-3">
                      <SafetyScoreBar score={d.safetyScore} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && drivers.length > 0 && (
          <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Showing {drivers.length} driver{drivers.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Add Driver Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); }} title="Add New Driver">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Rajesh Kumar"
              className={inputClasses}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                License Number <span className="text-red-500">*</span>
              </label>
              <input
                name="licenseNumber"
                value={form.licenseNumber}
                onChange={handleChange}
                placeholder="e.g. DL-0420110012345"
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="licenseCategory"
                value={form.licenseCategory}
                onChange={handleChange}
                className={inputClasses}
              >
                {LICENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                License Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                name="licenseExpiryDate"
                type="date"
                value={form.licenseExpiryDate}
                onChange={handleChange}
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                className={inputClasses}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Safety Score (0–100)
            </label>
            <input
              name="safetyScore"
              type="number"
              min="0"
              max="100"
              value={form.safetyScore}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { setModalOpen(false); }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-slate-800 transition-colors"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </>
              ) : (
                'Create Driver'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
