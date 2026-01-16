
import { Client, Funnel, Transaction, TrackingEntry } from './types';

export const MOCK_CLIENTS: Client[] = [];

export const MOCK_TRANSACTIONS: Transaction[] = [];

export const MOCK_FUNNELS: Funnel[] = [
  {
    id: 'outbound_track',
    name: 'Outbound Oficial',
    stages: [
      { id: 'st1', name: 'Leads Abordados', count: 0, value: 0, color: '#94a3b8' },
      { id: 'st2', name: 'Respostas (1ª Msg)', count: 0, value: 0, color: '#64748b' },
      { id: 'st3', name: 'Chegaram no Pitch', count: 0, value: 0, color: '#475569' },
      { id: 'st4', name: 'Confirmaram Call', count: 0, value: 0, color: '#3b82f6' },
      { id: 'st5', name: 'Call Realizada', count: 0, value: 0, color: '#6366f1' },
      { id: 'st6', name: 'Show Up', count: 0, value: 0, color: '#8b5cf6' },
      { id: 'st7', name: 'Vendas Realizadas', count: 0, value: 0, color: '#10b981' },
    ]
  },
  {
    id: 'default',
    name: 'Vendas Padrão',
    stages: [
      { id: '1', name: 'Visualização', count: 0, value: 0, color: '#94a3b8' },
      { id: '2', name: 'Lead Qualificado', count: 0, value: 0, color: '#64748b' },
      { id: '3', name: 'Reunião Agendada', count: 0, value: 0, color: '#3b82f6' },
      { id: '4', name: 'Proposta Enviada', count: 0, value: 0, color: '#6366f1' },
      { id: '5', name: 'Fechamento', count: 0, value: 0, color: '#10b981' },
    ]
  }
];

export const MOCK_TRACKING_ENTRIES: TrackingEntry[] = [];
