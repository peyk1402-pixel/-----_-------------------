
import React, { useState, createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import SearchPage from './pages/SearchPage';
import ReconciliationPage from './pages/ReconciliationPage';
import TasksPage from './pages/TasksPage'; // Import the new TasksPage

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNavBar from './components/BottomNavBar';

import type { BankTransaction, SystemReport } from './types';
import { dbService } from './services/dbService';

type Theme = 'light' | 'dark';

interface AppContextType {
  isAuthenticated: boolean;
  login: (cb?: () => void) => void;
  logout: () => void;
  bankData: BankTransaction[];
  setBankData: (data: BankTransaction[] | ((prevData: BankTransaction[]) => BankTransaction[])) => void;
  systemData: SystemReport[];
  setSystemData: (data: SystemReport[] | ((prevData: SystemReport[]) => SystemReport[])) => void;
  saveData: () => Promise<void>;
  clearData: () => Promise<void>;
  theme: Theme;
  toggleTheme: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}


const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const AppLayout: React.FC = () => {
    const { isSidebarCollapsed } = useAppContext();
    
    return (
        <div className="bg-gray-100 dark:bg-slate-900">
            <Sidebar />
            <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'md:mr-20' : 'md:mr-64'}`}>
                <div className="flex flex-col h-screen">
                    <Header />
                    <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
                        <Outlet />
                    </main>
                </div>
            </div>
            <BottomNavBar />
        </div>
    );
};


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bankData, setBankData] = useState<BankTransaction[]>([]);
  const [systemData, setSystemData] = useState<SystemReport[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme || 'dark'; // Default to dark theme
  });
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [loadedBankData, loadedSystemData] = await Promise.all([
          dbService.loadBankData(),
          dbService.loadSystemData(),
        ]);
        setBankData(loadedBankData);
        setSystemData(loadedSystemData);
      } catch (error) {
        console.error("Failed to load data from IndexedDB", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const login = (cb?: () => void) => {
    setIsAuthenticated(true);
    if (cb) cb();
  };

  const logout = () => {
    setIsAuthenticated(false);
  };
  
  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

  const saveData = useCallback(async () => {
      try {
          await dbService.saveBankData(bankData);
          await dbService.saveSystemData(systemData);
          console.log("Data backed up automatically to IndexedDB.");
      } catch (error) {
          console.error("Failed to save data to IndexedDB", error);
          throw new Error('Failed to save data');
      }
  }, [bankData, systemData]);
  
  const clearData = useCallback(async () => {
    try {
        setBankData([]);
        setSystemData([]);
        await dbService.saveBankData([]);
        await dbService.saveSystemData([]);
        console.log("Data cleared from IndexedDB.");
    } catch (error) {
        console.error("Failed to clear data in IndexedDB", error);
        throw new Error('Failed to clear data');
    }
  }, []);

  // Automatic backup effect
  useEffect(() => {
    const backupInterval = setInterval(() => {
      saveData().catch(err => console.error("Automatic backup failed:", err));
    }, 60000); // Backup every 60 seconds

    return () => {
      clearInterval(backupInterval);
    };
  }, [saveData]);

  const contextValue = useMemo(() => ({
    isAuthenticated,
    login,
    logout,
    bankData,
    setBankData,
    systemData,
    setSystemData,
    saveData,
    clearData,
    theme,
    toggleTheme,
    isSidebarCollapsed,
    toggleSidebar,
  }), [isAuthenticated, bankData, systemData, saveData, clearData, theme, isSidebarCollapsed]);
  
  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="mr-4 text-xl font-semibold">در حال بارگذاری داده‌ها...</p>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="text-gray-800 dark:text-gray-200 min-h-screen">
        <HashRouter>
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
            
            <Route path="/" element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" />}>
              <Route index element={<Dashboard />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="reconciliation" element={<ReconciliationPage />} />
              <Route path="tasks" element={<TasksPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </HashRouter>
      </div>
    </AppContext.Provider>
  );
};

export default App;
