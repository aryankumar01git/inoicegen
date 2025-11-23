import React, { useEffect, useState } from 'react';
import { LogOut, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileDropdownProps {
    onClose: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onClose }) => {
    const { user, signOut } = useAuth();
    const [analytics, setAnalytics] = useState({
        today: 0,
        week: 0,
        month: 0,
        last4Months: 0,
    });

    // Placeholder analytics – can be replaced with real data later
    useEffect(() => {
        setAnalytics({
            today: 0,
            week: 0,
            month: 0,
            last4Months: 0,
        });
    }, []);

    const handleLogout = async () => {
        await signOut();
        onClose();
    };

    return (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50">
            {/* Header – email + logout */}
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                            {user?.email?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user?.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>

            {/* Analytics */}
            <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Profit Overview</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">₹{analytics.today.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">This Week</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">₹{analytics.week.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">This Month</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">₹{analytics.month.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Last 4 Months</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">₹{analytics.last4Months.toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
