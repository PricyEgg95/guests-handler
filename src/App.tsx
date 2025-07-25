import React, { useState, useMemo } from 'react';
import { PartyPopper, Loader2 } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useGuests } from './hooks/useGuests';
import { AuthForm } from './components/AuthForm';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { GuestForm } from './components/GuestForm';
import { GuestCard } from './components/GuestCard';
import { StatsCards } from './components/StatsCards';
import { FilterBar } from './components/FilterBar';
import { TableManagement } from './components/TableManagement';
import { Guest, GuestFormData } from './types/guest';

function App() {
  const { user, loading: authLoading, isSuperUser } = useAuth();
  const { guests, loading: guestsLoading, addGuest, updateGuest, deleteGuest, getStats } = useGuests();
  const [activeTab, setActiveTab] = useState<'guests' | 'tables'>('guests');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'no-response' | 'accepted' | 'declined' | 'all'>('all');

  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      const matchesSearch = 
        guest.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.last_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [guests, searchTerm, statusFilter]);

  const handleSubmit = (guestData: GuestFormData) => {
    if (!isSuperUser) return;
    
    try {
      if (editingGuest) {
        updateGuest(editingGuest.id, guestData).then(() => {
          setIsFormOpen(false);
          setEditingGuest(null);
        }).catch((error) => {
          alert(error instanceof Error ? error.message : 'Erreur lors de la modification');
        });
      } else {
        addGuest(guestData).then(() => {
          setIsFormOpen(false);
        }).catch((error) => {
          alert(error instanceof Error ? error.message : 'Erreur lors de l\'ajout');
        });
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    }
  };

  const handleSubmitOld = async (guestData: GuestFormData) => {
    try {
      if (editingGuest) {
        await updateGuest(editingGuest.id, guestData);
        setEditingGuest(null);
      } else {
        await addGuest(guestData);
      }
      setIsFormOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    }
  };

  const handleEditClick = (guest: Guest) => {
    if (!isSuperUser) return;
    setEditingGuest(guest);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingGuest(null);
  };

  const stats = getStats();

  // Afficher le formulaire d'authentification si l'utilisateur n'est pas connecté
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header 
        stats={stats}
        onFilterChange={setStatusFilter}
        currentFilter={statusFilter}
      />
      <Navigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'guests' ? (
          <>
            {/* Stats */}
            <StatsCards 
              stats={stats} 
              onFilterChange={setStatusFilter}
              currentFilter={statusFilter}
            />

            {/* Filter Bar */}
            <FilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onAddGuest={() => setIsFormOpen(true)}
            />

            {/* Guest List */}
            {guestsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">Chargement des invités...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredGuests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PartyPopper className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {guests.length === 0 ? 'Aucun invité pour le moment' : 'Aucun invité trouvé'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {guests.length === 0 
                      ? 'Commencez par ajouter vos premiers invités à la fête.'
                      : 'Essayez de modifier vos critères de recherche ou filtres.'
                    }
                  </p>
                  {guests.length === 0 && (
                    <button
                      onClick={() => setIsFormOpen(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
                    >
                      Ajouter le premier invité
                    </button>
                  )}
                </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGuests.map(guest => (
                      <GuestCard
                        key={guest.id}
                        guest={guest}
                        onEdit={updateGuest}
                        onDelete={deleteGuest}
                        onEditClick={handleEditClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Guest Form Modal */}
            {isFormOpen && isSuperUser && (
              <GuestForm
                onSubmit={handleSubmit}
                onCancel={handleCloseForm}
                initialData={editingGuest}
                isEditing={!!editingGuest}
              />
            )}
          </>
        ) : (
          <TableManagement />
        )}
      </div>
    </div>
  );
}

export default App;