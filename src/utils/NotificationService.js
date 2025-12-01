import { addDoc, serverTimestamp } from 'firebase/firestore';
import { getUserNotificationsCollection } from './dbPaths';

/**
 * Send a board invitation notification to a user
 * @param {string} recipientUserId - ID of the user to invite
 * @param {object} board - The board object { id, title }
 * @param {object} inviter - The inviter object { uid, displayName, email }
 */
export const sendInviteNotification = async (recipientUserId, board, inviter) => {
    try {
        const notificationsRef = getUserNotificationsCollection(recipientUserId);
        await addDoc(notificationsRef, {
            type: 'board_invite',
            title: 'Board Invitation',
            message: `${inviter.displayName || inviter.email} invited you to join "${board.title}"`,
            data: {
                boardId: board.id,
                boardTitle: board.title,
                inviterId: inviter.uid,
                inviterName: inviter.displayName || inviter.email
            },
            read: false,
            status: 'pending',
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error sending invite notification:', error);
        throw error;
    }
};

/**
 * Send a task assignment notification to a user
 * @param {string} recipientUserId - ID of the user assigned
 * @param {object} card - The card object { id, title, listId }
 * @param {object} board - The board object { id, title }
 * @param {object} assigner - The assigner object { uid, displayName }
 */
export const sendAssignmentNotification = async (recipientUserId, card, board, assigner) => {
    try {
        const notificationsRef = getUserNotificationsCollection(recipientUserId);
        await addDoc(notificationsRef, {
            type: 'task_assignment',
            title: 'New Task Assignment',
            message: `${assigner.displayName || 'Someone'} assigned you to "${card.title}"`,
            data: {
                boardId: board.id,
                boardTitle: board.title,
                cardId: card.id,
                cardTitle: card.title,
                assignerId: assigner.uid,
                assignerName: assigner.displayName
            },
            read: false,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error sending assignment notification:', error);
        // Don't throw for assignments, just log it (non-critical)
    }
};
