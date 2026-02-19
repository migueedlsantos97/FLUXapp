import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Debt, Currency } from '../types';
import { sortDebts } from '../utils/finance';
import {
    Trash2,
    Pencil,
    Snowflake,
    TrendingDown,
    Plus,
    CreditCard,
    Calculator,
    Info,
    X,
    ChevronRight,
    Search
} from 'lucide-react';

export const DebtModule: React.FC = () => {
    const { data, updateData, addDebt, updateDebt, removeDebt, settings } = useStore();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [currency, setCurrency] = useState<Currency>('UYU');
    const [interestRate, setInterestRate] = useState('');
    const [minPayment, setMinPayment] = useState(''); // Cuota Mensual

    // Installment Logic State
    const [totalInstallments, setTotalInstallments] = useState('');
    const [paidInstallments, setPaidInstallments] = useState('');

    const sortedDebts = sortDebts(data.debts || [], data.paymentStrategy, settings.baseCurrency, data.exchangeRate);

    const handleEdit = (debt: Debt) => {
        setName(debt.name);
        setTotalAmount(debt.totalAmount.toString());
        setCurrency(debt.currency);
        setInterestRate(debt.interestRate.toString());
        setMinPayment(debt.minimumPayment.toString());
        setTotalInstallments(debt.totalInstallments.toString());
        setPaidInstallments(debt.paidInstallments.toString());

        setEditingId(debt.id);
        setShowForm(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !totalAmount || !totalInstallments) return;

        const tAmount = parseFloat(totalAmount);
        const tInstallments = parseInt(totalInstallments);
        const pInstallments = parseInt(paidInstallments) || 0;

        const amountPerInstallment = tAmount / tInstallments;
        const remainingAmount = amountPerInstallment * (tInstallments - pInstallments);

        const debtData = {
            name,
            totalAmount: tAmount,
            currency,
            interestRate: parseFloat(interestRate) || 0,
            minimumPayment: parseFloat(minPayment) || 0,
            totalInstallments: tInstallments,
            paidInstallments: pInstallments,
            remainingAmount: remainingAmount
        };

        if (editingId) {
            updateDebt(editingId, debtData);
        } else {
            addDebt({
                id: Math.random().toString(36).substr(2, 9),
                ...debtData
            });
        }
        resetForm();
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setName('');
        setTotalAmount('');
        setInterestRate('');
        setMinPayment('');
        setTotalInstallments('');
        setPaidInstallments('');
    };

    const formatMoney = (amount: number, curr: Currency) => {
        return new Intl.NumberFormat('es-UY', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 pb-20"
        >
            {/* Strategy Control Card */}
            <div className="glass glass-border p-6 rounded-[2.5rem] shadow-luxury">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Estrategia de Liquidez</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        onClick={() => updateData({ paymentStrategy: 'snowball' })}
                        className={`p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all duration-300 ${data.paymentStrategy === 'snowball'
                                ? 'border-primary-500 bg-white dark:bg-slate-800 text-primary-600 shadow-luxury'
                                : 'border-transparent bg-slate-100 dark:bg-slate-900/50 text-slate-400'
                            }`}
                    >
                        <Snowflake className={`w-6 h-6 transition-transform duration-500 ${data.paymentStrategy === 'snowball' ? 'scale-110' : ''}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Bola de Nieve</span>
                    </button>
                    <button
                        onClick={() => updateData({ paymentStrategy: 'avalanche' })}
                        className={`p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all duration-300 ${data.paymentStrategy === 'avalanche'
                                ? 'border-orange-500 bg-white dark:bg-slate-800 text-orange-600 shadow-luxury'
                                : 'border-transparent bg-slate-100 dark:bg-slate-900/50 text-slate-400'
                            }`}
                    >
                        <TrendingDown className={`w-6 h-6 transition-transform duration-500 ${data.paymentStrategy === 'avalanche' ? 'scale-110' : ''}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Avalancha</span>
                    </button>
                </div>

                {/* Strategy Explanation */}
                <motion.div
                    layout
                    className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex gap-4 items-start"
                >
                    <div className={`p-2 rounded-full flex-shrink-0 ${data.paymentStrategy === 'snowball' ? 'bg-primary-50 text-primary-500' : 'bg-orange-50 text-orange-500'}`}>
                        <Info className="w-4 h-4" />
                    </div>
                    <div className="text-xs leading-relaxed">
                        {data.paymentStrategy === 'snowball' ? (
                            <p className="text-slate-500 dark:text-slate-400">
                                <strong className="text-primary-600 dark:text-primary-400 font-black uppercase tracking-widest block mb-1">Enfoque Psicológico</strong>
                                Ataca las deudas de menor monto primero. Ideal para ver resultados rápidos y ganar tracción emocional.
                            </p>
                        ) : (
                            <p className="text-slate-500 dark:text-slate-400">
                                <strong className="text-orange-600 dark:text-orange-400 font-black uppercase tracking-widest block mb-1">Enfoque Matemático</strong>
                                Ataca primero la tasa de interés más alta. Es el método más eficiente para ahorrar dinero en intereses totales.
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Debt List */}
            <div className="space-y-4">
                <AnimatePresence mode="wait">
                    {!showForm ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <Button
                                variant="ghost"
                                onClick={() => { resetForm(); setShowForm(true); }}
                                className="w-full h-16 rounded-[2rem] border-dashed border-2 border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-transparent text-primary-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-slate-800 transition-all font-black text-xs uppercase tracking-widest"
                            >
                                <Plus className="w-5 h-5 mr-2" /> Registrar Nueva Deuda
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.form
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onSubmit={handleSave}
                            className="glass glass-border p-8 rounded-[2.5rem] space-y-6 shadow-luxury relative z-10"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{editingId ? 'Editar Deuda' : 'Nueva Deuda'}</h3>
                                <button type="button" onClick={resetForm} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
                            </div>

                            <Input placeholder="Nombre (ej. Visa, Préstamo)" value={name} onChange={e => setName(e.target.value)} autoFocus />

                            <div className="grid grid-cols-2 gap-3">
                                <Input placeholder="Monto Total" type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} />
                                <select
                                    value={currency}
                                    onChange={e => setCurrency(e.target.value as Currency)}
                                    className="h-12 bg-white dark:bg-slate-900 rounded-[1.25rem] px-4 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                                >
                                    <option>UYU</option><option>USD</option>
                                </select>
                            </div>

                            <div className="glass glass-border p-5 rounded-[1.75rem] space-y-4">
                                <div className="flex items-center gap-3">
                                    <Calculator className="w-4 h-4 text-primary-500" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Actual</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input label="Total Cuotas" type="number" placeholder="Ej. 12" value={totalInstallments} onChange={e => setTotalInstallments(e.target.value)} />
                                    <Input label="Ya Pagadas" type="number" placeholder="Ej. 3" value={paidInstallments} onChange={e => setPaidInstallments(e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Input label="TEA % Interés" type="number" placeholder="0" value={interestRate} onChange={e => setInterestRate(e.target.value)} />
                                <Input label="Cuota Mensual" type="number" placeholder="0.00" value={minPayment} onChange={e => setMinPayment(e.target.value)} />
                            </div>

                            <Button type="submit" className="w-full h-12 rounded-[1.25rem] font-black text-xs uppercase tracking-widest">
                                {editingId ? 'Actualizar' : 'Guardar Deuda'}
                            </Button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="space-y-4">
                    {sortedDebts.length === 0 && !showForm && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                            <CreditCard className="w-16 h-16 mb-4 opacity-10" />
                            <p className="text-xs font-black uppercase tracking-widest opacity-40">No hay deudas registradas</p>
                        </div>
                    )}

                    {sortedDebts.map((debt, index) => {
                        const progress = Math.min(100, (debt.paidInstallments / debt.totalInstallments) * 100);
                        return (
                            <motion.div
                                layout
                                key={debt.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass glass-border p-8 rounded-[2.5rem] shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-all group relative overflow-hidden"
                            >
                                {/* Priority Indicator */}
                                <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-[1.25rem] text-[9px] font-black uppercase tracking-widest ${index === 0 ? 'bg-primary-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                    {index === 0 ? 'Prioridad #1' : `#${index + 1}`}
                                </div>

                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 className="font-black text-xl text-slate-800 dark:text-white tracking-tight leading-none mb-2">{debt.name}</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="px-2 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-900/10 text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">
                                                TEA {debt.interestRate}%
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                {debt.paidInstallments} de {debt.totalInstallments} pagas
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Restante</span>
                                        <span className="font-black text-2xl text-slate-800 dark:text-white tracking-tighter">{formatMoney(debt.remainingAmount, debt.currency)}</span>
                                    </div>
                                </div>

                                {/* Progress Bar Container */}
                                <div className="space-y-2 mb-6">
                                    <div className="w-full bg-slate-100 dark:bg-slate-900/50 rounded-full h-3 overflow-hidden p-0.5 border border-slate-50 dark:border-slate-800">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full rounded-full ${index === 0 ? 'bg-gradient-to-r from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30' : 'bg-slate-400 dark:bg-slate-600'}`}
                                        ></motion.div>
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Carga: {formatMoney(debt.totalAmount, debt.currency)}</span>
                                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">Cuota: {formatMoney(debt.minimumPayment, debt.currency)}</span>
                                    </div>
                                </div>

                                {/* Actions bar */}
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleEdit(debt)} className="p-3 rounded-2xl text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => removeDebt(debt.id)} className="p-3 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};