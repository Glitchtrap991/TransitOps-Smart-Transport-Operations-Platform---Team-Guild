export default function StatusBadge({ status }) {
  const config = {
    'Available':  { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
    'On Trip':    { bg: 'bg-blue-100 dark:bg-blue-900/40',       text: 'text-blue-700 dark:text-blue-300',       dot: 'bg-blue-500' },
    'In Shop':    { bg: 'bg-amber-100 dark:bg-amber-900/40',     text: 'text-amber-700 dark:text-amber-300',     dot: 'bg-amber-500' },
    'Off Duty':   { bg: 'bg-amber-100 dark:bg-amber-900/40',     text: 'text-amber-700 dark:text-amber-300',     dot: 'bg-amber-500' },
    'Retired':    { bg: 'bg-red-100 dark:bg-red-900/40',         text: 'text-red-700 dark:text-red-300',         dot: 'bg-red-500' },
    'Suspended':  { bg: 'bg-red-100 dark:bg-red-900/40',         text: 'text-red-700 dark:text-red-300',         dot: 'bg-red-500' },
  };

  const style = config[status] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-500' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {status}
    </span>
  );
}
