import { collection, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Get user-specific database paths
 * CRITICAL: Each user must have their own isolated data space
 */

// Get reference to user's board document
export const getUserBoardRef = (userId) => {
    return doc(db, 'users', userId, 'boards', 'main-board');
};

// Get reference to user's cards collection
export const getUserCardsCollection = (userId) => {
    return collection(db, 'users', userId, 'cards');
};

// Get reference to a specific card
export const getUserCardRef = (userId, cardId) => {
    return doc(db, 'users', userId, 'cards', cardId);
};

// Get reference to user's labels collection
export const getUserLabelsCollection = (userId) => {
    return collection(db, 'users', userId, 'labels');
};

// Get reference to a specific label
export const getUserLabelRef = (userId, labelId) => {
    return doc(db, 'users', userId, 'labels', labelId);
};

// Get reference to user's team members collection
export const getUserTeamCollection = (userId) => {
    return collection(db, 'users', userId, 'team_members');
};

/**
 * Default board structure for new users
 */
export const DEFAULT_BOARD_LISTS = [
    { id: 'list-1', title: 'To Do', wipLimit: 5, index: 0 },
    { id: 'list-2', title: 'In Progress', wipLimit: 3, index: 1 },
    { id: 'list-3', title: 'Done', wipLimit: null, index: 2 }
];

/**
 * SHARED BOARD PATHS (New Architecture)
 */

// Get reference to a shared board document
export const getSharedBoardRef = (boardId) => {
    return doc(db, 'boards', boardId);
};

// Get reference to a shared board's cards collection
export const getSharedCardsCollection = (boardId) => {
    return collection(db, 'boards', boardId, 'cards');
};

// Get reference to a specific card in a shared board
export const getSharedCardRef = (boardId, cardId) => {
    return doc(db, 'boards', boardId, 'cards', cardId);
};

// Get reference to a shared board's labels collection
export const getSharedLabelsCollection = (boardId) => {
    return collection(db, 'boards', boardId, 'labels');
};

// Get reference to a specific label in a shared board
export const getSharedLabelRef = (boardId, labelId) => {
    return doc(db, 'boards', boardId, 'labels', labelId);
};

// --- Notifications ---
export const getUserNotificationsCollection = (userId) => {
    return collection(db, 'users', userId, 'notifications');
};

export const getUserNotificationRef = (userId, notificationId) => {
    return doc(db, 'users', userId, 'notifications', notificationId);
};

/**
 * Sample cards for new users (optional)
 */
export const SAMPLE_CARDS = [
    {
        title: 'Welcome to FlowSync! 👋',
        description: 'This is your personal Kanban board. Drag cards between lists to organize your work.',
        listId: 'list-1',
        index: 0,
        priority: 'High',
        assigneeId: '',
        labels: []
    },
    {
        title: 'Try the AI Analysis',
        description: 'Click "Analyze Flow" to get AI-powered insights about your board.',
        listId: 'list-1',
        index: 1,
        priority: 'Medium',
        assigneeId: '',
        labels: []
    },
    {
        title: 'Customize Your Labels',
        description: 'Create custom labels to categorize your tasks.',
        listId: 'list-2',
        index: 0,
        priority: 'Low',
        assigneeId: '',
        labels: []
    }
];
