import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface Shortcut {
    key: string;
    description: string;
}

interface ShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const shortcuts: Shortcut[] = [
    { key: 'Alt + N', description: 'New Invoice (Clear Form)' },
    { key: 'Alt + A', description: 'Add New Item' },
    { key: 'Alt + P', description: 'Print Invoice' },
    { key: 'Alt + D', description: 'Download PDF' },
    { key: 'Alt + S', description: 'Save / Export CSV' },
    { key: '↑ / ↓', description: 'Navigate Suggestions' },
    { key: 'Enter', description: 'Select Suggestion' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-2 text-gray-800 dark:text-white font-semibold">
                        <Keyboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3>Keyboard Shortcuts</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4">
                    <div className="space-y-2">
                        {shortcuts.map((shortcut, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                            >
                                <span className="text-sm text-gray-600 dark:text-gray-300">{shortcut.description}</span>
                                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-xs font-mono border dark:border-gray-600 shadow-sm min-w-[60px] text-center">
                                    {shortcut.key}
                                </kbd>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Use these shortcuts to speed up your workflow.
                    </p>
                </div>
            </div>
        </div>
    );
};
