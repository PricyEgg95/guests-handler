import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

interface TableFormData {
  name: string;
  capacity: number;
}

interface TableFormProps {
  onSubmit: (table: TableFormData) => void;
  isOpen: boolean;
  onClose: () => void;
  initialData?: TableFormData;
  title?: string;
}

export function TableForm({ onSubmit, isOpen, onClose, initialData, title = "Créer une table" }: TableFormProps) {
  const [formData, setFormData] = useState<TableFormData>(
    initialData || {
      name: '',
      capacity: 6,
    }
  );

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        capacity: 6,
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = formData.name.trim();
    
    // Validation du nom de table (caractères alphanumériques et espaces uniquement)
    const nameRegex = /^[a-zA-ZÀ-ÿ0-9\s]+$/;
    if (!nameRegex.test(trimmedName)) {
      alert('Le nom de la table ne peut contenir que des lettres, des chiffres et des espaces.');
      return;
    }
    
    if (trimmedName && formData.capacity > 0) {
      onSubmit({
        ...formData,
        name: trimmedName
      });
      if (!initialData) {
        setFormData({
          name: '',
          capacity: 6,
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la table *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ex: Table des mariés, Table principale..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Utilisez uniquement des lettres, chiffres et espaces. Le nom doit être unique.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacité (nombre de places) *
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  capacity: parseInt(e.target.value) || 1
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="6"
                min="1"
                max="20"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Nombre maximum de personnes pouvant s'asseoir à cette table
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {initialData ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}