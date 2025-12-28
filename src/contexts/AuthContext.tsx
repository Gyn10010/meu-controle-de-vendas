import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api.service';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing token on mount
        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('user_data');

        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch (error) {
                // If parsing fails, clear invalid data
                console.error('Failed to parse saved user data:', error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await apiService.login(email, password);
            const { user, token } = response;

            localStorage.setItem('auth_token', token);
            localStorage.setItem('user_data', JSON.stringify(user));

            setToken(token);
            setUser(user);
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Erro ao fazer login');
        }
    };

    const register = async (email: string, password: string, name: string) => {
        try {
            const response = await apiService.register(email, password, name);
            const { user, token } = response;

            localStorage.setItem('auth_token', token);
            localStorage.setItem('user_data', JSON.stringify(user));

            setToken(token);
            setUser(user);
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Erro ao criar conta');
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                register,
                logout,
                isAuthenticated: !!token,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
