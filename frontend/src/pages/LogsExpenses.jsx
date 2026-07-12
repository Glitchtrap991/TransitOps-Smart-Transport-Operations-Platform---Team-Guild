import { useState } from 'react';
import Maintenance from './Maintenance';
import Expenses from './Expenses';

export default function LogsExpenses() {
  const [activeTab, setActiveTab] = useState('maintenance');

  return (
    <div className="space-y-6">
      <div className="flex justify-center sm:justify-start">
        <div className="inline-flex rounded-xl bg-slate-200/50 p-1 dark:bg-slate-800/50 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`rounded-lg px-6 py-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === 'maintenance'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Maintenance Shop
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`rounded-lg px-6 py-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === 'expenses'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Fuel & Other Expenses
          </button>
        </div>
      </div>

      <div className="mt-4">
        {activeTab === 'maintenance' ? <Maintenance /> : <Expenses />}
      </div>
    </div>
  );
}
