import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: number; // percentage
  trendLabel?: string;
  icon?: React.ReactNode;
  neutral?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, trendLabel, icon, neutral }) => {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
        
        {trend !== undefined && (
          <div className="flex items-center mt-2 text-xs font-medium">
            {isPositive && !neutral && <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />}
            {isNegative && !neutral && <ArrowDownRight className="w-4 h-4 text-rose-500 mr-1" />}
            {neutral && <Minus className="w-4 h-4 text-slate-400 mr-1" />}
            
            <span className={`
              ${isPositive && !neutral ? 'text-emerald-600' : ''}
              ${isNegative && !neutral ? 'text-rose-600' : ''}
              ${neutral ? 'text-slate-500' : ''}
            `}>
              {Math.abs(trend)}%
            </span>
            <span className="text-slate-400 ml-1">{trendLabel || 'vs. mês anterior'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
