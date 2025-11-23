import { useState, useEffect } from 'react';
import { Moon, Sun, FileText, UserCircle } from 'lucide-react';
import { InvoiceForm } from './components/invoice/InvoiceForm';
import { SettingsForm } from './components/settings/SettingsForm';
import { InventoryManager } from './components/inventory/InventoryManager';
import { Login } from './components/auth/Login';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext'; // Added this import for useAuth
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ShortcutsModal } from './components/ui/ShortcutsModal';
import { ProfileDropdown } from './components/profile/ProfileDropdown';
import type { ShopSettings } from './lib/types';

const initialSettings: ShopSettings = {
  shopName: 'My Shop',
  ownerName: 'Owner Name',
  address: 'Shop Address, City - Pin',
  gstin: '',
  mobile: '',
  email: '',
  termsAndConditions: '1. Goods once sold will not be taken back.\\n2. Warranty as per company policy.',
  customFooterMessage: 'Thank you for your business!',
  allowItemDiscount: true,
  showGST: true,

  invoicePrimaryUseCase: 'GENERAL',
  // Watermark defaults
  watermarkText: 'My Shop',
  watermarkSize: 60,
  watermarkOpacity: 0.2,
  watermarkRotation: -45,
  watermarkColor: '#cccccc',
  showWatermark: true,
};

function MainApp() {

  const [activeTab, setActiveTab] = useState<'invoice' | 'settings' | 'inventory' | 'admin'>('invoice');
  const [settings, setSettings] = useState<ShopSettings>(initialSettings);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Initialize dark mode on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 relative">
      {/* Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-gray-50/50 to-white/50 dark:from-blue-900/20 dark:via-gray-900/50 dark:to-gray-900/50" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="text-white h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                InvoiceGenerator
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('invoice')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'invoice'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  New Invoice
                </button>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'inventory'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  Inventory
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'settings'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  Settings
                </button>
              </div>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className={`p-2 rounded-full transition-colors ${showProfile
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                    }`}
                  title="Profile & Analytics"
                >
                  <UserCircle size={24} />
                </button>
                {showProfile && <ProfileDropdown onClose={() => setShowProfile(false)} />}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-6 relative z-10">
        {activeTab === 'invoice' ? (
          <InvoiceForm settings={settings} />
        ) : activeTab === 'inventory' ? (
          <InventoryManager />
        ) : activeTab === 'admin' ? (
          <AdminDashboard />
        ) : (
          <SettingsForm settings={settings} onSave={setSettings} />
        )}
      </main>

      <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

function AuthenticatedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return user ? <MainApp /> : <Login />;
}

export default App;

