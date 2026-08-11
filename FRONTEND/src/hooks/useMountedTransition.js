import { useEffect, useRef, useState } from 'react';

/**
 * Keeps a conditionally-rendered element mounted for `exitDuration` ms after
 * `isOpen` flips false, so an exit animation class can play before it's
 * actually removed from the DOM instead of vanishing instantly.
 *
 * const shouldRender = useMountedTransition(isOpen, 200);
 * if (!shouldRender) return null;
 * <div className={isOpen ? 'animate-scale-in' : 'animate-scale-out'}>
 */
export default function useMountedTransition(isOpen, exitDuration = 200) {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const timeoutRef = useRef(null);

    useEffect(() => {
        clearTimeout(timeoutRef.current);
        if (isOpen) {
            setShouldRender(true);
        } else {
            timeoutRef.current = setTimeout(() => setShouldRender(false), exitDuration);
        }
        return () => clearTimeout(timeoutRef.current);
    }, [isOpen, exitDuration]);

    return shouldRender;
}
