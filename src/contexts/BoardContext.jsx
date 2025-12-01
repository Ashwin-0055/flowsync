import { createContext, useContext, useState, useEffect } from 'react';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp,
    writeBatch,
    onSnapshot,
    orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import {
    getUserBoardRef,
    getUserCardsCollection,
    getSharedBoardRef,
    getSharedCardsCollection,
    getSharedLabelsCollection,
    DEFAULT_BOARD_LISTS
} from '../utils/dbPaths';

const BoardContext = createContext({});

export function useBoard() {
    return useContext(BoardContext);
}

export function BoardProvider({ children }) {
    const { currentUser } = useAuth();
    const [activeBoard, setActiveBoard] = useState(null);
    const [lists, setLists] = useState([]);
    const [cards, setCards] = useState([]);
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            setActiveBoard(null);
            setLists([]);
            setCards([]);
            setLabels([]);
            setLoading(false);
            return;
        }

        loadUserBoard();
    }, [currentUser]);

    // Real-time sync listeners
    useEffect(() => {
        if (!activeBoard?.id) return;

        const boardId = activeBoard.id;

        // 1. Sync Board & Lists
        const boardRef = getSharedBoardRef(boardId);
        const unsubBoard = onSnapshot(boardRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setActiveBoard(prev => ({ ...prev, ...data }));
                setLists(data.lists || []);
            }
        }, (err) => {
            console.error("Error syncing board:", err);
            setError(err.message);
        });

        // 2. Sync Cards
        const cardsRef = getSharedCardsCollection(boardId);
        // const qCards = query(cardsRef, orderBy('index', 'asc')); // Optional: sort by index
        const unsubCards = onSnapshot(cardsRef, (snapshot) => {
            const cardsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Client-side sort to ensure index order
            cardsData.sort((a, b) => a.index - b.index);
            setCards(cardsData);
        }, (err) => {
            console.error("Error syncing cards:", err);
        });

        // 3. Sync Labels
        const labelsRef = getSharedLabelsCollection(boardId);
        const unsubLabels = onSnapshot(labelsRef, (snapshot) => {
            const labelsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setLabels(labelsData);
        }, (err) => {
            console.error("Error syncing labels:", err);
        });

        return () => {
            unsubBoard();
            unsubCards();
            unsubLabels();
        };
    }, [activeBoard?.id]);

    const loadUserBoard = async () => {
        setLoading(true);
        try {
            // 1. Check if user has any shared boards (where they are a member)
            const boardsRef = collection(db, 'boards');
            const q = query(boardsRef, where('members', 'array-contains', currentUser.uid));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                // User has boards, load the first one (for now)
                const boardDoc = snapshot.docs[0];
                const boardData = { id: boardDoc.id, ...boardDoc.data() };
                setActiveBoard(boardData);
                // Lists will be loaded by the onSnapshot listener
            } else {
                // 2. No shared boards found. Check for private board to migrate.
                await migratePrivateBoard();
            }
        } catch (err) {
            console.error('Error loading board:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const migratePrivateBoard = async () => {
        try {
            console.log('Starting board migration...');

            // Get private board data
            const privateBoardRef = getUserBoardRef(currentUser.uid);
            const privateBoardSnap = await getDoc(privateBoardRef);

            let initialLists = DEFAULT_BOARD_LISTS;
            if (privateBoardSnap.exists()) {
                initialLists = privateBoardSnap.data().lists || DEFAULT_BOARD_LISTS;
            }

            // Create new shared board
            const newBoardData = {
                title: 'My Board',
                ownerId: currentUser.uid,
                members: [currentUser.uid],
                lists: initialLists,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const boardDocRef = await addDoc(collection(db, 'boards'), newBoardData);
            const newBoardId = boardDocRef.id;

            // Migrate cards
            const privateCardsRef = getUserCardsCollection(currentUser.uid);
            const privateCardsSnap = await getDocs(privateCardsRef);

            if (!privateCardsSnap.empty) {
                const batch = writeBatch(db);
                const sharedCardsRef = getSharedCardsCollection(newBoardId);

                privateCardsSnap.docs.forEach(doc => {
                    const cardData = doc.data();
                    const newCardRef = doc(sharedCardsRef); // Auto-ID
                    batch.set(newCardRef, {
                        ...cardData,
                        boardId: newBoardId, // Add boardId reference
                        migratedFrom: doc.id
                    });
                });

                await batch.commit();
            }

            console.log('Migration complete. New board ID:', newBoardId);
            setActiveBoard({ id: newBoardId, ...newBoardData });

        } catch (err) {
            console.error('Migration failed:', err);
            setError('Failed to migrate board data.');
        }
    };

    const value = {
        activeBoard,
        lists,
        setLists,
        cards,
        setCards,
        labels,
        setLabels,
        loading,
        error,
        refreshBoard: loadUserBoard
    };

    return (
        <BoardContext.Provider value={value}>
            {children}
        </BoardContext.Provider>
    );
}
