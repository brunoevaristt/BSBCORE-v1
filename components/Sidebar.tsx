
import React from 'react';
import { LayoutDashboard, Wallet, Users, Filter, Settings, LogOut, Bot, Table, X } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, onLogout, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Hub Inicial', icon: <LayoutDashboard size={20} /> },
    { id: 'tracking', label: 'Tracking', icon: <Table size={20} /> },
    { id: 'finance', label: 'Financeiro', icon: <Wallet size={20} /> },
    { id: 'clients', label: 'Clientes', icon: <Users size={20} /> },
    { id: 'funnels', label: 'Funis', icon: <Filter size={20} /> },
    { id: 'ai-intelligence', label: 'Inteligência Artificial', icon: <Bot size={20} /> },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        w-64 bg-white h-screen border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">BSB<span className="text-slate-400 font-light">Core</span></h1>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${activePage === item.id
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
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
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center px-4 py-2 text-sm font-medium transition-all rounded-xl mb-2
              ${activePage === 'settings'
                ? 'bg-slate-100 text-slate-900 font-bold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
            `}
          >
            <Settings size={18} className="mr-3" />
            Configurações
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all"
          >
            <LogOut size={18} className="mr-3" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
