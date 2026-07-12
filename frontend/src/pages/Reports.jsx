import { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, FileText, FileSpreadsheet, TrendingUp, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_BASE = 'http://localhost:5000/api';

export default function Reports() {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/analytics/roi`);
        setAnalytics(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const exportCSV = () => {
    if (analytics.length === 0) return;
    const headers = ['Vehicle', 'Model', 'Status', 'Acquisition Cost ($)', 'Maintenance ($)', 'Fuel ($)', 'Total Operational ($)', 'Revenue ($)', 'ROI (%)', 'Efficiency (km/L)'];
    
    const rows = analytics.map(a => [
      a.registrationNumber,
      a.model,
      a.status,
      a.acquisitionCost,
      a.totalMaintenance,
      a.totalFuel,
      a.totalOperationalCost,
      a.revenue,
      a.roi,
      a.fuelEfficiency
    ]);

    const timestamp = `Generated on: ${new Date().toLocaleString()}`;
    const formulaText = `ROI Formula: ((Revenue - Total Operational Cost) / Acquisition Cost) * 100`;

    const csvContent = [
      'TransitOps Official Financial Report',
      timestamp,
      '',
      headers.join(','),
      ...rows.map(row => row.join(',')),
      '',
      formulaText
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'TransitOps_ROI_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (analytics.length === 0) return;
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.text('TransitOps Official Financial Report', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableColumn = ['Vehicle', 'Model', 'Acq. Cost ($)', 'Maint. ($)', 'Fuel ($)', 'Ops Cost ($)', 'Revenue ($)', 'ROI (%)', 'Efficiency (km/L)'];
    const tableRows = [];

    analytics.forEach(a => {
      const rowData = [
        a.registrationNumber,
        a.model,
        a.acquisitionCost.toLocaleString(),
        a.totalMaintenance.toLocaleString(),
        a.totalFuel.toLocaleString(),
        a.totalOperationalCost.toLocaleString(),
        a.revenue.toLocaleString(),
        `${a.roi}%`,
        a.fuelEfficiency
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
    });

    const finalY = doc.lastAutoTable.finalY || 40;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('ROI Formula: ((Revenue - Total Operational Cost) / Acquisition Cost) * 100', 14, finalY + 10);

    doc.save('TransitOps_ROI_Report.pdf');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Financial Reports & ROI
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Comprehensive breakdown of vehicle operational costs and return on investment.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={exportPDF}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/40 transition-all duration-200"
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-500/20">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Analytics Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/60 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50/50 dark:border-slate-700/60 dark:bg-slate-800/30">
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">Vehicle</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Acq. Cost</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Maintenance</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Fuel</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Ops Cost</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Revenue (Est.)</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Efficiency</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300 text-right">ROI %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                      <span>Analyzing fleet data…</span>
                    </div>
                  </td>
                </tr>
              ) : analytics.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    No analytics data available.
                  </td>
                </tr>
              ) : (
                analytics.map((a) => (
                  <tr key={a.vehicleId} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{a.registrationNumber}</div>
                      <div className="text-xs text-slate-500">{a.model}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">
                      ${a.acquisitionCost?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-rose-600 dark:text-rose-400 font-medium">
                      ${a.totalMaintenance?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-amber-600 dark:text-amber-400 font-medium">
                      ${a.totalFuel?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-800 dark:text-slate-200">
                      ${a.totalOperationalCost?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                      ${a.revenue?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600 dark:text-slate-400">
                      {a.fuelEfficiency} km/L
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                        a.roi >= 0 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                      }`}>
                        {a.roi >= 0 ? <TrendingUp className="h-3 w-3" /> : null}
                        {a.roi}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
