
import React from 'react';
import { NavLink } from 'react-router-dom';

const ICONS = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    upload: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    search: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    reconcile: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    tasks: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
};

const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
    const navLinkClasses = "flex flex-col items-center justify-center w-full pt-2 pb-1 text-center transition-colors duration-200";
    const activeClasses = "text-indigo-500 dark:text-indigo-400";
    const inactiveClasses = "text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400";

    return (
        <NavLink
            to={to}
            end
            className={({ isActive }) => `${navLinkClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </NavLink>
    );
};


const BottomNavBar: React.FC = () => {
    return (
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 z-40">
            <div className="flex justify-around items-center h-16">
                <NavItem to="/" icon={ICONS.dashboard} label="داشبورد" />
                <NavItem to="/upload" icon={ICONS.upload} label="بارگذاری" />
                <NavItem to="/search" icon={ICONS.search} label="جستجو" />
                <NavItem to="/reconciliation" icon={ICONS.reconcile} label="مغایرت‌گیری" />
                <NavItem to="/tasks" icon={ICONS.tasks} label="وظایف" />
            </div>
        </nav>
    );
};

export default BottomNavBar;
