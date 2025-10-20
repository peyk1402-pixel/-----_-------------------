import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import { processFiles } from '../services/dataService';
import type { BankTransaction, SystemReport } from '../types';

const ICONS = {
  upload: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  save: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V4zm3 1h4v1H8V5zm0 2h4v1H8V7z" /></svg>,
  error: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  trash: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
};

const Spinner: React.FC<{ message?: string }> = ({ message = 'در حال پردازش...' }) => (
    <div className="flex justify-center items-center space-x-2 space-x-reverse" role="status" aria-label="در حال بارگذاری">
        <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-indigo-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        <span className="text-indigo-500 dark:text-indigo-400">{message}</span>
    </div>
);

const FileUploader: React.FC<{ onFileUpload: (file: File) => void; title: string, id: string }> = ({ onFileUpload, title, id }) => {
    const [fileName, setFileName] = useState('');
    return (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center w-full bg-white dark:bg-gray-800/50 hover:border-indigo-500 transition-colors">
            {ICONS.upload}
            <label htmlFor={id} className="mt-4 cursor-pointer text-indigo-600 dark:text-indigo-400 font-semibold block">
                {title}
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">فایل اکسل خود را بکشید و رها کنید یا برای انتخاب کلیک کنید</p>
            <input
                id={id}
                type="file"
                className="hidden"
                accept=".xlsx, .xls"
                onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                        onFileUpload(e.target.files[0]);
                        setFileName(e.target.files[0].name);
                    }
                }}
            />
            {fileName && <p className="text-sm text-green-500 mt-2 font-semibold">{fileName}</p>}
        </div>
    );
};

const UploadPage: React.FC = () => {
    const { setBankData, setSystemData, saveData, clearData } = useAppContext();
    const navigate = useNavigate();
    const [processingStatus, setProcessingStatus] = useState({ loading: false, message: '', error: '' });
    const [saveStatus, setSaveStatus] = useState('');

    const handleFileProcessing = async (file: File, type: 'bank' | 'system') => {
        setProcessingStatus({ loading: true, message: `در حال خواندن فایل ${file.name}...`, error: '' });
        try {
            const newData = await processFiles(file, type);
            if (type === 'bank') {
                setBankData(prevData => [...prevData, ...(newData as BankTransaction[])]);
            } else {
                setSystemData(prevData => [...prevData, ...(newData as SystemReport[])]);
            }
            setProcessingStatus({ loading: false, message: `فایل ${file.name} با موفقیت پردازش و به داده‌های موجود اضافه شد.`, error: '' });
        } catch (err: any) {
            setProcessingStatus({ loading: false, message: '', error: `خطا در پردازش فایل: ${err.message}` });
        }
    };

    const handleSaveAndContinue = async () => {
        try {
            await saveData();
            setSaveStatus('اطلاعات با موفقیت ذخیره شد. در حال انتقال به داشبورد...');
            setTimeout(() => navigate('/'), 2000);
        } catch(e: any) {
            setSaveStatus(`خطا در ذخیره‌سازی: ${e.message}`);
        }
    };

    const handleClearData = async () => {
        if (window.confirm("آیا از پاک کردن تمام داده‌های بارگذاری شده مطمئن هستید؟ این عمل غیرقابل بازگشت است.")) {
            try {
                await clearData();
                setSaveStatus('تمام داده‌ها با موفقیت پاک شدند.');
            } catch (e: any) {
                setSaveStatus(`خطا در پاک کردن داده‌ها: ${e.message}`);
            }
        }
    };

    return (
        <div className="p-6">
             <div className="mb-8">
                <h1 className="text-2xl font-bold">بارگذاری و مدیریت فایل‌ها</h1>
                <p className="text-gray-500">فایل‌های جدید به داده‌های موجود اضافه می‌شوند. برای شروع مجدد، می‌توانید داده‌ها را پاک کنید.</p>
            </div>
            <div className="bg-white dark:bg-gray-800/50 p-8 rounded-xl shadow-md">
                <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto">
                    <FileUploader onFileUpload={(file) => handleFileProcessing(file, 'system')} title="بارگذاری گزارش سیستم" id="system-upload" />
                    <FileUploader onFileUpload={(file) => handleFileProcessing(file, 'bank')} title="بارگذاری گزارش بانک" id="bank-upload" />
                </div>
                
                <div className="mt-8 text-center max-w-3xl mx-auto">
                    {processingStatus.loading && <Spinner message={processingStatus.message} />}
                    {processingStatus.error && (
                        <div className="bg-red-100 dark:bg-red-900/30 border-r-4 border-red-500 text-red-800 dark:text-red-300 p-4 rounded-lg flex items-center justify-center text-right" role="alert">
                            {ICONS.error}
                            <div className="mr-3">
                                <p className="font-bold">خطا در پردازش فایل</p>
                                <p className="text-sm">{processingStatus.error}</p>
                            </div>
                        </div>
                    )}
                    {!processingStatus.loading && processingStatus.message && <p className="text-green-500">{processingStatus.message}</p>}
                </div>

                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-col items-center gap-4">
                    <button 
                        onClick={handleSaveAndContinue} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center gap-2 text-lg"
                    >
                        {ICONS.save}
                        ذخیره و ادامه
                    </button>
                     <button 
                        onClick={handleClearData} 
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                        {ICONS.trash}
                        پاک کردن تمام داده‌ها
                    </button>
                    {saveStatus && <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{saveStatus}</p>}
                </div>
            </div>
        </div>
    );
};

export default UploadPage;
