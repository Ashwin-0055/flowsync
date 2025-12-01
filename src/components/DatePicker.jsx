import { useState } from 'react';
import { FiCalendar, FiX } from 'react-icons/fi';

export default function DatePicker({ dueDate, onDateChange, onRemove }) {
    const [showPicker, setShowPicker] = useState(false);

    // Format date for input (YYYY-MM-DD)
    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    // Format date for display
    const formatDateForDisplay = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Check if it's today
        if (d.toDateString() === today.toDateString()) {
            return { text: 'Today', color: 'yellow' };
        }

        // Check if it's tomorrow
        if (d.toDateString() === tomorrow.toDateString()) {
            return { text: 'Tomorrow', color: 'green' };
        }

        // Check if overdue
        if (d < today) {
            return {
                text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                color: 'red'
            };
        }

        // Future date
        return {
            text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            color: 'blue'
        };
    };

    const handleDateChange = (e) => {
        const newDate = e.target.value ? new Date(e.target.value).toISOString() : null;
        onDateChange(newDate);
        setShowPicker(false);
    };

    const displayInfo = dueDate ? formatDateForDisplay(dueDate) : null;

    const colorClasses = {
        red: 'bg-red-500/20 text-red-400 border-red-500/50',
        yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
        green: 'bg-green-500/20 text-green-400 border-green-500/50',
        blue: 'bg-blue-500/20 text-blue-400 border-blue-500/50'
    };

    return (
        <div className="relative">
            {dueDate ? (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colorClasses[displayInfo.color]}`}>
                    <FiCalendar className="w-4 h-4" />
                    <span className="text-sm font-semibold">{displayInfo.text}</span>
                    {onRemove && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            className="hover:bg-white/10 rounded p-0.5 transition-colors"
                        >
                            <FiX className="w-3 h-3" />
                        </button>
                    )}
                </div>
            ) : (
                <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-white border border-dark-700 hover:border-primary-500 transition-colors"
                >
                    <FiCalendar className="w-4 h-4" />
                    <span className="text-sm font-semibold">Add due date</span>
                </button>
            )}

            {showPicker && !dueDate && (
                <div className="absolute top-full mt-2 left-0 bg-dark-800 rounded-lg border border-dark-700 p-4 shadow-xl z-10">
                    <label className="block text-sm font-semibold text-dark-300 mb-2">
                        Select Due Date
                    </label>
                    <input
                        type="date"
                        onChange={handleDateChange}
                        className="bg-dark-900 text-white px-3 py-2 rounded-lg border border-dark-700 focus:border-primary-500 outline-none"
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>
            )}
        </div>
    );
}
