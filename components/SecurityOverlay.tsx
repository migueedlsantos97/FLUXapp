import * as React from 'react';
import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, ShieldAlert, Fingerprint, Lock, Delete } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SecurityOverlay: React.FC = () => {
    const { vaultIsLocked, unlockVault } = useStore();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    // Si no está bloqueado, no renderizamos nada
    useEffect(() => {
        if (pin.length === 4) {
            setIsChecking(true);
            // Pequeño delay para feedback visual
            setTimeout(() => {
                const success = unlockVault(pin);
                if (!success) {
                    setError(true);
                    setPin('');
                    // Feedback háptico (vibración si está en móvil)
                    if (window.navigator.vibrate) window.navigator.vibrate(100);
                }
                setIsChecking(false);
            }, 600);
        }
    }, [pin, unlockVault]);

    const handleNumberClick = (num: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
            setError(false);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
        setError(false);
    };

    if (!vaultIsLocked) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/60 dark:bg-slate-950/80 backdrop-blur-2xl"
        >
            <div className="w-full max-w-sm p-8 flex flex-col items-center">
                {/* Logo & Status */}
                <motion.div
                    animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl transition-colors duration-500 ${error ? 'bg-red-500 text-white' : 'bg-primary-600 text-white'
                        }`}
                >
                    {error ? <ShieldAlert className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
                </motion.div>

                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">Flux Vault</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-12">Introduce tu PIN de seguridad</p>

                {/* PIN Display */}
                <div className="flex gap-4 mb-16">
                    {[0, 1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${pin.length > i
                                ? 'bg-primary-500 border-primary-500 scale-125 shadow-lg shadow-primary-500/50'
                                : 'border-slate-300 dark:border-slate-700'
                                } ${error ? 'border-red-500 bg-red-500' : ''}`}
                        />
                    ))}
                </div>

                {/* Pad Numérico */}
                <div className="grid grid-cols-3 gap-6 w-full">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <PadButton key={num} value={num.toString()} onClick={handleNumberClick} />
                    ))}
                    <div className="flex items-center justify-center">
                        <Fingerprint className="w-6 h-6 text-slate-300 dark:text-slate-700 opacity-50" />
                    </div>
                    <PadButton value="0" onClick={handleNumberClick} />
                    <button
                        onClick={handleDelete}
                        className="h-16 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <Delete className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 text-xs font-bold text-red-500 uppercase tracking-widest"
                    >
                        PIN Incorrecto. Reintente.
                    </motion.p>
                )}
            </div>
        </motion.div>
    );
};

const PadButton: React.FC<{ value: string, onClick: (v: string) => void }> = ({ value, onClick }) => (
    <button
        onClick={() => onClick(value)}
        className="h-16 w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-2xl font-black text-slate-700 dark:text-white shadow-sm active:scale-90 active:bg-slate-50 dark:active:bg-slate-800 transition-all flex items-center justify-center"
    >
        {value}
    </button>
);
