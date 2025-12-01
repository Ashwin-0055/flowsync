import { db } from './src/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// You need to replace this with your actual User ID from the console or AuthContext
const USER_ID = 'REPLACE_WITH_USER_ID';

async function sendTestNotification() {
    if (USER_ID === 'REPLACE_WITH_USER_ID') {
        console.error('Please set your USER_ID in the script');
        return;
    }

    try {
        await addDoc(collection(db, 'users', USER_ID, 'notifications'), {
            type: 'task_assignment',
            title: 'Test Notification',
            message: 'This is a test notification from the console.',
            data: {
                boardId: 'test-board',
                cardId: 'test-card'
            },
            read: false,
            createdAt: serverTimestamp()
        });
        console.log('Test notification sent!');
    } catch (error) {
        console.error('Error sending test notification:', error);
    }
}

// Expose to window for easy calling
window.sendTestNotification = sendTestNotification;
