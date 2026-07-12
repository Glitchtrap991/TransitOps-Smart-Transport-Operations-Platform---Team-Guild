import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, Truck, Filter, Edit2, Trash2, AlertCircle, FolderOpen, Upload, ArrowUpDown, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import API_BASE_URL from '../config/api';

const API_BASE = `${API_BASE_URL}/vehicles`;

const VEHICLE_STATUSES = ['All', 'Available', 'On Trip', 'In Shop', 'Retired'];
const VEHICLE_TYPES = ['Truck', 'Van', 'Bus', 'Trailer', 'Pickup', 'Tanker'];

const emptyForm = {
  registrationNumber: '',
  model: '',
  type: 'Truck',
  maxLoadCapacity: '',
  odometer: '',
  acquisitionCost: '',
  status: 'Available',
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'All';
  const [activeStatus, setActiveStatus] = useState(initialFilter);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [mockCompliance, setMockCompliance] = useState({ rc: true, insurance: true, puc: false });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [currentDocsVehicle, setCurrentDocsVehicle] = useState(null);
  const [docForm, setDocForm] = useState({ title: '', fileUrl: '' });
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // ---------- Fetch vehicles ----------
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeStatus !== 'All') params.set('status', activeStatus);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`${API_BASE}?${params.toString()}`);
      if (res.ok) {
        setVehicles(await res.json());
      }
    } catch {
      // Silently handle — data will simply not load
    } finally {
      setLoading(false);
    }
  }, [activeStatus, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicles();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchVehicles]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const processedVehicles = [...vehicles].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // ---------- Form validation ----------
  const validate = () => {
    const errs = {};
    if (!form.registrationNumber.trim())
      errs.registrationNumber = 'Registration # is required';
    if (!form.model.trim()) errs.model = 'Model is required';
    if (!form.type) errs.type = 'Type is required';
    if (!form.maxLoadCapacity || Number(form.maxLoadCapacity) <= 0)
      errs.maxLoadCapacity = 'Enter a valid load capacity';
    if (!form.acquisitionCost || Number(form.acquisitionCost) <= 0)
      errs.acquisitionCost = 'Enter a valid cost';
    return errs;
  };

  // ---------- Submit handler ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setServerError('');

    const payload = {
      ...form,
      maxLoadCapacity: Number(form.maxLoadCapacity),
      odometer: Number(form.odometer) || 0,
      acquisitionCost: Number(form.acquisitionCost),
    };

    try {
      const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || 'Something went wrong');
        setSubmitting(false);
        return;
      }

      const saved = await res.json();

      if (editingId) {
        setVehicles((prev) =>
          prev.map((v) => (v._id === editingId ? saved : v))
        );
        toast.success('Vehicle updated successfully.');
      } else {
        setVehicles((prev) => [saved, ...prev]);
        toast.success('✅ Vehicle added to fleet!');
      }

      closeModal();
      fetchVehicles();
    } catch {
      toast.error('Network error — is the backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Docs ----------
  const openDocs = (vehicle) => {
    setCurrentDocsVehicle(vehicle);
    setDocForm({ title: '', fileUrl: '' });
    setDocsModalOpen(true);
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!docForm.title || !docForm.fileUrl) return;
    setUploadingDoc(true);
    try {
      const res = await fetch(`${API_BASE}/${currentDocsVehicle._id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docForm),
      });
      if (res.ok) {
        const updatedVehicle = await res.json();
        setVehicles(prev => prev.map(v => v._id === updatedVehicle._id ? updatedVehicle : v));
        setCurrentDocsVehicle(updatedVehicle);
        setDocForm({ title: '', fileUrl: '' });
        toast.success('Document attached successfully.');
      } else {
        toast.error('Failed to attach document.');
      }
    } catch {
      toast.error('Network error attaching document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  // ---------- Delete ----------
  const handleDelete = async (id) => {
    if (!confirm('Delete this vehicle?')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVehicles((prev) => prev.filter((v) => v._id !== id));
        toast.success('Vehicle deleted.');
      }
    } catch {
      toast.error('Failed to delete vehicle.');
    }
  };

  // ---------- Modal helpers ----------
  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (vehicle) => {
    setEditingId(vehicle._id);
    setForm({
      registrationNumber: vehicle.registrationNumber,
      model: vehicle.model,
      type: vehicle.type,
      maxLoadCapacity: String(vehicle.maxLoadCapacity),
      odometer: String(vehicle.odometer),
      acquisitionCost: String(vehicle.acquisitionCost),
      status: vehicle.status,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
  };

  // ---------- Field change ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ---------- Input class helper ----------
  const inputClass = (field) =>
    `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2 ${
      formErrors[field]
        ? 'border-red-400 focus:ring-red-300 dark:border-red-500'
        : 'border-slate-300 focus:border-indigo-400 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500/30'
    }`;

  // ---------- Format currency ----------
  const fmt = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const fmtNum = (n) =>
    new Intl.NumberFormat('en-US').format(n);

  return (
    <div className="space-y-6">
      {/* -------- Page Header -------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Vehicles
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your fleet — {vehicles.length} vehicle{vehicles.length !== 1 && 's'}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </button>
      </div>

      {/* -------- Toolbar -------- */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search vehicles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-500/30"
          />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="hidden h-4 w-4 text-slate-400 sm:block" />
          {VEHICLE_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                activeStatus === s
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* -------- Data Table -------- */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-slate-600 dark:text-slate-300">Registration #</th>
                <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-slate-600 dark:text-slate-300">Model</th>
                <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-slate-600 dark:text-slate-300">Type</th>
                <th 
                  className="whitespace-nowrap px-6 py-3.5 font-semibold text-slate-600 dark:text-slate-300 text-right cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors group"
                  onClick={() => handleSort('maxLoadCapacity')}
                >
                  <div className="flex justify-end items-center gap-1">
                    Max Load (kg) <ArrowUpDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                  </div>
                </th>
                <th 
                  className="whitespace-nowrap px-6 py-3.5 font-semibold text-slate-600 dark:text-slate-300 text-right cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors group"
                  onClick={() => handleSort('odometer')}
                >
                  <div className="flex justify-end items-center gap-1">
                    Odometer <ArrowUpDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                  </div>
                </th>
                <th 
                  className="whitespace-nowrap px-6 py-3.5 font-semibold text-slate-600 dark:text-slate-300 text-right cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors group"
                  onClick={() => handleSort('acquisitionCost')}
                >
                  <div className="flex justify-end items-center gap-1">
                    Acquisition Cost <ArrowUpDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                  </div>
                </th>
                <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                <th className="whitespace-nowrap px-6 py-3.5 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                      <span>Loading vehicles…</span>
                    </div>
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <Truck className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                      <span className="text-sm">No vehicles found. Add one to get started!</span>
                    </div>
                  </td>
                </tr>
              ) : (
                processedVehicles.map((v, i) => (
                  <tr
                    key={v._id}
                    className={`transition-colors duration-150 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 ${
                      i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-800/30'
                    }`}
                  >
                    <td className="whitespace-nowrap px-6 py-3.5 font-mono font-semibold text-slate-900 dark:text-white">
                      {v.registrationNumber}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-slate-700 dark:text-slate-300">{v.model}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-slate-700 dark:text-slate-300">{v.type}</td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-right tabular-nums text-slate-700 dark:text-slate-300">
                      {fmtNum(v.maxLoadCapacity)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-right tabular-nums text-slate-700 dark:text-slate-300">
                      {fmtNum(v.odometer)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-right tabular-nums text-slate-700 dark:text-slate-300">
                      {fmt(v.acquisitionCost)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openDocs(v)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition-colors"
                          title="Documents"
                        >
                          <FolderOpen className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(v)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v._id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------- Add / Edit Modal -------- */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Vehicle' : 'Add Vehicle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Registration # */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Registration Number
            </label>
            <input
              name="registrationNumber"
              value={form.registrationNumber}
              onChange={handleChange}
              className={inputClass('registrationNumber')}
              placeholder="e.g. ABC-1234"
            />
            {formErrors.registrationNumber && (
              <p className="mt-1 text-xs text-red-500">{formErrors.registrationNumber}</p>
            )}
          </div>

          {/* Model */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Model
            </label>
            <input
              name="model"
              value={form.model}
              onChange={handleChange}
              className={inputClass('model')}
              placeholder="e.g. Volvo FH16"
            />
            {formErrors.model && (
              <p className="mt-1 text-xs text-red-500">{formErrors.model}</p>
            )}
          </div>

          {/* Type + Status row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className={inputClass('type')}
              >
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputClass('status')}
              >
                {VEHICLE_STATUSES.filter((s) => s !== 'All').map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Max Load + Odometer row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Max Load (kg)
              </label>
              <input
                name="maxLoadCapacity"
                type="number"
                min="0"
                value={form.maxLoadCapacity}
                onChange={handleChange}
                className={inputClass('maxLoadCapacity')}
                placeholder="e.g. 12000"
              />
              {formErrors.maxLoadCapacity && (
                <p className="mt-1 text-xs text-red-500">{formErrors.maxLoadCapacity}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Odometer
              </label>
              <input
                name="odometer"
                type="number"
                min="0"
                value={form.odometer}
                onChange={handleChange}
                className={inputClass('odometer')}
                placeholder="0"
              />
            </div>
          </div>

          {/* Acquisition Cost */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Acquisition Cost ($)
            </label>
            <input
              name="acquisitionCost"
              type="number"
              min="0"
              value={form.acquisitionCost}
              onChange={handleChange}
              className={inputClass('acquisitionCost')}
              placeholder="e.g. 85000"
            />
            {formErrors.acquisitionCost && (
              <p className="mt-1 text-xs text-red-500">{formErrors.acquisitionCost}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving…
                </>
              ) : editingId ? (
                'Update Vehicle'
              ) : (
                'Add Vehicle'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* -------- Docs Modal -------- */}
      <Modal
        isOpen={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
        title={`Documents: ${currentDocsVehicle?.registrationNumber || ''}`}
      >
        <div className="space-y-6">
          {/* Mock Compliance Toggles */}
          <div className="flex gap-4 mb-4">
            <button 
              onClick={() => setMockCompliance({...mockCompliance, rc: !mockCompliance.rc})}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-colors ${mockCompliance.rc ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}
            >
              <CheckCircle className="h-4 w-4" /> RC Verified
            </button>
            <button 
              onClick={() => setMockCompliance({...mockCompliance, insurance: !mockCompliance.insurance})}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-colors ${mockCompliance.insurance ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}
            >
              <CheckCircle className="h-4 w-4" /> Insured
            </button>
            <button 
              onClick={() => setMockCompliance({...mockCompliance, puc: !mockCompliance.puc})}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-colors ${mockCompliance.puc ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}
            >
              <CheckCircle className="h-4 w-4" /> PUC Validated
            </button>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800 pb-4 max-h-60 overflow-y-auto">
            {currentDocsVehicle?.documents?.length > 0 ? (
              currentDocsVehicle.documents.map((doc, i) => (
                <li key={i} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-medium text-slate-900 dark:text-white">{doc.title}</span>
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    View
                  </a>
                </li>
              ))
            ) : (
              <li className="py-4 text-center text-sm text-slate-500">No documents attached.</li>
            )}
          </ul>
          
          <form onSubmit={handleUploadDoc} className="space-y-4">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Upload New Document</h4>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">Document Title</label>
              <input required value={docForm.title} onChange={e => setDocForm({...docForm, title: e.target.value})} className={inputClass('title')} placeholder="e.g. Insurance 2026" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">File URL (Mocked Upload)</label>
              <input required value={docForm.fileUrl} onChange={e => setDocForm({...docForm, fileUrl: e.target.value})} className={inputClass('fileUrl')} placeholder="https://example.com/file.pdf" />
            </div>
            <button type="submit" disabled={uploadingDoc} className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-colors">
              <Upload className="h-4 w-4" /> {uploadingDoc ? 'Uploading...' : 'Attach Document'}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}
