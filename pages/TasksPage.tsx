
import React, { useState, useEffect } from 'react';
import type { Task } from '../types';

const ICONS = {
    add: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>,
    trash: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
};

const TasksPage: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        try {
            const storedTasks = localStorage.getItem('tasks');
            if (storedTasks) {
                setTasks(JSON.parse(storedTasks));
            }
        } catch (error) {
            console.error("Failed to parse tasks from localStorage", error);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTask.trim() === '') return;
        setTasks([...tasks, { id: Date.now(), text: newTask.trim(), completed: false }]);
        setNewTask('');
    };

    const handleToggleComplete = (id: number) => {
        setTasks(tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const handleDeleteTask = (id: number) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    const completedCount = tasks.filter(task => task.completed).length;
    const pendingCount = tasks.length - completedCount;

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">مدیریت وظایف</h1>
                <p className="text-gray-500">وظایف و یادآوری‌های خود را اینجا مدیریت کنید.</p>
            </div>

            <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-md">
                    <form onSubmit={handleAddTask} className="flex gap-4">
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="یک وظیفه جدید اضافه کنید..."
                            className="flex-grow px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500"
                        />
                        <button 
                            type="submit"
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            disabled={!newTask.trim()}
                        >
                            {ICONS.add}
                            <span>افزودن</span>
                        </button>
                    </form>
                </div>

                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4 text-sm font-semibold">
                        <span className="text-green-600 dark:text-green-400">انجام شده: {completedCount}</span>
                        <span className="text-yellow-600 dark:text-yellow-400">در انتظار: {pendingCount}</span>
                    </div>

                    {tasks.length > 0 ? (
                        <ul className="space-y-3">
                            {tasks.map(task => (
                                <li 
                                    key={task.id}
                                    className="flex items-center justify-between bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow-sm transition-all duration-300"
                                >
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => handleToggleComplete(task.id)}
                                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                        <span 
                                            className={`mr-4 text-gray-800 dark:text-gray-200 ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}
                                        >
                                            {task.text}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full transition-colors"
                                        aria-label="حذف وظیفه"
                                    >
                                        {ICONS.trash}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-10 text-gray-500 bg-white dark:bg-gray-800/50 rounded-lg">
                            <p>هنوز وظیفه‌ای اضافه نشده است.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TasksPage;
