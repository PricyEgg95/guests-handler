import React from 'react';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    total: number;
    accepted: number;
    declined: number;
    noResponse: number;
  };
  onFilterChange: (filter: 'all' | 'accepted' | 'declined' | 'no-response') => void;
  currentFilter: 'all' | 'accepted' | 'declined' | 'no-response';
}

export function StatsCards({ stats, onFilterChange, currentFilter }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Invités',
      value: stats.total,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      filter: 'all' as const,
    },
    {
      title: 'Acceptés',
      value: stats.accepted,
      icon: UserCheck,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      filter: 'accepted' as const,
    },
    {
      title: 'Refusés',
      value: stats.declined,
      icon: UserX,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      filter: 'declined' as const,
    },
    {
      title: 'Sans Réponse',
      value: stats.noResponse,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      filter: 'no-response' as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isActive = currentFilter === card.filter;
        return (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-200 cursor-pointer ${
              isActive 
                ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onFilterChange(card.filter)}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
            {isActive && (
              <div className="mt-2 text-xs text-blue-600 font-medium">
                Filtre actif
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}