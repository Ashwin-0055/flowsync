import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiUser, FiClock, FiTag } from 'react-icons/fi';
import { getUserById } from '../utils/userProfiles';

export default function KanbanCard({ card, labels = [], onClick }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: card.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const assignee = getUserById(card.assigneeId);

    const priorityColors = {
        Low: 'bg-green-500',
        Medium: 'bg-yellow-500',
        High: 'bg-red-500',
    };

    // Resolve labels
    const cardLabels = (card.labels || [])
        .map(labelId => labels.find(l => l.id === labelId))
        .filter(Boolean);

    // Due Date Logic
    const getDueDateStatus = (dateString) => {
        if (!dateString) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dateString);
        due.setHours(0, 0, 0, 0);

        if (due < today) return { color: 'text-red-400', icon: 'text-red-400' };
        if (due.getTime() === today.getTime()) return { color: 'text-yellow-400', icon: 'text-yellow-400' };
        return { color: 'text-dark-400', icon: 'text-dark-400' };
    };

    const dueDateStatus = getDueDateStatus(card.dueDate);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className="glass rounded-lg p-4 mb-3 cursor-pointer hover-lift group"
        >
            {/* Labels & Priority Row */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
                {/* Priority Indicator */}
                {card.priority && (
                    <div className={`w-2 h-2 rounded-full ${priorityColors[card.priority]}`} title={`Priority: ${card.priority}`}></div>
                )}

                {/* Labels */}
                {cardLabels.map(label => (
                    <div
                        key={label.id}
                        className={`h-1.5 w-8 rounded-full bg-gradient-to-r ${label.gradient}`}
                        title={label.name}
                    ></div>
                ))}
            </div>

            {/* Card Title */}
            <h4 className="text-dark-100 font-semibold mb-2 line-clamp-2">
                {card.title}
            </h4>

            {/* Card Description Preview */}
            {card.description && (
                <p className="text-dark-400 text-sm mb-3 line-clamp-2">
                    {card.description}
                </p>
            )}

            {/* Footer: Assignee & Due Date */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-700/50">
                {/* Assignee */}
                <div className="flex items-center gap-2">
                    {assignee ? (
                        <div className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                                style={{ backgroundColor: assignee.color }}
                            >
                                {assignee.avatar}
                            </div>
                            {/* <span className="text-xs text-dark-300">{assignee.name}</span> */}
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-dark-500" title="Unassigned">
                            <FiUser className="w-4 h-4" />
                        </div>
                    )}
                </div>

                {/* Due Date */}
                {card.dueDate && (
                    <div className={`flex items-center gap-1 text-xs ${dueDateStatus.color}`}>
                        <FiClock className={`w-3.5 h-3.5 ${dueDateStatus.icon}`} />
                        <span>{new Date(card.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                )}
            </div>

            {/* Hover indicator */}
            <div className="absolute inset-0 border-2 border-primary-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
    );
}
