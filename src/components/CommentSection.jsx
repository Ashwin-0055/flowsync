import React, { useState, useEffect, useRef } from 'react';
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { FiSend, FiMessageSquare, FiUser } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export default function CommentSection({ boardId, cardId }) {
    const { currentUser } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Fetch comments in real-time
    useEffect(() => {
        if (!boardId || !cardId) return;

        const commentsRef = collection(db, 'boards', boardId, 'cards', cardId, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedComments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComments(fetchedComments);
            setLoading(false);
            scrollToBottom();
        });

        return () => unsubscribe();
    }, [boardId, cardId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;

        try {
            const commentsRef = collection(db, 'boards', boardId, 'cards', cardId, 'comments');
            await addDoc(commentsRef, {
                text: newComment.trim(),
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Anonymous',
                userPhoto: currentUser.photoURL || null,
                createdAt: serverTimestamp()
            });
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    return (
        <div className="mt-6 border-t border-dark-700 pt-6">
            <h3 className="text-sm font-bold text-dark-300 mb-4 flex items-center gap-2">
                <FiMessageSquare className="w-4 h-4" />
                Comments ({comments.length})
            </h3>

            {/* Comments List */}
            <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {loading ? (
                    <p className="text-xs text-dark-500 text-center py-4">Loading comments...</p>
                ) : comments.length === 0 ? (
                    <p className="text-xs text-dark-500 text-center py-4 italic">No comments yet. Be the first!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 group">
                            <div className="shrink-0 mt-1">
                                {comment.userPhoto ? (
                                    <img
                                        src={comment.userPhoto}
                                        alt={comment.userName}
                                        className="w-8 h-8 rounded-full object-cover border border-dark-600"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center border border-dark-600">
                                        <FiUser className="w-4 h-4 text-dark-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="text-sm font-semibold text-dark-100">
                                        {comment.userName}
                                    </span>
                                    <span className="text-[10px] text-dark-500">
                                        {comment.createdAt?.toDate ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                    </span>
                                </div>
                                <div className="bg-dark-800/50 p-3 rounded-lg rounded-tl-none border border-dark-700/50 text-sm text-dark-200 group-hover:border-dark-600 transition-colors">
                                    {comment.text}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendComment} className="relative">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full bg-dark-800 border border-dark-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
                <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-500 hover:bg-primary-500/10 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                >
                    <FiSend className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
