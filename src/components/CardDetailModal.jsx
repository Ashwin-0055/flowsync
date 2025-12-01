import { useState, useRef, useEffect } from 'react';
import { FiX, FiTrash2, FiZap, FiTrendingUp, FiLoader, FiTag, FiCalendar, FiClock } from 'react-icons/fi';
import { llmApiCall } from '../utils/llmApiCall';
import { useTeam } from '../contexts/TeamContext';
import { useBoard } from '../contexts/BoardContext';
import { useAuth } from '../contexts/AuthContext';
import LabelPicker from './LabelPicker';
import DatePicker from './DatePicker';
import CommentSection from './CommentSection';
import AttachmentSection from './AttachmentSection';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function CardDetailModal({ card, labels = [], onClose, onUpdate, onDelete }) {
    const [title, setTitle] = useState(card?.title || '');
    const [description, setDescription] = useState(card?.description || '');
    const [assigneeId, setAssigneeId] = useState(card?.assigneeId || '');
    const [priority, setPriority] = useState(card?.priority || 'Medium');
    const [selectedLabels, setSelectedLabels] = useState(card?.labels || []);
    const [dueDate, setDueDate] = useState(card?.dueDate || null);

    const [isRefining, setIsRefining] = useState(false);
    const [isEstimating, setIsEstimating] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showLabelPicker, setShowLabelPicker] = useState(false);

    const labelPickerRef = useRef(null);
    const { members } = useTeam();
    const { activeBoard } = useBoard();
    const { currentUser } = useAuth();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (labelPickerRef.current && !labelPickerRef.current.contains(event.target)) {
                setShowLabelPicker(false);
            }
        };

        if (showLabelPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showLabelPicker]);

    if (!card) return null;

    const handleSave = async () => {
        // Check if assignee changed
        const oldAssigneeId = card.assigneeId;
        const newAssigneeId = assigneeId;

        onUpdate({
            ...card,
            title,
            description,
            assigneeId,
            priority,
            labels: selectedLabels,
            dueDate,
            updatedAt: new Date().toISOString(),
        });

        // Send notification if assigned to someone new (and not unassigned)
        if (newAssigneeId && newAssigneeId !== oldAssigneeId && activeBoard && currentUser) {
            try {
                const { sendAssignmentNotification } = await import('../utils/NotificationService');
                await sendAssignmentNotification(
                    newAssigneeId,
                    { ...card, title },
                    activeBoard,
                    currentUser
                );
            } catch (error) {
                console.error('Error sending assignment notification:', error);
            }
        }
        onClose();
    };

    const toggleLabel = (labelId) => {
        setSelectedLabels(prev =>
            prev.includes(labelId)
                ? prev.filter(id => id !== labelId)
                : [...prev, labelId]
        );
    };

    const handleRefineTask = async () => {
        if (!title.trim()) {
            alert('Please enter a task title first');
            return;
        }

        setIsRefining(true);
        try {
            const systemInstruction =
                "Act as an expert project manager. Create a detailed, actionable plan for the given task. " +
                "Provide 3-5 concise, numbered steps that break down the task into clear action items. " +
                "Keep each step brief and specific.";

            const userPrompt = `Task: ${title}\n\nCreate a refined action plan for this task.`;

            const refinedPlan = await llmApiCall(systemInstruction, userPrompt);
            setDescription(refinedPlan);
        } catch (error) {
            alert(`Failed to refine task: ${error.message}`);
        } finally {
            setIsRefining(false);
        }
    };

    const handleAutoEstimate = async () => {
        const taskContent = description || title;

        if (!taskContent.trim()) {
            alert('Please add a task title or description first');
            return;
        }

        setIsEstimating(true);
        try {
            const systemInstruction =
                "Analyze the task complexity and respond with ONLY one word: Low, Medium, or High. " +
                "Base your assessment on the scope, technical difficulty, and expected time investment.";

            const userPrompt = `Task: ${title}\n\nDescription: ${description || 'No additional details'}`;

            const complexity = await llmApiCall(systemInstruction, userPrompt);

            // Parse and validate the response
            const cleanComplexity = complexity.trim().replace(/[^a-zA-Z]/g, '');
            if (['Low', 'Medium', 'High'].includes(cleanComplexity)) {
                setPriority(cleanComplexity);
            } else {
                // Default to Medium if response is unexpected
                setPriority('Medium');
            }
        } catch (error) {
            alert(`Failed to estimate complexity: ${error.message}`);
        } finally {
            setIsEstimating(false);
        }
    };

    // Resolve selected label objects
    const activeLabels = labels.filter(l => selectedLabels.includes(l.id));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
            <div className="glass rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="sticky top-0 glass border-b border-dark-700 p-6 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-dark-50">Edit Card</h2>
                    <button
                        onClick={onClose}
                        className="text-dark-400 hover:text-dark-100 transition-colors"
                        aria-label="Close modal"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                            Task Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input"
                            placeholder="Enter task title..."
                            autoFocus
                        />
                    </div>

                    {/* Metadata Row: Labels & Due Date */}
                    <div className="flex flex-wrap gap-6">
                        {/* Labels */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Labels
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {activeLabels.map(label => (
                                    <span
                                        key={label.id}
                                        className={`px-2 py-1 rounded-md text-xs font-semibold text-white bg-gradient-to-r ${label.gradient} flex items-center gap-1`}
                                    >
                                        {label.name}
                                        <button
                                            onClick={() => toggleLabel(label.id)}
                                            className="hover:text-dark-200"
                                        >
                                            <FiX className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                                <div className="relative" ref={labelPickerRef}>
                                    <button
                                        onClick={() => setShowLabelPicker(!showLabelPicker)}
                                        className="px-2 py-1 rounded-md text-xs font-semibold bg-dark-800 text-dark-400 hover:text-white border border-dark-700 hover:border-primary-500 transition-colors flex items-center gap-1"
                                    >
                                        <FiTag className="w-3 h-3" />
                                        Add Label
                                    </button>

                                    {showLabelPicker && (
                                        <div className="absolute top-full left-0 mt-2 w-64 bg-dark-900 border border-dark-700 rounded-xl shadow-xl z-20 p-2">
                                            <LabelPicker
                                                labels={labels}
                                                selectedLabels={selectedLabels}
                                                onToggleLabel={toggleLabel}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Due Date
                            </label>
                            <DatePicker
                                dueDate={dueDate}
                                onDateChange={setDueDate}
                                onRemove={() => setDueDate(null)}
                            />
                        </div>
                    </div>

                    {/* AI Refine Button */}
                    <div>
                        <button
                            onClick={handleRefineTask}
                            disabled={isRefining || !title.trim()}
                            className="btn btn-secondary w-full flex items-center justify-center gap-2"
                        >
                            {isRefining ? (
                                <>
                                    <FiLoader className="w-4 h-4 spinner" />
                                    Refining task...
                                </>
                            ) : (
                                <>
                                    <FiZap className="w-4 h-4" />
                                    ✨ AI: Refine Task into Action Plan
                                </>
                            )}
                        </button>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                            Description / Action Plan
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input min-h-[150px] resize-y"
                            placeholder="Add detailed description or action plan..."
                        />
                    </div>

                    {/* Priority and Auto-Estimate */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Priority / Complexity
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="input"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleAutoEstimate}
                                disabled={isEstimating}
                                className="btn btn-secondary w-full flex items-center justify-center gap-2"
                            >
                                {isEstimating ? (
                                    <>
                                        <FiLoader className="w-4 h-4 spinner" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <FiTrendingUp className="w-4 h-4" />
                                        Auto-Estimate
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Assignee Dropdown - REAL DATA */}
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                            Assignee
                        </label>
                        <select
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                            className="input"
                        >
                            <option value="">Unassigned</option>
                            {members.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.name} {member.isCurrentUser ? '(You)' : `(${member.role})`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Attachments Section */}
                    <AttachmentSection boardId={activeBoard?.id} cardId={card.id} />

                    {/* Comments Section */}
                    <CommentSection boardId={activeBoard?.id} cardId={card.id} />
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 glass border-t border-dark-700 p-6 flex items-center justify-between">
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="btn btn-danger flex items-center gap-2"
                    >
                        <FiTrash2 className="w-4 h-4" />
                        Delete Card
                    </button>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="btn btn-primary">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={() => {
                    onDelete(card.id);
                    onClose();
                }}
                title="Delete Card"
                message="Are you sure you want to delete this card? This action cannot be undone."
            />
        </div>
    );
}
