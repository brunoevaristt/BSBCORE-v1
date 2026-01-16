
import React, { useRef } from 'react';
import { Save, Download, Upload, Trash2, Bell, Shield, User } from 'lucide-react';

interface SettingsProps {
  onExportData: () => void;
  onImportData: (file: File) => void;
  onClearData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onExportData, onImportData, onClearData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if(confirm(`Deseja importar os dados do arquivo "${file.name}"? Isso substituirá os dados atuais.`)) {
        onImportData(file);
      }
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configurações</h2>
        <p className="text-slate-500 text-sm">Gerencie preferências e dados do sistema.</p>
      </div>

      {/* Perfil */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <User size={18} className="text-slate-500" />
          <h3 className="font-semibold text-slate-900">Perfil de Acesso</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
             <input type="text" defaultValue="Administrador BSB" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed" disabled />
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
             <input type="text" defaultValue="admin@bsbmedia.com" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed" disabled />
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Função</label>
             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
               Super Admin
             </span>
           </div>
        </div>
      </div>

      {/* Preferências */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Bell size={18} className="text-slate-500" />
          <h3 className="font-semibold text-slate-900">Preferências do Sistema</h3>
        </div>
        <div className="p-6 space-y-4">
           <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Notificações de Sistema</p>
                <p className="text-xs text-slate-500">Exibir toasts de confirmação e erro.</p>
              </div>
              <div className="relative inline-block w-10 h-6 align-middle select-none">
                 <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-emerald-500 checked:bg-emerald-500 transition-all duration-300 right-4 top-0.5" />
                 <label className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-200 cursor-pointer"></label>
              </div>
           </div>
           <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Som de Alerta</p>
                <p className="text-xs text-slate-500">Tocar som ao concluir ações.</p>
              </div>
              <div className="relative inline-block w-10 h-6 align-middle select-none">
                 <input type="checkbox" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-emerald-500 checked:bg-emerald-500 transition-all duration-300 right-4 top-0.5" />
                 <label className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-200 cursor-pointer"></label>
              </div>
           </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Shield size={18} className="text-slate-500" />
          <h3 className="font-semibold text-slate-900">Gerenciamento de Dados</h3>
        </div>
        <div className="p-6 space-y-6">
           <div className="flex items-start gap-4">
              <div className="bg-slate-100 p-3 rounded-lg">
                <Download size={24} className="text-slate-600" />
              </div>
              <div className="flex-1">
                 <h4 className="text-sm font-bold text-slate-900">Exportar Backup (JSON)</h4>
                 <p className="text-xs text-slate-500 mt-1 mb-3">
                   Baixe um arquivo contendo todas as transações, clientes, funis e tracking. Útil para backup ou migração.
                 </p>
                 <button 
                   onClick={onExportData}
                   className="text-sm font-medium text-slate-700 bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                 >
                   Baixar Dados
                 </button>
              </div>
           </div>

           <div className="border-t border-slate-100"></div>

           <div className="flex items-start gap-4">
              <div className="bg-slate-100 p-3 rounded-lg">
                <Upload size={24} className="text-slate-600" />
              </div>
              <div className="flex-1">
                 <h4 className="text-sm font-bold text-slate-900">Restaurar Backup</h4>
                 <p className="text-xs text-slate-500 mt-1 mb-3">
                   Carregue um arquivo JSON exportado anteriormente. <span className="text-rose-500 font-bold">Cuidado:</span> Isso substituirá todos os dados atuais.
                 </p>
                 <input 
                   type="file" 
                   accept=".json" 
                   ref={fileInputRef}
                   onChange={handleFileChange}
                   className="hidden" 
                 />
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="text-sm font-medium text-slate-700 bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                 >
                   Selecionar Arquivo
                 </button>
              </div>
           </div>

           <div className="border-t border-slate-100"></div>

           <div className="flex items-start gap-4">
              <div className="bg-rose-50 p-3 rounded-lg">
                <Trash2 size={24} className="text-rose-600" />
              </div>
              <div className="flex-1">
                 <h4 className="text-sm font-bold text-rose-600">Zona de Perigo</h4>
                 <p className="text-xs text-slate-500 mt-1 mb-3">
                   Limpar todos os dados do aplicativo. Esta ação é irreversível.
                 </p>
                 <button 
                   onClick={() => {
                     if(confirm('ATENÇÃO: Você tem certeza absoluta? Todos os dados serão perdidos.')) {
                       onClearData();
                     }
                   }}
                   className="text-sm font-bold text-white bg-rose-600 border border-rose-600 px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
                 >
                   Limpar Tudo (Reset)
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
