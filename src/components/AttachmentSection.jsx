import React, { useState, useEffect, useRef } from 'react';
import {
    collection,
    addDoc,
    deleteDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc
} from 'firebase/firestore';
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { FiPaperclip, FiTrash2, FiDownload, FiFile, FiImage, FiLoader, FiX } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export default function AttachmentSection({ boardId, cardId }) {
    const { currentUser } = useAuth();
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    // Fetch attachments in real-time
    useEffect(() => {
        if (!boardId || !cardId) return;

        const attachmentsRef = collection(db, 'boards', boardId, 'cards', cardId, 'attachments');
        const q = query(attachmentsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedAttachments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAttachments(fetchedAttachments);
        });

        return () => unsubscribe();
    }, [boardId, cardId]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB limit');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            // Create storage ref
            const storagePath = `boards/${boardId}/cards/${cardId}/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, storagePath);

            // Upload file
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error('Upload error:', error);
                    alert('Failed to upload file');
                    setUploading(false);
                },
                async () => {
                    // Upload completed successfully
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    // Save metadata to Firestore
                    const attachmentsRef = collection(db, 'boards', boardId, 'cards', cardId, 'attachments');
                    await addDoc(attachmentsRef, {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        url: downloadURL,
                        storagePath: storagePath,
                        uploadedBy: currentUser.uid,
                        uploaderName: currentUser.displayName || 'Anonymous',
                        createdAt: serverTimestamp()
                    });

                    setUploading(false);
                    setUploadProgress(0);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            );

        } catch (error) {
            console.error('Error initiating upload:', error);
            setUploading(false);
        }
    };

    const handleDelete = async (attachment) => {
        if (!window.confirm(`Delete "${attachment.name}"?`)) return;

        try {
            // Delete from Storage
            const storageRef = ref(storage, attachment.storagePath);
            await deleteObject(storageRef);

            // Delete from Firestore
            await deleteDoc(doc(db, 'boards', boardId, 'cards', cardId, 'attachments', attachment.id));

        } catch (error) {
            console.error('Error deleting attachment:', error);
            alert('Failed to delete attachment');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return <FiImage className="w-5 h-5 text-purple-400" />;
        return <FiFile className="w-5 h-5 text-blue-400" />;
    };

    return (
        <div className="mt-6 border-t border-dark-700 pt-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-dark-300 flex items-center gap-2">
                    <FiPaperclip className="w-4 h-4" />
                    Attachments ({attachments.length})
                </h3>

                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
                        className={`
                            px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-2
                            ${uploading
                                ? 'bg-dark-700 text-dark-400 cursor-not-allowed'
                                : 'bg-dark-800 text-dark-200 hover:text-white hover:bg-dark-700 border border-dark-700'}
                        `}
                    >
                        {uploading ? (
                            <>
                                <FiLoader className="w-3 h-3 spinner" />
                                {Math.round(uploadProgress)}%
                            </>
                        ) : (
                            <>
                                <FiPlus className="w-3 h-3" />
                                Add File
                            </>
                        )}
                    </label>
                </div>
            </div>

            {/* Attachments List */}
            <div className="space-y-2">
                {attachments.length === 0 && !uploading && (
                    <p className="text-xs text-dark-500 text-center py-4 italic">No attachments yet.</p>
                )}

                {attachments.map(attachment => (
                    <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg border border-dark-700/50 group hover:border-dark-600 transition-colors"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-dark-700 rounded-lg shrink-0">
                                {getFileIcon(attachment.type)}
                            </div>
                            <div className="min-w-0">
                                <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-dark-200 hover:text-primary-400 truncate block hover:underline"
                                >
                                    {attachment.name}
                                </a>
                                <div className="text-[10px] text-dark-400 flex items-center gap-2">
                                    <span>{formatFileSize(attachment.size)}</span>
                                    <span>•</span>
                                    <span>{attachment.createdAt?.toDate ? formatDistanceToNow(attachment.createdAt.toDate(), { addSuffix: true }) : 'Just now'}</span>
                                    <span>•</span>
                                    <span>by {attachment.uploaderName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a
                                href={attachment.url}
                                download={attachment.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-700 rounded-md transition-colors"
                                title="Download"
                            >
                                <FiDownload className="w-4 h-4" />
                            </a>
                            <button
                                onClick={() => handleDelete(attachment)}
                                className="p-1.5 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                title="Delete"
                            >
                                <FiTrash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Helper icon for Add File button since I didn't import it in the main block
import { FiPlus } from 'react-icons/fi';
