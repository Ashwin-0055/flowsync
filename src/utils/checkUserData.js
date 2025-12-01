import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Check if user has any existing data (cards) in Firestore
 * @param {string} userId - The user's Firebase Auth UID
 * @returns {Promise<boolean>} - True if user is first-time (no data), false if returning user
 */
export async function isFirstTimeUser(userId) {
    if (!userId) return true;

    try {
        // Query for any cards created by this user
        const cardsQuery = query(
            collection(db, 'cards'),
            where('createdBy', '==', userId)
        );

        const snapshot = await getDocs(cardsQuery);

        // If no cards exist, user is first-time
        return snapshot.empty;
    } catch (error) {
        console.error('Error checking user data:', error);
        // On error, assume returning user to avoid showing tutorial unnecessarily
        return false;
    }
}
