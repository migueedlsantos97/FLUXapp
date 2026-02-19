import { ExpenseCategory, ExpenseImportance } from '../types';

interface ParsedExpense {
  amount: number;
  description: string;
  category: ExpenseCategory;
  importance: ExpenseImportance;
}

// Dictionary for categorization (Spanish & English)
const KEYWORDS: Record<string, { cat: ExpenseCategory, imp: ExpenseImportance }> = {
  // Food
  'super': { cat: 'food', imp: 'vital' },
  'súper': { cat: 'food', imp: 'vital' },
  'supermercado': { cat: 'food', imp: 'vital' },
  'grocery': { cat: 'food', imp: 'vital' },
  'groceries': { cat: 'food', imp: 'vital' },
  'comida': { cat: 'food', imp: 'vital' },
  'food': { cat: 'food', imp: 'vital' },
  'almuerzo': { cat: 'food', imp: 'flexible' },
  'lunch': { cat: 'food', imp: 'flexible' },
  'cena': { cat: 'food', imp: 'flexible' },
  'dinner': { cat: 'food', imp: 'flexible' },
  'delivery': { cat: 'food', imp: 'leisure' },
  'takeout': { cat: 'food', imp: 'leisure' },
  'mc': { cat: 'food', imp: 'leisure' },
  'burger': { cat: 'food', imp: 'leisure' },
  
  // Transport
  'uber': { cat: 'transport', imp: 'flexible' },
  'taxi': { cat: 'transport', imp: 'flexible' },
  'bus': { cat: 'transport', imp: 'vital' },
  'omnibus': { cat: 'transport', imp: 'vital' },
  'boleto': { cat: 'transport', imp: 'vital' },
  'ticket': { cat: 'transport', imp: 'vital' },
  'nafta': { cat: 'transport', imp: 'vital' },
  'combustible': { cat: 'transport', imp: 'vital' },
  'gas': { cat: 'transport', imp: 'vital' },
  'fuel': { cat: 'transport', imp: 'vital' },
  
  // Leisure
  'cine': { cat: 'leisure', imp: 'leisure' },
  'cinema': { cat: 'leisure', imp: 'leisure' },
  'movie': { cat: 'leisure', imp: 'leisure' },
  'salida': { cat: 'leisure', imp: 'leisure' },
  'out': { cat: 'leisure', imp: 'leisure' },
  'tragos': { cat: 'leisure', imp: 'leisure' },
  'drinks': { cat: 'leisure', imp: 'leisure' },
  'juego': { cat: 'leisure', imp: 'leisure' },
  'game': { cat: 'leisure', imp: 'leisure' },
  'regalo': { cat: 'leisure', imp: 'leisure' },
  'gift': { cat: 'leisure', imp: 'leisure' },
  'ropa': { cat: 'leisure', imp: 'flexible' },
  'clothes': { cat: 'leisure', imp: 'flexible' },
  'shopping': { cat: 'leisure', imp: 'leisure' },

  // Utilities
  'luz': { cat: 'utilities', imp: 'vital' },
  'ute': { cat: 'utilities', imp: 'vital' },
  'light': { cat: 'utilities', imp: 'vital' },
  'electricity': { cat: 'utilities', imp: 'vital' },
  'agua': { cat: 'utilities', imp: 'vital' },
  'ose': { cat: 'utilities', imp: 'vital' },
  'water': { cat: 'utilities', imp: 'vital' },
  'internet': { cat: 'utilities', imp: 'vital' },
  'wifi': { cat: 'utilities', imp: 'vital' },
  'antel': { cat: 'utilities', imp: 'vital' },
  'phone': { cat: 'utilities', imp: 'vital' },
  'celular': { cat: 'utilities', imp: 'vital' },

  // Health
  'farmacia': { cat: 'health', imp: 'vital' },
  'pharmacy': { cat: 'health', imp: 'vital' },
  'remedio': { cat: 'health', imp: 'vital' },
  'medicine': { cat: 'health', imp: 'vital' },
  'doctor': { cat: 'health', imp: 'vital' },
  'medico': { cat: 'health', imp: 'vital' },
};

export const parseSmartInput = (input: string): ParsedExpense[] => {
  const normalized = input.toLowerCase();
  
  // 1. Split compound sentences (e.g., "100 super y 200 taxi", "100 super, 200 taxi", "100 super and 200 taxi")
  // Regex looks for " y ", " e ", " con ", " and ", or commas/plus signs surrounded by spaces
  const segments = normalized.split(/\s+(?:y|e|con|and|\+|\,)\s+/g);
  
  const results: ParsedExpense[] = [];

  segments.forEach(segment => {
      const trimmed = segment.trim();
      if (!trimmed) return;

      // 2. Extract Amount
      const amountMatch = trimmed.match(/(\d+(?:\.\d+)?)/);
      if (!amountMatch) return; // Skip if no number found

      const amount = parseFloat(amountMatch[0]);
      
      // 3. Extract Description (remove the number)
      let description = trimmed.replace(amountMatch[0], '').trim();
      // Remove generic words if any
      description = description.replace(/^(gasto|pago|en|de|spend|on|in)\s+/g, '');
      
      if (!description) description = "Varios";

      // 4. Determine Category & Importance
      let category: ExpenseCategory = 'other';
      let importance: ExpenseImportance = 'flexible';

      // Check keywords in description
      for (const [key, value] of Object.entries(KEYWORDS)) {
          if (description.includes(key)) {
              category = value.cat;
              importance = value.imp;
              break; // Stop at first match (heuristic)
          }
      }

      results.push({ amount, description, category, importance });
  });

  return results;
};