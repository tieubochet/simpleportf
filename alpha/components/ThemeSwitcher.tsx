import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from './Icons';

export const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const isLight = theme === 'light';

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white text-indigo-200 hover:text-white hover:bg-white/10"
            title={`Switch to ${isLight ? 'Dark' : 'Light'} theme`}
            aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} theme`}
        >
            {isLight ? (
                <MoonIcon className="w-6 h-6" />
            ) : (
                <SunIcon className="w-6 h-6" />
            )}
        </button>
    );
};