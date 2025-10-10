import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { StatCard } from './components/StatCard';
import { Calendar } from './components/Calendar';
import { DayDetailModal } from './components/DayDetailModal';
import type { DayData, Project } from './types';
import { exportToCsv, importFromCsv } from './services/csvService';
// FIX: Changed import for startOfMonth to fix module resolution issue.
import { format, getMonth, getYear } from 'date-fns';
import startOfMonth from 'date-fns/startOfMonth';

const initialData: Record<string, DayData> = {
    '2025-10-01': { tradingFee: 2.00, alphaAirdrops: [], alphaEvents: [], points: 0 },
    '2025-10-02': { tradingFee: 2.00, alphaAirdrops: [], alphaEvents: [], points: 0 },
    '2025-10-03': { tradingFee: 2.00, alphaAirdrops: [], alphaEvents: [], points: 0 },
    '2025-10-05': { tradingFee: 2.00, alphaAirdrops: [], alphaEvents: [], points: 0 },
    '2025-10-06': { tradingFee: 0, alphaAirdrops: [{ id: 'a1', name: 'Airdrop 1', amount: 61.00 }], alphaEvents: [], points: -15 },
    '2025-10-07': { tradingFee: 0, alphaAirdrops: [{ id: 'a2', name: 'Airdrop 2', amount: 48.00 }], alphaEvents: [], points: -15 },
    '2025-10-08': { tradingFee: 0, alphaAirdrops: [{ id: 'a3', name: 'Airdrop 3', amount: 52.00 }], alphaEvents: [], points: -15 },
    '2025-10-09': { tradingFee: 0, alphaAirdrops: [{ id: 'a4', name: 'Airdrop 4', amount: 55.00 }], alphaEvents: [], points: -15 },
};

export default function App() {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1));
    const [dailyData, setDailyData] = useState<Record<string, DayData>>(initialData);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const stats = useMemo(() => {
        const currentMonthData = Object.entries(dailyData).filter(([date]) => {
            const d = new Date(date);
            return getYear(d) === getYear(currentDate) && getMonth(d) === getMonth(currentDate);
        // FIX: Cast the data to DayData to resolve type inference issues where `Object.entries`
        // was likely inferring the value type as `unknown`. This ensures `currentMonthData` is
        // correctly typed as `DayData[]`, resolving subsequent property access errors.
        }).map(([, data]) => data as DayData);

        const totalIncome = currentMonthData.reduce((sum, day) => {
            const airdropTotal = day.alphaAirdrops.reduce((s, p) => s + p.amount, 0);
            const eventTotal = day.alphaEvents.reduce((s, p) => s + p.amount, 0);
            return sum + airdropTotal + eventTotal;
        }, 0);

        const totalExpense = currentMonthData.reduce((sum, day) => sum + day.tradingFee, 0);
        
        const profit = totalIncome - totalExpense;
        const alphaAirdropsCount = currentMonthData.reduce((sum, day) => sum + day.alphaAirdrops.length, 0);
        const alphaEventsCount = currentMonthData.reduce((sum, day) => sum + day.alphaEvents.length, 0);
        const totalScore = currentMonthData.reduce((sum, day) => sum + day.points, 0);

        let topProject: Project = { id: '', name: '', amount: -1 };

        currentMonthData.forEach(day => {
            [...day.alphaAirdrops, ...day.alphaEvents].forEach(project => {
                if (project.amount > topProject.amount) {
                    topProject = project;
                }
            });
        });

        return {
            totalIncome,
            profit,
            alphaAirdropsCount,
            alphaEventsCount,
            totalScore,
            topProject,
        };
    }, [dailyData, currentDate]);

    const handlePrevMonth = useCallback(() => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    }, []);

    const handleNextMonth = useCallback(() => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
        });
    }, []);
    
    const handleExport = useCallback(() => {
        const today = new Date();
        const filename = `financial_data_export_${format(today, 'yyyy-MM-dd')}.csv`;
        exportToCsv(filename, dailyData);
    }, [dailyData]);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const importedData = await importFromCsv(file);
            const newData = { ...dailyData, ...importedData };
            setDailyData(newData);
            
            const importedDates = Object.keys(importedData);
            if (importedDates.length > 0) {
                 setCurrentDate(startOfMonth(new Date(importedDates[0])));
            }
        } catch (error) {
            console.error("Error importing CSV:", error);
            alert(`Failed to import CSV. Please check the file format. Error: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    
    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
    };

    const handleSaveData = (date: Date, data: DayData) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        setDailyData(prev => ({
            ...prev,
            [dateKey]: data,
        }));
        handleCloseModal();
    };


    return (
        <div className="min-h-screen">
            <Header title="Thống kê Alpha Binance" />
            <main className="p-4 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                    <StatCard title="Tổng Thu Nhập" value={`$${stats.totalIncome.toFixed(2)}`} />
                    <StatCard title="Alpha Airdrop" value={stats.alphaAirdropsCount.toString()} />
                    <StatCard title="Alpha Event" value={stats.alphaEventsCount.toString()} />
                    <StatCard title="Lợi Nhuận" value={`$${stats.profit.toFixed(2)}`} />
                    <StatCard title="Tổng điểm" value={stats.totalScore.toString()} />
                    <StatCard 
                        title="Dự án đỉnh nhất" 
                        value={
                            stats.topProject.amount > 0 ? (
                                <p className="text-lg font-bold text-[--color-text-primary] truncate" title={`${stats.topProject.name}: $${stats.topProject.amount.toFixed(2)}`}>
                                    {stats.topProject.name}:
                                    <span className="font-semibold text-[--color-text-positive]">
                                        {' '}${stats.topProject.amount.toFixed(2)}
                                    </span>
                                </p>
                            ) : <span className="text-[--color-text-primary]">N/A</span>
                        } 
                    />
                </div>
                <Calendar 
                    currentDate={currentDate}
                    data={dailyData}
                    onNextMonth={handleNextMonth}
                    onPrevMonth={handlePrevMonth}
                    onExport={handleExport}
                    onImport={handleImportClick}
                    onDayClick={handleDayClick}
                />
            </main>
            {isModalOpen && selectedDate && (
                <DayDetailModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveData}
                    date={selectedDate}
                    data={dailyData[format(selectedDate, 'yyyy-MM-dd')]}
                />
            )}
            <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
            />
        </div>
    );
}