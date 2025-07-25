import React from 'react';
import { Users, Layout } from 'lucide-react';

interface NavigationProps {
  activeTab: 'guests' | 'tables';
  onTabChange: (tab: 'guests' | 'tables') => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    {
      id: 'guests' as const,
      label: 'Gestion des Invités',
      icon: Users,
    },
    {
      id: 'tables' as const,
      label: 'Plan des Tables',
      icon: Layout,
    },
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}