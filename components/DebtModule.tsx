import React, { useState } from 'react';
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
    Info
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
    
    // Logic: Calculate remaining balance based on installments
    // If it's a credit card with 1 installment (revolving), logic still holds (1 total, 0 paid = full amount)
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
    <div className="space-y-6">
        {/* Strategy Control Card */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Estrategia de Pago</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
                <button 
                    onClick={() => updateData({ paymentStrategy: 'snowball' })}
                    className={`p-3 rounded-xl flex flex-col items-center gap-2 border-2 transition-all ${
                        data.paymentStrategy === 'snowball' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                        : 'border-transparent bg-slate-50 dark:bg-slate-700/50 text-slate-500'
                    }`}
                >
                    <Snowflake className="w-5 h-5" />
                    <span className="text-xs font-bold">Bola de Nieve</span>
                </button>
                <button 
                    onClick={() => updateData({ paymentStrategy: 'avalanche' })}
                    className={`p-3 rounded-xl flex flex-col items-center gap-2 border-2 transition-all ${
                        data.paymentStrategy === 'avalanche' 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' 
                        : 'border-transparent bg-slate-50 dark:bg-slate-700/50 text-slate-500'
                    }`}
                >
                    <TrendingDown className="w-5 h-5" />
                    <span className="text-xs font-bold">Avalancha</span>
                </button>
            </div>
            
            {/* Strategy Explanation */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex gap-3 items-start">
                <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${data.paymentStrategy === 'snowball' ? 'text-blue-500' : 'text-red-500'}`} />
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {data.paymentStrategy === 'snowball' ? (
                        <span>
                            <strong className="text-blue-600 dark:text-blue-400 block mb-1">Enfoque Psicológico</strong> 
                            Ordena tus deudas de menor a mayor monto total. Pagas las pequeñas primero para liberar flujo de caja y ganar motivación rápidamente.
                        </span>
                    ) : (
                        <span>
                            <strong className="text-red-600 dark:text-red-400 block mb-1">Enfoque Matemático</strong>
                            Ataca primero la deuda con mayor Tasa de Interés (TEA). Aunque sea difícil al inicio, es la forma más rápida y barata de salir de deudas a largo plazo.
                        </span>
                    )}
                </p>
            </div>
        </div>

        {/* Debt List */}
        <div className="space-y-4">
            {!showForm ? (
                <Button 
                    variant="ghost" 
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="w-full border-dashed border-2 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-transparent text-primary-700 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold py-4"
                >
                    <Plus className="w-5 h-5 mr-1" /> Registrar Nueva Deuda
                </Button>
            ) : (
                <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">{editingId ? 'Editar Deuda' : 'Nueva Deuda'}</h3>
                    </div>
                    
                    <Input label="Nombre de la Deuda" placeholder="Ej. Préstamo Automotor" value={name} onChange={e => setName(e.target.value)} autoFocus />
                    
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Monto Total Original" type="number" placeholder="0.00" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} />
                        <div>
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Moneda</label>
                             <select 
                                value={currency} 
                                onChange={e => setCurrency(e.target.value as Currency)} 
                                className="w-full h-[42px] bg-white dark:bg-slate-800 rounded-lg px-3 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                            >
                                <option>UYU</option><option>USD</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-3">
                             <Calculator className="w-4 h-4 text-slate-400" />
                             <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Cálculo de Restante</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="Total de Cuotas" type="number" placeholder="Ej. 24" value={totalInstallments} onChange={e => setTotalInstallments(e.target.value)} />
                            <Input label="Cuotas Pagadas" type="number" placeholder="Ej. 5" value={paidInstallments} onChange={e => setPaidInstallments(e.target.value)} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="TEA % (Interés)" type="number" placeholder="Ej. 90" value={interestRate} onChange={e => setInterestRate(e.target.value)} />
                        <Input label="Valor Cuota (Mensual)" type="number" placeholder="0.00" value={minPayment} onChange={e => setMinPayment(e.target.value)} />
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={resetForm} className="flex-1">Cancelar</Button>
                        <Button type="submit" className="flex-1">Guardar</Button>
                    </div>
                </form>
            )}

            {sortedDebts.length === 0 && !showForm && (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <CreditCard className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">No tienes deudas registradas.</p>
                </div>
            )}

            {sortedDebts.map((debt, index) => (
                <div key={debt.id} className="relative bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
                    {/* Rank Badge */}
                    <div className="absolute top-0 left-0 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[10px] px-2 py-1 rounded-tl-xl rounded-br-lg font-mono font-bold">
                        #{index + 1} Prioridad
                    </div>

                    <div className="flex justify-between items-start mt-4 mb-3">
                        <div>
                            <h4 className="font-bold text-lg text-slate-800 dark:text-white">{debt.name}</h4>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                                <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px]">TEA {debt.interestRate}%</span>
                                <span>•</span>
                                <span>{debt.paidInstallments}/{debt.totalInstallments} Cuotas</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block text-xs text-slate-400 uppercase">Restante</span>
                            <span className="font-bold text-slate-800 dark:text-white text-lg">{formatMoney(debt.remainingAmount, debt.currency)}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className={`h-2.5 rounded-full transition-all duration-500 ${index === 0 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-slate-400'}`}
                                style={{ width: `${Math.min(100, (debt.paidInstallments / debt.totalInstallments) * 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                             <span className="text-[10px] text-slate-400">Total Original: {formatMoney(debt.totalAmount, debt.currency)}</span>
                             <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Cuota: {formatMoney(debt.minimumPayment, debt.currency)}/mes</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex justify-end gap-2">
                         <button onClick={() => handleEdit(debt)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary-600 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <Pencil className="w-3 h-3" /> Editar
                         </button>
                         <button onClick={() => removeDebt(debt.id)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <Trash2 className="w-3 h-3" /> Eliminar
                         </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};