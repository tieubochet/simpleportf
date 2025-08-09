import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') {
        return 'dark';
    }
    try {
        const storedTheme = window.localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme;
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
        
        if (theme === 'dark') {
            root.classList.add('dark');
            if (metaThemeColor) metaThemeColor.setAttribute('content', '#0f172a');
        } else {
            root.classList.remove('dark');
            if (metaThemeColor) metaThemeColor.setAttribute('content', '#f1f5f9');
        }

        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            // ignore
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    }, []);

    return { theme, toggleTheme };
}
