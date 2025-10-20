import type { BankTransaction, SystemReport, ReconciliationResult } from '../types';

// Assuming xlsx, jsPDF, and autoTable are available on the window object from the CDN
declare const XLSX: any;
declare const jspdf: any;

// Helper to extract the 6-digit bill of lading number or expense number from bank description
export const extractBillNumber = (description: string): string | null => {
    if (typeof description !== 'string' || !description) {
        return null;
    }
    // Regex for bill number (بارنامه) or expense voucher (تنخواه)
    const match = description.match(/(?:بارنامه|تنخواه|بابت|ش\s*ب\s*:?|سند)\s*(\d{6,})/);
    if (match && match[1]) {
        return match[1].slice(-6);
    }
    // Fallback for just a 6-digit number
    const sixDigitMatch = description.match(/\b\d{6}\b/);
    return sixDigitMatch ? sixDigitMatch[0] : null;
};


const MAPPING_SCHEMAS = {
  bank: {
    'حساب مبدا': ['حساب مبدا'],
    'نام صاحب حساب مبدا': ['نام صاحب حساب مبدا'],
    'حساب/شبا مقصد': ['حساب/شبا مقصد', 'حساب مقصد', 'شبا مقصد'],
    'نام صاحب حساب مقصد': ['نام صاحب حساب مقصد', 'نام گیرنده'],
    'تاریخ': ['تاریخ', 'date', 'تاریخ تراکنش'],
    'مبلغ': ['مبلغ', 'amount'],
    'برداشت': ['برداشت', 'debit', 'مبلغ برداشت'],
    'واریز': ['واریز', 'credit', 'مبلغ واریز'],
    'شماره تنخواه': ['شماره تنخواه'],
    'شرح / بابت': ['شرح / بابت', 'شرح', 'description', 'شرح عمليات', 'شرح تراکنش'],
    'شماره پیگیری': ['شماره پیگیری'],
    'موجودی': ['موجودی', 'balance', 'مانده', 'موجودي نهايي'],
  },
  system: {
    'تاریخ': ['تاریخ', 'date'],
    'شماره بارنامه': ['شماره بارنامه', 'bill number'],
    'شماره انتظامی': ['شماره انتظامی', 'پلاک'],
    'وضعیت': ['وضعیت', 'status'],
    'طرف قرارداد': ['طرف قرارداد', 'contractor'],
    'راننده': ['راننده', 'driver'],
    'شهر مقصد': ['شهر مقصد'],
    'شهر مبدا': ['شهر مبدا'],
    'مقصد': ['مقصد', 'destination'],
    'مبدا': ['مبدا', 'origin'],
    'پیش حمل': ['پیش حمل'],
    'پس حمل': ['پس حمل'],
    'کرایه حمل': ['کرایه حمل', 'کرایه'],
    'پرداختی': ['پرداختی', 'paid'],
    'مانده کرایه': ['مانده کرایه', 'balance'],
    'نوع ماشین': ['نوع ماشین'],
  }
};

function createHeaderMap(headerRow: string[], schema: Record<string, string[]>): Record<string, string> {
  const headerMap: Record<string, string> = {};
  const normalizedHeaderRow = headerRow.map(h => String(h || '').toLowerCase().trim().replace(/\s+/g, ' '));

  for (const standardKey in schema) {
    for (const possibleName of schema[standardKey]) {
      const normalizedPossibleName = possibleName.toLowerCase().trim().replace(/\s+/g, ' ');
      const index = normalizedHeaderRow.indexOf(normalizedPossibleName);
      if (index !== -1) {
        headerMap[headerRow[index]] = standardKey;
        break; 
      }
    }
  }
  return headerMap;
}

