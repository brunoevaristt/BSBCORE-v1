
import { supabase } from '../lib/supabaseClient';
import { Client, Transaction, Funnel, FunnelStage, TrackingEntry } from '../types';
import { MOCK_FUNNELS } from '../constants';

// --- Helpers ---

const getUserId = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id;
};

// --- Clients ---

export const getClients = async (): Promise<Client[]> => {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        monthlyValue: c.monthly_value,
        status: c.status,
        ltv: c.ltv,
        startDate: c.start_date,
        tags: c.tags || []
    }));
};

export const addClient = async (client: Partial<Client>): Promise<Client> => {
    const userId = await getUserId();
    const { data, error } = await supabase
        .from('clients')
        .insert([{
            name: client.name,
            monthly_value: client.monthlyValue,
            status: client.status,
            ltv: client.ltv,
            start_date: client.startDate,
            tags: client.tags,
            user_id: userId
        }])
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        name: data.name,
        monthlyValue: data.monthly_value,
        status: data.status,
        ltv: data.ltv,
        startDate: data.start_date,
        tags: data.tags || []
    };
};

export const updateClient = async (client: Partial<Client>): Promise<void> => {
    if (!client.id) return;

    const { error } = await supabase
        .from('clients')
        .update({
            name: client.name,
            monthly_value: client.monthlyValue,
            status: client.status,
            ltv: client.ltv,
            start_date: client.startDate,
            tags: client.tags
        })
        .eq('id', client.id);

    if (error) throw error;
};

export const deleteClient = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// --- Transactions ---

export const getTransactions = async (): Promise<Transaction[]> => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

    if (error) throw error;

    return data.map((t: any) => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        frequency: t.frequency,
        date: t.date,
        clientId: t.client_id,
        category: t.category,
        discount: t.discount,
        additionalServiceDescription: t.additional_service_description,
        additionalServiceValue: t.additional_service_value
    }));
};

export const addTransaction = async (tx: Partial<Transaction>): Promise<Transaction> => {
    const userId = await getUserId();
    const { data, error } = await supabase
        .from('transactions')
        .insert([{
            description: tx.description,
            amount: tx.amount,
            type: tx.type,
            frequency: tx.frequency,
            date: tx.date,
            client_id: tx.clientId,
            category: tx.category,
            discount: tx.discount,
            additional_service_description: tx.additionalServiceDescription,
            additional_service_value: tx.additionalServiceValue,
            user_id: userId
        }])
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        description: data.description,
        amount: data.amount,
        type: data.type,
        frequency: data.frequency,
        date: data.date,
        clientId: data.client_id,
        category: data.category,
        discount: data.discount,
        additionalServiceDescription: data.additional_service_description,
        additionalServiceValue: data.additional_service_value
    };
};

export const updateTransaction = async (tx: Partial<Transaction>): Promise<void> => {
    if (!tx.id) return;

    const { error } = await supabase
        .from('transactions')
        .update({
            description: tx.description,
            amount: tx.amount,
            type: tx.type,
            frequency: tx.frequency,
            date: tx.date,
            client_id: tx.clientId,
            category: tx.category,
            discount: tx.discount,
            additional_service_description: tx.additionalServiceDescription,
            additional_service_value: tx.additionalServiceValue
        })
        .eq('id', tx.id);

    if (error) throw error;
};

export const deleteTransaction = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// --- Funnels ---

export const getFunnels = async (): Promise<Funnel[]> => {
    const { data: funnelsData, error: funnelsError } = await supabase
        .from('funnels')
        .select('*');

    if (funnelsError) throw funnelsError;

    const { data: stagesData, error: stagesError } = await supabase
        .from('funnel_stages')
        .select('*')
        .order('order_index', { ascending: true });

    if (stagesError) throw stagesError;

    return funnelsData.map((f: any) => ({
        id: f.id,
        name: f.name,
        stages: stagesData
            .filter((s: any) => s.funnel_id === f.id)
            .map((s: any) => ({
                id: s.id,
                name: s.name,
                count: 0, // These are calculated in the frontend or via tracking entries
                value: 0,
                color: s.color
            }))
    }));
};

export const createFunnel = async (name: string, stages: Partial<FunnelStage>[]): Promise<Funnel> => {
    const userId = await getUserId();

    // 1. Create Funnel
    const { data: funnelData, error: funnelError } = await supabase
        .from('funnels')
        .insert([{ name, user_id: userId }])
        .select()
        .single();

    if (funnelError) throw funnelError;

    // 2. Create Stages
    const stagesToInsert = stages.map((s, index) => ({
        funnel_id: funnelData.id,
        name: s.name,
        order_index: index,
        color: s.color,
        user_id: userId
    }));

    const { data: stagesData, error: stagesError } = await supabase
        .from('funnel_stages')
        .insert(stagesToInsert)
        .select();

    if (stagesError) throw stagesError;

    return {
        id: funnelData.id,
        name: funnelData.name,
        stages: stagesData.map((s: any) => ({
            id: s.id,
            name: s.name,
            count: 0,
            value: 0,
            color: s.color
        }))
    };
};

