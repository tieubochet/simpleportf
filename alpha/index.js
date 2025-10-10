'use strict';

// --- DATA ---
// Data replicated from the provided image for October 2025.
const calendarData = {
  "2025-10-01": -2.00,
  "2025-10-02": -2.00,
  "2025-10-03": -2.00,
  "2025-10-04": -2.00,
  "2025-10-05": -2.00,
  "2025-10-06": 61.00,
  "2025-10-07": 48.00,
  "2025-10-08": 52.00,
  "2025-10-09": 55.00,
};

// --- STATE ---
let currentDate = new Date('2025-10-01T00:00:00');

// --- DOM ELEMENTS ---
const monthYearEl = document.getElementById('month-year');
const calendarDaysEl = document.getElementById('calendar-days');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const exportCsvBtn = document.getElementById('export-csv');

// --- FUNCTIONS ---

/**
 * Renders the calendar grid for the month specified by the global `currentDate`.
 */
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYearEl.textContent = `Tháng ${month + 1} / ${year}`;
    calendarDaysEl.innerHTML = ''; // Clear previous month's days

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'border-t border-r';
        calendarDaysEl.appendChild(emptyCell);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'border-t border-r p-2 h-28 flex flex-col';

        const dateNumber = document.createElement('span');
        dateNumber.className = 'font-medium text-gray-800';
        dateNumber.textContent = day;
        dayCell.appendChild(dateNumber);

        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const amount = calendarData[dateKey];

        if (amount !== undefined) {
            const amountEl = document.createElement('span');
            const amountColor = amount > 0 ? 'text-green-600' : 'text-red-600';
            const amountPrefix = amount > 0 ? '+' : '';
            amountEl.className = `mt-1 text-sm ${amountColor} font-semibold`;
            amountEl.textContent = `${amountPrefix}${amount.toFixed(2)}`;
            dayCell.appendChild(amountEl);
        }

        calendarDaysEl.appendChild(dayCell);
    }
}

/**
 * Changes the current month and re-renders the calendar.
 * @param {number} offset - The number of months to move (-1 for previous, 1 for next).
 */
function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    renderCalendar();
}

/**
 * Exports the financial data for the current month to a CSV file.
 */
function handleExportCSV() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthStr = String(month + 1).padStart(2, '0');
    
    const relevantData = Object.entries(calendarData)
      .filter(([key]) => key.startsWith(`${year}-${monthStr}`));

    if (relevantData.length === 0) {
        alert("No data to export for the current month.");
        return;
    }

    let csvContent = "Date,Amount\n";
    relevantData.forEach(([date, amount]) => {
      csvContent += `${date},${amount.toFixed(2)}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `financial_data_${year}_${monthStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));
    exportCsvBtn.addEventListener('click', handleExportCSV);

    // Initial render
    renderCalendar();
});