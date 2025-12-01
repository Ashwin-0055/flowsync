/**
 * Mock user profiles for assignee feature
 */
export const mockUsers = [
    {
        id: 'user-1',
        name: 'Alice (Admin)',
        email: 'alice@flowsync.io',
        avatar: '👩‍💼',
        color: '#3b82f6'
    },
    {
        id: 'user-2',
        name: 'Bob (Dev)',
        email: 'bob@flowsync.io',
        avatar: '👨‍💻',
        color: '#10b981'
    },
    {
        id: 'user-3',
        name: 'Carol (Designer)',
        email: 'carol@flowsync.io',
        avatar: '👩‍🎨',
        color: '#f59e0b'
    },
    {
        id: 'user-4',
        name: 'David (QA)',
        email: 'david@flowsync.io',
        avatar: '👨‍🔬',
        color: '#8b5cf6'
    },
    {
        id: 'user-5',
        name: 'Eve (PM)',
        email: 'eve@flowsync.io',
        avatar: '👩‍💼',
        color: '#ec4899'
    }
];

/**
 * Get user display name from user ID
 * @param {string} userId - The user ID
 * @returns {string} - The user's display name or "Unassigned"
 */
export function getUserDisplayName(userId) {
    if (!userId) return 'Unassigned';

    const user = mockUsers.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
}

/**
 * Get user object from user ID
 * @param {string} userId - The user ID
 * @returns {object|null} - The user object or null
 */
export function getUserById(userId) {
    return mockUsers.find(u => u.id === userId) || null;
}

/**
 * Get all users
 * @returns {Array} - Array of all user objects
 */
export function getAllUsers() {
    return mockUsers;
}
