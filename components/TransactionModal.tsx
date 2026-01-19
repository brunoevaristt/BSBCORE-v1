import React, { useState, useEffect } from 'react';
import { Client, Transaction, TransactionType } from '../types';
import { X, Calendar, User, DollarSign, Tag, Plus } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Partial<Transaction>) => void;
  onAddClient: () => void;
  clients: Client[];
  initialData?: Partial<Transaction> | null;
}

type TransactionMode = 'recurring' | 'avulso' | 'expense';

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, onAddClient, clients, initialData }) => {
  const [mode, setMode] = useState<TransactionMode>('recurring');

  const [selectedClientId, setSelectedClientId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState('Serviços');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Recurring specific fields
  const [discount, setDiscount] = useState<number>(0);
  const [extraServiceDesc, setExtraServiceDesc] = useState('');
  const [extraServiceValue, setExtraServiceValue] = useState<number>(0);

  // Derived state for contract info
  const selectedClient = clients.find(c => c.id === selectedClientId);
  const [monthsActive, setMonthsActive] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Determine mode based on initial data
        if (initialData.type === 'expense') {
          setMode('expense');
        } else if (initialData.frequency === 'recurring' && initialData.clientId) {
          setMode('recurring');
        } else {
          setMode('avulso');
        }

        setSelectedClientId(initialData.clientId || '');
        setDescription(initialData.description);
        setAmount(initialData.amount);
        setCategory(initialData.category);
        setDate(initialData.date.split('T')[0]);
        setDiscount(initialData.discount || 0);
        setExtraServiceDesc(initialData.additionalServiceDescription || '');
        setExtraServiceValue(initialData.additionalServiceValue || 0);
      } else {
        // Create Mode - Reset
        resetForm();
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (selectedClient && mode === 'recurring') {
      const start = new Date(selectedClient.startDate);
      const now = new Date();
      const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
      setMonthsActive(months > 0 ? months : 0);

      // Only set amount from client if it's a NEW transaction or changing client
      if (!initialData || (initialData && initialData.clientId !== selectedClientId)) {
        setAmount(selectedClient.monthlyValue);
      }
    }
  }, [selectedClient, mode]);

  // Auto-calculate total for recurring
  const totalAmount = mode === 'recurring'
    ? (selectedClient ? selectedClient.monthlyValue - discount + extraServiceValue : 0)
    : amount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine description based on mode
    let finalDesc = description;
    if (mode === 'recurring' && selectedClient && (!description || description.includes('Mensalidade'))) {
      finalDesc = `${selectedClient.name} - Mensalidade (${new Date(date).toLocaleDateString('pt-BR', { month: 'long' })})`;
    }

    const payload: Partial<Transaction> = {
      description: finalDesc,
      amount: totalAmount,
      type: mode === 'expense' ? 'expense' : 'revenue',
      frequency: mode === 'recurring' ? 'recurring' : 'one-time',
      date,
      clientId: mode === 'recurring' ? selectedClientId : undefined,
      category: mode === 'recurring' ? 'Mensalidade' : category,
      discount: mode === 'recurring' ? discount : 0,
      additionalServiceDescription: mode === 'recurring' ? extraServiceDesc : undefined,
      additionalServiceValue: mode === 'recurring' ? extraServiceValue : 0,
    };

    if (initialData && 'id' in initialData) {
      payload.id = initialData.id; // Preserve ID for updates if it exists
    }

    onSave(payload);
    onClose();
  };

  const resetForm = () => {
    setMode('recurring');
    setSelectedClientId('');
    setDescription('');
    setAmount(0);
    setCategory('Serviços');
    setDate(new Date().toISOString().split('T')[0]);
    setDiscount(0);
    setExtraServiceDesc('');
    setExtraServiceValue(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            {initialData
              ? (initialData.id ? 'Editar Transação' : 'Duplicar Transação')
              : 'Nova Transação'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 3-Way Toggle */}
          <div className="flex flex-col gap-1 bg-slate-100 p-1 rounded-lg">
            <div className="flex">
              <button
                type="button"
                onClick={() => setMode('recurring')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'recurring' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Cliente Recorrente
              </button>
              <button
                type="button"
                onClick={() => setMode('avulso')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'avulso' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Cliente Avulso
              </button>
            </div>
            <button
              type="button"
              onClick={() => setMode('expense')}
              className={`w-full py-2 text-sm font-medium rounded-md transition-all ${mode === 'expense' ? 'bg-rose-100 text-rose-700 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              Despesa
            </button>
          </div>

          <div className="space-y-4">
            {/* Date Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Data</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {mode === 'recurring' ? (
              <>
                {/* Recurring Logic */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Selecionar Cliente</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <User className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                      <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                        required
                      >
                        <option value="">Selecione...</option>
                        {clients.filter(c => c.status === 'active').map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={onAddClient}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 transition-colors"
                      title="Adicionar Novo Cliente"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {selectedClient && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Contrato Ativo:</span>
                      <span className="font-semibold text-slate-700">{monthsActive} meses</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Valor Base:</span>
                      <span className="font-semibold text-slate-900">R$ {selectedClient.monthlyValue.toLocaleString('pt-BR')}</span>
                    </div>

                    <div className="border-t border-slate-200 pt-3 space-y-3">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Desconto / Bônus (-)</label>
                        <input
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(Number(e.target.value))}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm bg-white text-rose-600"
                          placeholder="0,00"
                        />
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-slate-500 mb-1 block">Serviço Extra (Descrição)</label>
                          <input
                            type="text"
                            value={extraServiceDesc}
                            onChange={(e) => setExtraServiceDesc(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm bg-white text-slate-900"
                            placeholder="Ex: Landing Page"
                          />
                        </div>
                        <div className="w-1/3">
                          <label className="text-xs text-slate-500 mb-1 block">Valor (+)</label>
                          <input
                            type="number"
                            value={extraServiceValue}
                            onChange={(e) => setExtraServiceValue(Number(e.target.value))}
                            className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm bg-white text-emerald-600"
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* One-Time or Expense Logic */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Descrição</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 outline-none focus:border-slate-400"
                    placeholder={mode === 'expense' ? "Ex: Aluguel do Escritório" : "Ex: Consultoria Pontual"}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Valor</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className={`w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-slate-400 ${mode === 'expense' ? 'text-rose-600 font-semibold' : 'text-slate-900'}`}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Categoria</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 outline-none focus:border-slate-400"
                        placeholder={mode === 'expense' ? "Ex: Infraestrutura" : "Ex: Serviços"}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-sm">
              <span className="text-slate-500 block">Total Final</span>
              <span className={`font-bold text-lg ${mode === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                {mode === 'expense' && '- '}{totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm text-white ${mode === 'expense' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 hover:bg-slate-800'}`}
            >
              {initialData
                ? (initialData.id ? 'Atualizar' : 'Salvar Cópia')
                : (mode === 'expense' ? 'Salvar Despesa' : 'Salvar Receita')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
