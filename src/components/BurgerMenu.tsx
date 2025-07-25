import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Users, UserCheck, UserX, Clock, User, Settings, LogOut } from 'lucide-react';
import { useAuth, UserProfile } from '../hooks/useAuth';

interface BurgerMenuProps {
  stats: {
    total: number;
    accepted: number;
    declined: number;
    noResponse: number;
  };
  onFilterChange: (filter: 'all' | 'accepted' | 'declined' | 'no-response') => void;
  currentFilter: 'all' | 'accepted' | 'declined' | 'no-response';
  userProfile: UserProfile | null;
}

export function BurgerMenu({ stats, onFilterChange, currentFilter, userProfile }: BurgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, signOut, isSuperUser } = useAuth();

  // Fermer le menu en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filterOptions = [
    {
      id: 'all' as const,
      label: 'Tous les invités',
      count: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
    },
    {
      id: 'accepted' as const,
      label: 'Acceptés',
      count: stats.accepted,
      icon: UserCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hoverColor: 'hover:bg-emerald-100',
    },
    {
      id: 'declined' as const,
      label: 'Refusés',
      count: stats.declined,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
    },
    {
      id: 'no-response' as const,
      label: 'Sans réponse',
      count: stats.noResponse,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      hoverColor: 'hover:bg-yellow-100',
    },
  ];

  const handleFilterClick = (filterId: 'all' | 'accepted' | 'declined' | 'no-response') => {
    onFilterChange(filterId);
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };
  return (
    <div className="relative" ref={menuRef}>
      {/* Bouton burger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <>
          {/* Overlay pour mobile */}
          <div className="fixed inset-0 bg-black bg-opacity-20 z-40 md:hidden" />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            {/* En-tête du menu */}
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">{user?.email}</p>
                  <p className="text-sm opacity-90">
                    {isSuperUser ? 'Super-utilisateur' : 'Invité'}
                  </p>
                </div>
              </div>
            </div>

            {/* Section Filtres */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Filtrer les invités
              </h3>
              
              <div className="space-y-2">
                {filterOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = currentFilter === option.id;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleFilterClick(option.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        isActive 
                          ? `${option.bgColor} ${option.color} ring-2 ring-blue-200` 
                          : `hover:bg-gray-50 text-gray-700 ${option.hoverColor}`
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-white bg-opacity-50' : option.bgColor}`}>
                        <Icon className={`w-4 h-4 ${isActive ? option.color : option.color}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm opacity-75">{option.count} invité{option.count !== 1 ? 's' : ''}</p>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section Profil (pour futures fonctionnalités) */}
            <div className="border-t border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Compte</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium">Mon profil</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Settings className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium">Paramètres</span>
                </button>
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-red-100">
                    <LogOut className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}