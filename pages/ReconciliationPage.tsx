import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppContext } from '../App';
import { reconcileData, exportToExcel } from '../services/dataService';
import type { ReconciliationResult, SystemReport, BankTransaction } from '../types';

// Declare jspdf for CDN usage
declare const jspdf: any;

const ICONS = {
    reconcile: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    pdf: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    excel: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" /></svg>,
    matched: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    unmatchedSystem: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    unmatchedBank: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    warning: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block ml-2 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    sortAsc: <svg className="w-4 h-4 ml-1" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd"></path></svg>,
    sortDesc: <svg className="w-4 h-4 ml-1" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>,
};

const Spinner: React.FC = () => (
    <div className="flex justify-center items-center h-full p-8" role="status" aria-label="در حال بارگذاری">
        <svg aria-hidden="true" className="w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-indigo-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
        <span className="sr-only">در حال بارگذاری...</span>
    </div>
);

const StatCard: React.FC<{ title: string; value: number; color: string; icon: React.ReactNode }> = ({ title, value, color, icon }) => {
  const colors: { [key: string]: string } = {
    green: 'from-green-400 to-emerald-500',
    red: 'from-red-500 to-rose-600',
    orange: 'from-orange-500 to-amber-600',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white p-5 rounded-xl shadow-lg flex items-center justify-between transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-transparent hover:border-white/20`}>
      <div>
        <p className="text-sm font-medium opacity-80">{title}</p>
        <p className="text-3xl font-bold mt-1">{value.toLocaleString('fa-IR')}</p>
      </div>
      <div className="opacity-50">{icon}</div>
    </div>
  );
};

type Column = { key: string; label: string; };
type SortConfig = { key: string; direction: 'ascending' | 'descending' };

interface DataTableProps {
  title: string;
  data: any[];
  columns: Column[];
  tableKey: string;
  sortConfig: SortConfig;
  onSort: (table: string, column: string) => void;
  rowStyle?: string;
}

const DataTable: React.FC<DataTableProps> = ({ title, data, columns, tableKey, sortConfig, onSort, rowStyle }) => {
    if (data.length === 0) return null;
    
    const SortIndicator: React.FC<{ direction: 'ascending' | 'descending' | null }> = ({ direction }) => {
        if (!direction) return null;
        return direction === 'ascending' ? ICONS.sortAsc : ICONS.sortDesc;
    };
    
    return (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-md transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">{title} ({data.length.toLocaleString('fa-IR')})</h3>
            </div>
            <div className="overflow-x-auto max-h-[450px]">
                <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                        <tr>{columns.map(col => (
                            <th key={col.key} className="px-2 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200" onClick={() => onSort(tableKey, col.key)}>
                                <div className="flex items-center justify-end">
                                    {col.label}
                                    {sortConfig.key === col.key && <SortIndicator direction={sortConfig.direction} />}
                                </div>
                            </th>
                        ))}</tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index} className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 ${rowStyle || ''}`}>
                                {columns.map((col, colIndex) => (
                                    <td key={col.key} className="px-2 py-2 whitespace-nowrap">
                                        {colIndex === 0 && (rowStyle?.includes('red') || rowStyle?.includes('orange')) && ICONS.warning}
                                        {row[col.key]?.toLocaleString('fa-IR') || '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const matchedColumns: Column[] = [ { key: 'system.تاریخ', label: 'تاریخ سیستم' }, { key: 'system.شماره بارنامه', label: 'بارنامه' }, { key: 'system.راننده', label: 'راننده' }, { key: 'system.پرداختی', label: 'مبلغ تطبیق یافته' }, { key: 'difference', label: 'اختلاف' }, { key: 'bank.تاریخ', label: 'تاریخ بانک' }, { key: 'bank.شرح / بابت', label: 'شرح بانک' }, ];
const unmatchedSystemColumns: Column[] = [ { key: 'تاریخ', label: 'تاریخ' }, { key: 'شماره بارنامه', label: 'شماره بارنامه' }, { key: 'راننده', label: 'راننده' }, { key: 'پرداختی', label: 'مبلغ پرداختی' }, { key: 'وضعیت', label: 'وضعیت' }, { key: 'شهر مقصد', label: 'شهر مقصد' }, ];
const unmatchedBankColumns: Column[] = [ { key: 'تاریخ', label: 'تاریخ' }, { key: 'مبلغ', label: 'مبلغ' }, { key: 'شرح / بابت', label: 'شرح' }, { key: 'نام صاحب حساب مقصد', label: 'گیرنده' }, { key: 'شماره پیگیری', label: 'شماره پیگیری' }, ];

const ColumnSelector: React.FC<{ title: string; allColumns: Column[]; selected: string[]; onChange: (key: string, selected: boolean) => void; onSelectAll: () => void; onDeselectAll: () => void; }> = ({ title, allColumns, selected, onChange, onSelectAll, onDeselectAll }) => (
    <div>
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">{title}</h4>
            <div className="flex gap-3">
                <button onClick={onSelectAll} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">انتخاب همه</button>
                <button onClick={onDeselectAll} className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:underline">لغو انتخاب همه</button>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {allColumns.map(col => (
                <label key={col.key} className="flex items-center space-x-2 space-x-reverse bg-gray-100 dark:bg-gray-700/50 p-2 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                    <input
                        type="checkbox"
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                        checked={selected.includes(col.key)}
                        onChange={(e) => onChange(col.key, e.target.checked)}
                    />
                    <span>{col.label}</span>
                </label>
            ))}
        </div>
    </div>
);


const ReconciliationPage: React.FC = () => {
    const { systemData, bankData } = useAppContext();
    const [result, setResult] = useState<ReconciliationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reportStartDate, setReportStartDate] = useState('');
    const [reportEndDate, setReportEndDate] = useState('');
    
    const [sortConfigs, setSortConfigs] = useState<{ [key: string]: SortConfig }>(() => {
        try {
            const saved = localStorage.getItem('reconciliationSortConfigs');
            return saved ? JSON.parse(saved) : {
                matched: { key: 'system.تاریخ', direction: 'descending' },
                unmatchedSystem: { key: 'تاریخ', direction: 'descending' },
                unmatchedBank: { key: 'تاریخ', direction: 'descending' },
            };
        } catch {
            return {
                matched: { key: 'system.تاریخ', direction: 'descending' },
                unmatchedSystem: { key: 'تاریخ', direction: 'descending' },
                unmatchedBank: { key: 'تاریخ', direction: 'descending' },
            };
        }
    });

    const [selectedColumns, setSelectedColumns] = useState({
        matched: matchedColumns.map(c => c.key),
        unmatchedSystem: unmatchedSystemColumns.map(c => c.key),
        unmatchedBank: unmatchedBankColumns.map(c => c.key),
    });

    useEffect(() => {
        localStorage.setItem('reconciliationSortConfigs', JSON.stringify(sortConfigs));
    }, [sortConfigs]);


    const handleReconcile = () => {
        if (systemData.length === 0 || bankData.length === 0) { alert("لطفا ابتدا هر دو فایل گزارش سیستم و بانک را بارگذاری کنید."); return; }
        setIsLoading(true);
        setTimeout(() => {
            try {
                setResult(reconcileData(systemData, bankData));
            } catch (error) { console.error("Reconciliation failed:", error); alert("فرایند مغایرت‌گیری با خطا مواجه شد."); } 
            finally { setIsLoading(false); }
        }, 100);
    };

    const handleSort = useCallback((tableKey: string, sortKey: string) => {
        setSortConfigs(prevConfigs => {
            const currentConfig = prevConfigs[tableKey];
            const newDirection = currentConfig?.key === sortKey && currentConfig.direction === 'ascending' ? 'descending' : 'ascending';
            return { ...prevConfigs, [tableKey]: { key: sortKey, direction: newDirection } };
        });
    }, []);

    const flattenedMatchedData = useMemo(() => result?.matched.map(item => ({ 'system.تاریخ': item.system['تاریخ'], 'system.شماره بارنامه': item.system['شماره بارنامه'], 'system.راننده': item.system['راننده'], 'system.پرداختی': item.system['پرداختی'], 'bank.تاریخ': item.bank['تاریخ'], 'bank.شرح / بابت': item.bank['شرح / بابت'], 'difference': Math.abs(item.system['پرداختی'] - (item.bank['مبلغ'] || 0)), })) || [], [result]);

    const getNestedValue = (obj: any, path: string) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

    const applySort = useCallback((data: any[], sortConfig: SortConfig) => {
        if (!sortConfig.key) return data;
        
        const sortedData = [...data];
        sortedData.sort((a, b) => {
            const aValue = getNestedValue(a, sortConfig.key);
            const bValue = getNestedValue(b, sortConfig.key);

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;
            
            if (sortConfig.key.toLowerCase().includes('تاریخ')) {
                 const dateA = new Date(String(aValue).replace(/\//g, '-')).getTime();
                 const dateB = new Date(String(bValue).replace(/\//g, '-')).getTime();
                 if (!isNaN(dateA) && !isNaN(dateB)) {
                    return (dateA - dateB) * (sortConfig.direction === 'ascending' ? 1 : -1);
                 }
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return (aValue - bValue) * (sortConfig.direction === 'ascending' ? 1 : -1);
            }

            return String(aValue).localeCompare(String(bValue), 'fa') * (sortConfig.direction === 'ascending' ? 1 : -1);
        });
        
        return sortedData;

    }, []);
    
    const handleColumnSelectionChange = (table: keyof typeof selectedColumns, columnKey: string, isSelected: boolean) => {
        setSelectedColumns(prev => {
            const newSelection = new Set(prev[table]);
            if (isSelected) {
                newSelection.add(columnKey);
            } else {
                newSelection.delete(columnKey);
            }
            return { ...prev, [table]: Array.from(newSelection) };
        });
    };
    
    const handleSelectAllColumns = (table: keyof typeof selectedColumns) => {
        const allKeys = table === 'matched' ? matchedColumns.map(c => c.key)
                      : table === 'unmatchedSystem' ? unmatchedSystemColumns.map(c => c.key)
                      : unmatchedBankColumns.map(c => c.key);
        setSelectedColumns(prev => ({ ...prev, [table]: allKeys }));
    };

    const handleDeselectAllColumns = (table: keyof typeof selectedColumns) => {
        setSelectedColumns(prev => ({ ...prev, [table]: [] }));
    };


    const processedMatchedData = useMemo(() => applySort(flattenedMatchedData, sortConfigs.matched), [flattenedMatchedData, sortConfigs.matched, applySort]);
    const processedUnmatchedSystem = useMemo(() => applySort(result?.unmatchedSystem || [], sortConfigs.unmatchedSystem), [result?.unmatchedSystem, sortConfigs.unmatchedSystem, applySort]);
    const processedUnmatchedBank = useMemo(() => applySort(result?.unmatchedBank || [], sortConfigs.unmatchedBank), [result?.unmatchedBank, sortConfigs.unmatchedBank, applySort]);

    const handleGeneratePdfReport = () => {
        if (!result || !reportStartDate || !reportEndDate) { alert("لطفا تاریخ شروع و پایان را انتخاب کنید."); return; }
        const startDate = new Date(reportStartDate); const endDate = new Date(reportEndDate);
        const filterByDate = (data: any[], dateKey: string) => data.filter(item => {
            const itemDateValue = getNestedValue(item, dateKey);
            if (!itemDateValue) return false;
            const itemDate = new Date(String(itemDateValue).replace(/\//g, '-'));
            return itemDate >= startDate && itemDate <= endDate;
        });

        const filteredMatched = filterByDate(flattenedMatchedData, 'system.تاریخ');
        const filteredUnmatchedSystem = filterByDate(result.unmatchedSystem, 'تاریخ');
        const filteredUnmatchedBank = filterByDate(result.unmatchedBank, 'تاریخ');
        
        const summary = {
            matchedCount: filteredMatched.length, matchedAmount: filteredMatched.reduce((sum, item) => sum + getNestedValue(item, 'system.پرداختی'), 0),
            unmatchedSystemCount: filteredUnmatchedSystem.length, unmatchedSystemAmount: filteredUnmatchedSystem.reduce((sum, item) => sum + item['پرداختی'], 0),
            unmatchedBankCount: filteredUnmatchedBank.length, unmatchedBankAmount: filteredUnmatchedBank.reduce((sum, item) => sum + (item['مبلغ'] || 0), 0),
        };

        const { jsPDF } = jspdf;
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/vazir-font/30.1.0/Vazir-Regular.ttf', 'Vazir', 'normal');
        doc.setFont('Vazir');
        
        doc.setFontSize(22); doc.setTextColor(26, 32, 44);
        doc.text('گزارش مغایرت‌گیری جامع', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        doc.setFontSize(12); doc.setTextColor(100);
        doc.text(`بازه زمانی: از ${reportStartDate} تا ${reportEndDate}`, doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });
        
        let currentY = 40;
        doc.setFontSize(14);
        doc.text('خلاصه گزارش آماری', doc.internal.pageSize.getWidth() - 15, currentY, { align: 'right' });
        currentY += 8;

        const summaryBody = [['موارد تطبیق یافته', summary.matchedCount, summary.matchedAmount],['سیستم (عدم تطبیق)', summary.unmatchedSystemCount, summary.unmatchedSystemAmount],['بانک (عدم تطبیق)', summary.unmatchedBankCount, summary.unmatchedBankAmount]];
        doc.autoTable({
            startY: currentY,
            head: [['دسته', 'تعداد', 'مجموع مبلغ (ریال)'].reverse()],
            body: summaryBody.map(row => row.map(cell => cell.toLocaleString('fa-IR')).reverse()),
            theme: 'grid', styles: { font: 'Vazir', halign: 'right', cellPadding: 3, fontSize: 11 },
            headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold', halign: 'center', textColor: 255 },
            didParseCell: (data: any) => { if (data.section === 'body' && data.column.index === 2) { data.cell.styles.fontStyle = 'bold'; data.cell.styles.textColor = [26, 32, 44]; } if (data.section === 'body' && (data.column.index === 0 || data.column.index === 1)) { data.cell.styles.halign = 'center'; } }
        });
        currentY = doc.autoTable.previous.finalY + 15;
        const tableConfig = { styles: { font: 'Vazir', halign: 'right' }, headStyles: { fillColor: [30, 41, 59] }, alternateRowStyles: { fillColor: [248, 250, 252] } };
        
        if (filteredMatched.length > 0 && selectedColumns.matched.length > 0) {
            const activeCols = matchedColumns.filter(c => selectedColumns.matched.includes(c.key));
            doc.text('موارد تطبیق یافته', doc.internal.pageSize.getWidth() - 15, currentY, { align: 'right' }); currentY += 5;
            doc.autoTable({ startY: currentY, head: [activeCols.map(c => c.label).reverse()], body: filteredMatched.map(row => activeCols.map(c => getNestedValue(row, c.key)?.toLocaleString('fa-IR') || '-').reverse()), ...tableConfig });
            currentY = doc.autoTable.previous.finalY + 15;
        }
        if (filteredUnmatchedSystem.length > 0 && selectedColumns.unmatchedSystem.length > 0) {
            const activeCols = unmatchedSystemColumns.filter(c => selectedColumns.unmatchedSystem.includes(c.key));
            doc.text('گزارش سیستم (عدم تطبیق)', doc.internal.pageSize.getWidth() - 15, currentY, { align: 'right' }); currentY += 5;
            doc.autoTable({ startY: currentY, head: [activeCols.map(c => c.label).reverse()], body: filteredUnmatchedSystem.map(row => activeCols.map(c => row[c.key as keyof typeof row]?.toLocaleString('fa-IR') || '-').reverse()), ...tableConfig });
            currentY = doc.autoTable.previous.finalY + 15;
        }
        if (filteredUnmatchedBank.length > 0 && selectedColumns.unmatchedBank.length > 0) {
             const activeCols = unmatchedBankColumns.filter(c => selectedColumns.unmatchedBank.includes(c.key));
            doc.text('گزارش بانک (عدم تطبیق)', doc.internal.pageSize.getWidth() - 15, currentY, { align: 'right' }); currentY += 5;
            doc.autoTable({ startY: currentY, head: [activeCols.map(c => c.label).reverse()], body: filteredUnmatchedBank.map(row => activeCols.map(c => row[c.key as keyof typeof row]?.toLocaleString('fa-IR') || '-').reverse()), ...tableConfig });
        }

        doc.save(`گزارش_مغایرت_${reportStartDate}_تا_${reportEndDate}.pdf`);
        setIsModalOpen(false);
    };

    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div><h1 className="text-2xl font-bold">مغایرت‌گیری اتوماتیک</h1><p className="text-gray-500">مقایسه گزارش سیستم با تراکنش‌های بانکی</p></div>
                <div className="flex gap-4">
                     <button onClick={() => setIsModalOpen(true)} disabled={!result} className="action-button bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transform transition-transform hover:-translate-y-0.5">{ICONS.pdf} تولید گزارش</button>
                     <button onClick={handleReconcile} disabled={isLoading} className="action-button bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-wait transform transition-transform hover:-translate-y-0.5">{ICONS.reconcile} {isLoading ? 'در حال پردازش...' : 'شروع مغایرت‌گیری'}</button>
                </div>
            </div>
            
            {isLoading && <Spinner />}

            {!isLoading && result && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <StatCard title="موارد تطبیق یافته" value={result.matched.length} color="green" icon={ICONS.matched} />
                         <StatCard title="سیستم (عدم تطبیق)" value={result.unmatchedSystem.length} color="red" icon={ICONS.unmatchedSystem} />
                         <StatCard title="بانک (عدم تطبیق)" value={result.unmatchedBank.length} color="orange" icon={ICONS.unmatchedBank} />
                    </div>
                    <div className="space-y-8">
                        <DataTable title="موارد تطبیق یافته" data={processedMatchedData} columns={matchedColumns} tableKey="matched" sortConfig={sortConfigs.matched} onSort={handleSort} />
                        <DataTable title="گزارش سیستم (عدم تطبیق)" data={processedUnmatchedSystem} columns={unmatchedSystemColumns} tableKey="unmatchedSystem" sortConfig={sortConfigs.unmatchedSystem} onSort={handleSort} rowStyle="bg-red-200/50 dark:bg-red-900/40 text-red-900 dark:text-red-200" />
                        <DataTable title="گزارش بانک (عدم تطبیق)" data={processedUnmatchedBank} columns={unmatchedBankColumns} tableKey="unmatchedBank" sortConfig={sortConfigs.unmatchedBank} onSort={handleSort} rowStyle="bg-orange-200/50 dark:bg-orange-900/40 text-orange-900 dark:text-orange-200" />
                    </div>
                </>
            )}

            {!isLoading && !result && (
                <div className="text-center py-16 text-gray-500 bg-white dark:bg-gray-800/50 rounded-xl"><p>برای مشاهده نتایج، روی دکمه "شروع مغایرت‌گیری" کلیک کنید.</p><p className="text-sm mt-2">اطمینان حاصل کنید که هر دو فایل مورد نیاز در صفحه بارگذاری، آپلود شده باشند.</p></div>
            )}
             {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in">
                    <div className="bg-white/80 dark:bg-gray-800/80 border border-white/20 p-8 rounded-2xl shadow-xl w-full max-w-2xl transform transition-all duration-300 scale-95 animate-fade-in-up">
                        <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">تنظیمات گزارش PDF</h3>
                         <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div>
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 border-b pb-2">بازه زمانی</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1" htmlFor="reportStartDate">تاریخ شروع</label><input id="reportStartDate" type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} className="filter-input w-full" /></div>
                                    <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1" htmlFor="reportEndDate">تاریخ پایان</label><input id="reportEndDate" type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} className="filter-input w-full" /></div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 border-b pb-2">انتخاب ستون‌ها</h4>
                                <div className="space-y-4 pt-2">
                                    <ColumnSelector title="جدول موارد تطبیق یافته" allColumns={matchedColumns} selected={selectedColumns.matched} onChange={(key, isSelected) => handleColumnSelectionChange('matched', key, isSelected)} onSelectAll={() => handleSelectAllColumns('matched')} onDeselectAll={() => handleDeselectAllColumns('matched')} />
                                    <ColumnSelector title="جدول سیستم (عدم تطبیق)" allColumns={unmatchedSystemColumns} selected={selectedColumns.unmatchedSystem} onChange={(key, isSelected) => handleColumnSelectionChange('unmatchedSystem', key, isSelected)} onSelectAll={() => handleSelectAllColumns('unmatchedSystem')} onDeselectAll={() => handleDeselectAllColumns('unmatchedSystem')} />
                                    <ColumnSelector title="جدول بانک (عدم تطبیق)" allColumns={unmatchedBankColumns} selected={selectedColumns.unmatchedBank} onChange={(key, isSelected) => handleColumnSelectionChange('unmatchedBank', key, isSelected)} onSelectAll={() => handleSelectAllColumns('unmatchedBank')} onDeselectAll={() => handleDeselectAllColumns('unmatchedBank')} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-4">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">لغو</button>
                            <button onClick={handleGeneratePdfReport} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">تولید PDF</button>
                        </div>
                    </div>
                </div>
            )}
             <style>{`.action-button { display: inline-flex; align-items: center; padding: 0.75rem 1.5rem; font-weight: 600; border-radius: 0.5rem; transition: all 0.2s; } .export-button { display: inline-flex; align-items: center; padding: 0.5rem 1rem; color: white; font-weight: 600; border-radius: 0.5rem; } .filter-input { width: 100%; border-radius: 0.375rem; border: 1px solid #d1d5db; background-color: #f9fafb; padding: 0.5rem 0.75rem; font-size: 0.875rem; } .dark .filter-input { background-color: #374151; border-color: #4b5563; color: #e5e7eb; } @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } } .animate-fade-in { animation: fade-in 0.3s ease-out forwards; } @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; } .custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #a0aec0; border-radius: 10px; } .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #475569; }`}</style>
        </div>
    );
};

export default ReconciliationPage;