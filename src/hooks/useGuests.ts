import { useState, useEffect } from 'react';
import { Guest, GuestFormData } from '../types/guest';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useGuests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Charger les invités depuis Supabase
  const fetchGuests = async () => {
    if (!user?.id) {
      setGuests([]);
      setLoading(false);
      return;
    }

    try {
      // Get all guests (super-users see their own, guests see all from super-users)
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des invités:', error);
        return;
      }

      setGuests(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des invités:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [user]);

  const addGuest = async (guestData: GuestFormData): Promise<Guest | null> => {
    if (!user?.id) return null;

    // Vérifier l'unicité du nom + prénom
    const existingGuest = guests.find(g => 
      g.first_name.toLowerCase().trim() === guestData.first_name.toLowerCase().trim() &&
      g.last_name.toLowerCase().trim() === guestData.last_name.toLowerCase().trim()
    );
    
    if (existingGuest) {
      throw new Error(`Un invité avec le nom "${guestData.first_name} ${guestData.last_name}" existe déjà.`);
    }

    try {
      const { data, error } = await supabase
        .from('guests')
        .insert([
          {
            ...guestData,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'ajout de l\'invité:', error);
        return null;
      }

      setGuests(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'invité:', error);
      return null;
    }
  };

  const updateGuest = async (id: string, updates: Partial<GuestFormData>): Promise<boolean> => {
    if (!user?.id) return false;

    // Vérifier l'unicité du nom + prénom (sauf pour l'invité en cours de modification)
    if (updates.first_name || updates.last_name) {
      const currentGuest = guests.find(g => g.id === id);
      if (currentGuest) {
        const newFirstName = updates.first_name || currentGuest.first_name;
        const newLastName = updates.last_name || currentGuest.last_name;
        
        const existingGuest = guests.find(g => 
          g.id !== id &&
          g.first_name.toLowerCase().trim() === newFirstName.toLowerCase().trim() &&
          g.last_name.toLowerCase().trim() === newLastName.toLowerCase().trim()
        );
        
        if (existingGuest) {
          throw new Error(`Un invité avec le nom "${newFirstName} ${newLastName}" existe déjà.`);
        }
      }
    }

    try {
      const { data, error } = await supabase
        .from('guests')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la modification de l\'invité:', error);
        return false;
      }

      setGuests(prev => prev.map(guest => 
        guest.id === id ? data : guest
      ));
      return true;
    } catch (error) {
      console.error('Erreur lors de la modification de l\'invité:', error);
      return false;
    }
  };

  const deleteGuest = async (id: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors de la suppression de l\'invité:', error);
        return false;
      }

      setGuests(prev => prev.filter(guest => guest.id !== id));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'invité:', error);
      return false;
    }
  };

  const getStats = () => {
    const total = guests.length;
    const accepted = guests.filter(g => g.status === 'accepted').length;
    const declined = guests.filter(g => g.status === 'declined').length;
    const noResponse = guests.filter(g => g.status === 'no-response').length;
    
    return { total, accepted, declined, noResponse };
  };

  return {
    guests,
    loading,
    addGuest,
    updateGuest,
    deleteGuest,
    getStats,
    refetch: fetchGuests,
  };
}