export const updateFunnel = async (funnel: Funnel): Promise<void> => {
    const userId = await getUserId();

    // Update Funnel Name
    await supabase
        .from('funnels')
        .update({ name: funnel.name })
        .eq('id', funnel.id);

    // Handle Stages (Delete all and recreate is easiest for reordering, but might break IDs if referenced)
    // Better: Upsert based on ID.

    // For simplicity: We will update existing ones and insert new ones.
    // Deleting missing ones is tricky if we don't track them.

    // Strategy: Delete all stages for this funnel and re-insert. 
    // WARNING: This breaks foreign keys in tracking_entries if they reference stage_id (they don't, they reference funnel_id and use metrics JSONB).
    // So it is SAFE to delete stages if metrics just use stage IDs as keys? 
    // Wait, if metrics use stage IDs as keys, and we generate NEW IDs, the metrics will break.
    // We MUST preserve IDs.

    for (let i = 0; i < funnel.stages.length; i++) {
        const stage = funnel.stages[i];
        if (stage.id && stage.id.length > 10) { // Assuming UUIDs are long, temp IDs might be short? Or we check if it exists.
            // Update
            await supabase
                .from('funnel_stages')
                .update({ name: stage.name, order_index: i, color: stage.color })
                .eq('id', stage.id);
        } else {
            // Insert (New stage added in UI)
            // Note: The UI might generate a temp ID. We should ignore it and let DB gen new one, 
            // BUT we need to update the UI with the new ID. 
            // For now, let's assume the UI sends a payload where we can distinguish.
            // Actually, the simplest way for now is to just insert if it doesn't look like a UUID?
            // Or just upsert.

            // Let's try upsert.
            const { error } = await supabase
                .from('funnel_stages')
                .upsert({
                    id: stage.id.length > 10 ? stage.id : undefined, // If it's a real UUID, use it. If not (temp), let DB gen.
                    funnel_id: funnel.id,
                    name: stage.name,
                    order_index: i,
                    color: stage.color,
                    user_id: userId
                });
            if (error) console.error("Error upserting stage", error);
        }
    }

    // We also need to delete stages that are no longer in the list.
    // Get current DB stages
    const { data: dbStages } = await supabase.from('funnel_stages').select('id').eq('funnel_id', funnel.id);
    if (dbStages) {
        const incomingIds = funnel.stages.map(s => s.id);
        const toDelete = dbStages.filter(s => !incomingIds.includes(s.id)).map(s => s.id);
        if (toDelete.length > 0) {
            await supabase.from('funnel_stages').delete().in('id', toDelete);
        }
    }
};

// --- Tracking Entries ---

export const getTrackingEntries = async (): Promise<TrackingEntry[]> => {
    const { data, error } = await supabase
        .from('tracking_entries')
        .select('*')
        .order('start_date', { ascending: false });

    if (error) throw error;

    return data.map((e: any) => ({
        id: e.id,
        funnelId: e.funnel_id,
        startDate: e.start_date,
        endDate: e.end_date,
        metrics: e.metrics,
        revenue: e.revenue
    }));
};

export const addTrackingEntry = async (entry: TrackingEntry): Promise<TrackingEntry> => {
    const userId = await getUserId();
    const { data, error } = await supabase
        .from('tracking_entries')
        .insert([{
            funnel_id: entry.funnelId,
            start_date: entry.startDate,
            end_date: entry.endDate,
            metrics: entry.metrics,
            revenue: entry.revenue,
            user_id: userId
        }])
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        funnelId: data.funnel_id,
        startDate: data.start_date,
        endDate: data.end_date,
        metrics: data.metrics,
        revenue: data.revenue
    };
};

export const updateTrackingEntry = async (entry: TrackingEntry): Promise<void> => {
    if (!entry.id) return;

    const { error } = await supabase
        .from('tracking_entries')
        .update({
            funnel_id: entry.funnelId,
            start_date: entry.startDate,
            end_date: entry.endDate,
            metrics: entry.metrics,
            revenue: entry.revenue
        })
        .eq('id', entry.id);

    if (error) throw error;
};

export const deleteTrackingEntry = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('tracking_entries')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const seedDefaultFunnels = async (): Promise<void> => {
    for (const mockFunnel of MOCK_FUNNELS) {
        await createFunnel(mockFunnel.name, mockFunnel.stages);
    }
};
