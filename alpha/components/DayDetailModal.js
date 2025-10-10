import React, { useState, useEffect } from 'react';
import { CloseIcon, PlusIcon } from './Icons.js';
import { format } from 'date-fns';

const ProjectInputList = ({ title, projects, setProjects }) => {
    
    const addProject = () => {
        setProjects([...projects, { id: crypto.randomUUID(), name: '', amount: 0 }]);
    };

    const updateProject = (id, field, value) => {
        const processedValue = field === 'amount' ? parseFloat(value) || 0 : value;
        setProjects(projects.map(p => p.id === id ? { ...p, [field]: processedValue } : p));
    };
    
    const removeProject = (id) => {
        setProjects(projects.filter(p => p.id !== id));
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h4 className="text-md font-semibold text-[--color-text-primary]">{title}</h4>
                <button 
                    onClick={addProject} 
                    className="p-1 rounded-full text-[--color-text-secondary] hover:bg-[--color-border-default] hover:text-[--color-text-primary] transition-colors"
                    title={`Thêm ${title}`}
                    aria-label={`Thêm ${title}`}
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
            {projects.map((project) => (
                <div key={project.id} className="grid grid-cols-12 gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Tên dự án"
                        value={project.name}
                        onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                        className="col-span-6 p-2 border border-[--color-border-default] rounded-md shadow-sm focus:ring-[--color-accent-primary] focus:border-[--color-accent-primary] bg-[--color-input-bg] text-[--color-text-primary]"
                    />
                    <input
                        type="number"
                        placeholder="Số tiền"
                        value={project.amount}
                        onChange={(e) => updateProject(project.id, 'amount', e.target.value)}
                        className="col-span-4 p-2 border border-[--color-border-default] rounded-md shadow-sm focus:ring-[--color-accent-primary] focus:border-[--color-accent-primary] bg-[--color-input-bg] text-[--color-text-primary]"
                    />
                    <button onClick={() => removeProject(project.id)} className="col-span-2 text-[--color-text-negative] hover:opacity-75 font-semibold">Xóa</button>
                </div>
            ))}
        </div>
    );
};


export const DayDetailModal = ({ isOpen, onClose, onSave, date, data }) => {
    const [tradingFee, setTradingFee] = useState(0);
    const [airdrops, setAirdrops] = useState([]);
    const [events, setEvents] = useState([]);
    const [points, setPoints] = useState(0);

    useEffect(() => {
        if (data) {
            setTradingFee(data.tradingFee || 0);
            setAirdrops(data.alphaAirdrops ? JSON.parse(JSON.stringify(data.alphaAirdrops)) : []);
            setEvents(data.alphaEvents ? JSON.parse(JSON.stringify(data.alphaEvents)) : []);
            setPoints(data.points || 0);
        } else {
            setTradingFee(0);
            setAirdrops([]);
            setEvents([]);
            setPoints(0);
        }
    }, [data, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(date, {
            tradingFee,
            alphaAirdrops: airdrops.filter(p => p.name.trim() !== ''),
            alphaEvents: events.filter(p => p.name.trim() !== ''),
            points,
        });
    };

    return (
        <div className="fixed inset-0 bg-[--color-bg-overlay] z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-[--color-bg-card] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b border-[--color-border-default] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[--color-text-primary]">
                        Chỉnh sửa ngày {format(date, 'dd/MM/yyyy')}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10">
                        <CloseIcon className="w-6 h-6 text-[--color-text-secondary]" />
                    </button>
                </header>

                <main className="p-6 space-y-6 overflow-y-auto">
                    <div>
                        <label htmlFor="tradingFee" className="block text-sm font-medium text-[--color-text-secondary]">Trading Fee</label>
                        <input
                            id="tradingFee"
                            type="number"
                            value={tradingFee}
                            onChange={(e) => setTradingFee(parseFloat(e.target.value) || 0)}
                            className="mt-1 block w-full p-2 border border-[--color-border-default] rounded-md shadow-sm focus:ring-[--color-accent-primary] focus:border-[--color-accent-primary] bg-[--color-input-bg] text-[--color-text-primary]"
                        />
                    </div>
                    
                    <ProjectInputList title="Alpha Airdrop" projects={airdrops} setProjects={setAirdrops} />
                    <ProjectInputList title="Alpha Event" projects={events} setProjects={setEvents} />

                    <div>
                        <label htmlFor="points" className="block text-sm font-medium text-[--color-text-secondary]">Điểm</label>
                        <input
                            id="points"
                            type="number"
                            value={points}
                            onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                             className="mt-1 block w-full p-2 border border-[--color-border-default] rounded-md shadow-sm focus:ring-[--color-accent-primary] focus:border-[--color-accent-primary] bg-[--color-input-bg] text-[--color-text-primary]"
                        />
                    </div>
                </main>

                <footer className="p-4 bg-[--color-bg-card-alt] border-t border-[--color-border-default] flex justify-end items-center gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[--color-button-secondary-text] bg-[--color-button-secondary-bg] border border-[--color-button-secondary-border] rounded-md hover:bg-[--color-button-secondary-bg-hover] transition-colors">
                        Hủy
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-[--color-accent-primary] border border-transparent rounded-md hover:bg-[--color-accent-primary-hover] transition-colors">
                        Lưu
                    </button>
                </footer>
            </div>
        </div>
    );
};
