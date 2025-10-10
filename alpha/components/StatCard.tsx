import React from 'react';

interface StatCardProps {
    title: string;
    value: string | React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
    return (
        <div className="bg-[--color-bg-card] p-5 rounded-xl shadow-sm border border-[--color-border-default]">
            <p className="text-sm text-[--color-text-secondary]">{title}</p>
            {typeof value === 'string' ? (
                <p className="text-2xl font-bold text-[--color-text-primary] mt-1">{value}</p>
            ) : (
                <div className="mt-1">{value}</div>
            )}
        </div>
    );
};
