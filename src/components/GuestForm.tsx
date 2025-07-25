import React, { useState, useEffect } from 'react';
import { Guest } from '../types/guest';
import { useTables } from '../hooks/useTables';

interface GuestFormProps {
  onSubmit: (guest: GuestFormData) => void;
  onCancel: () => void;
  initialData?: Guest;
  isEditing?: boolean;
}

export function GuestForm({ onSubmit, onCancel, initialData, isEditing = false }: GuestFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState<'no-response' | 'accepted' | 'declined'>('no-response');
  const [tableNumber, setTableNumber] = useState<string>('');
  
  const { tables } = useTables();

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.first_name);
      setLastName(initialData.last_name);
      setStatus(initialData.status);
      setTableNumber(initialData.table_number || '');
    } else {
      setFirstName('');
      setLastName('');
      setStatus('no-response');
      setTableNumber('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    
    if (!trimmedFirstName || !trimmedLastName) {
      alert('Le prénom et le nom sont obligatoires.');
      return;
    }
    
    try {
      onSubmit({
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        status,
        table_number: tableNumber || null,
      });
      
      // Reset form if not editing
      if (!isEditing) {
        setFirstName('');
        setLastName('');
        setStatus('no-response');
        setTableNumber('');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? 'Modifier l\'invité' : 'Ajouter un invité'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              Prénom
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'no-response' | 'accepted' | 'declined')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="no-response">Sans réponse</option>
              <option value="accepted">Accepté</option>
              <option value="declined">Refusé</option>
            </select>
          </div>

          <div>
            <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Table
            </label>
            <select
              id="tableNumber"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Aucune table</option>
              {tables.map((table) => (
                <option key={table.id} value={table.name}>
                  {table.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}