import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { SavingGoal, Currency } from '../types';
import { convertToCurrency } from '../utils/finance';
import { 
    Plus, 
    Trash2, 
    Pencil, 
    Plane, 
    Car, 
    Home, 
    Shield, 
    Gift, 
    Smartphone, 
    Rocket,
    PiggyBank,
    Target
} from 'lucide-react';

const ICONS: Record<string, any> = {
    'plane': Plane,
    'car': Car,
    'home': Home,
    'shield': Shield,
    'gift': Gift,
    'phone': Smartphone,
    'rocket': Rocket,
    'piggy': PiggyBank
};

export const SavingsModule: React.FC = () => {
  const { data, addSavingGoal, updateSavingGoal, removeSavingGoal, settings } = useStore();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [currency, setCurrency] = useState<Currency>('UYU');
  const [icon, setIcon] = useState('piggy');
  const [color, setColor] = useState('bg-emerald-500');

  const goals = data.savingGoals || [];
  
  // Stats
  const totalSavings = goals.reduce((acc, g) => acc + convertToCurrency(g.currentAmount, g.currency, settings.baseCurrency, data.exchangeRate), 0);
  const monthlyCommitment = goals.reduce((acc, g) => acc + convertToCurrency(g.monthlyContribution, g.currency, settings.baseCurrency, data.exchangeRate), 0);

  const formatMoney = (amount: number, curr: Currency) => {
    return new Intl.NumberFormat(settings.language, { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(amount);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setMonthlyContribution('');
    setIcon('piggy');
    setColor('bg-emerald-500');
  };

  const handleEdit = (goal: SavingGoal) => {
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setMonthlyContribution(goal.monthlyContribution.toString());
    setCurrency(goal.currency);
    setIcon(goal.icon);
    setColor(goal.color);
    setEditingId(goal.id);
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const goalData = {
        name,
        targetAmount: parseFloat(targetAmount) || 0,
        currentAmount: parseFloat(currentAmount) || 0,
        monthlyContribution: parseFloat(monthlyContribution) || 0,
        currency,
        icon,
        color
    };

    if (editingId) {
        updateSavingGoal(editingId, goalData);
    } else {
        addSavingGoal({
            id: Math.random().toString(36).substr(2, 9),
            ...goalData
        });
    }
    resetForm();
  };

  return (
    <div className="space-y-6 pb-20">
        
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Patrimonio en Cofres</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                    {formatMoney(totalSavings, settings.baseCurrency)}
                </h3>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Aporte Mensual</p>
                <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">
                    {formatMoney(monthlyCommitment, settings.baseCurrency)}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Descontado del presupuesto diario</p>
            </div>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
            {!showForm ? (
                 <Button 
                    variant="ghost" 
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="w-full border-dashed border-2 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-transparent text-primary-700 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold py-4"
                >
                    <Plus className="w-5 h-5 mr-1" /> Crear Nuevo Cofre
                </Button>
            ) : (
                <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">{editingId ? 'Editar Cofre' : 'Nuevo Cofre'}</h3>
                    </div>
                    
                    <Input label="Nombre del Objetivo" placeholder="Ej. Viaje a Japón" value={name} onChange={e => setName(e.target.value)} autoFocus />
                    
                    <div className="grid grid-cols-2 gap-3">
                         <Input label="Meta (Total)" type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
                         <div>
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Moneda</label>
                             <select 
                                value={currency} 
                                onChange={e => setCurrency(e.target.value as Currency)} 
                                className="w-full h-[42px] bg-white dark:bg-slate-800 rounded-lg px-3 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                            >
                                <option>UYU</option><option>USD</option><option>UI</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                         <Input label="Ahorrado Actual" type="number" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} />
                         <Input label="Aporte Mensual" type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Icono & Color</label>
                        <div className="flex gap-4 items-center">
                             <div className="flex gap-2">
                                 {['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'].map(c => (
                                     <div 
                                        key={c} 
                                        onClick={() => setColor(c)}
                                        className={`w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-110 ${c} ${color === c ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-600' : ''}`}
                                     ></div>
                                 ))}
                             </div>
                             <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                             <div className="flex gap-2">
                                 {Object.keys(ICONS).slice(0, 4).map(k => {
                                     const IconC = ICONS[k];
                                     return (
                                         <button type="button" key={k} onClick={() => setIcon(k)} className={`p-1.5 rounded-lg ${icon === k ? 'bg-slate-200 dark:bg-slate-700' : 'text-slate-400'}`}>
                                             <IconC className="w-4 h-4" />
                                         </button>
                                     )
                                 })}
                             </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={resetForm} className="flex-1">Cancelar</Button>
                        <Button type="submit" className="flex-1">Guardar</Button>
                    </div>
                </form>
            )}

            {goals.map(goal => {
                const Icon = ICONS[goal.icon] || PiggyBank;
                const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                
                // Calculate estimated months left
                const remaining = goal.targetAmount - goal.currentAmount;
                const monthsLeft = goal.monthlyContribution > 0 ? Math.ceil(remaining / goal.monthlyContribution) : null;

                return (
                    <div key={goal.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                        
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl ${goal.color} bg-opacity-10 flex items-center justify-center text-white shadow-md`}>
                                    <div className={`w-full h-full rounded-2xl ${goal.color} opacity-20 absolute`}></div>
                                    <Icon className={`w-6 h-6 ${goal.color.replace('bg-', 'text-')}`} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-slate-800 dark:text-white">{goal.name}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Meta: <span className="font-medium">{formatMoney(goal.targetAmount, goal.currency)}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-2xl font-bold text-slate-800 dark:text-white">{formatMoney(goal.currentAmount, goal.currency)}</span>
                                {monthsLeft !== null && remaining > 0 && (
                                    <span className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                                        <Target className="w-3 h-3" /> {monthsLeft} mes{monthsLeft !== 1 ? 'es' : ''}
                                    </span>
                                )}
                                {remaining <= 0 && (
                                    <span className="text-[10px] text-emerald-500 font-bold flex items-center justify-end gap-1">
                                        <Shield className="w-3 h-3" /> Completado
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                             <div 
                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ${goal.color}`}
                                style={{ width: `${Math.min(100, progress)}%` }}
                             ></div>
                        </div>
                        
                        <div className="flex justify-between items-center relative z-10">
                             <span className="text-[10px] font-bold text-slate-400">{progress.toFixed(0)}%</span>
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(goal)} className="p-1.5 text-slate-300 hover:text-primary-500">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => removeSavingGoal(goal.id)} className="p-1.5 text-slate-300 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                        </div>

                    </div>
                );
            })}
        </div>
    </div>
  );
};