import React, { useState } from 'react';
import { Client } from '../types';
import { MoreHorizontal, Circle, Search, Filter, Edit2, Trash2 } from 'lucide-react';

interface ClientsProps {
  clients: Client[];
  onAddClient: () => void;
  onUpdateClient: (client: Partial<Client>) => void;
  onDeleteClient: (id: string) => void;
  onEditClient: (client: Client) => void; // Prop to trigger modal from parent
}

const Clients: React.FC<ClientsProps> = ({ clients, onAddClient, onUpdateClient, onDeleteClient, onEditClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'churned'>('all');

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          client.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Clientes Recorrentes</h2>
          <p className="text-slate-500 text-sm">Gestão da base ativa e LTV.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Buscar cliente..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-400"
             />
           </div>
           <div className="relative">
             <Filter className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
             <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-400 appearance-none bg-white cursor-pointer"
             >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="paused">Pausados</option>
                <option value="churned">Cancelados</option>
             </select>
           </div>
           <button 
             onClick={onAddClient}
             className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
           >
            Novo Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group relative">
            
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => onEditClient(client)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full"
                    title="Editar"
                >
                    <Edit2 size={16} />
                </button>
                <button 
                    onClick={() => {
                        if(confirm('Tem certeza que deseja excluir este cliente?')) {
                            onDeleteClient(client.id);
                        }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                    title="Excluir"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="flex justify-between items-start mb-4 pr-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                  {client.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 truncate max-w-[150px]">{client.name}</h3>
                  <div className="flex items-center text-xs text-slate-500">
                    <Circle size={8} className={`mr-1.5 ${client.status === 'active' ? 'text-emerald-500 fill-emerald-500' : 'text-amber-500 fill-amber-500'}`} />
                    {client.status === 'active' ? 'Ativo' : client.status === 'paused' ? 'Pausado' : 'Cancelado'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                <span className="text-slate-500">Valor Mensal</span>
                <span className="font-medium text-slate-900">{formatCurrency(client.monthlyValue)}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                <span className="text-slate-500">LTV Estimado</span>
                <span className="font-medium text-emerald-600">{formatCurrency(client.ltv)}</span>
              </div>
              <div className="flex justify-between text-sm pt-1">
                 <span className="text-slate-500">Início</span>
                 <span className="text-slate-700">{new Date(client.startDate).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {client.tags.map(tag => (
                <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-slate-50 text-slate-500 rounded border border-slate-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
        
        {filteredClients.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400">
            Nenhum cliente encontrado com os filtros atuais.
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;
