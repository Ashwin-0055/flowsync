import { useState } from 'react';
import { FiSearch, FiX, FiFilter } from 'react-icons/fi';

export default function SearchBar({ onSearch, onFilterToggle, showFilters }) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (value) => {
        setSearchTerm(value);
        onSearch(value);
    };

    const clearSearch = () => {
        setSearchTerm('');
        onSearch('');
    };

    return (
        <div className="flex items-center gap-3 mb-6">
            {/* Search Input */}
            <div className="relative flex-1">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center bg-dark-800 rounded-xl border border-dark-700 focus-within:border-primary-500 transition-colors">
                    <FiSearch className="w-5 h-5 text-dark-500 ml-4" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search cards by title or description..."
                        className="flex-1 bg-transparent text-white px-4 py-3 outline-none placeholder-dark-500"
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="p-2 mr-2 hover:bg-dark-700 rounded-lg transition-colors"
                            title="Clear search"
                        >
                            <FiX className="w-5 h-5 text-dark-400" />
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Toggle Button */}
            <button
                onClick={onFilterToggle}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${showFilters
                        ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg shadow-primary-500/30'
                        : 'bg-dark-800 text-dark-300 border border-dark-700 hover:border-primary-500'
                    }`}
                title="Toggle filters"
            >
                <FiFilter className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
            </button>
        </div>
    );
}
