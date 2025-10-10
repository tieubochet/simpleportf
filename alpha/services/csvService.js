import { format, parse } from 'date-fns';

export const exportToCsv = (filename, data) => {
    const header = 'date,type,name,amount\n';
    const rows = [];

    for (const date in data) {
        const dayData = data[date];
        if (dayData.tradingFee > 0) {
            rows.push({ date, type: 'TRADING_FEE', name: '', amount: dayData.tradingFee });
        }
        if (dayData.points !== 0) {
            rows.push({ date, type: 'POINTS', name: '', amount: dayData.points });
        }
        dayData.alphaAirdrops.forEach(p => {
            rows.push({ date, type: 'AIRDROP', name: p.name, amount: p.amount });
        });
        dayData.alphaEvents.forEach(p => {
            rows.push({ date, type: 'EVENT', name: p.name, amount: p.amount });
        });
    }

    const csvRows = rows.map(row => `${row.date},${row.type},"${row.name.replace(/"/g, '""')}",${row.amount}`);
    const csvString = header + csvRows.join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const importFromCsv = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                const lines = text.split('\n').filter(row => row.trim() !== '');
                const header = lines.shift()?.trim().toLowerCase().split(',');

                if (!header || header[0] !== 'date' || header[1] !== 'type' || header[2] !== 'name' || header[3] !== 'amount') {
                    throw new Error('Invalid CSV header. Expected "date,type,name,amount".');
                }

                const data = {};

                lines.forEach((line, index) => {
                    // Basic CSV parsing for quoted names
                    const values = line.match(/(?:"[^"]*"|[^,]+)/g);
                    if (!values || values.length !== 4) {
                        throw new Error(`Invalid row format at line ${index + 2}. Expected 4 columns.`);
                    }
                    const [dateStr, type, name, amountStr] = values.map(v => v.trim().replace(/^"|"$/g, ''));
                    
                    const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
                    if (isNaN(parsedDate.getTime())) {
                        throw new Error(`Invalid date format at line ${index + 2}: ${dateStr}. Expected 'yyyy-MM-dd'.`);
                    }
                    const dateKey = format(parsedDate, 'yyyy-MM-dd');
                    
                    const amount = parseFloat(amountStr);
                    if (isNaN(amount)) {
                        throw new Error(`Invalid amount at line ${index + 2}: ${amountStr}. Must be a number.`);
                    }

                    if (!data[dateKey]) {
                        data[dateKey] = { tradingFee: 0, alphaAirdrops: [], alphaEvents: [], points: 0 };
                    }

                    switch (type.toUpperCase()) {
                        case 'TRADING_FEE':
                            data[dateKey].tradingFee = amount;
                            break;
                        case 'POINTS':
                            data[dateKey].points = amount;
                            break;
                        case 'AIRDROP':
                            data[dateKey].alphaAirdrops.push({ id: crypto.randomUUID(), name, amount });
                            break;
                        case 'EVENT':
                            data[dateKey].alphaEvents.push({ id: crypto.randomUUID(), name, amount });
                            break;
                        default:
                            console.warn(`Unknown type "${type}" at line ${index + 2}. Skipping.`);
                    }
                });
                resolve(data);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};