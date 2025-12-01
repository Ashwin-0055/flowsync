import { useState } from 'react';
import { FiX, FiCheck, FiTag } from 'react-icons/fi';
import { addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useBoard } from '../contexts/BoardContext';
import { getSharedLabelsCollection, getSharedLabelRef } from '../utils/dbPaths';

const LABEL_COLORS = [
    { name: 'Red', value: '#ef4444', gradient: 'from-red-500 to-rose-600' },
    { name: 'Orange', value: '#f97316', gradient: 'from-orange-500 to-amber-600' },
    { name: 'Yellow', value: '#eab308', gradient: 'from-yellow-500 to-orange-500' },
    { name: 'Green', value: '#22c55e', gradient: 'from-green-500 to-emerald-600' },
    { name: 'Blue', value: '#3b82f6', gradient: 'from-blue-500 to-cyan-600' },
    { name: 'Purple', value: '#a855f7', gradient: 'from-purple-500 to-pink-600' },
    { name: 'Pink', value: '#ec4899', gradient: 'from-pink-500 to-rose-600' },
    { name: 'Gray', value: '#6b7280', gradient: 'from-gray-500 to-slate-600' }
];

export default function LabelManager({ labels, onClose, onUpdate }) {
    const { activeBoard } = useBoard();
    const [editingLabel, setEditingLabel] = useState(null);
    const [newLabelName, setNewLabelName] = useState('');
    const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0]);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateLabel = async () => {
        if (!newLabelName.trim() || !activeBoard) return;

        try {
            const labelsRef = getSharedLabelsCollection(activeBoard.id);
            await addDoc(labelsRef, {
                name: newLabelName.trim(),
                color: selectedColor.value,
                gradient: selectedColor.gradient,
                createdAt: new Date().toISOString()
            });

            setNewLabelName('');
            setSelectedColor(LABEL_COLORS[0]);
            setIsCreating(false);
            onUpdate?.();
        } catch (error) {
            console.error('Error creating label:', error);
        }
    };

    const handleUpdateLabel = async (labelId, updates) => {
        if (!activeBoard) return;
        try {
            const labelRef = getSharedLabelRef(activeBoard.id, labelId);
            await updateDoc(labelRef, updates);
            onUpdate?.();
        } catch (error) {
            console.error('Error updating label:', error);
        }
    };

    const handleDeleteLabel = async (labelId) => {
        if (!activeBoard) return;
        try {
            const labelRef = getSharedLabelRef(activeBoard.id, labelId);
            await deleteDoc(labelRef);
            onUpdate?.();
        } catch (error) {
            console.error('Error deleting label:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 rounded-2xl border border-dark-700 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-dark-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                            <FiTag className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Manage Labels</h2>
                            <p className="text-sm text-dark-400">Create and organize your labels</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                    >
                        <FiX className="w-5 h-5 text-dark-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Existing Labels */}
                    {labels && labels.length > 0 ? (
                        labels.map(label => (
                            <div
                                key={label.id}
                                className="flex items-center gap-3 p-4 bg-dark-900 rounded-xl border border-dark-700 hover:border-primary-500/50 transition-colors"
                            >
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${label.gradient} flex items-center justify-center`}>
                                    <FiTag className="w-6 h-6 text-white" />
                                </div>

                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={editingLabel?.id === label.id ? editingLabel.name : label.name}
                                        onChange={(e) => setEditingLabel({ ...label, name: e.target.value })}
                                        onBlur={() => {
                                            if (editingLabel?.id === label.id && editingLabel.name !== label.name) {
                                                handleUpdateLabel(label.id, { name: editingLabel.name });
                                            }
                                            setEditingLabel(null);
                                        }}
                                        className="w-full bg-transparent text-white font-semibold outline-none"
                                    />
                                </div>

                                <button
                                    onClick={() => handleDeleteLabel(label.id)}
                                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                    title="Delete label"
                                >
                                    <FiX className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-dark-500">
                            <FiTag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>No labels created yet</p>
                        </div>
                    )}

                    {/* Create New Label */}
                    {isCreating ? (
                        <div className="p-4 bg-dark-900 rounded-xl border border-primary-500/50 space-y-4">
                            <input
                                type="text"
                                value={newLabelName}
                                onChange={(e) => setNewLabelName(e.target.value)}
                                placeholder="Label name..."
                                className="w-full bg-dark-800 text-white px-4 py-3 rounded-lg outline-none border border-dark-700 focus:border-primary-500 transition-colors"
                                autoFocus
                            />

                            {/* Color Picker */}
                            <div>
                                <label className="block text-sm font-semibold text-dark-300 mb-2">
                                    Choose Color
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {LABEL_COLORS.map(color => (
                                        <button
                                            key={color.value}
                                            onClick={() => setSelectedColor(color)}
                                            className={`h-12 rounded-lg bg-gradient-to-br ${color.gradient} flex items-center justify-center transition-transform hover:scale-105 ${selectedColor.value === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-900' : ''
                                                }`}
                                        >
                                            {selectedColor.value === color.value && (
                                                <FiCheck className="w-5 h-5 text-white" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleCreateLabel}
                                    disabled={!newLabelName.trim()}
                                    className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create Label
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCreating(false);
                                        setNewLabelName('');
                                        setSelectedColor(LABEL_COLORS[0]);
                                    }}
                                    className="btn btn-ghost"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full p-4 border-2 border-dashed border-dark-700 hover:border-primary-500 rounded-xl text-dark-400 hover:text-primary-400 transition-colors flex items-center justify-center gap-2"
                        >
                            <FiTag className="w-5 h-5" />
                            <span className="font-semibold">Create New Label</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
