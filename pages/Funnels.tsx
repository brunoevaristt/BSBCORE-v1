import React, { useState } from 'react';
import { Funnel, FunnelStage } from '../types';
import { Plus, Edit2, Check, X, ArrowUp, ArrowDown } from 'lucide-react';

interface FunnelsProps {
  funnels: Funnel[];
  setFunnels: React.Dispatch<React.SetStateAction<Funnel[]>>;
}

const Funnels: React.FC<FunnelsProps> = ({ funnels, setFunnels }) => {
  const [activeFunnelId, setActiveFunnelId] = useState<string>(funnels[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFunnelName, setNewFunnelName] = useState('');

  const activeFunnel = funnels.find(f => f.id === activeFunnelId) || funnels[0];

  const handleStageUpdate = (stageId: string, field: keyof FunnelStage, value: string | number) => {
    setFunnels(prev => prev.map(f => {
      if (f.id !== activeFunnelId) return f;
      return {
        ...f,
        stages: f.stages.map(s => s.id === stageId ? { ...s, [field]: value } : s)
      };
    }));
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    if (!activeFunnel) return;
    const newStages = [...activeFunnel.stages];
    if (direction === 'up' && index > 0) {
      [newStages[index], newStages[index - 1]] = [newStages[index - 1], newStages[index]];
    } else if (direction === 'down' && index < newStages.length - 1) {
      [newStages[index], newStages[index + 1]] = [newStages[index + 1], newStages[index]];
    }
    
    setFunnels(prev => prev.map(f => {
      if (f.id !== activeFunnelId) return f;
      return { ...f, stages: newStages };
    }));
  };

  const handleCreateFunnel = () => {
    if (!newFunnelName.trim()) return;
    const newFunnel: Funnel = {
      id: Math.random().toString(36).substr(2, 9),
      name: newFunnelName,
      stages: [
         { id: '1', name: 'Nova Etapa', count: 0, value: 0, color: '#94a3b8' }
      ]
    };
    setFunnels([...funnels, newFunnel]);
    setActiveFunnelId(newFunnel.id);
    setIsCreating(false);
    setNewFunnelName('');
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('pt-BR').format(num);
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Funis de Vendas</h2>
          <p className="text-slate-500 text-sm">Gestão visual do pipeline.</p>
        </div>
        <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`p-2 rounded-md transition-colors ${isEditing ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-900'}`}
              title="Editar Etapas"
            >
              <Edit2 size={18} />
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 overflow-x-auto">
        {funnels.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFunnelId(f.id)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeFunnelId === f.id 
                ? 'border-slate-900 text-slate-900' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {f.name}
          </button>
        ))}
        {isCreating ? (
          <div className="flex items-center gap-2 pb-2">
            <input 
              type="text" 
              value={newFunnelName}
              onChange={(e) => setNewFunnelName(e.target.value)}
              className="text-sm border border-slate-200 rounded px-2 py-1 outline-none bg-white text-slate-900"
              placeholder="Nome do Funil"
              autoFocus
            />
            <button onClick={handleCreateFunnel} className="text-emerald-500 hover:text-emerald-700"><Check size={16} /></button>
            <button onClick={() => setIsCreating(false)} className="text-rose-500 hover:text-rose-700"><X size={16} /></button>
          </div>
        ) : (
          <button 
            onClick={() => setIsCreating(true)}
            className="pb-3 text-sm font-medium text-slate-400 hover:text-slate-600 flex items-center"
          >
            <Plus size={14} className="mr-1" /> Novo Funil
          </button>
        )}
      </div>

      {/* Funnel Visualization */}
      <div className="flex justify-center py-10">
         <div className="w-full max-w-2xl flex flex-col items-center space-y-1">
            {activeFunnel.stages.map((stage, index) => {
               const widthPercent = 100 - (index * (60 / Math.max(activeFunnel.stages.length, 1))); // Decreasing width
               
               return (
                 <div 
                    key={stage.id} 
                    className="relative group transition-all duration-300"
                    style={{ width: `${widthPercent}%` }}
                 >
                    {/* The Funnel Shape Block */}
                    <div 
                       className="h-24 md:h-28 relative flex items-center justify-center text-white shadow-md hover:brightness-110 transition-all rounded-sm"
                       style={{ 
                          backgroundColor: stage.color,
                          // Creating a subtle trapezoid look with clip-path
                          clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
                          margin: '0 auto'
                       }}
                    >
                       <div className="text-center z-10 px-4">
                          <div className="font-bold text-2xl md:text-3xl drop-shadow-md">
                              {isEditing ? (
                                <input 
                                    type="number" 
                                    value={stage.count}
                                    onChange={(e) => handleStageUpdate(stage.id, 'count', Number(e.target.value))}
                                    className="bg-transparent text-center w-24 border-b border-white/50 text-white placeholder-white/50 outline-none"
                                />
                              ) : formatNumber(stage.count)}
                          </div>
                          
                          <div className="font-medium text-white/90 text-sm md:text-base mt-1 drop-shadow-sm">
                              {isEditing ? (
                                <input 
                                    type="text" 
                                    value={stage.name}
                                    onChange={(e) => handleStageUpdate(stage.id, 'name', e.target.value)}
                                    className="bg-transparent text-center border-b border-white/50 text-white placeholder-white/50 outline-none w-full"
                                />
                              ) : stage.name}
                          </div>
                       </div>
                    </div>

                    {/* Value Tag Floating Right */}
                    {stage.value > 0 && (
                        <div className="absolute top-1/2 -right-24 md:-right-32 transform -translate-y-1/2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100 text-xs md:text-sm text-slate-600 font-medium whitespace-nowrap">
                           {formatCurrency(stage.value)}
                        </div>
                    )}

                    {/* Move Controls in Edit Mode */}
                    {isEditing && (
                      <div className="absolute left-0 -ml-10 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                         <button 
                           onClick={() => handleMoveStage(index, 'up')}
                           disabled={index === 0}
                           className="p-1 bg-white border border-slate-200 rounded text-slate-500 hover:text-slate-900 disabled:opacity-30"
                         >
                           <ArrowUp size={14} />
                         </button>
                         <button 
                           onClick={() => handleMoveStage(index, 'down')}
                           disabled={index === activeFunnel.stages.length - 1}
                           className="p-1 bg-white border border-slate-200 rounded text-slate-500 hover:text-slate-900 disabled:opacity-30"
                         >
                           <ArrowDown size={14} />
                         </button>
                      </div>
                    )}
                 </div>
               );
            })}

            {isEditing && (
              <button 
                onClick={() => {
                  const newStage: FunnelStage = {
                      id: Math.random().toString(36).substr(2, 9),
                      name: 'Nova Etapa',
                      count: 0,
                      value: 0,
                      color: '#64748b' // Default color
                  };
                  setFunnels(prev => prev.map(f => f.id === activeFunnelId ? { ...f, stages: [...f.stages, newStage] } : f));
                }}
                className="mt-6 flex items-center px-4 py-2 border border-dashed border-slate-300 rounded-md text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors bg-white"
              >
                <Plus size={16} className="mr-2" /> Adicionar Etapa
              </button>
            )}
         </div>
      </div>
    </div>
  );
};

export default Funnels;
