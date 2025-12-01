import { FiCheck, FiTag } from 'react-icons/fi';

export default function LabelPicker({ labels, selectedLabels = [], onToggleLabel }) {
    if (!labels || labels.length === 0) {
        return (
            <div className="p-4 text-center text-dark-500">
                <FiTag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No labels available</p>
                <p className="text-xs mt-1">Create labels in the Label Manager</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {labels.map(label => {
                const isSelected = selectedLabels.includes(label.id);

                return (
                    <button
                        key={label.id}
                        onClick={() => onToggleLabel(label.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${isSelected
                                ? `bg-gradient-to-r ${label.gradient} text-white shadow-lg`
                                : 'bg-dark-800 hover:bg-dark-700 text-dark-300'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white/20' : `bg-gradient-to-br ${label.gradient}`
                            }`}>
                            {isSelected ? (
                                <FiCheck className="w-4 h-4 text-white" />
                            ) : (
                                <FiTag className="w-4 h-4 text-white" />
                            )}
                        </div>

                        <span className="font-semibold">{label.name}</span>
                    </button>
                );
            })}
        </div>
    );
}
