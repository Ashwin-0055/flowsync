import { useState, useEffect, useRef } from 'react';
import { FiBell, FiCheck, FiX, FiInfo } from 'react-icons/fi';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { getUserNotificationsCollection } from '../utils/dbPaths';

export default function NotificationCenter() {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [showToast, setShowToast] = useState(false);
    const [latestNotification, setLatestNotification] = useState(null);
    const previousCountRef = useRef(0);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Listen for notifications
    useEffect(() => {
        if (!currentUser) return;

        const notificationsRef = getUserNotificationsCollection(currentUser.uid);
        const q = query(notificationsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(notifs);

            const newUnreadCount = notifs.filter(n => !n.read).length;
            setUnreadCount(newUnreadCount);

            // Check for new notifications to show toast
            // If count increased and we have notifications
            if (newUnreadCount > previousCountRef.current && notifs.length > 0) {
                const newest = notifs[0];
                // Only show toast for unread notifications created recently (to avoid toast storm on load)
                // For simplicity, we just check if it's unread and we detected a count increase
                if (!newest.read) {
                    setLatestNotification(newest);
                    setShowToast(true);
                    // Auto hide after 5 seconds
                    setTimeout(() => setShowToast(false), 5000);
                }
            }
            previousCountRef.current = newUnreadCount;
        });

        return () => unsubscribe();
    }, [currentUser]);

    const markAsRead = async (notificationId) => {
        if (!currentUser) return;
        try {
            const notifRef = doc(db, 'users', currentUser.uid, 'notifications', notificationId);
            await updateDoc(notifRef, { read: true });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleAcceptInvite = async (notification) => {
        if (!currentUser) return;
        try {
            // 1. Add user to board members
            const boardRef = doc(db, 'boards', notification.data.boardId);
            await updateDoc(boardRef, {
                members: arrayUnion(currentUser.uid)
            });

            // 2. Update notification status
            const notifRef = doc(db, 'users', currentUser.uid, 'notifications', notification.id);
            await updateDoc(notifRef, {
                status: 'accepted',
                read: true,
                message: `You joined "${notification.data.boardTitle}"`
            });

        } catch (error) {
            console.error('Error accepting invite:', error);
            alert('Failed to join board. It may no longer exist.');
        }
    };

    const handleDeclineInvite = async (notification) => {
        if (!currentUser) return;
        try {
            // Update notification status
            const notifRef = doc(db, 'users', currentUser.uid, 'notifications', notification.id);
            await updateDoc(notifRef, {
                status: 'declined',
                read: true,
                message: `You declined the invitation to "${notification.data.boardTitle}"`
            });
        } catch (error) {
            console.error('Error declining invite:', error);
        }
    };

    const deleteNotification = async (notificationId, e) => {
        e.stopPropagation();
        if (!currentUser) return;
        try {
            const notifRef = doc(db, 'users', currentUser.uid, 'notifications', notificationId);
            await deleteDoc(notifRef);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-ghost relative p-2"
                title="Notifications"
            >
                <FiBell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-dark-900"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl z-50 animate-fade-in origin-top-right">
                    <div className="p-4 border-b border-dark-700 flex justify-between items-center">
                        <h3 className="font-bold text-dark-50">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-dark-400">
                                <FiBell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-dark-700">
                                {notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 hover:bg-dark-700/50 transition-colors ${!notif.read ? 'bg-dark-700/20' : ''}`}
                                        onClick={() => !notif.read && markAsRead(notif.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${notif.type === 'board_invite' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {notif.type === 'board_invite' ? <FiCheck className="w-4 h-4" /> : <FiInfo className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-dark-100">{notif.title}</p>
                                                <p className="text-sm text-dark-300 mt-0.5">{notif.message}</p>
                                                <p className="text-xs text-dark-500 mt-1">
                                                    {notif.createdAt?.toDate().toLocaleDateString()}
                                                </p>

                                                {/* Invite Actions */}
                                                {notif.type === 'board_invite' && notif.status === 'pending' && (
                                                    <div className="flex gap-2 mt-3">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleAcceptInvite(notif); }}
                                                            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                                                        >
                                                            <FiCheck className="w-3 h-3" /> Accept
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeclineInvite(notif); }}
                                                            className="px-3 py-1.5 bg-dark-600 hover:bg-dark-500 text-dark-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                                                        >
                                                            <FiX className="w-3 h-3" /> Decline
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => deleteNotification(notif.id, e)}
                                                className="text-dark-500 hover:text-red-400 self-start p-1"
                                                title="Delete"
                                            >
                                                <FiX className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && latestNotification && (
                <div className="fixed bottom-4 right-4 z-50 bg-dark-800 border border-dark-700 p-4 rounded-xl shadow-2xl animate-slide-up flex items-start gap-3 max-w-sm">
                    <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${latestNotification.type === 'board_invite' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {latestNotification.type === 'board_invite' ? <FiCheck className="w-4 h-4" /> : <FiInfo className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-dark-100">{latestNotification.title}</h4>
                        <p className="text-sm text-dark-300 mt-1">{latestNotification.message}</p>
                    </div>
                    <button onClick={() => setShowToast(false)} className="text-dark-400 hover:text-dark-200">
                        <FiX className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
