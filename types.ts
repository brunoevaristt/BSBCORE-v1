
export type TransactionType = 'revenue' | 'expense';
export type Frequency = 'recurring' | 'one-time';
export type ClientStatus = 'active' | 'paused' | 'churned';

export interface Client {
  id: string;
  name: string;
  monthlyValue: number;
  status: ClientStatus;
  ltv: number;
  startDate: string;
  tags: string[];
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  frequency: Frequency;
  date: string;
  clientId?: string;
  category: string;
  // New fields for detailed recurring logic
  discount?: number;
  additionalServiceDescription?: string;
  additionalServiceValue?: number;
}

export interface FunnelStage {
  id: string;
  name: string;
  count: number;
  value: number;
  color: string;
}

export interface Funnel {
  id: string;
  name: string;
  stages: FunnelStage[];
}

export interface TrackingEntry {
  id: string;
  funnelId: string;
  startDate: string;
  endDate: string;
  // Map stageId to the value count
  metrics: Record<string, number>; 
  revenue: number;
}

export interface DashboardMetrics {
  totalRevenue: number;
  receivedRevenue: number;
  forecastRevenue: number;
  totalExpenses: number;
  netProfit: number;
  activeClients: number;
  mrr: number;
  arr: number;
  growth: number;
}

export type DateFilterType = 'all' | 'last-week' | 'last-month' | 'custom' | 'specific-date';

export interface DateFilterState {
  type: DateFilterType;
  startDate?: string;
  endDate?: string;
}
