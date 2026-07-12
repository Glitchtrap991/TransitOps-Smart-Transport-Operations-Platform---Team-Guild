import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Truck, Activity, Wrench, Navigation, Users, Percent, AlertTriangle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import Reports from './Reports';

const API_BASE = 'http://localhost:5000/api';
const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [roiRes, alertsRes, vehRes, tripRes, drvRes] = await Promise.all([
          axios.get(`${API_BASE}/analytics/roi`),
          axios.get(`${API_BASE}/analytics/license-alerts`),
          axios.get(`${API_BASE}/vehicles`),
          axios.get(`${API_BASE}/trips?status=Dispatched`),
          axios.get(`${API_BASE}/drivers`),
        ]);
        setAnalytics(roiRes.data);
        setAlerts(alertsRes.data);
        setVehicles(vehRes.data);
        setTrips(tripRes.data);
        setDrivers(drvRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute KPIs
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'In Shop').length;
  const activeTrips = trips.length;
  const driversOnDuty = drivers.filter(d => d.status === 'On Trip' || d.status === 'Available').length; // "On Duty" means not off duty/suspended
  const utilization = totalVehicles === 0 ? 0 : Math.round(((totalVehicles - availableVehicles - maintenanceVehicles) / totalVehicles) * 100);

  // Compute Chart Data
  const fleetStatusData = [
    { name: 'Available', value: availableVehicles },
    { name: 'On Trip', value: vehicles.filter(v => v.status === 'On Trip').length },
    { name: 'In Shop', value: maintenanceVehicles },
    { name: 'Retired', value: vehicles.filter(v => v.status === 'Retired').length },
  ].filter(d => d.value > 0);

  const kpis = [
    { label: 'Total Vehicles', value: totalVehicles, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400', link: '/fleet?tab=vehicles' },
    { label: 'Available', value: availableVehicles, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400', link: '/fleet?tab=vehicles&filter=Available' },
    { label: 'In Maintenance', value: maintenanceVehicles, icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400', link: '/fleet?tab=vehicles&filter=In Shop' },
    { label: 'Active Trips', value: activeTrips, icon: Navigation, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400', link: '/operations?filter=Active' },
    { label: 'Drivers On Duty', value: driversOnDuty, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400', link: '/fleet?tab=drivers&filter=Available' },
    { label: 'Utilization', value: `${utilization}%`, icon: Percent, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400', link: null },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <span>Loading Enterprise Dashboard…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-4 flex items-start gap-4 rounded-2xl border-l-4 border-red-500 bg-red-50 p-4 shadow-sm dark:bg-red-900/20 dark:border-red-500 ring-1 ring-red-500/10">
          <AlertTriangle className="h-6 w-6 shrink-0 text-red-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-red-800 dark:text-red-400">Action Required: Driver Licenses Expiring!</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              The following drivers have licenses expiring within 30 days or already expired:
            </p>
            <ul className="mt-2 list-inside list-disc text-sm text-red-700 dark:text-red-300 font-medium">
              {alerts.map(d => (
                <li key={d._id}>{d.name} (Expires: {new Date(d.licenseExpiryDate).toLocaleDateString()})</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx} 
              onClick={() => kpi.link && navigate(kpi.link)}
              className={`flex flex-col justify-center rounded-3xl border border-slate-200/60 bg-white/60 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60 transition-transform duration-300 ${kpi.link ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md' : ''}`}
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${kpi.bg}`}>
                <Icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.label}</span>
              <span className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</span>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Operational Costs */}
        <div className="rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60">
          <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">Operational Costs per Vehicle</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="registrationNumber" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="totalMaintenance" name="Maintenance ($)" stackId="a" fill="#f59e0b" radius={[0, 0, 4, 4]} />
                <Bar dataKey="totalFuel" name="Fuel ($)" stackId="a" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Fleet Status Donut */}
        <div className="rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60">
          <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">Fleet Status Distribution</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fleetStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {fleetStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Fuel Efficiency Line Chart (Spans full width on large screens) */}
        <div className="rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60 lg:col-span-2">
          <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">Fuel Efficiency (km/L)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="registrationNumber" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="fuelEfficiency" 
                  name="Efficiency (km/L)"
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Embedded Reports Section */}
      <div className="mt-8 pt-8 border-t border-slate-200/60 dark:border-slate-800/60">
        <Reports />
      </div>
    </div>
  );
}
