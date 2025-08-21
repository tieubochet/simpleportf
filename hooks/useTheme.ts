import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'dim';

const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') {
        return 'dark';
    }
    try {
        const storedTheme = window.localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'dim') {
            return storedTheme as Theme;
        }
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
    } catch (e) {
      // ignore
    }
    return 'dark'; // Default to dark
};

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        const root = window.document.documentElement;
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        root.classList.remove('dark', 'dim');

        if (theme === 'dark') {
            root.classList.add('dark');
            if (metaThemeColor) metaThemeColor.setAttribute('content', '#0f172a');
        } else if (theme === 'dim') {
            root.classList.add('dark', 'dim');
            if (metaThemeColor) metaThemeColor.setAttribute('content', '#1e293b');
        } else { // light
            if (metaThemeColor) metaThemeColor.setAttribute('content', '#f1f5f9');
        }


        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            // ignore
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => {
            if (prevTheme === 'light') return 'dim';
            if (prevTheme === 'dim') return 'dark';
            return 'light';
        });
    }, []);

    return { theme, toggleTheme };
}