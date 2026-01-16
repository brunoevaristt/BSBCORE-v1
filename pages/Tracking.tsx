
import React, { useState, useMemo } from 'react';
import { Funnel, FunnelStage, TrackingEntry } from '../types';
import { Plus, ChevronDown, ArrowUp, ArrowDown, Minus, X, Info, MoreHorizontal, Edit2, Trash2, Settings, GripVertical } from 'lucide-react';

interface TrackingProps {
  funnels: Funnel[];
  entries: TrackingEntry[];
  onAddEntry: (entry: TrackingEntry) => void;
  onUpdateEntry: (entry: TrackingEntry) => void;
  onDeleteEntry: (id: string) => void;
  onUpdateFunnel: (funnel: Funnel) => void;
}

const Tracking: React.FC<TrackingProps> = ({ funnels, entries, onAddEntry, onUpdateEntry, onDeleteEntry, onUpdateFunnel }) => {
  const [activeFunnelId, setActiveFunnelId] = useState<string>(funnels[0]?.id || '');
  
  // Data Entry Modal State
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TrackingEntry | null>(null);
  
  // Funnel Settings Modal State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<Funnel | null>(null);

  // Form State
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [inputMetrics, setInputMetrics] = useState<Record<string, number>>({});
  const [inputRevenue, setInputRevenue] = useState<number>(0);

  const activeFunnel = funnels.find(f => f.id === activeFunnelId) || funnels[0];

  const funnelEntries = useMemo(() => {
    return entries
      .filter(e => e.funnelId === activeFunnelId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [entries, activeFunnelId]);

  // --- Entry Management ---
  const handleOpenEntryModal = (entry?: TrackingEntry) => {
    if (entry) {
        setEditingEntry(entry);
        setDateRange({ start: entry.startDate, end: entry.endDate });
        setInputMetrics(entry.metrics);
        setInputRevenue(entry.revenue);
    } else {
        setEditingEntry(null);
        // Default: Last week
        const today = new Date();
        const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        setDateRange({ 
            start: lastWeek.toISOString().split('T')[0], 
            end: today.toISOString().split('T')[0] 
        });
        
        const initialMetrics: Record<string, number> = {};
        activeFunnel.stages.forEach(s => initialMetrics[s.id] = 0);
        setInputMetrics(initialMetrics);
        setInputRevenue(0);
    }
    setIsEntryModalOpen(true);
  };

  const handleSubmitEntry = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entryData: TrackingEntry = {
        id: editingEntry ? editingEntry.id : Math.random().toString(36).substr(2, 9),
        funnelId: activeFunnelId,
        startDate: dateRange.start,
        endDate: dateRange.end,
        metrics: inputMetrics,
        revenue: inputRevenue
    };

    if (editingEntry) {
        onUpdateEntry(entryData);
    } else {
        onAddEntry(entryData);
    }
    setIsEntryModalOpen(false);
  };

  const handleDelete = (id: string) => {
      if(confirm('Tem certeza que deseja excluir este registro?')) {
          onDeleteEntry(id);
      }
  };

  // --- Funnel Configuration Management ---
  const handleOpenSettings = () => {
    setEditingFunnel(JSON.parse(JSON.stringify(activeFunnel))); // Deep copy
    setIsSettingsModalOpen(true);
  };

  const handleUpdateStageName = (id: string, name: string) => {
      if(!editingFunnel) return;
      const updatedStages = editingFunnel.stages.map(s => s.id === id ? { ...s, name } : s);
      setEditingFunnel({ ...editingFunnel, stages: updatedStages });
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
      if (!editingFunnel) return;
      const newStages = [...editingFunnel.stages];
      if (direction === 'up' && index > 0) {
          [newStages[index], newStages[index - 1]] = [newStages[index - 1], newStages[index]];
      } else if (direction === 'down' && index < newStages.length - 1) {
          [newStages[index], newStages[index + 1]] = [newStages[index + 1], newStages[index]];
      }
      setEditingFunnel({ ...editingFunnel, stages: newStages });
  };

  const handleDeleteStage = (index: number) => {
      if (!editingFunnel) return;
      const newStages = [...editingFunnel.stages];
      newStages.splice(index, 1);
      setEditingFunnel({ ...editingFunnel, stages: newStages });
  };

  const handleAddStage = () => {
      if (!editingFunnel) return;
      const newStage: FunnelStage = {
          id: Math.random().toString(36).substr(2, 9),
          name: 'Nova Etapa',
          count: 0, 
          value: 0,
          color: '#64748b'
      };
      setEditingFunnel({ ...editingFunnel, stages: [...editingFunnel.stages, newStage] });
  };

  const handleSaveFunnelSettings = () => {
      if(editingFunnel) {
          onUpdateFunnel(editingFunnel);
          setIsSettingsModalOpen(false);
      }
  };


  // --- Helper Components ---
  const ConversionBadge = ({ current, total }: { current: number, total: number }) => {
      if (!total || total === 0) return <span className="text-[10px] text-slate-300">-</span>;
      const rate = Math.round((current / total) * 100);
      return (
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded ml-2">
              {rate}%
          </span>
      );
  };

  const PeriodComparison = ({ currentVal, prevVal }: { currentVal: number, prevVal: number }) => {
      if (prevVal === undefined) return null;
      const diff = currentVal - prevVal;
      if (diff === 0) return <Minus size={10} className="text-slate-300 ml-1 inline" />;
      const isPositive = diff > 0;
      const percent = prevVal !== 0 ? Math.round((Math.abs(diff) / prevVal) * 100) : 100;

      return (
          <div className="flex items-center text-[10px] mt-0.5 font-bold">
             {isPositive ? <ArrowUp size={10} className="text-emerald-500 mr-0.5" /> : <ArrowDown size={10} className="text-rose-500 mr-0.5" />}
             <span className={isPositive ? "text-emerald-600" : "text-rose-600"}>{percent}%</span>
          </div>
      );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tracking Operacional</h2>
          <p className="text-slate-500 text-sm">Acompanhamento manual e análise de conversão.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center gap-2">
             <div className="relative">
                <select
                value={activeFunnelId}
                onChange={(e) => setActiveFunnelId(e.target.value)}
                className="appearance-none bg-white border border-slate-300 pl-4 pr-10 py-2 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:border-slate-500 shadow-sm"
                >
                    {funnels.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-2.5 text-slate-500 pointer-events-none" />
             </div>
             <button 
                onClick={handleOpenSettings}
                className="p-2 bg-white border border-slate-300 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
                title="Configurar Funil (Editar Etapas)"
             >
                 <Settings size={18} />
             </button>
          </div>
          
          <button 
            onClick={() => handleOpenEntryModal()}
            className="flex items-center bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus size={16} className="mr-2" />
            Novo Registro
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
         <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
               <tr>
                  <th className="px-4 py-4 min-w-[140px] sticky left-0 bg-slate-50 z-10 border-r border-slate-200">Período</th>
                  {activeFunnel.stages.map(stage => (
                      <th key={stage.id} className="px-4 py-4 min-w-[140px] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full border border-slate-300" style={{ backgroundColor: stage.color }}></span>
                              {stage.name}
                          </div>
                      </th>
                  ))}
                  <th className="px-4 py-4 text-right min-w-[120px] bg-slate-50/50">Faturamento</th>
                  <th className="px-4 py-4 w-[60px]"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {funnelEntries.map((entry, index) => {
                   const prevEntry = funnelEntries[index + 1];
                   return (
                       <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                           <td className="px-4 py-3 font-medium text-slate-900 sticky left-0 bg-white border-r border-slate-100 group-hover:bg-slate-50 transition-colors">
                               <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Semana</div>
                               <span className="whitespace-nowrap">
                                {new Date(entry.startDate).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})} 
                                <span className="mx-1 text-slate-300">-</span> 
                                {new Date(entry.endDate).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                               </span>
                           </td>
                           
                           {activeFunnel.stages.map((stage, stageIdx) => {
                               const value = entry.metrics[stage.id] || 0;
                               const prevValue = prevEntry ? prevEntry.metrics[stage.id] : undefined;
                               const previousStageId = stageIdx > 0 ? activeFunnel.stages[stageIdx - 1].id : null;
                               const previousStageValue = previousStageId ? (entry.metrics[previousStageId] || 0) : 0;
                               
                               return (
                                   <td key={stage.id} className="px-4 py-3 border-r border-dashed border-slate-100 last:border-0">
                                       <div className="flex items-baseline">
                                           <span className="text-base font-bold text-slate-800">{value}</span>
                                           {stageIdx > 0 && <ConversionBadge current={value} total={previousStageValue} />}
                                       </div>
                                       {prevValue !== undefined && <PeriodComparison currentVal={value} prevVal={prevValue} />}
                                   </td>
                               );
                           })}

                           <td className="px-4 py-3 text-right bg-slate-50/30">
                                <div className="font-bold text-slate-900">
                                    {entry.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </div>
                                {prevEntry && (
                                    <div className="flex justify-end">
                                        <PeriodComparison currentVal={entry.revenue} prevVal={prevEntry.revenue} />
                                    </div>
                                )}
                           </td>
                           <td className="px-2">
                               <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                      onClick={() => handleOpenEntryModal(entry)}
                                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded border border-transparent hover:border-slate-200"
                                      title="Editar"
                                   >
                                       <Edit2 size={14} />
                                   </button>
                                   <button 
                                      onClick={() => handleDelete(entry.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded border border-transparent hover:border-rose-200"
                                      title="Excluir"
                                   >
                                       <Trash2 size={14} />
                                   </button>
                               </div>
                           </td>
                       </tr>
                   );
               })}
               {funnelEntries.length === 0 && (
                   <tr>
                       <td colSpan={activeFunnel.stages.length + 3} className="text-center py-12 text-slate-400">
                           <Info className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                           <p>Nenhum registro encontrado.</p>
                           <button onClick={() => handleOpenEntryModal()} className="text-slate-900 font-bold hover:underline mt-2">Adicionar o primeiro registro</button>
                       </td>
                   </tr>
               )}
            </tbody>
         </table>
      </div>

      {/* Entry Modal */}
      {isEntryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                  <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
                      <h3 className="text-lg font-bold text-slate-900">
                          {editingEntry ? 'Editar Registro' : 'Novo Registro de Tracking'}
                      </h3>
                      <button onClick={() => setIsEntryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <form onSubmit={handleSubmitEntry} className="overflow-y-auto p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data Início</label>
                              <input 
                                  type="date" 
                                  required
                                  value={dateRange.start}
                                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 bg-white outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data Fim</label>
                              <input 
                                  type="date" 
                                  required
                                  value={dateRange.end}
                                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 bg-white outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                              />
                          </div>
                      </div>

                      <div className="border-t border-slate-100 my-2"></div>

                      <h4 className="text-sm font-bold text-slate-900 mb-2">Preencher Funil</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                          {activeFunnel.stages.map((stage) => (
                              <div key={stage.id}>
                                  <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-2">
                                     <span className="w-2.5 h-2.5 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: stage.color }}></span>
                                     {stage.name}
                                  </label>
                                  <input 
                                      type="number"
                                      min="0"
                                      value={inputMetrics[stage.id] !== undefined ? inputMetrics[stage.id] : ''}
                                      onChange={(e) => setInputMetrics({ ...inputMetrics, [stage.id]: Number(e.target.value) })}
                                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 bg-white outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
                                      placeholder="0"
                                  />
                              </div>
                          ))}
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <label className="block text-xs font-bold text-slate-900 uppercase mb-1">Faturamento Total (R$)</label>
                          <input 
                              type="number"
                              min="0"
                              step="0.01"
                              value={inputRevenue}
                              onChange={(e) => setInputRevenue(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-lg font-bold text-emerald-600 bg-white outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              placeholder="0,00"
                          />
                      </div>

                      <div className="pt-2">
                          <button
                              type="submit"
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg text-sm font-bold transition-colors shadow-sm"
                          >
                              {editingEntry ? 'Salvar Alterações' : 'Salvar Registro'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Funnel Settings Modal */}
      {isSettingsModalOpen && editingFunnel && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
                      <h3 className="text-lg font-bold text-slate-900">Editar Estrutura do Funil</h3>
                      <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto">
                      <div className="mb-4">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Funil</label>
                          <input 
                              type="text" 
                              value={editingFunnel.name}
                              onChange={(e) => setEditingFunnel({...editingFunnel, name: e.target.value})}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 bg-white outline-none focus:ring-2 focus:ring-slate-900"
                          />
                      </div>

                      <div className="space-y-3">
                         <label className="block text-xs font-bold text-slate-500 uppercase">Etapas (Arraste ou Edite)</label>
                         {editingFunnel.stages.map((stage, index) => (
                             <div key={stage.id} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg group">
                                 <div className="flex flex-col text-slate-400 px-1 cursor-grab active:cursor-grabbing">
                                    <button 
                                        type="button" 
                                        onClick={() => handleMoveStage(index, 'up')}
                                        disabled={index === 0}
                                        className="hover:text-slate-800 disabled:opacity-20"
                                    >
                                        <ArrowUp size={12} />
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => handleMoveStage(index, 'down')}
                                        disabled={index === editingFunnel.stages.length - 1}
                                        className="hover:text-slate-800 disabled:opacity-20"
                                    >
                                        <ArrowDown size={12} />
                                    </button>
                                 </div>
                                 <input 
                                     type="text" 
                                     value={stage.name}
                                     onChange={(e) => handleUpdateStageName(stage.id, e.target.value)}
                                     className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm text-slate-900 bg-white outline-none focus:border-slate-500"
                                 />
                                 <button 
                                     onClick={() => handleDeleteStage(index)}
                                     className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                     title="Remover Etapa"
                                 >
                                     <Trash2 size={16} />
                                 </button>
                             </div>
                         ))}
                      </div>

                      <button 
                         onClick={handleAddStage}
                         className="mt-4 w-full py-2 border border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                      >
                          <Plus size={16} /> Adicionar Nova Etapa
                      </button>
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                      <button 
                          onClick={() => setIsSettingsModalOpen(false)}
                          className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900"
                      >
                          Cancelar
                      </button>
                      <button 
                          onClick={handleSaveFunnelSettings}
                          className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 shadow-sm"
                      >
                          Salvar Estrutura
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Tracking;
