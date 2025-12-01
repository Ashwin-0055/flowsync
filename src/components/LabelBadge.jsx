import { FiX } from 'react-icons/fi';

export default function LabelBadge({ label, onRemove, size = 'md' }) {
    const sizes = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-2'
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${label.gradient} text-white font-semibold ${sizes[size]} shadow-sm`}
        >
            {label.name}
            {onRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(label.id);
                    }}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                    <FiX className="w-3 h-3" />
                </button>
            )}
        </span>
    );
}
