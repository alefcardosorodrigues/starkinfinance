import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ParsedExpense {
  id: string; // Temporary ID for UI tracking
  date: string; // ISO string 'YYYY-MM-DD'
  name: string;
  value: number; // Raw number
  categoryId?: string; 
  isValid: boolean; // Flag to easily identify invalid parsing if needed
}

export interface BankStatementParser {
  name: string;
  parse(text: string, currentYear: number): ParsedExpense[];
}

const MONTH_MAP: Record<string, number> = {
  JAN: 0, FEV: 1, MAR: 2, ABR: 3, MAI: 4, JUN: 5, JUL: 6, AGO: 7, SET: 8, OUT: 9, NOV: 10, DEZ: 11
};

export class NubankParser implements BankStatementParser {
  name = 'Nubank';

  parse(text: string, currentYear: number): ParsedExpense[] {
    const expenses: ParsedExpense[] = [];
    
    // Apenas analisa a parte do texto após a palavra TRANSAÇÕES para evitar pegar os resumos iniciais
    const transacoesMatch = text.match(/TRANSAÇÕES/i);
    let textToParse = text;
    if (transacoesMatch && transacoesMatch.index !== undefined) {
      textToParse = text.substring(transacoesMatch.index);
    }
    
    // Remove cabeçalhos que se repetem no topo de cada página e acabam sujando o texto capturado 
    // ou sendo confundidos com datas de transações
    textToParse = textToParse
      .replace(/FATURA\s+\d{2}\s+[a-zA-Z]{3}\s+\d{4}/gi, '')
      .replace(/EMISSÃO\s+E\s+ENVIO\s+\d{2}\s+[a-zA-Z]{3}\s+\d{4}/gi, '')
      .replace(/TRANSAÇÕES\s+DE\s+\d{2}\s+[a-zA-Z]{3}\s+A\s+\d{2}\s+[a-zA-Z]{3}/gi, '');

    
    // Pattern to match Nubank transactions:
    // "02 DEZ •••• 3999 produtos lp - Parcela 2/5 R$ 120,00"
    // "22 DEZ Desconto Antecipação faculdade Tete parc −R$ 4,89"
    // Regex explanation:
    // (\d{2}) -> Day
    // \s+(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ) -> Month
    // (.*?) -> Description (lazy)
    // (?=(-?R\$|−R\$)\s*[\d.,]+) -> Positive lookahead for currency to stop the lazy matching
    // (-?R\$|−R\$)\s*([\d.,]+) -> Currency symbol (including minus or unicode minus) and value
    
    // A simpler approach: find the date, anything in between, and then the currency value at the end of the line.
    // However, text from pdf might not have strict newlines per transaction.
    // Let's use a global match:
    const regex = /(\d{2})\s+(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\s+(.*?)\s+(-?R\$|−R\$)\s*([\d.,]+)/gi;
    
    let match;
    while ((match = regex.exec(textToParse)) !== null) {
      const day = parseInt(match[1], 10);
      const monthStr = match[2].toUpperCase();
      let description = match[3].trim();
      const currencySymbol = match[4]; // R$, -R$, −R$
      const valueStr = match[5];
      
      const month = MONTH_MAP[monthStr];
      
      // Clean up description (remove •••• 1234 if present)
      description = description.replace(/••••\s*\d{4}\s*/, '').trim();

      // Handle value formatting
      let rawValue = parseFloat(valueStr.replace(/\./g, '').replace(',', '.'));
      
      // If it's a negative amount in the statement (like a discount or payment), the symbol will contain a minus
      if (currencySymbol.includes('-') || currencySymbol.includes('−')) {
        rawValue = -rawValue;
      }
      
      // We assume the year is the currentYear. If month is DEC and current is JAN, it might be last year,
      // but the user requested to use the currently selected app year as base. 
      // We will strictly use currentYear.
      const date = new Date(currentYear, month, day);
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      // Create a temporary UUID-like string for list management
      const tempId = Math.random().toString(36).substring(2, 9);

      // Desconsiderar valores negativos (como descontos por antecipação ou pagamentos)
      if (rawValue >= 0) {
        expenses.push({
          id: tempId,
          date: formattedDate,
          name: description,
          value: rawValue,
          isValid: true
        });
      }
    }

    return expenses;
  }
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    // Join items with a space to allow regex to easily match across the "line"
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};

export const parseBankStatement = async (file: File, currentYear: number, parser: BankStatementParser = new NubankParser()): Promise<ParsedExpense[]> => {
  const text = await extractTextFromPDF(file);
  return parser.parse(text, currentYear);
};
