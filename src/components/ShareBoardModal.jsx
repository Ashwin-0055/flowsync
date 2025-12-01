import { useState } from 'react';
import { FiX, FiUserPlus, FiMail, FiCheck, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { collection, query, where, getDocs, updateDoc, arrayUnion, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useBoard } from '../contexts/BoardContext';

export default function ShareBoardModal({ onClose }) {
    const { activeBoard } = useBoard();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setStatus('loading');
        setMessage('');

        try {
            // 1. Find user by email
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', email.trim()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setStatus('error');
                setMessage('User not found. Ask them to sign in to FlowSync first.');
                return;
            }

            const userToAdd = querySnapshot.docs[0].data();

            // 2. Check if already a member
            if (activeBoard.members.includes(userToAdd.uid)) {
                setStatus('error');
                setMessage('User is already a member of this board.');
                return;
            }

            // 3. Send Invite Notification
            const { sendInviteNotification } = await import('../utils/NotificationService');
            const { useAuth } = await import('../contexts/AuthContext'); // Need current user info
            // Note: We can't use hooks inside this async function, so we'll need to pass currentUser prop or get it from auth
            const { auth } = await import('../config/firebase');
            const currentUser = auth.currentUser;

            await sendInviteNotification(
                userToAdd.uid,
                { id: activeBoard.id, title: activeBoard.title },
                { uid: currentUser.uid, displayName: currentUser.displayName, email: currentUser.email }
            );

            setStatus('success');
            setMessage(`Invitation sent to ${userToAdd.displayName || email}!`);
            setEmail('');

            // Close after delay
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (error) {
            console.error('Error inviting user:', error);
            setStatus('error');
            setMessage('Failed to send invitation. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
            <div className="glass rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-dark-50 flex items-center gap-2">
                        <FiUserPlus className="w-5 h-5 text-primary-500" />
                        Share Board
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-dark-400 hover:text-dark-100 transition-colors"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div>
                    <p className="text-dark-300 mb-6">
                        Invite team members to collaborate on <strong>{activeBoard?.title}</strong>.
                    </p>

                    <form onSubmit={handleInvite} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="colleague@example.com"
                                    className="input pl-10"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Status Messages */}
                        {status === 'error' && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
                                <FiAlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-300">{message}</p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-start gap-3">
                                <FiCheck className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-green-300">{message}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className="btn btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {status === 'loading' ? (
                                <>
                                    <FiLoader className="w-5 h-5 spinner" />
                                    Sending Invite...
                                </>
                            ) : status === 'success' ? (
                                <>
                                    <FiCheck className="w-5 h-5" />
                                    Invited!
                                </>
                            ) : (
                                <>
                                    <FiUserPlus className="w-5 h-5" />
                                    Invite Member
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
