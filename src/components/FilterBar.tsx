import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: 'no-response' | 'accepted' | 'declined' | 'all';
  onStatusFilterChange: (status: 'no-response' | 'accepted' | 'declined' | 'all') => void;
  onAddGuest: () => void;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAddGuest,
}: FilterBarProps) {
  const { isSuperUser } = useAuth();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un invité par nom ou prénom..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="no-response">Sans réponse</option>
              <option value="accepted">Acceptés</option>
              <option value="declined">Refusés</option>
            </select>
          </div>

          {isSuperUser && (
            <button
              onClick={onAddGuest}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Ajouter un invité</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}