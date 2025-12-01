import { createContext, useContext, useState, useEffect } from 'react';
import {
    collection,
    doc,
    getDoc,
    updateDoc,
    arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { useBoard } from './BoardContext';

const TeamContext = createContext({});

export function useTeam() {
    return useContext(TeamContext);
}

export function TeamProvider({ children }) {
    const { currentUser } = useAuth();
    const { activeBoard } = useBoard();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!activeBoard || !activeBoard.members) {
            setMembers([]);
            setLoading(false);
            return;
        }

        const fetchMembers = async () => {
            setLoading(true);
            try {
                const memberPromises = activeBoard.members.map(async (uid) => {
                    const userDoc = await getDoc(doc(db, 'users', uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        return {
                            id: uid,
                            name: userData.displayName || userData.email.split('@')[0],
                            email: userData.email,
                            role: uid === activeBoard.ownerId ? 'Owner' : 'Member',
                            avatar: userData.photoURL,
                            isCurrentUser: uid === currentUser?.uid
                        };
                    }
                    return null;
                });

                const fetchedMembers = await Promise.all(memberPromises);
                setMembers(fetchedMembers.filter(m => m !== null));
            } catch (error) {
                console.error('Error fetching board members:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [activeBoard, currentUser]);

    const removeMember = async (memberId) => {
        if (!activeBoard || !currentUser) return;

        // Only owner can remove members (unless leaving self)
        if (activeBoard.ownerId !== currentUser.uid && memberId !== currentUser.uid) {
            throw new Error('Only the board owner can remove members.');
        }

        try {
            const boardRef = doc(db, 'boards', activeBoard.id);
            await updateDoc(boardRef, {
                members: arrayRemove(memberId)
            });
            // The activeBoard update will trigger the useEffect to refresh members
        } catch (error) {
            console.error('Error removing team member:', error);
            throw error;
        }
    };

    // Add member is now handled by ShareBoardModal, but we keep the interface clean
    const addMember = async () => {
        console.warn('Use ShareBoardModal to add members');
    };

    const value = {
        members,
        loading,
        addMember,
        removeMember
    };

    return (
        <TeamContext.Provider value={value}>
            {children}
        </TeamContext.Provider>
    );
}
