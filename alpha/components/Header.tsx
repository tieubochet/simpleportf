import React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';

interface HeaderProps {
    title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
    return (
        <header className="bg-[--color-accent-primary] shadow-md">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-[--color-text-accent]">
                    {title}
                </h1>
                <ThemeSwitcher />
            </div>
        </header>
    );
};
