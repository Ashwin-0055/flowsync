import { FiX, FiCommand } from 'react-icons/fi';

export default function ShortcutsModal({ onClose }) {
    const shortcuts = [
        { key: 'N', description: 'Add New List' },
        { key: '/', description: 'Focus Search' },
        { key: 'Esc', description: 'Close Modals' },
        { key: '?', description: 'Show this help' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
            <div className="glass rounded-xl shadow-2xl max-w-md w-full animate-slide-up">
                <div className="p-6 border-b border-dark-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-dark-50 flex items-center gap-2">
                        <FiCommand className="w-5 h-5" />
                        Keyboard Shortcuts
                    </h2>
                    <button onClick={onClose} className="text-dark-400 hover:text-dark-100">
                        <FiX className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {shortcuts.map((s) => (
                        <div key={s.key} className="flex items-center justify-between">
                            <span className="text-dark-200">{s.description}</span>
                            <kbd className="px-3 py-1 bg-dark-700 rounded-lg text-dark-100 font-mono text-sm border border-dark-600 shadow-sm">
                                {s.key}
                            </kbd>
                        </div>
                    ))}
                </div>
                <div className="p-6 border-t border-dark-700 bg-dark-800/50 rounded-b-xl">
                    <p className="text-xs text-center text-dark-400">
                        Press <kbd className="px-1 py-0.5 bg-dark-700 rounded text-dark-300 font-mono">Esc</kbd> to close
                    </p>
                </div>
            </div>
        </div>
    );
}
