import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const USERS = [
    { id: 'u1', name: 'Claudio', avatar: '👨' },
    { id: 'u2', name: 'Giovanna', avatar: '👩' },
    { id: 'u3', name: 'Tailma', avatar: '👩' },
    { id: 'u4', name: 'Victor', avatar: '👨' },
];

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load from local storage
        const savedId = localStorage.getItem('expenses_user_id');
        if (savedId) {
            const user = USERS.find(u => u.id === savedId);
            if (user) setCurrentUser(user);
        }
        setLoading(false);
    }, []);

    const login = (userId) => {
        const user = USERS.find(u => u.id === userId);
        if (user) {
            setCurrentUser(user);
            localStorage.setItem('expenses_user_id', userId);
        }
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('expenses_user_id');
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
