import React, { useState, useEffect } from 'react';
import { supabase, SupabaseInitError } from './services/supabase';
import { Session } from '@supabase/supabase-js';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import InitializationError from './components/InitializationError';

type View = 'landing' | 'auth' | 'dashboard';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [view, setView] = useState<View>('landing');
    const [initializationError, setInitializationError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (SupabaseInitError) {
            setInitializationError(SupabaseInitError);
            setLoading(false);
            return;
        }

        // FIX: Added guard for supabase.auth to fix TypeScript error.
        // At runtime, this check is redundant because of the SupabaseInitError check above.
        if (!supabase.auth) {
            setLoading(false);
            return;
        }

        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session) {
                setView('dashboard');
            }
            setLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                setView('dashboard');
            } else {
                setView('landing');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        // FIX: Added guard for supabase.auth to fix TypeScript error.
        if (!supabase.auth) return;
        await supabase.auth.signOut();
        setSession(null);
        setView('landing');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-600"></div>
            </div>
        );
    }
    
    if (initializationError) {
        return <InitializationError error={initializationError} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {view === 'dashboard' && session ? (
                <Dashboard session={session} onSignOut={handleSignOut} />
            ) : view === 'auth' ? (
                <Auth />
            ) : (
                <LandingPage onGetStarted={() => setView('auth')} />
            )}
        </div>
    );
};

export default App;