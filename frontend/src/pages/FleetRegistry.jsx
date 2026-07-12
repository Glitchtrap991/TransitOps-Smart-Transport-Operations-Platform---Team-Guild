import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Vehicles from './Vehicles';
import Drivers from './Drivers';

export default function FleetRegistry() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'vehicles';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'vehicles' || tab === 'drivers')) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    searchParams.set('tab', tab);
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center sm:justify-start">
        <div className="inline-flex rounded-xl bg-slate-200/50 p-1 dark:bg-slate-800/50 backdrop-blur-md">
          <button
            onClick={() => handleTabChange('vehicles')}
            className={`rounded-lg px-6 py-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === 'vehicles'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Vehicles
          </button>
          <button
            onClick={() => handleTabChange('drivers')}
            className={`rounded-lg px-6 py-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === 'drivers'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Drivers
          </button>
        </div>
      </div>

      <div className="mt-4">
        {activeTab === 'vehicles' ? <Vehicles /> : <Drivers />}
      </div>
    </div>
  );
}
