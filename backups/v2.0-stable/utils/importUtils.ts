import Papa from 'papaparse';
import { createWorker } from 'tesseract.js';
import { VariableExpense, FinancialData, ExpenseCategory, ExpenseImportance } from '../types';

export interface RawTransaction {
    date: string;
    description: string;
    amount: number;
    currency: 'UYU' | 'USD';
}

export const parseCSV = (file: File): Promise<RawTransaction[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                // Simple mapping assumption (to be refined in UI)
                // Here we just return the raw data for now
                const transactions = results.data as any[];
                resolve(transactions);
            },
            error: (error) => reject(error),
        });
    });
};

export const processImageWithOCR = async (imageFile: File): Promise<string> => {
    const worker = await createWorker('spa');
    const { data: { text } } = await worker.recognize(imageFile);
    await worker.terminate();
    return text;
};

export const detectCSVColumns = (firstRow: any): { date: string, description: string, amount: string, currency: string } => {
    const keys = Object.keys(firstRow);
    const mapping = { date: '', description: '', amount: '', currency: '' };

    const datePatterns = ['fecha', 'date', 'f.', 'día', 'day', 'ejecución'];
    const descPatterns = ['descrip', 'concepto', 'nombre', 'detall', 'motivo', 'business'];
    const amountPatterns = ['monto', 'importe', 'amount', 'valor', 'total', 'débito', 'debit', 'salida'];
    const currencyPatterns = ['moneda', 'currency', 'divisa', 'mon.'];

    keys.forEach(key => {
        const lowerKey = key.toLowerCase();
        if (!mapping.date && datePatterns.some(p => lowerKey.includes(p))) mapping.date = key;
        if (!mapping.description && descPatterns.some(p => lowerKey.includes(p))) mapping.description = key;
        if (!mapping.amount && amountPatterns.some(p => lowerKey.includes(p))) mapping.amount = key;
        if (!mapping.currency && currencyPatterns.some(p => lowerKey.includes(p))) mapping.currency = key;
    });

    return mapping;
};

export const extractTransactionFromText = (text: string): Partial<RawTransaction> => {
    const result: Partial<RawTransaction> = {};

    // Enhanced Regex for Amount (detects things like $ 1.234,56 or 1234.56)
    // Supports negative amounts and different currency symbols
    const amountRegex = /(?:total|importe|monto|uyu|usd|\$|u\$s)\s*[:\-]?\s*(?:\$|USD|UYU)?\s*(-?\d{1,3}(?:\.\d{3})*(?:,\d{2})?|-?\d+(?:\.\d{2})?)/i;
    const amountMatch = text.match(amountRegex);
    if (amountMatch) {
        let cleanAmount = amountMatch[1].replace(/\./g, '').replace(',', '.');
        result.amount = Math.abs(parseFloat(cleanAmount)); // We usually want absolute for expenses
    }

    // Enhanced Regex for Date (DD/MM/YYYY, DD-MM-YYYY, DD/MM/YY)
    const dateRegex = /(\d{1,2})[\/\-s\.](\d{1,2})[\/\-s\.](\d{2,4})/;
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
        let year = dateMatch[3];
        if (year.length === 2) year = `20${year}`;
        result.date = `${year}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
    }

    return result;
};

export const findDuplicates = (
    newTransactions: Partial<VariableExpense>[],
    existingExpenses: VariableExpense[]
): number[] => {
    const duplicatesIndices: number[] = [];

    newTransactions.forEach((newTr, index) => {
        const isDuplicate = existingExpenses.some(ext => {
            const amountMatch = Math.abs(ext.amount - (newTr.amount || 0)) < 0.01;

            // Fuzzy text similarity (simple overlap check)
            const extDesc = ext.description.toLowerCase();
            const newDesc = (newTr.description || '').toLowerCase();
            const descMatch = extDesc.includes(newDesc) || newDesc.includes(extDesc);

            // Date match within 48 hours for flexibility with bank lags
            const dateDiff = Math.abs(new Date(ext.date).getTime() - new Date(newTr.date || '').getTime());
            const timeMatch = dateDiff <= 48 * 60 * 60 * 1000;

            return amountMatch && timeMatch && (descMatch || dateDiff === 0);
        });

        if (isDuplicate) duplicatesIndices.push(index);
    });

    return duplicatesIndices;
};

export const suggestCategory = (description: string): ExpenseCategory => {
    const desc = description.toLowerCase();

    // Food & Supermarkets
    if (desc.includes('super') || desc.includes('disco') || desc.includes('tienda inglesa') ||
        desc.includes('devoto') || desc.includes('ta-ta') || desc.includes('macro') ||
        desc.includes('pedidosya') || desc.includes('rappi') || desc.includes('mcdonald')) return 'food';

    // Transport & Fuel
    if (desc.includes('uber') || desc.includes('taxi') || desc.includes('stm') ||
        desc.includes('ancap') || desc.includes('axion') || desc.includes('petrobras') ||
        desc.includes('disa')) return 'transport';

    // Utilities & Services
    if (desc.includes('antel') || desc.includes('ute') || desc.includes('ose') ||
        desc.includes('claro') || desc.includes('movistar') || desc.includes('movistar')) return 'utilities';

    // Subscriptions
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('hbo') ||
        desc.includes('prime') || desc.includes('disney') || desc.includes('youtube') ||
        desc.includes('apple') || desc.includes('google storage')) return 'subscription';

    // Health
    if (desc.includes('farma') || desc.includes('hospital') || desc.includes('medica') ||
        desc.includes('sanatorio') || desc.includes('dentista') || desc.includes('optica')) return 'health';

    return 'other';
};
