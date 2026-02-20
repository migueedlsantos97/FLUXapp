import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import {
    X,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Loader2,
    Database,
    ScanLine,
    Download,
    HelpCircle,
    Info,
    ArrowLeft,
    FileCode,
    PlayCircle
} from 'lucide-react';
import {
    parseCSV,
    processImageWithOCR,
    extractTransactionFromText,
    findDuplicates,
    suggestCategory,
    detectCSVColumns,
    RawTransaction
} from '../utils/importUtils';
import { VariableExpense, Currency, ExpenseCategory, ExpenseImportance } from '../types';
import { getLocalISODate, formatDateLabel, parseISODate, sanitizeText, validateFinancialInput } from '../utils/finance';
import {
    Utensils,
    Bus,
    Zap,
    CalendarClock,
    Stethoscope,
    ShoppingBag,
    MoreHorizontal,
    Trash2,
    ShieldAlert
} from 'lucide-react';

interface ImportCenterProps {
    onClose: () => void;
}

const CATEGORY_ICONS: Record<string, any> = {
    food: Utensils,
    transport: Bus,
    utilities: Zap,
    subscription: CalendarClock,
    health: Stethoscope,
    leisure: ShoppingBag,
    other: MoreHorizontal
};

export const ImportCenter: React.FC<ImportCenterProps> = ({ onClose }) => {
    const { data, addVariableExpenses, settings } = useStore();
    const [step, setStep] = useState<'select' | 'mapping' | 'preview' | 'help'>('select');
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [rawTransactions, setRawTransactions] = useState<any[]>([]);
    const [processedExpenses, setProcessedExpenses] = useState<(Partial<VariableExpense> & { selected?: boolean })[]>([]);
    const [duplicateIndices, setDuplicateIndices] = useState<number[]>([]);
    const [mapping, setMapping] = useState({
        date: '',
        description: '',
        amount: '',
        currency: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFile(file);
        setIsLoading(true);

        try {
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                const results = await parseCSV(file);
                if (results.length > 0) {
                    const detected = detectCSVColumns(results[0]);
                    setMapping(detected);
                    setRawTransactions(results);

                    // IQ: If we have high confidence (date, desc, and amount found), skip to preview
                    if (detected.date && detected.description && detected.amount) {
                        applyMapping(results, detected);
                    } else {
                        setStep('mapping');
                    }
                }
            } else {
                alert('Por ahora solo soportamos archivos CSV.');
            }
        } catch (error) {
            console.error('Error parsing file:', error);
            alert('Error al leer el archivo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCameraUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const text = await processImageWithOCR(file);
            const extracted = extractTransactionFromText(text);

            const newExpense: Partial<VariableExpense> & { selected?: boolean } = {
                id: crypto.randomUUID(),
                amount: extracted.amount || 0,
                currency: settings.baseCurrency,
                description: 'Carga via OCR',
                category: 'other',
                importance: 'flexible' as ExpenseImportance,
                isImpulsive: false,
                date: extracted.date || new Date().toISOString().split('T')[0],
                timestamp: Date.now(),
                selected: true
            };

            setProcessedExpenses([newExpense]);
            setStep('preview');
        } catch (error) {
            console.error('OCR Error:', error);
            alert('Error al procesar la imagen.');
        } finally {
            setIsLoading(false);
        }
    };

    const applyMapping = (transactions: any[] = rawTransactions, currentMapping = mapping) => {
        const expenses = transactions.map(raw => {
            let amountRaw = String(raw[currentMapping.amount] || '0');
            // Detect if it's a negative amount (expense) or positive (income/return)
            const isNegative = amountRaw.includes('-') || amountRaw.includes('CR');
            let amount = validateFinancialInput(amountRaw.replace(/[^\d.,]/g, '').replace(',', '.'));

            const dateRaw = String(raw[currentMapping.date] || '');
            let dateStr = getLocalISODate(new Date());

            if (dateRaw) {
                // Robust parsing for common formats (YYYY-MM-DD, DD/MM/YYYY)
                if (dateRaw.includes('-')) {
                    // Assume ISO-ish
                    dateStr = getLocalISODate(parseISODate(dateRaw));
                } else if (dateRaw.includes('/')) {
                    // Assume DD/MM/YYYY or MM/DD/YYYY (common in banking)
                    const parts = dateRaw.split('/');
                    if (parts.length === 3) {
                        const day = parseInt(parts[0]);
                        const month = parseInt(parts[1]);
                        const year = parseInt(parts[2]);
                        // If year is 2 digits, assume 20xx
                        const fullYear = year < 100 ? 2000 + year : year;
                        // Try to be smart: if month > 12, it's likely MM/DD
                        if (month > 12) {
                            dateStr = getLocalISODate(new Date(fullYear, day - 1, month));
                        } else {
                            dateStr = getLocalISODate(new Date(fullYear, month - 1, day));
                        }
                    }
                } else {
                    const parsedDate = new Date(dateRaw);
                    if (!isNaN(parsedDate.getTime())) {
                        dateStr = getLocalISODate(parsedDate);
                    }
                }
            }

            const description = sanitizeText(String(raw[currentMapping.description] || 'Sin descripción'));
            const category = suggestCategory(description);

            return {
                id: crypto.randomUUID(),
                amount,
                currency: (raw[currentMapping.currency] as Currency) || settings.baseCurrency,
                description,
                category,
                importance: 'flexible' as ExpenseImportance,
                isImpulsive: false,
                date: dateStr,
                timestamp: new Date(dateStr).getTime() || Date.now(),
                selected: amount > 0 // Only select if amount is valid
            };
        });

        const duplicates = findDuplicates(expenses, data.variableExpenses);

        // Auto-deselect duplicates
        const processed = expenses.map((exp, i) => ({
            ...exp,
            selected: !duplicates.includes(i)
        }));

        setProcessedExpenses(processed);
        setDuplicateIndices(duplicates);
        setStep('preview');
    };

    const handleConfirmImport = () => {
        const selectedExpenses = processedExpenses.filter(e => e.selected);

        const finalExpenses = selectedExpenses.map(exp => ({
            ...exp,
            id: exp.id || crypto.randomUUID(),
            amount: validateFinancialInput(exp.amount),
            currency: exp.currency || settings.baseCurrency,
            description: sanitizeText(exp.description || ''),
            category: exp.category || 'other',
            importance: exp.importance || 'flexible',
            isImpulsive: !!exp.isImpulsive,
            date: exp.date || new Date().toISOString(),
            timestamp: exp.timestamp || Date.now()
        })) as VariableExpense[];

        addVariableExpenses(finalExpenses);
        onClose();
    };

    const handleDownloadTemplate = () => {
        const headers = ["Fecha", "Descripción", "Monto", "Moneda"];
        const exampleValues = ["2026-02-19", "Compra Ejemplo", "1500.50", "UYU"];
        const csvContent = [headers, exampleValues].map(row => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "flux_plantilla_importacion.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-700">
                {/* Header */}
                <div className="p-6 border-b border-main flex justify-between items-center bg-surface-alt">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-500/30">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-main uppercase tracking-tight flex items-center gap-2">
                                Importar
                            </h3>
                            <p className="text-xs text-muted font-medium italic">Automatiza tu realidad financiera sin fricción</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setStep(step === 'help' ? 'select' : 'help')}
                            className={`p-2 rounded-full transition-all ${step === 'help' ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600' : 'hover:bg-surface-alt text-muted'}`}
                            title="Guía de Importación"
                        >
                            <HelpCircle className="w-6 h-6" />
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Stepper */}
                    {/* Stepper (Only show if not in help) */}
                    {step !== 'help' && (
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <StepIndicator active={step === 'select'} complete={step !== 'select'} label="Origen" />
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                            <StepIndicator active={step === 'mapping'} complete={step === 'preview'} label="Mapeo" />
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                            <StepIndicator active={step === 'preview'} complete={false} label="Revisión" />
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 animate-pulse">Procesando Inteligencia de Datos...</p>
                        </div>
                    ) : (
                        <>
                            {step === 'select' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ActionButton
                                            icon={<FileCode className="w-8 h-8" />}
                                            title="Archivo Bancario"
                                            desc="Sube tu extracto en formato CSV"
                                            onClick={() => fileInputRef.current?.click()}
                                            primary
                                        />
                                        <ActionButton
                                            icon={<ScanLine className="w-8 h-8" />}
                                            title="Escanear Boleta"
                                            desc="Foto de ticket con OCR local"
                                            onClick={() => cameraInputRef.current?.click()}
                                        />
                                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                                        <input type="file" ref={cameraInputRef} onChange={handleCameraUpload} accept="image/*" className="hidden" />
                                    </div>

                                    {/* CSV Template Download Section */}
                                    <div className="p-5 rounded-3xl bg-surface border border-main border-dashed flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600">
                                                <Download className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-main">¿No tienes un archivo?</p>
                                                <p className="text-[10px] text-muted">Usa nuestra plantilla oficial para evitar errores</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleDownloadTemplate}
                                            className="px-4 py-2 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all"
                                        >
                                            Bajar Plantilla
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 'mapping' && (
                                <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                                    <h4 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                        Configuración de Columnas
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <MappingSelect label="Fecha" value={mapping.date} onChange={v => setMapping({ ...mapping, date: v })} options={Object.keys(rawTransactions[0] || {})} />
                                        <MappingSelect label="Descripción" value={mapping.description} onChange={v => setMapping({ ...mapping, description: v })} options={Object.keys(rawTransactions[0] || {})} />
                                        <MappingSelect label="Monto" value={mapping.amount} onChange={v => setMapping({ ...mapping, amount: v })} options={Object.keys(rawTransactions[0] || {})} />
                                        <MappingSelect label="Moneda (Opcional)" value={mapping.currency} onChange={v => setMapping({ ...mapping, currency: v })} options={Object.keys(rawTransactions[0] || {})} />
                                    </div>
                                    <button
                                        onClick={applyMapping}
                                        className="w-full mt-4 py-3 bg-primary-600 text-white rounded-2xl font-black tracking-tight hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
                                    >
                                        Generar Vista Previa
                                    </button>
                                </div>
                            )}

                            {step === 'preview' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="flex justify-between items-end border-b border-main pb-4">
                                        <div>
                                            <h4 className="font-black text-main uppercase tracking-tight">
                                                {processedExpenses.length} Movimientos
                                            </h4>
                                            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">
                                                {processedExpenses.filter(e => e.selected).length} seleccionados para inyectar
                                            </p>
                                        </div>
                                        {duplicateIndices.length > 0 && (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-[10px] font-black uppercase tracking-tighter">
                                                <ShieldAlert className="w-3.5 h-3.5" />
                                                {duplicateIndices.length} Posibles Duplicados Detectados
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {processedExpenses.map((exp, i) => {
                                            const isDuplicate = duplicateIndices.includes(i);
                                            const Icon = CATEGORY_ICONS[exp.category || 'other'] || MoreHorizontal;

                                            return (
                                                <div
                                                    key={i}
                                                    onClick={() => {
                                                        const newProcessed = [...processedExpenses];
                                                        newProcessed[i].selected = !newProcessed[i].selected;
                                                        setProcessedExpenses(newProcessed);
                                                    }}
                                                    className={`group p-4 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between gap-4 ${exp.selected
                                                        ? isDuplicate ? 'bg-orange-50/20 border-orange-200/40 shadow-sm' : 'bg-surface border-main shadow-sm'
                                                        : 'bg-surface-alt border-transparent opacity-60 grayscale'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${exp.selected ? 'bg-primary-600 border-primary-600 text-white' : 'bg-transparent border-slate-300 dark:border-slate-600'
                                                            }`}>
                                                            {exp.selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                        </div>
                                                        <div className={`p-3 rounded-2xl ${exp.selected ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                                                            <Icon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-main line-clamp-1">{exp.description}</p>
                                                            <div className="flex items-center gap-2 text-[10px] font-medium text-muted">
                                                                <span>{formatDateLabel(exp.date!, settings.language)}</span>
                                                                <span className="opacity-30">•</span>
                                                                <span className="uppercase text-primary-500 font-bold">{exp.category}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-sm font-black ${exp.selected ? 'text-main' : 'text-muted'}`}>
                                                            {exp.currency} {exp.amount?.toLocaleString()}
                                                        </p>
                                                        {isDuplicate && (
                                                            <p className="text-[9px] font-black text-orange-500 uppercase italic">Ya existe</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button
                                            onClick={() => setStep('select')}
                                            className="flex-1 py-4 bg-surface-alt text-muted rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-main"
                                        >
                                            <ArrowLeft className="w-4 h-4 inline-block mr-2" /> Atrás
                                        </button>
                                        <button
                                            onClick={handleConfirmImport}
                                            disabled={processedExpenses.filter(e => e.selected).length === 0}
                                            className="flex-[2] py-4 bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black tracking-tight hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20"
                                        >
                                            Confirmar e Inyectar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 'help' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="p-6 rounded-[2.5rem] bg-surface-alt border border-main">
                                        <h4 className="font-black text-main uppercase tracking-tight mb-4 flex items-center gap-2">
                                            <Info className="w-5 h-5 text-primary-600" /> Cómo usar el Import Center
                                        </h4>
                                        <div className="space-y-4">
                                            <HelpStep number="1" title="Prepara tu Archivo" desc="Descarga la plantilla CSV o usa un export de tu home banking." />
                                            <HelpStep number="2" title="Mapea las Columnas" desc="Dinos qué columna es la fecha, cuál el monto y cuál la descripción." />
                                            <HelpStep number="3" title="Revisa y Confirma" desc="Detectaremos duplicados automáticamente. Revisa y pulsa Confirmar." />
                                        </div>
                                    </div>

                                    {/* Video Tutorial Placeholder */}
                                    <div className="relative group overflow-hidden rounded-[2.5rem] border border-main aspect-video bg-slate-900 flex items-center justify-center cursor-pointer shadow-xl">
                                        <div className="text-center z-10 transition-transform group-hover:scale-110">
                                            <PlayCircle className="w-16 h-16 text-white mb-2 mx-auto drop-shadow-2xl" />
                                            <p className="text-xs font-black text-white uppercase tracking-widest">Ver Video Tutorial</p>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 to-transparent opacity-60"></div>
                                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80')] bg-cover bg-center brightness-50 opacity-40"></div>
                                    </div>

                                    {/* Mock OCR Button for Testing */}
                                    <button
                                        onClick={() => {
                                            const mockExpense: Partial<VariableExpense> = {
                                                id: crypto.randomUUID(),
                                                amount: 1500.50,
                                                currency: settings.baseCurrency,
                                                description: 'Mock: Tienda Inglesa',
                                                category: 'food',
                                                importance: 'flexible',
                                                isImpulsive: false,
                                                date: new Date().toISOString().split('T')[0],
                                                timestamp: Date.now()
                                            };
                                            setProcessedExpenses([mockExpense]);
                                            setStep('preview');
                                        }}
                                        className="w-full py-3 bg-surface-alt border border-main border-dashed text-primary-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                    >
                                        🧪 Simular Escaneo (Para Pruebas)
                                    </button>

                                    <button
                                        onClick={() => setStep('select')}
                                        className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black tracking-tight hover:bg-primary-700 transition-all"
                                    >
                                        Entendido, ¡A Importar!
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- SUBCOMPONENTS ---

const ActionButton: React.FC<{ icon: any, title: string, desc: string, onClick: () => void, primary?: boolean }> = ({ icon, title, desc, onClick, primary }) => (
    <button
        onClick={onClick}
        className={`p-6 rounded-[2rem] border-2 text-left transition-all hover:scale-[1.02] active:scale-95 flex flex-col gap-4 ${primary
            ? 'bg-primary-600 border-primary-500 text-white shadow-xl shadow-primary-600/20'
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 hover:border-primary-400'}`}
    >
        <div className={`p-4 rounded-[1.25rem] w-fit ${primary ? 'bg-white/10' : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'}`}>
            {icon}
        </div>
        <div>
            <h4 className={`font-black uppercase tracking-tight ${primary ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{title}</h4>
            <p className={`text-[10px] font-medium ${primary ? 'text-primary-100/70' : 'text-slate-400'}`}>{desc}</p>
        </div>
    </button>
);

const StepIndicator: React.FC<{ active: boolean, complete: boolean, label: string }> = ({ active, complete, label }) => (
    <div className="flex flex-col items-center gap-1.5 flex-1">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${active
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/40 ring-4 ring-primary-500/20'
            : complete ? 'bg-emerald-500 text-white' : 'bg-surface-alt border border-main text-muted'}`}>
            {complete ? '✓' : ''}
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-widest ${active ? 'text-primary-600' : 'text-muted'}`}>{label}</span>
    </div>
);

const HelpStep: React.FC<{ number: string, title: string, desc: string }> = ({ number, title, desc }) => (
    <div className="flex gap-4">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-[10px] font-black">{number}</div>
        <div>
            <p className="text-xs font-bold text-main">{title}</p>
            <p className="text-[10px] text-muted leading-relaxed">{desc}</p>
        </div>
    </div>
);

const MappingSelect: React.FC<{ label: string, value: string, onChange: (v: string) => void, options: string[] }> = ({ label, value, onChange, options }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-black text-muted tracking-tighter ml-1">{label}</label>
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="select-premium w-full text-xs"
        >
            <option value="">Selecciona Columna...</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);
