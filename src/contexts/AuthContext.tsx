import React, { createContext, useContext, useState, useEffect } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { signIn as authSignIn, signUp as authSignUp, signOut as authSignOut } from '../lib/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        await authSignIn(email, password);
    };

    const signUp = async (email: string, password: string) => {
        await authSignUp(email, password);
    };

    const signOut = async () => {
        await authSignOut();
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        signOut
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
