
import React, { useMemo, useState } from 'react';
import { Transaction, Client, DashboardMetrics, DateFilterState } from '../types';
import MetricCard from '../components/MetricCard';
import DateRangeFilter from '../components/DateRangeFilter';
import { DollarSign, TrendingUp, Users, Activity, Edit2, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  clients: Client[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, clients }) => {
  const [dateFilter, setDateFilter] = useState<DateFilterState>({ type: 'all' });
  const [monthlyGoal, setMonthlyGoal] = useState(0); // Default goal reset to 0
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (dateFilter.type === 'all') return transactions;
    
    return transactions.filter(t => {
      if (!dateFilter.startDate) return true;
      const tDate = t.date.split('T')[0];
      const start = dateFilter.startDate;
      const end = dateFilter.endDate || start;
      return tDate >= start && tDate <= end;
    });
  }, [transactions, dateFilter]);

  // Calculate Metrics on the fly
  const metrics: DashboardMetrics = useMemo(() => {
    const totalRevenue = filteredTransactions
      .filter(t => t.type === 'revenue')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    // MRR = Sum of monthlyValue of active clients (Current Status, not filtered by date usually, but could be)
    const mrr = clients
      .filter(c => c.status === 'active')
      .reduce((acc, curr) => acc + curr.monthlyValue, 0);

    return {
      totalRevenue,
      receivedRevenue: totalRevenue * 0.85, // Mock: 85% collected
      forecastRevenue: totalRevenue + (mrr > 0 ? mrr * 0.2 : 0), // Mock: forecast
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      activeClients: clients.filter(c => c.status === 'active').length,
      mrr,
      arr: mrr * 12,
      growth: 0 // Reset growth
    };
  }, [filteredTransactions, clients]);

  // Goal Progress Calculation (Prevent division by zero)
  const goalProgress = monthlyGoal > 0 ? Math.min((metrics.totalRevenue / monthlyGoal) * 100, 100) : 0;

  // Projection Data for Chart (Dynamic based on current MRR)
  const projectionData = [
    { name: 'Jan', revenue: metrics.mrr * 0.9, recurring: metrics.mrr * 0.8 },
    { name: 'Fev', revenue: metrics.mrr * 0.95, recurring: metrics.mrr * 0.9 },
    { name: 'Mar', revenue: metrics.mrr, recurring: metrics.mrr },
    { name: 'Abr', revenue: metrics.mrr * 1.05, recurring: metrics.mrr * 1.02 },
    { name: 'Mai', revenue: metrics.mrr * 1.12, recurring: metrics.mrr * 1.05 },
    { name: 'Jun', revenue: metrics.mrr * 1.20, recurring: metrics.mrr * 1.10 },
  ];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Hub Inicial</h2>
          <p className="text-slate-500 text-sm">Visão executiva do negócio hoje.</p>
        </div>
        <div className="flex items-center gap-4">
           <DateRangeFilter filter={dateFilter} onChange={setDateFilter} />
           <div className="text-right hidden md:block pl-4 border-l border-slate-200">
             <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">MRR Atual</p>
             <p className="text-2xl font-bold text-emerald-600">{formatCurrency(metrics.mrr)}</p>
           </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Receita (Período)"
          value={formatCurrency(metrics.totalRevenue)}
          trend={0}
          icon={<DollarSign className="w-5 h-5" />}
        />
        <MetricCard 
          title="Lucro Líquido"
          value={formatCurrency(metrics.netProfit)}
          trend={0}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard 
          title="Despesas"
          value={formatCurrency(metrics.totalExpenses)}
          trend={0}
          trendLabel="vs. mês anterior"
          neutral={true}
          icon={<Activity className="w-5 h-5" />}
        />
        <MetricCard 
          title="Clientes Ativos"
          value={metrics.activeClients.toString()}
          trend={0}
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Secondary KPI & Projection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Projeção de Receita Recorrente (6 Meses)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `R$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRv)" />
                <Area type="monotone" dataKey="recurring" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Snapshot Cards */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-400 font-medium uppercase">Receita Anual Projetada (ARR)</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(metrics.arr)}</p>
            <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
              <div className="bg-slate-900 h-full rounded-full" style={{ width: metrics.arr > 0 ? '65%' : '0%' }}></div>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-right">Baseado no MRR atual</p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-slate-400 font-medium uppercase flex items-center">
                   <Target size={14} className="mr-1" /> Meta Mensal
                </span>
                <button 
                  onClick={() => setIsEditingGoal(!isEditingGoal)}
                  className="text-slate-300 hover:text-slate-600 transition-colors"
                >
                  <Edit2 size={14} />
                </button>
             </div>
             
             {isEditingGoal ? (
               <div className="mb-4">
                 <input 
                   type="number" 
                   value={monthlyGoal}
                   onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                   className="w-full text-lg font-bold border-b border-slate-300 outline-none pb-1 bg-white text-slate-900"
                   autoFocus
                   onBlur={() => setIsEditingGoal(false)}
                   placeholder="0"
                 />
               </div>
             ) : (
               <div className="flex items-baseline mb-4">
                 <span className="text-2xl font-bold text-slate-900">{formatCurrency(monthlyGoal)}</span>
               </div>
             )}

             <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between text-xs">
                   <span className="font-semibold text-emerald-600">{Math.round(goalProgress)}% Atingido</span>
                   <span className="text-slate-400">{formatCurrency(metrics.totalRevenue)} atual</span>
                </div>
                <div className="overflow-hidden h-2 mb-1 text-xs flex rounded-full bg-slate-100">
                   <div style={{ width: `${goalProgress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"></div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
