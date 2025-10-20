import React, { useMemo } from 'react';
import { useAppContext } from '../App';
import { Link } from 'react-router-dom';
import ChartComponent from '../components/ChartComponent';
import type { ChartData } from '../types';
import { reconcileData } from '../services/dataService';

const ICONS = {
  income: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v1m0 10v1m6-1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  expense: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  profit: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>,
  transactions: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
  records: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  average: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
};

interface DiscrepancyChartData {
    name: string;
    unmatchedSystemAmount: number;
    unmatchedBankAmount: number;
}

interface DiscrepancyAvgChartData {
    name: string;
    avgDifference: number;
}

interface AvgUnmatchedChartData {
    name: string;
    avgSystemUnmatched: number;
    avgBankUnmatched: number;
}


const StatCard: React.FC<{ title: string; value: string; unit: string; color: string; icon: React.ReactNode }> = ({ title, value, unit, color, icon }) => {
  const colors: { [key: string]: string } = {
    green: 'from-green-400 to-emerald-500',
    red: 'from-red-400 to-rose-500',
    blue: 'from-blue-400 to-indigo-500',
    yellow: 'from-yellow-400 to-amber-500',
    indigo: 'from-indigo-500 to-purple-600',
    purple: 'from-purple-500 to-violet-600',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white p-5 rounded-xl shadow-lg flex items-center justify-between transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-400/20 border border-transparent hover:border-white/20`}>
      <div>
        <p className="text-sm font-medium opacity-80">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        <p className="text-sm opacity-80">{unit}</p>
      </div>
      <div className="opacity-50">
        {icon}
      </div>
    </div>
  )
};

const Dashboard: React.FC = () => {
    const { bankData, systemData } = useAppContext();

    const chartData = useMemo<ChartData[]>(() => {
        if (!bankData.length) return [];
        const monthlyData: { [key: string]: { income: number, expense: number } } = {};
        bankData.forEach(tx => {
            if (tx['تاریخ'] && typeof tx['تاریخ'] === 'string') {
                const month = tx['تاریخ'].substring(0, 7);
                if (!monthlyData[month]) {
                    monthlyData[month] = { income: 0, expense: 0 };
                }
                monthlyData[month].income += tx['واریز'] || 0;
                monthlyData[month].expense += tx['برداشت'] || 0;
            }
        });
        return Object.entries(monthlyData)
            .map(([month, data]) => ({ name: month, ...data }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [bankData]);
    
    const avgTxChartData = useMemo(() => {
        if (!bankData.length) return [];
        const monthlyData: { [key: string]: { total: number, count: number } } = {};
        bankData.forEach(tx => {
            if (tx['تاریخ'] && typeof tx['تاریخ'] === 'string') {
                const month = tx['تاریخ'].substring(0, 7);
                if (!monthlyData[month]) {
                    monthlyData[month] = { total: 0, count: 0 };
                }
                const amount = (tx['برداشت'] || 0); // Only expenses
                if (amount > 0) {
                    monthlyData[month].total += amount;
                    monthlyData[month].count += 1;
                }
            }
        });
        return Object.entries(monthlyData)
            .map(([month, data]) => ({ 
                name: month, 
                avgAmount: data.count > 0 ? Math.round(data.total / data.count) : 0 
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [bankData]);

    const reconciliationResult = useMemo(() => {
        if (!bankData.length || !systemData.length) return null;
        return reconcileData(systemData, bankData);
    }, [bankData, systemData]);


    const discrepancyChartData = useMemo<DiscrepancyChartData[]>(() => {
        if (!reconciliationResult) return [];
        const { unmatchedSystem, unmatchedBank } = reconciliationResult;
        const monthlyData: { [key: string]: { unmatchedSystemAmount: number, unmatchedBankAmount: number } } = {};

        unmatchedSystem.forEach(item => {
            if (item['تاریخ'] && typeof item['تاریخ'] === 'string') {
                const month = item['تاریخ'].substring(0, 7);
                if (!monthlyData[month]) {
                    monthlyData[month] = { unmatchedSystemAmount: 0, unmatchedBankAmount: 0 };
                }
                monthlyData[month].unmatchedSystemAmount += item['پرداختی'] || 0;
            }
        });
        
        unmatchedBank.forEach(tx => {
            if (tx['تاریخ'] && typeof tx['تاریخ'] === 'string') {
                const month = tx['تاریخ'].substring(0, 7);
                if (!monthlyData[month]) {
                    monthlyData[month] = { unmatchedSystemAmount: 0, unmatchedBankAmount: 0 };
                }
                monthlyData[month].unmatchedBankAmount += tx['مبلغ'] || 0;
            }
        });

        return Object.entries(monthlyData)
            .map(([month, data]) => ({ name: month, ...data }))
            .sort((a, b) => a.name.localeCompare(b.name));

    }, [reconciliationResult]);
    
    const discrepancyAvgChartData = useMemo<DiscrepancyAvgChartData[]>(() => {
        if (!reconciliationResult) return [];
        const { matched } = reconciliationResult;
        const discrepantItems = matched.filter(item => Math.abs(item.system['پرداختی'] - (item.bank['مبلغ'] || 0)) > 1);

        const monthlyAvg: { [key: string]: { totalDiff: number, count: number } } = {};
        
        discrepantItems.forEach(item => {
             if (item.system['تاریخ'] && typeof item.system['تاریخ'] === 'string') {
                const month = item.system['تاریخ'].substring(0, 7);
                if (!monthlyAvg[month]) {
                    monthlyAvg[month] = { totalDiff: 0, count: 0 };
                }
                monthlyAvg[month].totalDiff += Math.abs(item.system['پرداختی'] - (item.bank['مبلغ'] || 0));
                monthlyAvg[month].count++;
             }
        });

        return Object.entries(monthlyAvg)
            .map(([month, data]) => ({ 
                name: month, 
                avgDifference: data.count > 0 ? Math.round(data.totalDiff / data.count) : 0
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

    }, [reconciliationResult]);
    
    const avgUnmatchedChartData = useMemo<AvgUnmatchedChartData[]>(() => {
        if (!reconciliationResult) return [];
        const { unmatchedSystem, unmatchedBank } = reconciliationResult;
        const monthlyData: { [key: string]: { sysTotal: number, sysCount: number, bankTotal: number, bankCount: number } } = {};

        unmatchedSystem.forEach(item => {
            if (item['تاریخ'] && typeof item['تاریخ'] === 'string') {
                const month = item['تاریخ'].substring(0, 7);
                if (!monthlyData[month]) {
                    monthlyData[month] = { sysTotal: 0, sysCount: 0, bankTotal: 0, bankCount: 0 };
                }
                monthlyData[month].sysTotal += item['پرداختی'] || 0;
                monthlyData[month].sysCount++;
            }
        });
        
        unmatchedBank.forEach(tx => {
            if (tx['تاریخ'] && typeof tx['تاریخ'] === 'string') {
                const month = tx['تاریخ'].substring(0, 7);
                if (!monthlyData[month]) {
                    monthlyData[month] = { sysTotal: 0, sysCount: 0, bankTotal: 0, bankCount: 0 };
                }
                monthlyData[month].bankTotal += tx['مبلغ'] || 0;
                monthlyData[month].bankCount++;
            }
        });

        return Object.entries(monthlyData)
            .map(([month, data]) => ({
                name: month,
                avgSystemUnmatched: data.sysCount > 0 ? Math.round(data.sysTotal / data.sysCount) : 0,
                avgBankUnmatched: data.bankCount > 0 ? Math.round(data.bankTotal / data.bankCount) : 0,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

    }, [reconciliationResult]);


    const stats = useMemo(() => {
        const totalIncome = bankData.reduce((acc, tx) => acc + (tx['واریز'] || 0), 0);
        const totalExpense = bankData.reduce((acc, tx) => acc + (tx['برداشت'] || 0), 0);
        const expenseTransactions = bankData.filter(tx => (tx['برداشت'] || 0) > 0);
        
        return {
            totalIncome,
            totalExpense,
            netProfit: totalIncome - totalExpense,
            transactions: bankData.length,
            systemRecords: systemData.length,
            avgTransaction: expenseTransactions.length > 0 ? Math.round(totalExpense / expenseTransactions.length) : 0,
        };
    }, [bankData, systemData]);

    if (bankData.length === 0 || systemData.length === 0) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center h-full">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">به سامانه خوش آمدید</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl">
                    برای شروع تحلیل و مغایرت‌گیری، لطفا ابتدا فایل‌های گزارش سیستم و تراکنش‌های بانکی را بارگذاری کنید.
                </p>
                <Link 
                    to="/upload" 
                    className="mt-8 px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                >
                    رفتن به صفحه بارگذاری فایل
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8">
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-600 dark:text-indigo-400">
                    {ICONS.dashboard}
                </div>
                <div>
                    <h1 className="text-2xl font-bold">داشبورد مدیریتی</h1>
                    <p className="text-gray-500">خلاصه وضعیت مالی و عملیاتی</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <StatCard title="مجموع درآمد" value={stats.totalIncome.toLocaleString('fa-IR')} unit="ریال" color="green" icon={ICONS.income} />
                <StatCard title="مجموع هزینه" value={stats.totalExpense.toLocaleString('fa-IR')} unit="ریال" color="red" icon={ICONS.expense} />
                <StatCard title="سود خالص" value={stats.netProfit.toLocaleString('fa-IR')} unit="ریال" color="blue" icon={ICONS.profit} />
                <StatCard title="تراکنش‌های بانک" value={stats.transactions.toLocaleString('fa-IR')} unit="عدد" color="yellow" icon={ICONS.transactions} />
                <StatCard title="رکوردهای سیستم" value={stats.systemRecords.toLocaleString('fa-IR')} unit="عدد" color="indigo" icon={ICONS.records} />
                <StatCard title="میانگین هزینه" value={stats.avgTransaction.toLocaleString('fa-IR')} unit="ریال" color="purple" icon={ICONS.average} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-md">
                    <h3 className="font-bold text-lg mb-4">نمودار درآمد و هزینه ماهانه</h3>
                    <ChartComponent data={chartData} />
                </div>
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-md">
                    <h3 className="font-bold text-lg mb-4">نمودار میانگین مبلغ هزینه ماهانه</h3>
                     <ChartComponent 
                        data={avgTxChartData} 
                        bars={[
                            { key: 'avgAmount', name: 'میانگین هزینه', color: '#8b5cf6' }
                        ]}
                    />
                </div>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {discrepancyChartData.length > 0 && (
                     <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-md">
                        <h3 className="font-bold text-lg mb-4">نمودار مبالغ تطبیق نیافته ماهانه</h3>
                        <ChartComponent 
                            data={discrepancyChartData} 
                            bars={[
                                { key: 'unmatchedSystemAmount', name: 'سیستم (عدم تطبیق)', color: '#f97316' },
                                { key: 'unmatchedBankAmount', name: 'بانک (عدم تطبیق)', color: '#f59e0b' }
                            ]}
                        />
                    </div>
                )}
                 {discrepancyAvgChartData.length > 0 && (
                     <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-md">
                        <h3 className="font-bold text-lg mb-4">نمودار میانگین اختلاف مبالغ تطبیق یافته</h3>
                        <ChartComponent 
                            data={discrepancyAvgChartData} 
                            bars={[
                                { key: 'avgDifference', name: 'میانگین اختلاف', color: '#ef4444' }
                            ]}
                        />
                    </div>
                )}
            </div>
             <div className="grid grid-cols-1 gap-8 mt-8">
                 {avgUnmatchedChartData.length > 0 && (
                     <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-md">
                        <h3 className="font-bold text-lg mb-4">نمودار میانگین مبالغ تطبیق نیافته ماهانه</h3>
                        <ChartComponent 
                            data={avgUnmatchedChartData} 
                            bars={[
                                { key: 'avgSystemUnmatched', name: 'میانگین سیستم (عدم تطبیق)', color: '#a855f7' },
                                { key: 'avgBankUnmatched', name: 'میانگین بانک (عدم تطبیق)', color: '#ec4899' }
                            ]}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;