

import { useMemo } from 'react';
// FIX: Changed imports for startOfMonth and startOfWeek to fix module resolution issue.
import { endOfMonth, endOfWeek, eachDayOfInterval, addDays, getDay } from 'date-fns';
import startOfMonth from 'date-fns/startOfMonth';
import startOfWeek from 'date-fns/startOfWeek';

interface CalendarDay {
    date: Date | null;
    isCurrentMonth: boolean;
}

export const useCalendarGrid = (currentDate: Date) => {
    const days = useMemo(() => {
        const firstDayOfMonth = startOfMonth(currentDate);
        const lastDayOfMonth = endOfMonth(currentDate);

        const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 }); // Sunday
        const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 });

        const calendarDays: CalendarDay[] = [];
        let day = startDate;

        while (day <= endDate) {
            calendarDays.push({
                date: day,
                isCurrentMonth: day >= firstDayOfMonth && day <= lastDayOfMonth,
            });
            day = addDays(day, 1);
        }
        
        return calendarDays;
    }, [currentDate]);

    return { days };
};