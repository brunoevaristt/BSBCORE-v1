import React, { useState, useMemo } from 'react';
import { Transaction, Client, DateFilterState } from '../types';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, Plus, Calendar, Edit2, Trash2, Copy } from 'lucide-react';
import DateRangeFilter from '../components/DateRangeFilter';
import TransactionModal from '../components/TransactionModal';

interface FinanceProps {
  transactions: Transaction[];
  clients: Client[];
  onAddTransaction: (t: Partial<Transaction>) => void;
  onUpdateTransaction: (t: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  onRepeatMonth: () => void;
  onAddClient: () => void;
}

const Finance: React.FC<FinanceProps> = ({
  transactions,
  clients,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onRepeatMonth,
  onAddClient
}) => {
  const [dateFilter, setDateFilter] = useState<DateFilterState>({ type: 'all' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Partial<Transaction> | null>(null);

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

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDuplicate = (transaction: Transaction) => {
    // Create a copy without the ID
    const { id, ...duplicatedData } = transaction;
    setEditingTransaction(duplicatedData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleSave = (t: Partial<Transaction>) => {
    if (t.id) {
      onUpdateTransaction(t);
    } else {
      onAddTransaction(t);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Financeiro</h2>
          <p className="text-slate-500 text-sm">Gestão de receitas e despesas.</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 items-end sm:items-center">
          <DateRangeFilter filter={dateFilter} onChange={setDateFilter} />

          <button
            onClick={onRepeatMonth}
            className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw size={16} className="mr-2" />
            Repetir Mês
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus size={16} className="mr-2" />
            Nova Transação
          </button>
        </div>
      </div>

      {/* Transaction View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-start">
                      <div className={`mt-1 p-1.5 rounded-full mr-3 shrink-0 ${t.type === 'revenue' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {t.type === 'revenue' ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                      </div>
                      <div>
                        <div className="font-bold">{t.description}</div>
                        {t.frequency === 'recurring' && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 font-medium">Recorrente</span>}
                        {t.additionalServiceDescription && (
                          <div className="text-xs text-slate-500 mt-1 flex items-center italic">
                            <Plus size={10} className="mr-1" />
                            {t.additionalServiceDescription} (+{formatCurrency(t.additionalServiceValue || 0)})
                          </div>
                        )}
                        {t.discount && t.discount > 0 && (
                          <div className="text-xs text-rose-500 mt-0.5 font-medium">
                            Desconto aplicado (-{formatCurrency(t.discount)})
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{t.category}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${t.type === 'revenue' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                      {t.type === 'revenue' ? 'RECEITA' : 'DESPESA'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold text-base ${t.type === 'revenue' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {t.type === 'expense' && '- '}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDuplicate(t)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                        title="Duplicar"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(t)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir esta transação?')) {
                            onDeleteTransaction(t.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredTransactions.map((t) => (
            <div key={t.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className={`p-2 rounded-full mr-3 shrink-0 ${t.type === 'revenue' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {t.type === 'revenue' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{t.description}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {new Date(t.date).toLocaleDateString('pt-BR')} • {t.category}
                    </div>
                  </div>
                </div>
                <div className={`font-bold ${t.type === 'revenue' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {t.type === 'expense' && '- '}{formatCurrency(t.amount)}
                </div>
              </div>

              {t.additionalServiceDescription && (
                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center italic">
                  <Plus size={10} className="mr-1" />
                  {t.additionalServiceDescription} (+{formatCurrency(t.additionalServiceValue || 0)})
                </div>
              )}

              {t.discount && t.discount > 0 && (
                <div className="text-xs text-rose-500 font-medium">
                  Desconto aplicado (-{formatCurrency(t.discount)})
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${t.type === 'revenue' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                  {t.type === 'revenue' ? 'RECEITA' : 'DESPESA'}
                </span>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleDuplicate(t)}
                    className="text-slate-400 hover:text-slate-900 flex items-center text-xs font-bold"
                  >
                    <Copy size={14} className="mr-1" /> Duplicar
                  </button>
                  <button
                    onClick={() => handleEdit(t)}
                    className="text-slate-400 hover:text-slate-900 flex items-center text-xs font-bold"
                  >
                    <Edit2 size={14} className="mr-1" /> Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir esta transação?')) {
                        onDeleteTransaction(t.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 flex items-center text-xs font-bold"
                  >
                    <Trash2 size={14} className="mr-1" /> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredTransactions.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p>Nenhuma transação encontrada para este período.</p>
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        onAddClient={onAddClient}
        clients={clients}
        initialData={editingTransaction}
      />
    </div>
  );
};

export default Finance;
