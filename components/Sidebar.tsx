
import React from 'react';
import { LayoutDashboard, Wallet, Users, Filter, Settings, LogOut, Bot, Table } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Hub Inicial', icon: <LayoutDashboard size={20} /> },
    { id: 'tracking', label: 'Tracking', icon: <Table size={20} /> },
    { id: 'finance', label: 'Financeiro', icon: <Wallet size={20} /> },
    { id: 'clients', label: 'Clientes', icon: <Users size={20} /> },
    { id: 'funnels', label: 'Funis', icon: <Filter size={20} /> },
    { id: 'ai-intelligence', label: 'Inteligência Artificial', icon: <Bot size={20} /> },
  ];

  return (
    <aside className="w-64 bg-white h-screen border-r border-slate-200 flex flex-col fixed left-0 top-0 z-40">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">BSB<span className="text-slate-400 font-light">Core</span></h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              w-full flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors
              ${activePage === item.id 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
            `}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-md mb-2
            ${activePage === 'settings' 
              ? 'bg-slate-100 text-slate-900' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
          `}
        >
          <Settings size={18} className="mr-3" />
          Configurações
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
        >
          <LogOut size={18} className="mr-3" />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
