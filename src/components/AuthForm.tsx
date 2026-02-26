import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, PartyPopper, Crown, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function AuthForm() {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'code'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [eventCode, setEventCode] = useState('');
  const [selectedRole, setSelectedRole] = useState<'super-user' | 'guest'>('guest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, signInAnonymously, joinEventByCode, updateUserRole } = useAuth();

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Sign in anonymously if not logged in
      const { data: authData, error: authError } = await signInAnonymously();
      if (authError) {
        setError(authError.message);
        return;
      }

      // 2. Join event by code
      const { error: joinError } = await joinEventByCode(eventCode);
      if (joinError) {
        setError(joinError.message);
        return;
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error: signUpError } = await signUp(email, password);
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        
        // Set user role after successful signup
        const { error: roleError } = await updateUserRole(selectedRole);
        if (roleError) {
          setError('Account created but failed to set role. Please contact support.');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <PartyPopper className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gestion d'Invités
            </h1>
          </div>
          <p className="text-gray-600">
            {authMode === 'signup'
              ? 'Créez votre compte pour commencer'
              : authMode === 'signin'
              ? 'Connectez-vous à votre compte'
              : 'Accédez à l\'évènement avec votre code'}
          </p>
        </div>

        {authMode === 'code' ? (
          <form onSubmit={handleCodeSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code de l'évènement (6 caractères)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl font-bold tracking-widest"
                  placeholder="ABC123"
                  required
                  maxLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || eventCode.length !== 6}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Accéder à l'évènement
                </>
              )}
            </button>
          </form>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="votre@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          {authMode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type de compte
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="super-user"
                    checked={selectedRole === 'super-user'}
                    onChange={(e) => setSelectedRole(e.target.value as 'super-user')}
                    className="mr-3"
                  />
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Crown className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Super-utilisateur</p>
                      <p className="text-sm text-gray-500">Peut gérer les invités et les tables</p>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="guest"
                    checked={selectedRole === 'guest'}
                    onChange={(e) => setSelectedRole(e.target.value as 'guest')}
                    className="mr-3"
                  />
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Invité</p>
                      <p className="text-sm text-gray-500">Peut consulter les invités et les tables</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {authMode === 'signup' ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                {authMode === 'signup' ? 'Créer un compte' : 'Se connecter'}
              </>
            )}
          </button>
        </form>
        )}

        <div className="mt-6 flex flex-col gap-3 text-center">
          {authMode !== 'code' && (
            <button
              onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {authMode === 'signup'
                ? 'Déjà un compte ? Se connecter'
                : 'Pas de compte ? Créer un compte'
              }
            </button>
          )}

          <button
            onClick={() => setAuthMode(authMode === 'code' ? 'signin' : 'code')}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm border-t border-gray-100 pt-3"
          >
            {authMode === 'code'
              ? 'Retour à la connexion'
              : 'Accéder avec un code d\'évènement'
            }
          </button>
        </div>
      </div>
    </div>
  );
}