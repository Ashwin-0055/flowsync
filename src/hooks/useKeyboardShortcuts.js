import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Ignore if typing in an input or textarea
            if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
                return;
            }

            const key = event.key.toLowerCase();
            const handler = shortcuts[key];

            if (handler) {
                event.preventDefault();
                handler();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
};
