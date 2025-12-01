import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FiCheck } from 'react-icons/fi';

export default function ThemePicker() {
    const { theme, setTheme, themes } = useTheme();

    return (
        <div className="p-2">
            <h3 className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-3 px-2">
                Select Theme
            </h3>
            <div className="space-y-1">
                {themes.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`
                            w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105
                            ${theme === t.id
                                ? 'bg-primary-500/10 text-primary-400 ring-1 ring-primary-500/50'
                                : 'text-dark-200 hover:bg-dark-700 hover:text-white'}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-4 h-4 rounded-full border border-white/10 shadow-sm transition-transform group-hover:rotate-12"
                                style={{ background: `linear-gradient(135deg, ${t.colors.bg}, ${t.colors.primary})` }}
                            />
                            <span>{t.name}</span>
                        </div>
                        {theme === t.id && <FiCheck className="w-4 h-4 animate-scale-in" />}
                    </button>
                ))}
            </div>
        </div>
    );
}
