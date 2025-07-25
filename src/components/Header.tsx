import React from 'react';
import { PartyPopper, Crown, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { BurgerMenu } from './BurgerMenu';

interface HeaderProps {
  stats: {
    total: number;
    accepted: number;
    declined: number;
    noResponse: number;
  };
  onFilterChange: (filter: 'all' | 'accepted' | 'declined' | 'no-response') => void;
  currentFilter: 'all' | 'accepted' | 'declined' | 'no-response';
}

export function Header({ stats, onFilterChange, currentFilter }: HeaderProps) {
  const { user, userProfile, isSuperUser } = useAuth();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <PartyPopper className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gestion d'Invités
            </h1>
            {userProfile && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
                {isSuperUser ? (
                  <>
                    <Crown className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">Super-utilisateur</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Invité</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center">
            <BurgerMenu 
              stats={stats}
              onFilterChange={onFilterChange}
              currentFilter={currentFilter}
              userProfile={userProfile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}