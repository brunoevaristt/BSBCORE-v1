import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { DateFilterState, DateFilterType } from '../types';

interface DateRangeFilterProps {
  filter: DateFilterState;
  onChange: (filter: DateFilterState) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ filter, onChange }) => {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as DateFilterType;
    let startDate = '';
    let endDate = '';
    
    const now = new Date();
    
    if (type === 'last-week') {
      const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      startDate = lastWeek.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    } else if (type === 'last-month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      startDate = lastMonth.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    } else if (type === 'specific-date') {
       startDate = now.toISOString().split('T')[0];
       endDate = now.toISOString().split('T')[0];
    }

    onChange({ type, startDate, endDate });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-1 rounded-md border border-slate-200 shadow-sm">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar size={14} className="text-slate-500" />
        </div>
        <select
          value={filter.type}
          onChange={handleTypeChange}
          className="pl-9 pr-8 py-1.5 bg-transparent text-sm font-medium text-slate-700 focus:outline-none appearance-none cursor-pointer hover:bg-slate-50 rounded bg-white"
        >
          <option value="all">Todo o período</option>
          <option value="last-week">Última Semana</option>
          <option value="last-month">Último Mês</option>
          <option value="specific-date">Data Específica</option>
          <option value="custom">Período Personalizado</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
          <ChevronDown size={14} className="text-slate-400" />
        </div>
      </div>

      {(filter.type === 'custom' || filter.type === 'specific-date') && (
        <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
          <input
            type="date"
            value={filter.startDate || ''}
            onChange={(e) => onChange({ ...filter, startDate: e.target.value, endDate: filter.type === 'specific-date' ? e.target.value : filter.endDate })}
            className="text-xs border border-slate-200 rounded px-2 py-1 text-slate-600 bg-white focus:border-slate-400 focus:outline-none"
          />
          {filter.type === 'custom' && (
            <>
              <span className="text-xs text-slate-400">até</span>
              <input
                type="date"
                value={filter.endDate || ''}
                onChange={(e) => onChange({ ...filter, endDate: e.target.value })}
                className="text-xs border border-slate-200 rounded px-2 py-1 text-slate-600 bg-white focus:border-slate-400 focus:outline-none"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
