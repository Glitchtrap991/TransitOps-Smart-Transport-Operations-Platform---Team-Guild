import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, DollarSign, AlertCircle, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import API_BASE_URL from '../config/api';

const API_BASE = API_BASE_URL;

const emptyForm = {
  vehicle: '',
  type: 'Other',
  liters: '',
  cost: ''
};

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [expRes, vehRes] = await Promise.all([
          axios.get(`${API_BASE}/expenses`),
          axios.get(`${API_BASE}/vehicles`)
        ]);
        setExpenses(expRes.data);
        setVehicles(vehRes.data);
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const processedExpenses = [...expenses].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    
    if (sortConfig.key === 'date') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const { data } = await axios.post(`${API_BASE}/expenses`, form);
      setExpenses([data, ...expenses]);
      setModalOpen(false);
      setForm(emptyForm);
      toast.success('Expense logged successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log expense');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500/30";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Expense Logs
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track fuel, tolls, and miscellaneous operational expenses.
          </p>
        </div>
        <button
          onClick={() => { setModalOpen(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5" />
          Log Expense
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/60 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50/50 dark:border-slate-700/60 dark:bg-slate-800/30">
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Vehicle</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Type</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Liters (Fuel)</th>
                <th 
                  className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors group"
                  onClick={() => handleSort('cost')}
                >
                  <div className="flex justify-end items-center gap-1">
                    Cost <ArrowUpDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors group"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex justify-end items-center gap-1">
                    Date <ArrowUpDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400">Loading expenses...</td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400">No expenses found.</td>
                </tr>
              ) : (
                processedExpenses.map((exp) => (
                  <tr key={exp._id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{exp.vehicle?.registrationNumber}</div>
                      <div className="text-xs text-slate-500">{exp.vehicle?.model}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        exp.type === 'Fuel' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        exp.type === 'Toll' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                        'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {exp.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">
                      {exp.type === 'Fuel' && exp.liters ? `${exp.liters} L` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                      ${exp.cost?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log Manual Expense">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Select Vehicle</label>
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
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Expense Type</label>
            <select
              required
              value={form.type}
              onChange={e => setForm({...form, type: e.target.value})}
              className={inputClass}
            >
              <option value="Fuel">Fuel</option>
              <option value="Toll">Toll</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {form.type === 'Fuel' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Liters</label>
              <input
                required type="number" min="0" step="0.1"
                value={form.liters}
                onChange={e => setForm({...form, liters: e.target.value})}
                className={inputClass}
                placeholder="E.g., 50.5"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Total Cost ($)</label>
            <input
              required type="number" min="0" step="0.01"
              value={form.cost}
              onChange={e => setForm({...form, cost: e.target.value})}
              className={inputClass}
              placeholder="E.g., 45.00"
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
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 disabled:opacity-70 transition-all duration-200"
            >
              {submitting ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