export const processFiles = (file: File, type: 'bank' | 'system'): Promise<(BankTransaction | SystemReport)[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                if (!sheetName) throw new Error("فایل اکسل خالی است یا شیت معتبری ندارد.");

                const worksheet = workbook.Sheets[sheetName];
                
                const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                if (rawData.length < 2) {
                    throw new Error("فایل اکسل داده‌ای برای پردازش ندارد.");
                }

                const headers: string[] = rawData[0].map(h => String(h || ''));
                const schema = MAPPING_SCHEMAS[type];
                const headerMap = createHeaderMap(headers, schema);

                if (Object.keys(headerMap).length === 0) {
                  throw new Error("هیچ یک از ستون‌های مورد انتظار (مانند تاریخ، مبلغ) در فایل یافت نشد.");
                }

                const json: any[] = XLSX.utils.sheet_to_json(worksheet);

                const mappedData = json.map(row => {
                  const newRow: { [key: string]: any } = {};
                  for (const originalKey in row) {
                    if (headerMap[originalKey]) {
                      const newKey = headerMap[originalKey];
                      let value = row[originalKey];
                      
                      const numericKeys = ['مبلغ', 'برداشت', 'واریز', 'موجودی', 'پیش حمل', 'پس حمل', 'کرایه حمل', 'پرداختی', 'مانده کرایه'];
                      if (numericKeys.includes(newKey)) {
                        value = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) || 0 : Number(value) || 0;
                      }
                      if (newKey === 'تاریخ' && value instanceof Date) {
                         const year = value.getFullYear();
                         const month = String(value.getMonth() + 1).padStart(2, '0');
                         const day = String(value.getDate()).padStart(2, '0');
                         value = `${year}/${month}/${day}`;
                      }

                      newRow[newKey] = value;
                    }
                  }
                  
                  if (type === 'bank') {
                    if (newRow['مبلغ'] && !newRow['برداشت']) {
                      newRow['برداشت'] = newRow['مبلغ'];
                    }
                    if(!newRow['واریز']) newRow['واریز'] = 0;
                  }
                  
                  return newRow;
                });

                const finalData = mappedData.filter(row => Object.keys(row).length > 0 && row['تاریخ']);
                if (finalData.length === 0) throw new Error("هیچ ردیف داده معتبری با تاریخ در فایل یافت نشد.");

                resolve(finalData as any[]);
            } catch (err) {
                console.error("File processing error:", err);
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsBinaryString(file);
    });
};

export const reconcileData = (systemData: SystemReport[], bankData: BankTransaction[]): ReconciliationResult => {
    const systemMap = new Map<string, SystemReport[]>();
    systemData.forEach(item => {
        const billNo = String(item['شماره بارنامه']).slice(-6);
        if (billNo) {
            if (!systemMap.has(billNo)) systemMap.set(billNo, []);
            systemMap.get(billNo)!.push(item);
        }
    });

    const matched: { system: SystemReport, bank: BankTransaction }[] = [];
    const matchedBankTransactions = new Set<BankTransaction>();

    bankData.forEach(bankTx => {
        const billNo = extractBillNumber(bankTx['شرح / بابت']);
        if (billNo && systemMap.has(billNo)) {
            const potentialMatches = systemMap.get(billNo)!;
            const bankDate = new Date(String(bankTx['تاریخ']).replace(/\//g, '-'));

            let bestMatchIndex = -1;
            let smallestDateDiff = Infinity;

            potentialMatches.forEach((systemItem, index) => {
                const amountDiff = Math.abs(systemItem['پرداختی'] - (bankTx['مبلغ'] || 0));
                
                if (amountDiff < 1) { // Match amount first
                    const systemDate = new Date(String(systemItem['تاریخ']).replace(/\//g, '-'));
                    const dateDiff = Math.abs(bankDate.getTime() - systemDate.getTime());
                    if (dateDiff < smallestDateDiff) {
                        smallestDateDiff = dateDiff;
                        bestMatchIndex = index;
                    }
                }
            });

            if (bestMatchIndex !== -1) {
                const daysDiff = smallestDateDiff / (1000 * 3600 * 24);
                if (daysDiff <= 15) { // Loosen date window slightly
                    const matchedSystemItem = potentialMatches[bestMatchIndex];
                    matched.push({ system: matchedSystemItem, bank: bankTx });
                    matchedBankTransactions.add(bankTx);
                    potentialMatches.splice(bestMatchIndex, 1);
                    if (potentialMatches.length === 0) systemMap.delete(billNo);
                }
            }
        }
    });

    const unmatchedBank = bankData.filter(bankTx => !matchedBankTransactions.has(bankTx) && bankTx['مبلغ'] > 0);
    const unmatchedSystem = Array.from(systemMap.values()).flat();

    return { matched, unmatchedSystem, unmatchedBank };
};

export const exportToExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (data: any[], headers: string[], title: string) => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/vazir-font/30.1.0/Vazir-Regular.ttf', 'Vazir', 'normal');
    doc.setFont('Vazir');
    
    const reversedHeaders = [...headers].reverse();
    const body = data.map(row => reversedHeaders.map(header => row[header] !== undefined && row[header] !== null ? String(row[header]) : ''));

    doc.autoTable({
        head: [reversedHeaders],
        body: body,
        styles: {
            font: 'Vazir',
            halign: 'right'
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
        },
        didDrawPage: (data: any) => {
            doc.text(`گزارش: ${title}`, doc.internal.pageSize.getWidth() - data.settings.margin.right, 15, { align: 'right' });
        }
    });

    doc.save(`${title}.pdf`);
};
