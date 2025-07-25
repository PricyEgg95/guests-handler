import { useState, useEffect } from 'react';
import { Table, TableFormData, TableWithGuests } from '../types/table';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Charger les tables depuis Supabase
  const fetchTables = async () => {
    if (!user?.id) {
      setTables([]);
      setLoading(false);
      return;
    }

    try {
      // Get all tables (super-users see their own, guests see all from super-users)
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des tables:', error);
        return;
      }

      setTables(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des tables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [user]);

  const addTable = async (tableData: TableFormData): Promise<Table | null> => {
    if (!user?.id) return null;

    // Vérifier l'unicité du nom de table
    const existingTable = tables.find(t => 
      t.name.toLowerCase().trim() === tableData.name.toLowerCase().trim()
    );
    
    if (existingTable) {
      throw new Error(`Une table avec le nom "${tableData.name}" existe déjà.`);
    }

    try {
      const { data, error } = await supabase
        .from('tables')
        .insert([
          {
            ...tableData,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'ajout de la table:', error);
        return null;
      }

      setTables(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la table:', error);
      return null;
    }
  };

  const updateTable = async (id: string, updates: Partial<TableFormData>): Promise<boolean> => {
    if (!user?.id) return false;

    // Vérifier l'unicité du nom de table (sauf pour la table en cours de modification)
    if (updates.name) {
      const existingTable = tables.find(t => 
        t.id !== id &&
        t.name.toLowerCase().trim() === updates.name.toLowerCase().trim()
      );
      
      if (existingTable) {
        throw new Error(`Une table avec le nom "${updates.name}" existe déjà.`);
      }
    }

    try {
      const { data, error } = await supabase
        .from('tables')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la modification de la table:', error);
        return false;
      }

      setTables(prev => prev.map(table => 
        table.id === id ? data : table
      ));
      return true;
    } catch (error) {
      console.error('Erreur lors de la modification de la table:', error);
      return false;
    }
  };

  const deleteTable = async (id: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // D'abord, récupérer le nom de la table à supprimer
      const { data: tableData, error: tableError } = await supabase
        .from('tables')
        .select('name')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (tableError) {
        console.error('Erreur lors de la récupération de la table:', tableError);
        return false;
      }

      // Retirer tous les invités de cette table (par nom de table)
      await supabase
        .from('guests')
        .update({ table_number: null })
        .eq('table_number', tableData.name)
        .eq('user_id', user.id);

      // Ensuite, supprimer la table
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors de la suppression de la table:', error);
        return false;
      }

      setTables(prev => prev.filter(table => table.id !== id));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la table:', error);
      return false;
    }
  };

  const getTablesWithGuests = async (): Promise<TableWithGuests[]> => {
    if (!user?.id) return [];

    try {
      // Récupérer toutes les tables
      const { data: tablesData, error: tablesError } = await supabase
        .from('tables')
        .select('*')
        .eq('user_id', user.id);

      if (tablesError) {
        console.error('Erreur lors du chargement des tables:', tablesError);
        return [];
      }

      // Récupérer tous les invités
      const { data: guestsData, error: guestsError } = await supabase
        .from('guests')
        .select('id, first_name, last_name, table_number')
        .eq('user_id', user.id)
        .not('table_number', 'is', null);

      if (guestsError) {
        console.error('Erreur lors du chargement des invités:', guestsError);
        return [];
      }

      // Associer les invités aux tables
      const tablesWithGuests: TableWithGuests[] = (tablesData || []).map(table => {
        return {
          ...table,
          guests: (guestsData || [])
            .filter(guest => guest.table_number === table.name)
            .map(guest => ({
              id: guest.id,
              first_name: guest.first_name,
              last_name: guest.last_name,
            }))
        };
      });

      return tablesWithGuests;
    } catch (error) {
      console.error('Erreur lors du chargement des tables avec invités:', error);
      return [];
    }
  };

  return {
    tables,
    loading,
    addTable,
    updateTable,
    deleteTable,
    getTablesWithGuests,
    refetch: fetchTables,
  };
}