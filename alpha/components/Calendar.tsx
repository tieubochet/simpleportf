import React from 'react';
import { format } from 'date-fns';
import { useCalendarGrid } from '../hooks/useCalendarGrid';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import type { DayData } from '../types';

interface CalendarProps {
    currentDate: Date;
    data: Record<string, DayData>;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onExport: () => void;
    onImport: () => void;
    onDayClick: (date: Date) => void;
}

const WEEKDAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const CalendarCell: React.FC<{ day: Date | null; isCurrentMonth: boolean; dayData?: DayData; onClick: (date: Date) => void }> = ({ day, isCurrentMonth, dayData, onClick }) => {
    const totalAmount = dayData 
        ? dayData.alphaAirdrops.reduce((sum, p) => sum + p.amount, 0) +
          dayData.alphaEvents.reduce((sum, p) => sum + p.amount, 0) -
          dayData.tradingFee
        : undefined;

    const hasData = totalAmount !== undefined && totalAmount !== 0;

    const bgClass = isCurrentMonth ? 'bg-[--color-bg-card] hover:bg-[--color-bg-card-alt]' : 'bg-[--color-bg-card-alt]';
    const cellClasses = `relative border border-[--color-border-default] p-2 h-24 md:h-28 text-left align-top transition-colors ${bgClass}`;
    const dateClasses = `text-sm ${isCurrentMonth ? 'text-[--color-text-primary]' : 'text-[--color-text-secondary]'}`;
    
    const amountColor = totalAmount !== undefined && totalAmount >= 0 ? 'text-[--color-text-positive]' : 'text-[--color-text-negative]';
    const amountPrefix = totalAmount !== undefined && totalAmount >= 0 ? '+' : '';

    const handleClick = () => {
        if (day) {
            onClick(day);
        }
    };

    return (
        <button className={cellClasses} onClick={handleClick} disabled={!day}>
            {day && <span className={dateClasses}>{format(day, 'd')}</span>}
            {hasData && isCurrentMonth && (
                <div className={`absolute bottom-2 left-2 text-sm font-semibold ${amountColor}`}>
                    {amountPrefix}{(totalAmount || 0).toFixed(2)}
                </div>
            )}
        </button>
    );
};


export const Calendar: React.FC<CalendarProps> = ({ currentDate, data, onPrevMonth, onNextMonth, onExport, onImport, onDayClick }) => {
    const { days } = useCalendarGrid(currentDate);
    const monthYearString = `Tháng ${format(currentDate, 'M')} / ${format(currentDate, 'yyyy')}`;

    return (
        <div className="bg-[--color-bg-card] p-4 md:p-6 rounded-xl shadow-sm border border-[--color-border-default]">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[--color-text-primary] mb-4 sm:mb-0">{monthYearString}</h2>
                <div className="flex items-center gap-2">
                    <button onClick={onPrevMonth} className="p-2 rounded-md border border-[--color-button-secondary-border] bg-[--color-button-secondary-bg] hover:bg-[--color-button-secondary-bg-hover] transition-colors">
                        <ChevronLeftIcon className="h-5 w-5 text-[--color-text-secondary]" />
                    </button>
                    <button onClick={onNextMonth} className="p-2 rounded-md border border-[--color-button-secondary-border] bg-[--color-button-secondary-bg] hover:bg-[--color-button-secondary-bg-hover] transition-colors">
                        <ChevronRightIcon className="h-5 w-5 text-[--color-text-secondary]" />
                    </button>
                    <button onClick={onImport} className="ml-4 px-4 py-2 text-sm font-medium text-[--color-button-secondary-text] bg-[--color-button-secondary-bg] border border-[--color-button-secondary-border] rounded-md hover:bg-[--color-button-secondary-bg-hover] transition-colors">
                        Import CSV
                    </button>
                    <button onClick={onExport} className="px-4 py-2 text-sm font-medium text-white bg-[--color-accent-primary] border border-transparent rounded-md hover:bg-[--color-accent-primary-hover] transition-colors">
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7">
                {WEEKDAY_NAMES.map(day => (
                    <div key={day} className="text-center font-medium text-xs text-[--color-text-secondary] py-3 border-b-2 border-[--color-border-default]">
                        {day}
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-7">
                {days.map(({ date, isCurrentMonth }, index) => {
                    const dateKey = date ? format(date, 'yyyy-MM-dd') : '';
                    const dayData = data[dateKey];
                    return (
                        <CalendarCell 
                            key={index} 
                            day={date} 
                            isCurrentMonth={isCurrentMonth}
                            dayData={dayData}
                            onClick={onDayClick}
                        />
                    )
                })}
            </div>
        </div>
    );
};