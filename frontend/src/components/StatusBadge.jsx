export default function StatusBadge({ status }) {
  const config = {
    Available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 ring-emerald-600/20',
    'On Trip': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 ring-blue-600/20',
    'In Shop': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 ring-amber-600/20',
    'Off Duty': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 ring-amber-600/20',
    Retired: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 ring-red-600/20',
    Suspended: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 ring-red-600/20',
  };

  const classes = config[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 ring-gray-600/20';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${classes}`}
    >
      {status}
    </span>
  );
}
