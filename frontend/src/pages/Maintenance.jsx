import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Wrench, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

const API_BASE = 'http://localhost:5000/api';

const emptyForm = {
  vehicle: '',
  description: '',
  cost: ''
};

export default function Maintenance() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [logsRes, vehRes] = await Promise.all([
        axios.get(`${API_BASE}/maintenance`),
        axios.get(`${API_BASE}/vehicles?status=Available`)
      ]);
      setLogs(logsRes.data);
      setVehicles(vehRes.data);
    } catch (err) {
      console.error('Failed to load maintenance data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const { data } = await axios.post(`${API_BASE}/maintenance`, form);
      setLogs([data, ...logs]);
      setModalOpen(false);
      setForm(emptyForm);
      // Remove vehicle from available vehicles list
      setVehicles(vehicles.filter(v => v._id !== form.vehicle));
      toast.success('🔧 Vehicle moved to In Shop status.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create log');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseLog = async (id) => {
    if (!window.confirm('Are you sure you want to close this repair and return the vehicle to Available?')) return;
    try {
      const { data } = await axios.put(`${API_BASE}/maintenance/${id}/close`);
      setLogs(logs.map(log => log._id === id ? data : log));
      fetchData(); // Refresh available vehicles
      toast.success('Repair resolved. Vehicle is Available.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close log');
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500/30";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Maintenance Logs
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track repairs, maintenance costs, and shop status.
          </p>
        </div>
        <button
          onClick={() => { setModalOpen(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5" />
          Log Repair
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/60 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50/50 dark:border-slate-700/60 dark:bg-slate-800/30">
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Vehicle</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Description</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Cost</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Date</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">Loading maintenance logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">No maintenance records found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{log.vehicle?.registrationNumber}</div>
                      <div className="text-xs text-slate-500">{log.vehicle?.model}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 max-w-xs truncate" title={log.description}>
                      {log.description}
                    </td>
                    <td className="px-6 py-4 font-medium text-amber-600 dark:text-amber-400">
                      ${log.cost?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        log.status === 'Open' 
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.status === 'Open' && (
                        <button
                          onClick={() => handleCloseLog(log._id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-colors"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log New Repair / Maintenance">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Select Available Vehicle</label>
            <select
              required
              value={form.vehicle}
              onChange={e => setForm({...form, vehicle: e.target.value})}
              className={inputClass}
            >
              <option value="" disabled>-- Select Vehicle --</option>
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>
                  {v.registrationNumber} - {v.model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Repair Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className={inputClass}
              placeholder="E.g., Oil change, brake pad replacement"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Total Cost ($)</label>
            <input
              required type="number" min="0" step="0.01"
              value={form.cost}
              onChange={e => setForm({...form, cost: e.target.value})}
              className={inputClass}
              placeholder="E.g., 250.00"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 disabled:opacity-70 transition-all duration-200"
            >
              {submitting ? 'Logging...' : 'Log & Put In Shop'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
