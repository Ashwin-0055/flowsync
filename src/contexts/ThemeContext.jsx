import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Load theme from localStorage or default to 'midnight'
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('flowsync-theme') || 'midnight';
    });

    useEffect(() => {
        // Save theme to localStorage
        localStorage.setItem('flowsync-theme', theme);

        // Apply theme class to document element
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const themes = [
        { id: 'midnight', name: 'Midnight', colors: { bg: '#0f172a', primary: '#6366f1' } },
        { id: 'ocean', name: 'Ocean', colors: { bg: '#0c4a6e', primary: '#0ea5e9' } },
        { id: 'forest', name: 'Forest', colors: { bg: '#064e3b', primary: '#10b981' } },
        { id: 'sunset', name: 'Sunset', colors: { bg: '#4a044e', primary: '#d946ef' } },
        { id: 'nebula', name: 'Nebula', colors: { bg: '#312e81', primary: '#8b5cf6' } },
    ];

    const value = {
        theme,
        setTheme,
        themes
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
