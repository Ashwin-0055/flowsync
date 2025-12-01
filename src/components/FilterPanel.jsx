import { FiX } from 'react-icons/fi';

export default function FilterPanel({ filters, onFilterChange, onClearAll, lists, labels }) {
    const priorities = ['Low', 'Medium', 'High', 'Critical'];

    const handlePriorityToggle = (priority) => {
        const current = filters.priorities || [];
        const updated = current.includes(priority)
            ? current.filter(p => p !== priority)
            : [...current, priority];
        onFilterChange({ ...filters, priorities: updated });
    };

    const handleListToggle = (listId) => {
        const current = filters.lists || [];
        const updated = current.includes(listId)
            ? current.filter(l => l !== listId)
            : [...current, listId];
        onFilterChange({ ...filters, lists: updated });
    };

    const handleLabelToggle = (labelId) => {
        const current = filters.labels || [];
        const updated = current.includes(labelId)
            ? current.filter(l => l !== labelId)
            : [...current, labelId];
        onFilterChange({ ...filters, labels: updated });
    };

    const activeFilterCount =
        (filters.priorities?.length || 0) +
        (filters.lists?.length || 0);

    return (
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 mb-6 animate-slide-down">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </h3>
                {activeFilterCount > 0 && (
                    <button
                        onClick={onClearAll}
                        className="text-sm text-dark-400 hover:text-primary-400 transition-colors flex items-center gap-1"
                    >
                        <FiX className="w-4 h-4" />
                        Clear all
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {/* Priority Filter */}
                <div>
                    <label className="block text-sm font-semibold text-dark-300 mb-3">
                        Priority
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {priorities.map(priority => {
                            const isActive = filters.priorities?.includes(priority);
                            const colorMap = {
                                Low: 'from-blue-500 to-cyan-600',
                                Medium: 'from-green-500 to-emerald-600',
                                High: 'from-yellow-500 to-orange-600',
                                Critical: 'from-red-500 to-rose-600'
                            };

                            return (
                                <button
                                    key={priority}
                                    onClick={() => handlePriorityToggle(priority)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${isActive
                                        ? `bg-gradient-to-r ${colorMap[priority]} text-white shadow-lg`
                                        : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                                        }`}
                                >
                                    {priority}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* List Filter */}
                <div>
                    <label className="block text-sm font-semibold text-dark-300 mb-3">
                        Lists
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {lists.map(list => {
                            const isActive = filters.lists?.includes(list.id);

                            return (
                                <button
                                    key={list.id}
                                    onClick={() => handleListToggle(list.id)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${isActive
                                        ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg'
                                        : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                                        }`}
                                >
                                    {list.title}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Label Filter */}
                {labels && labels.length > 0 && (
                    <div>
                        <label className="block text-sm font-semibold text-dark-300 mb-3">
                            Labels
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {labels.map(label => {
                                const isActive = filters.labels?.includes(label.id);

                                return (
                                    <button
                                        key={label.id}
                                        onClick={() => handleLabelToggle(label.id)}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${isActive
                                            ? `bg-gradient-to-r ${label.gradient} text-white shadow-lg ring-2 ring-white ring-offset-2 ring-offset-dark-800`
                                            : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : `bg-gradient-to-r ${label.gradient}`}`}></div>
                                        {label.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
