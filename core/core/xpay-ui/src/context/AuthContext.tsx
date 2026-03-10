import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AuthResponse } from '../types';

interface AuthContextType {
    isAuthenticated: boolean;
    username: string | null;
    role: string | null;
    login: (data: AuthResponse) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
        () => !!localStorage.getItem('token')
    );
    const [username, setUsername] = useState<string | null>(
        () => localStorage.getItem('username')
    );
    const [role, setRole] = useState<string | null>(
        () => localStorage.getItem('role')
    );

    const login = useCallback((data: AuthResponse) => {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);
        setIsAuthenticated(true);
        setUsername(data.username);
        setRole(data.role);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        setIsAuthenticated(false);
        setUsername(null);
        setRole(null);
    }, []);


    useEffect(() => {
        const handleForceLogout = () => {
            logout();
            window.location.replace('/login');
        };
        window.addEventListener('auth:logout', handleForceLogout);
        return () => window.removeEventListener('auth:logout', handleForceLogout);
    }, [logout]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, username, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
