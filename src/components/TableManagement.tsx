import React, { useState, useEffect } from 'react';
import { Plus, Save, RotateCcw, Users, Edit, Trash2 } from 'lucide-react';
import { useTables } from '../hooks/useTables';
import { useGuests } from '../hooks/useGuests';
import { useAuth } from '../hooks/useAuth';
import { TableWithGuests } from '../types/table';
import { Guest } from '../types/guest';
import { TableForm } from './TableForm';

export function TableManagement() {
  const { tables, loading: tablesLoading, addTable, updateTable, deleteTable, getTablesWithGuests } = useTables();
  const { guests, updateGuest } = useGuests();
  const { isSuperUser } = useAuth();
  const [tablesWithGuests, setTablesWithGuests] = useState<TableWithGuests[]>([]);
  const [unassignedGuests, setUnassignedGuests] = useState<Guest[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draggedGuest, setDraggedGuest] = useState<Guest | null>(null);
  const [editingTable, setEditingTable] = useState<TableWithGuests | null>(null);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      const tablesData = await getTablesWithGuests();
      setTablesWithGuests(tablesData);
      
      // Filtrer les invités non assignés
      const unassigned = guests.filter(guest => !guest.table_number);
      setUnassignedGuests(unassigned);
    };

    if (!tablesLoading) {
      loadData();
    }
  }, [tables, guests, tablesLoading]);

  const handleCreateTable = async (tableData: { name: string; capacity: number }) => {
    try {
      const newTable = await addTable({
        ...tableData,
        position: { x: Math.random() * 400, y: Math.random() * 300 }
      });
      
      if (newTable) {
        setIsFormOpen(false);
        setEditingTable(null);
        // Recharger les données
        const tablesData = await getTablesWithGuests();
        setTablesWithGuests(tablesData);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la création de la table');
    }
  };

  const handleUpdateTable = async (tableData: { name: string; capacity: number }) => {
    if (!editingTable) return;
    
    try {
      const success = await updateTable(editingTable.id, {
        ...tableData,
        position: editingTable.position
      });
      
      if (success) {
        setIsFormOpen(false);
        setEditingTable(null);
        // Recharger les données
        const tablesData = await getTablesWithGuests();
        setTablesWithGuests(tablesData);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la modification de la table');
    }
  };

  const handleFormSubmit = async (tableData: { name: string; capacity: number }) => {
    if (editingTable) {
      await handleUpdateTable(tableData);
    } else {
      await handleCreateTable(tableData);
    }
  };

  const handleFormClose = () => {
      setIsFormOpen(false);
      setEditingTable(null);
  };

  const handleDragStart = (guest: Guest) => {
    if (!isSuperUser) return;
    setDraggedGuest(guest);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, table: TableWithGuests) => {
    e.preventDefault();
    
    if (!draggedGuest || !isSuperUser) return;

    // Vérifier si la table a encore de la place
    if (table.guests.length >= table.capacity) {
      alert(`La table "${table.name}" est pleine (${table.capacity} places maximum).`);
      setDraggedGuest(null);
      return;
    }

    // Mettre à jour l'invité
    const success = await updateGuest(draggedGuest.id, {
      table_number: table.name
    });

    if (success) {
      // Recharger les données
      const tablesData = await getTablesWithGuests();
      setTablesWithGuests(tablesData);
      
      // Mettre à jour la liste des invités non assignés
      const unassigned = guests
        .map(g => g.id === draggedGuest.id ? { ...g, table_number: table.name } : g)
        .filter(guest => !guest.table_number);
      setUnassignedGuests(unassigned);
    }

    setDraggedGuest(null);
  };

  const handleRemoveGuestFromTable = async (guestId: string) => {
    if (!isSuperUser) return;
    
    const success = await updateGuest(guestId, {
      table_number: undefined
    });

    if (success) {
      // Recharger les données
      const tablesData = await getTablesWithGuests();
      setTablesWithGuests(tablesData);
      
      const guest = guests.find(g => g.id === guestId);
      if (guest) {
        setUnassignedGuests(prev => [...prev, { ...guest, table_number: undefined }]);
      }
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!isSuperUser) return;
    
    const tableToDelete = tablesWithGuests.find(t => t.id === tableId);
    if (!tableToDelete) return;
    
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la table "${tableToDelete.name}" ? ` +
      `Tous les invités assignés à cette table seront automatiquement désassignés.`
    );
    
    if (!confirmDelete) return;
    
    const success = await deleteTable(tableId);
    if (success) {
      const tablesData = await getTablesWithGuests();
      setTablesWithGuests(tablesData);
      
      // Recharger les invités non assignés
      const unassigned = guests.filter(guest => !guest.table_number);
      setUnassignedGuests(unassigned);
    }
  };

  if (tablesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barre d'outils */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Gestion des Tables</h2>
          {isSuperUser && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Créer une table
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone d'édition des tables */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Plan des Tables</h3>
            
            {tablesWithGuests.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {isSuperUser ? 'Aucune table créée' : 'Aucune table disponible'}
                </p>
                {isSuperUser && (
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Créer votre première table
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[400px]">
                {tablesWithGuests.map((table) => (
                  <div
                    key={table.id}
                    className={`border-2 border-dashed rounded-lg p-4 transition-colors relative ${
                      draggedGuest && isSuperUser
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                    onDragOver={isSuperUser ? handleDragOver : undefined}
                    onDrop={isSuperUser ? (e) => handleDrop(e, table) : undefined}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">{table.name}</h4>
                        <p className="text-sm text-gray-500">
                          {table.guests.length}/{table.capacity} places
                        </p>
                      </div>
                      {isSuperUser && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingTable(table);
                              setIsFormOpen(true);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTable(table.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {table.guests.map((guest) => (
                        <div
                          key={guest.id}
                          className="flex items-center justify-between bg-blue-50 rounded-lg p-2"
                        >
                          <span className="text-sm font-medium text-blue-800">
                            {guest.first_name} {guest.last_name}
                          </span>
                          {isSuperUser && (
                            <button
                              onClick={() => handleRemoveGuestFromTable(guest.id)}
                              className="text-blue-600 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {table.guests.length < table.capacity && isSuperUser && (
                        <div className={`text-center py-2 text-sm border-2 border-dashed rounded-lg transition-colors ${
                          draggedGuest
                            ? 'border-blue-400 text-blue-600 bg-blue-100' 
                            : 'border-gray-200 text-gray-400'
                        }`}>
                          {draggedGuest ? 'Déposez ici' : 'Glissez un invité ici'}
                        </div>
                      )}
                      
                      {table.guests.length >= table.capacity && (
                        <div className="text-center py-2 text-red-500 text-sm border-2 border-dashed border-red-200 rounded-lg bg-red-50">
                          Table complète
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Liste des invités non assignés */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Invités non assignés ({unassignedGuests.length})
            </h3>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {unassignedGuests.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  Tous les invités sont assignés à une table
                </p>
              ) : (
                unassignedGuests.map((guest) => (
                  <div
                    key={guest.id}
                    draggable={isSuperUser}
                    onDragStart={isSuperUser ? () => handleDragStart(guest) : undefined}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isSuperUser ? 'cursor-move' : 'cursor-default'
                    } ${
                      draggedGuest?.id === guest.id 
                        ? 'bg-blue-100 border-2 border-blue-300' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-xs">
                        {guest.first_name[0]}{guest.last_name[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {guest.first_name} {guest.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {guest.status === 'accepted' ? 'Accepté' : 
                         guest.status === 'declined' ? 'Refusé' : 'Sans réponse'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire de création/édition de table */}
      {isSuperUser && (
        <TableForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          initialData={editingTable ? {
            name: editingTable.name,
            capacity: editingTable.capacity
          } : undefined}
          title={editingTable ? 'Modifier la table' : 'Créer une table'}
        />
      )}
    </div>
  );
}