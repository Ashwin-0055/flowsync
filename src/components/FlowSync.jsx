import { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import {
    onSnapshot,
    updateDoc,
    addDoc,
    deleteDoc,
    writeBatch,
    query,
    where,
    getDocs,
    serverTimestamp,
    setDoc,
    doc,
    getDoc
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { FiUsers, FiEdit2, FiShare2, FiTag, FiLoader, FiZap, FiLogOut, FiPlus } from 'react-icons/fi';
import confetti from 'canvas-confetti';
import ThemePicker from './ThemePicker';

import { llmApiCall } from '../utils/llmApiCall';
import { useAuth } from '../contexts/AuthContext';
import { useBoard } from '../contexts/BoardContext';
import {
    getSharedBoardRef,
    getSharedCardsCollection,
    getSharedCardRef,
    getSharedLabelsCollection
} from '../utils/dbPaths';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

import KanbanList from './KanbanList';
import KanbanCard from './KanbanCard';
import CardDetailModal from './CardDetailModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import Toast from './Toast';
import WelcomeModal from './WelcomeModal';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import TeamSettingsModal from './TeamSettingsModal';
import ShareBoardModal from './ShareBoardModal';
import LabelManager from './LabelManager';
import NotificationCenter from './NotificationCenter';
import CalendarView from './CalendarView';
import ShortcutsModal from './ShortcutsModal';
import AnalysisModal from './AnalysisModal';

export default function FlowSync() {
    const { currentUser } = useAuth();
    const { activeBoard, loading: boardLoading, lists, setLists, cards, setCards, labels, setLabels } = useBoard();
    const [activeCard, setActiveCard] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [toast, setToast] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [isFirstTime, setIsFirstTime] = useState(false);
    const [viewMode, setViewMode] = useState('board');

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showTeamSettings, setShowTeamSettings] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showLabelManager, setShowLabelManager] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleInput, setTitleInput] = useState('');

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        priorities: [],
        lists: [],
        labels: []
    });

    const [showShortcuts, setShowShortcuts] = useState(false);

    // Analysis State
    const [analysisResult, setAnalysisResult] = useState('');
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);

    // Keyboard Shortcuts
    useKeyboardShortcuts({
        'n': () => handleAddList(),
        '/': () => document.getElementById('search-input')?.focus(),
        'escape': () => {
            setSelectedCard(null);
            setShowShareModal(false);
            setShowTeamSettings(false);
            setShowLabelManager(false);
            setShowShortcuts(false);
            setIsEditingTitle(false);
        },
        '?': () => setShowShortcuts(true)
    });

    // Show welcome modal for first-time users
    useEffect(() => {
        if (isFirstTime) {
            setShowWelcome(true);
        }
    }, [isFirstTime]);

    const [ownerName, setOwnerName] = useState('');

    // Fetch owner name if guest
    useEffect(() => {
        const fetchOwnerName = async () => {
            if (activeBoard && currentUser && activeBoard.ownerId !== currentUser.uid) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', activeBoard.ownerId));
                    if (userDoc.exists()) {
                        setOwnerName(userDoc.data().displayName || 'Unknown User');
                    }
                } catch (error) {
                    console.error('Error fetching owner name:', error);
                }
            } else {
                setOwnerName('');
            }
        };
        fetchOwnerName();
    }, [activeBoard, currentUser]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Filter and search cards
    const getFilteredCards = () => {
        let filtered = [...cards];

        // Apply search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(card =>
                card.title.toLowerCase().includes(term) ||
                (card.description && card.description.toLowerCase().includes(term))
            );
        }

        // Apply priority filter
        if (filters.priorities.length > 0) {
            filtered = filtered.filter(card =>
                filters.priorities.includes(card.priority)
            );
        }

        // Apply list filter
        if (filters.lists.length > 0) {
            filtered = filtered.filter(card =>
                filters.lists.includes(card.listId)
            );
        }

        // Apply label filter
        if (filters.labels && filters.labels.length > 0) {
            filtered = filtered.filter(card =>
                card.labels && card.labels.some(labelId => filters.labels.includes(labelId))
            );
        }

        return filtered;
    };

    // Get cards for a specific list with filters applied
    const getCardsForList = (listId) => {
        const filteredCards = getFilteredCards();
        return filteredCards.filter(card => card.listId === listId);
    };

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    // Add New List (SHARED)
    const handleAddList = async () => {
        if (!activeBoard) return;

        const newList = {
            id: `list-${Date.now()}`,
            title: 'New List',
            wipLimit: 5,
            index: lists.length
        };

        try {
            const boardRef = getSharedBoardRef(activeBoard.id);
            await updateDoc(boardRef, {
                lists: [...lists, newList]
            });
        } catch (error) {
            console.error('Error adding list:', error);
            showToast('Failed to add list', 'error');
        }
    };

    // Delete List (SHARED)
    const handleDeleteList = async (listToDelete) => {
        if (!activeBoard) return;

        setDeleteConfirm({
            title: 'Delete List?',
            message: `Are you sure you want to delete "${listToDelete.title}"? All cards in this list will be permanently deleted.`,
            onConfirm: async () => {
                try {
                    const batch = writeBatch(db);

                    // Delete all cards in this list (SHARED)
                    const cardsRef = getSharedCardsCollection(activeBoard.id);
                    const cardsQuery = query(cardsRef, where('listId', '==', listToDelete.id));
                    const cardsSnapshot = await getDocs(cardsQuery);
                    cardsSnapshot.docs.forEach(doc => {
                        batch.delete(doc.ref);
                    });

                    // Remove list and re-index remaining lists
                    const updatedLists = lists
                        .filter(l => l.id !== listToDelete.id)
                        .map((l, index) => ({ ...l, index }));

                    const boardRef = getSharedBoardRef(activeBoard.id);
                    batch.update(boardRef, { lists: updatedLists });

                    await batch.commit();
                    showToast('List deleted successfully', 'success');
                } catch (error) {
                    console.error('Error deleting list:', error);
                    showToast('Failed to delete list', 'error');
                }
            }
        });
    };

    // Update List (SHARED)
    const handleUpdateList = async (updatedList) => {
        if (!activeBoard) return;

        try {
            const updatedLists = lists.map(l =>
                l.id === updatedList.id ? updatedList : l
            );

            const boardRef = getSharedBoardRef(activeBoard.id);
            await updateDoc(boardRef, {
                lists: updatedLists
            });
        } catch (error) {
            console.error('Error updating list:', error);
            showToast('Failed to update list', 'error');
        }
    };

    // Add new card (SHARED)
    const handleAddCard = async (listId, date = null) => {
        if (!activeBoard || !currentUser) return;

        // Default to first list if listId is null (e.g. from Calendar)
        const targetListId = listId || (lists.length > 0 ? lists[0].id : null);
        if (!targetListId) {
            showToast('No lists available to add card', 'error');
            return;
        }

        const cardsInList = cards.filter(c => c.listId === targetListId);

        try {
            const cardsRef = getSharedCardsCollection(activeBoard.id);
            const newCardRef = await addDoc(cardsRef, {
                title: 'New Task',
                description: '',
                listId: targetListId,
                index: cardsInList.length,
                assigneeId: '',
                priority: 'Medium',
                labels: [],
                dueDate: date ? date.toISOString() : null,
                boardId: activeBoard.id,
                createdBy: currentUser.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            // Open the card detail modal immediately for the new card
            setSelectedCard({
                id: newCardRef.id,
                title: 'New Task',
                description: '',
                listId: targetListId,
                index: cardsInList.length,
                assigneeId: '',
                priority: 'Medium',
                labels: [],
                dueDate: date ? { toDate: () => date } : null, // Mock Firestore timestamp for immediate display
                boardId: activeBoard.id,
                createdBy: currentUser.uid
            });

            // Mark user as no longer first-time after creating first card
            if (isFirstTime) {
                setIsFirstTime(false);
            }
        } catch (error) {
            console.error('Error adding card:', error);
            showToast('Failed to add card', 'error');
        }
    };

    // Update card (SHARED)
    const handleUpdateCard = async (updatedCard) => {
        if (!activeBoard) return;

        try {
            const cardRef = getSharedCardRef(activeBoard.id, updatedCard.id);
            await updateDoc(cardRef, {
                title: updatedCard.title,
                description: updatedCard.description,
                assigneeId: updatedCard.assigneeId,
                priority: updatedCard.priority,
                labels: updatedCard.labels || [],
                dueDate: updatedCard.dueDate || null,
                updatedAt: updatedCard.updatedAt
            });
            showToast('Card updated successfully', 'success');
        } catch (error) {
            console.error('Error updating card:', error);
            showToast('Failed to update card', 'error');
        }
    };

    // Delete card (SHARED)
    const handleDeleteCard = async (cardId) => {
        if (!activeBoard) return;

        try {
            const cardRef = getSharedCardRef(activeBoard.id, cardId);
            await deleteDoc(cardRef);
            showToast('Card deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting card:', error);
            showToast('Failed to delete card', 'error');
        }
    };

    // Drag and drop handlers
    const handleDragStart = (event) => {
        const { active } = event;
        const card = cards.find(c => c.id === active.id);
        setActiveCard(card);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        setActiveCard(null);

        if (!over) return;

        const activeCard = cards.find(c => c.id === active.id);
        if (!activeCard) return;

        const overList = lists.find(l => l.id === over.id);
        const overCard = cards.find(c => c.id === over.id);

        let targetListId = overList?.id || overCard?.listId;
        if (!targetListId) return;

        const sourceListId = activeCard.listId;

        // If dropped on the same list
        if (sourceListId === targetListId) {
            const cardsInList = cards.filter(c => c.listId === sourceListId);
            const oldIndex = cardsInList.findIndex(c => c.id === activeCard.id);
            const newIndex = overCard
                ? cardsInList.findIndex(c => c.id === overCard.id)
                : cardsInList.length - 1;

            if (oldIndex !== newIndex) {
                const reorderedCards = arrayMove(cardsInList, oldIndex, newIndex);
                await updateCardIndices(reorderedCards);
            }
        } else {
            // Moving to a different list
            await moveCardToList(activeCard, targetListId, overCard);
        }
    };

    const moveCardToList = async (card, targetListId, overCard) => {
        if (!activeBoard) return;

        try {
            const batch = writeBatch(db);

            // Get cards in source list (excluding the moved card)
            const sourceCards = cards
                .filter(c => c.listId === card.listId && c.id !== card.id)
                .sort((a, b) => a.index - b.index);

            // Re-index source list cards (close the gap) - SHARED
            sourceCards.forEach((c, index) => {
                const cardRef = getSharedCardRef(activeBoard.id, c.id);
                batch.update(cardRef, { index });
            });

            // Get cards in target list
            const targetCards = cards
                .filter(c => c.listId === targetListId)
                .sort((a, b) => a.index - b.index);

            // Determine new index in target list
            let newIndex = targetCards.length;
            if (overCard) {
                newIndex = targetCards.findIndex(c => c.id === overCard.id);
            }

            // Update the moved card - SHARED
            const movedCardRef = getSharedCardRef(activeBoard.id, card.id);
            batch.update(movedCardRef, {
                listId: targetListId,
                index: newIndex,
                updatedAt: new Date().toISOString()
            });

            // Re-index target list cards - SHARED
            targetCards.forEach((c, index) => {
                const adjustedIndex = index >= newIndex ? index + 1 : index;
                const cardRef = getSharedCardRef(activeBoard.id, c.id);
                batch.update(cardRef, { index: adjustedIndex });
            });

            await batch.commit();

            // Confetti if moved to "Done"
            const targetList = lists.find(l => l.id === targetListId);
            if (targetList && targetList.title.toLowerCase() === 'done') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                // Play success sound
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
                audio.volume = 0.5;
                audio.play().catch(e => console.log('Audio play failed', e));

                showToast('Task Completed! 🎉', 'success');
            }

        } catch (error) {
            console.error('Error moving card:', error);
            showToast('Failed to move card', 'error');
        }
    };

    const updateCardIndices = async (cardsToUpdate) => {
        if (!activeBoard) return;

        try {
            const batch = writeBatch(db);
            cardsToUpdate.forEach((card, index) => {
                const cardRef = getSharedCardRef(activeBoard.id, card.id);
                batch.update(cardRef, { index });
            });
            await batch.commit();
        } catch (error) {
            console.error('Error updating card indices:', error);
            showToast('Failed to reorder cards', 'error');
        }
    };

    // Board-Level AI Summary
    const handleAnalyzeFlow = async () => {
        setIsAnalyzing(true);
        try {
            // Collect board data
            const summary = lists.map(list => {
                const listCards = cards.filter(c => c.listId === list.id);
                const isViolation = list.wipLimit && listCards.length > list.wipLimit;
                const priorityCount = {
                    High: listCards.filter(c => c.priority === 'High').length,
                    Medium: listCards.filter(c => c.priority === 'Medium').length,
                    Low: listCards.filter(c => c.priority === 'Low').length
                };

                return `${list.title}: ${listCards.length} cards${list.wipLimit ? ` (WIP limit: ${list.wipLimit}${isViolation ? ' - VIOLATION!' : ''})` : ''
                    } [High: ${priorityCount.High}, Medium: ${priorityCount.Medium}, Low: ${priorityCount.Low}]`;
            }).join('\n');

            const totalCards = cards.length;
            const prompt = `Board Status:\n${summary}\n\nTotal cards: ${totalCards}`;

            const systemInstruction =
                "Analyze the current Kanban board status and provide a concise, single-paragraph status report " +
                "focusing on project risk, bottlenecks, and the highest priority next step. " +
                "Be specific and actionable.";

            const analysis = await llmApiCall(systemInstruction, prompt);

            // Show result in modal instead of toast
            setAnalysisResult(analysis);
            setShowAnalysisModal(true);

        } catch (error) {
            showToast(`Failed to analyze board: ${error.message}`, 'error');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleUpdateTitle = async () => {
        if (!activeBoard || !titleInput.trim() || titleInput === activeBoard.title) {
            setIsEditingTitle(false);
            return;
        }

        try {
            const boardRef = getSharedBoardRef(activeBoard.id);
            await updateDoc(boardRef, { title: titleInput });
            showToast('Board name updated', 'success');
        } catch (error) {
            console.error('Error updating board title:', error);
            showToast('Failed to update board name', 'error');
        } finally {
            setIsEditingTitle(false);
        }
    };

    if (boardLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-dark-400">Loading Board...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        {ownerName && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium mb-3 border border-purple-500/30">
                                <FiUsers className="w-3 h-3" />
                                Viewing {ownerName}'s Board
                            </div>
                        )}
                        {isEditingTitle ? (
                            <input
                                type="text"
                                value={titleInput}
                                onChange={(e) => setTitleInput(e.target.value)}
                                onBlur={handleUpdateTitle}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
                                className="text-4xl font-bold text-dark-50 mb-2 bg-transparent border-b border-primary-500 focus:outline-none w-full max-w-md"
                                autoFocus
                            />
                        ) : (
                            <h1
                                onClick={() => {
                                    if (!ownerName) {
                                        setTitleInput(activeBoard?.title || '');
                                        setIsEditingTitle(true);
                                    }
                                }}
                                className={`text-4xl font-bold text-dark-50 mb-2 flex items-center gap-3 group ${!ownerName ? 'cursor-pointer hover:text-dark-100 transition-colors' : ''}`}
                                title={!ownerName ? "Click to edit board name" : "You cannot edit the board name"}
                            >
                                {activeBoard?.title || 'FlowSync'}
                                {!ownerName && <FiEdit2 className="w-6 h-6 text-dark-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </h1>
                        )}
                        <p className="text-dark-400">
                            Real-time collaborative Kanban with AI assistance
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View Toggle */}
                        <div className="bg-dark-200 p-1 rounded-lg border border-white/5 flex items-center">
                            <button
                                onClick={() => setViewMode('board')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'board' ? 'bg-primary-500 text-white shadow-lg' : 'text-dark-400 hover:text-white'}`}
                            >
                                Board
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-primary-500 text-white shadow-lg' : 'text-dark-400 hover:text-white'}`}
                            >
                                Calendar
                            </button>
                        </div>

                        {/* Share Button */}
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <FiShare2 className="w-5 h-5" />
                            Share
                        </button>

                        {/* Manage Team Button */}
                        <button
                            onClick={() => setShowTeamSettings(true)}
                            className="btn btn-secondary flex items-center gap-2"
                        >
                            <FiUsers className="w-5 h-5" />
                            Team
                        </button>

                        {/* Manage Labels Button */}
                        <button
                            onClick={() => setShowLabelManager(true)}
                            className="btn btn-secondary flex items-center gap-2"
                        >
                            <FiTag className="w-5 h-5" />
                            Labels
                        </button>

                        {/* AI Board Summary */}
                        <button
                            onClick={handleAnalyzeFlow}
                            disabled={isAnalyzing}
                            className="btn btn-secondary flex items-center gap-2">
                            {isAnalyzing ? (
                                <>
                                    <FiLoader className="w-5 h-5 spinner" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <FiZap className="w-5 h-5" />
                                    Analyze
                                </>
                            )}
                        </button>

                        {/* Notification Center */}
                        <NotificationCenter />

                        {/* Logout Button */}
                        <button
                            onClick={() => signOut(auth)}
                            className="btn btn-ghost flex items-center gap-2"
                            title="Log out"
                        >
                            <FiLogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div >

                {/* Add New List Button */}
                {
                    viewMode === 'board' && (
                        <button
                            onClick={handleAddList}
                            className="btn btn-secondary flex items-center gap-2"
                        >
                            <FiPlus className="w-4 h-4" />
                            Add New List
                        </button>
                    )
                }
            </header >

            {/* Search and Filters */}
            < div className="mb-6" >
                <SearchBar
                    onSearch={setSearchTerm}
                    onFilterToggle={() => setShowFilters(!showFilters)}
                    showFilters={showFilters}
                />

                {
                    showFilters && (
                        <FilterPanel
                            filters={filters}
                            onFilterChange={setFilters}
                            onClearAll={() => setFilters({ priorities: [], lists: [], labels: [] })}
                            lists={lists}
                            labels={labels}
                        />
                    )
                }
            </div >

            {/* Board or Calendar View */}
            <div key={viewMode} className="animate-fade-in-up">
                {
                    viewMode === 'board' ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex gap-6 overflow-x-auto pb-6">
                                {lists.map((list) => (
                                    <KanbanList
                                        key={list.id}
                                        list={list}
                                        cards={getCardsForList(list.id)}
                                        labels={labels}
                                        onAddCard={() => handleAddCard(list.id)}
                                        onCardClick={setSelectedCard}
                                        onUpdateList={handleUpdateList}
                                        onDeleteList={handleDeleteList}
                                    />
                                ))}
                            </div>

                            {/* Drag Overlay */}
                            <DragOverlay>
                                {activeCard ? <KanbanCard card={activeCard} labels={labels} /> : null}
                            </DragOverlay>
                        </DndContext>
                    ) : (
                        <CalendarView
                            cards={getFilteredCards()}
                            onCardClick={setSelectedCard}
                            onAddCard={(date) => handleAddCard(null, date)}
                            onCardMove={async (card, newDate) => {
                                try {
                                    const cardRef = getSharedCardRef(activeBoard.id, card.id);
                                    await updateDoc(cardRef, {
                                        dueDate: newDate.toISOString(),
                                        updatedAt: new Date().toISOString()
                                    });
                                    showToast('Card moved successfully', 'success');
                                } catch (error) {
                                    console.error('Error moving card:', error);
                                    showToast('Failed to move card', 'error');
                                }
                            }}
                        />
                    )
                }
            </div>

            {/* Card Detail Modal */}
            {
                selectedCard && (
                    <CardDetailModal
                        card={selectedCard}
                        labels={labels}
                        onClose={() => setSelectedCard(null)}
                        onUpdate={handleUpdateCard}
                        onDelete={handleDeleteCard}
                    />
                )
            }

            {/* Team Settings Modal */}
            {
                showTeamSettings && (
                    <TeamSettingsModal
                        onClose={() => setShowTeamSettings(false)}
                        onInvite={() => {
                            setShowTeamSettings(false);
                            setShowShareModal(true);
                        }}
                    />
                )
            }

            {/* Share Board Modal */}
            {
                showShareModal && (
                    <ShareBoardModal
                        onClose={() => setShowShareModal(false)}
                    />
                )
            }

            {/* Label Manager Modal */}
            {
                showLabelManager && (
                    <LabelManager
                        labels={labels}
                        onClose={() => setShowLabelManager(false)}
                    />
                )
            }

            {/* Delete Confirmation Modal */}
            {
                deleteConfirm && (
                    <DeleteConfirmModal
                        isOpen={!!deleteConfirm}
                        title={deleteConfirm.title}
                        message={deleteConfirm.message}
                        onConfirm={deleteConfirm.onConfirm}
                        onClose={() => setDeleteConfirm(null)}
                    />
                )
            }

            {/* Toast Notifications */}
            {
                toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )
            }

            {/* Welcome Modal for First-Time Users */}
            {
                showWelcome && (
                    <WelcomeModal
                        onClose={() => {
                            setShowWelcome(false);
                            markTutorialSeen();
                        }}
                    />
                )
            }

            {/* Shortcuts Modal */}
            {
                showShortcuts && (
                    <ShortcutsModal onClose={() => setShowShortcuts(false)} />
                )
            }

            {/* Analysis Modal */}
            {
                showAnalysisModal && (
                    <AnalysisModal
                        analysis={analysisResult}
                        onClose={() => setShowAnalysisModal(false)}
                    />
                )
            }
        </div >
    );
}
