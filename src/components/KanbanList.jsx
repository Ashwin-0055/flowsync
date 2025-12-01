import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import KanbanCard from './KanbanCard';

export default function KanbanList({
    list,
    cards,
    onAddCard,
    onCardClick,
    onUpdateList,
    onDeleteList,
    labels
}) {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingWip, setIsEditingWip] = useState(false);
    const [editedTitle, setEditedTitle] = useState(list.title);
    const [editedWip, setEditedWip] = useState(list.wipLimit || '');

    const { setNodeRef, isOver } = useDroppable({
        id: list.id,
    });

    const cardIds = cards.map(card => card.id);
    const isWipViolation = list.wipLimit && cards.length > list.wipLimit;

    const handleTitleSave = () => {
        if (editedTitle.trim()) {
            onUpdateList({ ...list, title: editedTitle.trim() });
        } else {
            setEditedTitle(list.title);
        }
        setIsEditingTitle(false);
    };

    const handleWipSave = () => {
        const wipValue = editedWip === '' ? null : parseInt(editedWip, 10);
        onUpdateList({ ...list, wipLimit: wipValue });
        setIsEditingWip(false);
    };

    return (
        <div className="glass rounded-xl p-4 w-80 flex-shrink-0">
            {/* List Header */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    {/* Editable Title - STEP 1.3 */}
                    {isEditingTitle ? (
                        <div className="flex items-center gap-2 flex-1">
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleTitleSave();
                                    if (e.key === 'Escape') {
                                        setEditedTitle(list.title);
                                        setIsEditingTitle(false);
                                    }
                                }}
                                onBlur={handleTitleSave}
                                className="input text-lg font-bold py-1 px-2"
                                autoFocus
                            />
                        </div>
                    ) : (
                        <h3
                            onClick={() => setIsEditingTitle(true)}
                            className="text-lg font-bold text-dark-50 cursor-pointer hover:text-primary-400 transition-colors flex items-center gap-2 group"
                        >
                            {list.title}
                            <FiEdit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                    )}

                    {/* Delete List - STEP 1.2 */}
                    <button
                        onClick={() => onDeleteList(list)}
                        className="text-dark-500 hover:text-red-500 transition-colors p-1"
                        title="Delete list"
                    >
                        <FiTrash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Card Count and WIP Limit - STEP 1.3 */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">
                        {cards.length} {cards.length === 1 ? 'card' : 'cards'}
                    </span>

                    {isEditingWip ? (
                        <div className="flex items-center gap-1">
                            <span className="text-dark-400 text-xs">WIP:</span>
                            <input
                                type="number"
                                value={editedWip}
                                onChange={(e) => setEditedWip(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleWipSave();
                                    if (e.key === 'Escape') {
                                        setEditedWip(list.wipLimit || '');
                                        setIsEditingWip(false);
                                    }
                                }}
                                onBlur={handleWipSave}
                                className="input w-16 py-0 px-1 text-xs"
                                min="1"
                                placeholder="∞"
                                autoFocus
                            />
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditingWip(true)}
                            className={`text-xs px-2 py-1 rounded transition-colors ${isWipViolation
                                ? 'bg-red-500 text-white animate-pulse-soft'
                                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                }`}
                            title="Click to edit WIP limit"
                        >
                            WIP: {list.wipLimit || '∞'}
                        </button>
                    )}

                </div>

                {isWipViolation && (
                    <div className="mt-2 text-xs text-red-400 bg-red-500 bg-opacity-10 px-2 py-1 rounded">
                        ⚠️ WIP limit exceeded!
                    </div>
                )}
            </div>

            {/* Cards Container */}
            <div
                ref={setNodeRef}
                className={`min-h-[200px] transition-all ${isOver ? 'drag-over' : ''
                    }`}
            >
                <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                    {cards.map((card) => (
                        <KanbanCard
                            key={card.id}
                            card={card}
                            labels={labels}
                            onClick={() => onCardClick(card)}
                        />
                    ))}
                </SortableContext>
            </div>

            {/* Add Card Button */}
            <button
                onClick={onAddCard}
                className="w-full btn btn-ghost flex items-center justify-center gap-2 mt-3"
            >
                <FiPlus className="w-4 h-4" />
                Add Card
            </button>
        </div >
    );
}
