import { useMemo } from 'react';
import { endOfMonth, endOfWeek, addDays, startOfMonth, startOfWeek } from 'date-fns';

export const useCalendarGrid = (currentDate) => {
    const days = useMemo(() => {
        const firstDayOfMonth = startOfMonth(currentDate);
        const lastDayOfMonth = endOfMonth(currentDate);

        const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 }); // Sunday
        const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 });

        const calendarDays = [];
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
