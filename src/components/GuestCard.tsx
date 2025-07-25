import React, { useState } from 'react';
import { Edit, Trash2, Users } from 'lucide-react';
import { Guest, GuestFormData } from '../types/guest';
import { useAuth } from '../hooks/useAuth';

interface GuestCardProps {
  guest: Guest;
  onEdit: (id: string, updates: Partial<GuestFormData>) => void;
  onDelete: (id: string) => void;
  onEditClick: (guest: Guest) => void;
}

export function GuestCard({ guest, onEdit, onDelete, onEditClick }: GuestCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { isSuperUser } = useAuth();

  const getStatusColor = (status: Guest['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusText = (status: Guest['status']) => {
    switch (status) {
      case 'accepted':
        return 'Accepté';
      case 'declined':
        return 'Refusé';
      default:
        return 'Sans réponse';
    }
  };

  const handleDelete = () => {
    onDelete(guest.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {guest.first_name[0]}{guest.last_name[0]}
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {guest.first_name} {guest.last_name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(guest.status)}`}>
                  {getStatusText(guest.status)}
                </span>
                {guest.table_number && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <Users className="w-3 h-3" />
                    Table {guest.table_number}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {isSuperUser && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEditClick(guest)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {showDeleteConfirm && isSuperUser && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 mb-3">
            Êtes-vous sûr de vouloir supprimer cet invité ?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Supprimer
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}