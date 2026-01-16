import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { X, User, DollarSign, Calendar, Tag } from 'lucide-react';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Partial<Client>) => void;
  initialData?: Client | null;
}

const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [monthlyValue, setMonthlyValue] = useState<number>(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setMonthlyValue(initialData.monthlyValue);
        setStartDate(initialData.startDate.split('T')[0]);
        setTags(initialData.tags.join(', '));
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Client> = {
      name,
      monthlyValue,
      startDate,
      tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      status: initialData ? initialData.status : 'active',
      ltv: monthlyValue * 12 // Simplified Estimate
    };
    
    if (initialData) {
      payload.id = initialData.id;
    }

    onSave(payload);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setMonthlyValue(0);
    setStartDate(new Date().toISOString().split('T')[0]);
    setTags('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{initialData ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nome da Empresa</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                placeholder="Ex: Alpha Corp"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Valor Mensal (Recorrência)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="number"
                value={monthlyValue}
                onChange={(e) => setMonthlyValue(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Data de Início</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tags (separadas por vírgula)</label>
            <div className="relative">
              <Tag className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                placeholder="Ex: Tech, Enterprise, Indicação"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              {initialData ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
