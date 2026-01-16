
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Clients from './pages/Clients';
import Funnels from './pages/Funnels';
import Tracking from './pages/Tracking';
import Settings from './pages/Settings';
import AudioInput from './components/AudioInput';
import ClientModal from './components/ClientModal';
import AIIntelligence from './pages/AIIntelligence';
import { Transaction, Client, Funnel, TrackingEntry } from './types';
import { ProcessedAudioResult } from './services/geminiService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import * as dataService from './services/dataService';

const AppContent: React.FC = () => {
  const { session, signOut } = useAuth();

  const [activePage, setActivePage] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [trackingEntries, setTrackingEntries] = useState<TrackingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Notification State
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load Data
  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [txs, cls, fns, trk] = await Promise.all([
        dataService.getTransactions(),
        dataService.getClients(),
        dataService.getFunnels(),
        dataService.getTrackingEntries()
      ]);

      setTransactions(txs);
      setClients(cls);

      if (fns.length === 0) {
        await dataService.seedDefaultFunnels();
        const newFns = await dataService.getFunnels();
        setFunnels(newFns);
      } else {
        setFunnels(fns);
      }

      setTrackingEntries(trk);
    } catch (error) {
      console.error("Error loading data:", error);
      setNotification({ message: 'Erro ao carregar dados.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (page: string) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    if (confirm('Deseja realmente sair do sistema?')) {
      await signOut();
    }
  };

  // --- Data Management (Settings) ---
  const handleExportData = () => {
    const data = {
      transactions,
      clients,
      funnels,
      trackingEntries,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bsb-core-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setNotification({ message: 'Backup exportado com sucesso.', type: 'success' });
  };

  const handleImportData = async (file: File) => {
    // Note: Importing JSON backup to Supabase is complex (ID conflicts). 
    // For now, we might just warn or implement a smart merge later.
    // Or we just parse and add them as new entries?
    alert("Importação direta para o banco de dados ainda não implementada para evitar duplicidade. Entre em contato com o suporte.");
  };

  const handleClearData = async () => {
    if (confirm('ATENÇÃO: Isso apagará dados do banco de dados. Tem certeza?')) {
      // Implement delete all in service if needed, or just warn.
      alert("Função desabilitada por segurança no ambiente de produção.");
    }
  };


  // --- Transactions Logic ---
  const handleAddTransaction = async (newTxData: Partial<Transaction>) => {
    try {
      const savedTx = await dataService.addTransaction(newTxData);
      setTransactions(prev => [savedTx, ...prev]);
      setNotification({ message: 'Transação registrada com sucesso.', type: 'success' });
    } catch (error) {
      console.error(error);
      setNotification({ message: 'Erro ao salvar transação.', type: 'error' });
    }
  };

  const handleUpdateTransaction = async (updatedTx: Partial<Transaction>) => {
    try {
      await dataService.updateTransaction(updatedTx);
      setTransactions(prev => prev.map(t => t.id === updatedTx.id ? { ...t, ...updatedTx } as Transaction : t));
      setNotification({ message: 'Transação atualizada.', type: 'success' });
    } catch (error) {
      console.error(error);
      setNotification({ message: 'Erro ao atualizar transação.', type: 'error' });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await dataService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      setNotification({ message: 'Transação excluída.', type: 'info' });
    } catch (error) {
      console.error(error);
      setNotification({ message: 'Erro ao excluir transação.', type: 'error' });
    }
  };

  const handleRepeatMonth = async () => {
    const recurring = transactions.filter(t => t.frequency === 'recurring');
    let count = 0;
    for (const t of recurring) {
      const newTxData = {
        ...t,
        id: undefined, // Let DB generate
        date: new Date().toISOString(),
        description: `${t.description} (Cópia)`
      };
      try {
        const saved = await dataService.addTransaction(newTxData);
        setTransactions(prev => [saved, ...prev]);
        count++;
      } catch (e) {
        console.error("Error repeating transaction", e);
      }
    }
    setNotification({ message: `${count} recorrências duplicadas com sucesso.`, type: 'info' });
  };

  // --- Clients Logic ---
  const handleAddClient = async (clientData: Partial<Client>) => {
    try {
      const savedClient = await dataService.addClient(clientData);
      setClients(prev => [savedClient, ...prev]);
      setNotification({ message: 'Cliente cadastrado com sucesso.', type: 'success' });
    } catch (error) {
      console.error(error);
      setNotification({ message: 'Erro ao salvar cliente.', type: 'error' });
    }
  };

  const handleUpdateClient = async (updatedClient: Partial<Client>) => {
    try {
      await dataService.updateClient(updatedClient);
      setClients(prev => prev.map(c => c.id === updatedClient.id ? { ...c, ...updatedClient } as Client : c));
      setNotification({ message: 'Cliente atualizado.', type: 'success' });
      setEditingClient(null);
    } catch (error) {
      console.error(error);
      setNotification({ message: 'Erro ao atualizar cliente.', type: 'error' });
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await dataService.deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
      setNotification({ message: 'Cliente removido.', type: 'info' });
    } catch (error) {
      console.error(error);
      setNotification({ message: 'Erro ao remover cliente.', type: 'error' });
    }
  };

  const openEditClientModal = (client: Client) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
  };

  // --- Tracking Logic ---
  const handleAddTrackingEntry = async (entry: TrackingEntry) => {
    try {
      const savedEntry = await dataService.addTrackingEntry(entry);
      setTrackingEntries(prev => [savedEntry, ...prev]);
      setNotification({ message: 'Registro de tracking adicionado.', type: 'success' });
    } catch (error) {
      console.error(error);
      setNotification({ message: 'Erro ao salvar tracking.', type: 'error' });
    }
  };

  const handleUpdateTrackingEntry = async (updatedEntry: TrackingEntry) => {
    try {
      await dataService.updateTrackingEntry(updatedEntry);
      setTrackingEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
      setNotification({ message: 'Registro de tracking atualizado.', type: 'success' });
    } catch (error) {
      console.error(error);
      setNotification({ message: 'Erro ao atualizar tracking.', type: 'error' });
    }
  };

  const handleDeleteTrackingEntry = async (id: string) => {
    try {
      await dataService.deleteTrackingEntry(id);
      setTrackingEntries(prev => prev.filter(e => e.id !== id));
      setNotification({ message: 'Registro excluído.', type: 'info' });
    } catch (error) {
      console.error(error);
      setNotification({ message: 'Erro ao excluir tracking.', type: 'error' });
    }
  };

  const handleUpdateFunnel = async (updatedFunnel: Funnel) => {
    try {
      await dataService.updateFunnel(updatedFunnel);
      // Reload funnels to get fresh IDs if stages were added
      const fns = await dataService.getFunnels();
      setFunnels(fns);
      setNotification({ message: 'Estrutura do funil atualizada.', type: 'success' });
    } catch (error) {
      console.error(error);
      setNotification({ message: 'Erro ao atualizar funil.', type: 'error' });
    }
  };


  // --- AI Logic ---
  const handleAudioData = async (result: ProcessedAudioResult) => {
    // Process Transactions
    let txCount = 0;
    for (const t of result.extractedTransactions) {
      const newTx: Partial<Transaction> = {
        description: t.description,
        amount: t.amount,
        type: t.type,
        frequency: t.frequency,
        category: t.category || 'Geral',
        date: new Date().toISOString(),
      };
      await handleAddTransaction(newTx);
      txCount++;
    }

    // Process Clients
    let clCount = 0;
    for (const c of result.extractedClients) {
      const newClient: Partial<Client> = {
        name: c.name,
        monthlyValue: c.monthlyValue,
        status: 'active',
        ltv: c.monthlyValue * 12,
        startDate: new Date().toISOString(),
        tags: ['Novo']
      };
      await handleAddClient(newClient);
      clCount++;
    }

    setNotification({ message: `IA Processou: ${txCount} transações e ${clCount} clientes.`, type: 'success' });
  };

  const confirmAITransactions = (txs: Partial<Transaction>[]) => {
    txs.forEach(t => handleAddTransaction(t));
  };
  const confirmAIClients = (cls: Partial<Client>[]) => {
    cls.forEach(c => handleAddClient(c));
  };

  // --- Render ---

  if (!session) {
    return <Auth />;
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Carregando dados...</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <main className="flex-1 ml-64 p-8 relative">
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-xl flex items-center animate-in slide-in-from-top-2 fade-in duration-300 ${notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'}`}>
            <div className={`w-2 h-2 rounded-full mr-3 ${notification.type === 'error' ? 'bg-white' : 'bg-emerald-400'}`}></div>
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          {activePage === 'dashboard' && <Dashboard transactions={transactions} clients={clients} />}

          {activePage === 'tracking' && (
            <Tracking
              funnels={funnels}
              entries={trackingEntries}
              onAddEntry={handleAddTrackingEntry}
              onUpdateEntry={handleUpdateTrackingEntry}
              onDeleteEntry={handleDeleteTrackingEntry}
              onUpdateFunnel={handleUpdateFunnel}
            />
          )}

          {activePage === 'finance' && (
            <Finance
              transactions={transactions}
              clients={clients}
              onAddTransaction={handleAddTransaction}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onRepeatMonth={handleRepeatMonth}
              onAddClient={() => { setEditingClient(null); setIsClientModalOpen(true); }}
            />
          )}

          {activePage === 'clients' && (
            <Clients
              clients={clients}
              onAddClient={() => { setEditingClient(null); setIsClientModalOpen(true); }}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
              onEditClient={openEditClientModal}
            />
          )}

          {activePage === 'funnels' && <Funnels funnels={funnels} setFunnels={setFunnels} />}

          {activePage === 'ai-intelligence' && (
            <AIIntelligence
              onConfirmTransactions={confirmAITransactions}
              onConfirmClients={confirmAIClients}
            />
          )}

          {activePage === 'settings' && (
            <Settings
              onExportData={handleExportData}
              onImportData={handleImportData}
              onClearData={handleClearData}
            />
          )}
        </div>
      </main>

      {activePage !== 'ai-intelligence' && activePage !== 'settings' && (
        <AudioInput onDataProcessed={handleAudioData} />
      )}

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => { setIsClientModalOpen(false); setEditingClient(null); }}
        onSave={editingClient ? handleUpdateClient : handleAddClient}
        initialData={editingClient}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
