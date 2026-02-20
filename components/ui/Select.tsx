import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    label?: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    className?: string;
}

export const Select: React.FC<SelectProps> = ({ label, value, options, onChange, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className || 'w-full'}`} ref={containerRef}>
            {label && (
                <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-2 ml-1">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-12 bg-surface border border-main rounded-xl px-4 flex items-center justify-between text-main font-bold focus:outline-none transition-all hover:bg-surface-alt group"
            >
                <span className="truncate">{selectedOption?.label || value}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-muted group-hover:text-main"
                >
                    <ChevronDown className="w-4 h-4" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-[100] w-full mt-2 bg-surface-alt border border-main rounded-xl shadow-2xl overflow-hidden backdrop-blur-md"
                    >
                        <div className="max-h-60 overflow-y-auto py-1">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-4 py-3 text-left text-sm font-bold transition-colors flex items-center justify-between
                    ${option.value === value
                                            ? 'bg-main text-background'
                                            : 'text-main hover:bg-surface'}`}
                                >
                                    {option.label}
                                    {option.value === value && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-background" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
