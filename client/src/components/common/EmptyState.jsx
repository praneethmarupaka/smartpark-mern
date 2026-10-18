import React from 'react';
import { SearchX } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = SearchX,
  title = 'No records found',
  description = 'No results match your selected criteria. Try adjusting your filters or location search.',
  action = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
