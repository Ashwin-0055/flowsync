import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { isFirstTimeUser } from '../utils/checkUserData';

const AuthContext = createContext({});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isFirstTime, setIsFirstTime] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Safety timeout to prevent infinite loading
        const timeout = setTimeout(() => {
            console.warn('Auth initialization timeout - proceeding anyway');
            setLoading(false);
        }, 3000);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                setCurrentUser(user);

                if (user) {
                    // Sync user data to Firestore
                    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
                    const { db } = await import('../config/firebase');

                    const userRef = doc(db, 'users', user.uid);
                    await setDoc(userRef, {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || user.email.split('@')[0],
                        photoURL: user.photoURL,
                        lastLogin: serverTimestamp()
                    }, { merge: true });

                    // Check if user has already seen the tutorial
                    const { getDoc } = await import('firebase/firestore');
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists() && userSnap.data().hasSeenTutorial) {
                        setIsFirstTime(false);
                    } else {
                        // Fallback to checking if they have created content (legacy check)
                        const firstTime = await isFirstTimeUser(user.uid);
                        setIsFirstTime(firstTime);
                    }
                } else {
                    setIsFirstTime(false);
                }
            } catch (error) {
                console.error('Error in auth state change:', error);
                // Continue anyway - don't block the app
            } finally {
                clearTimeout(timeout);
                setLoading(false);
            }
        }, (error) => {
            // Error callback
            console.error('Auth state listener error:', error);
            clearTimeout(timeout);
            setLoading(false);
        });

        return () => {
            clearTimeout(timeout);
            unsubscribe();
        };
    }, []);

    const markTutorialSeen = async () => {
        if (!currentUser) return;
        try {
            const { doc, updateDoc } = await import('firebase/firestore');
            const { db } = await import('../config/firebase');
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                hasSeenTutorial: true
            });
            setIsFirstTime(false);
        } catch (error) {
            console.error('Error marking tutorial as seen:', error);
            // Fallback to local state if network fails
            setIsFirstTime(false);
        }
    };

    const value = {
        currentUser,
        isFirstTime,
        loading,
        setIsFirstTime, // Keep for backward compatibility if needed
        markTutorialSeen // New persistent method
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
