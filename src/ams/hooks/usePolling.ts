import { useEffect, useRef, useCallback } from 'react';

export function usePolling(
    fn: () => void | Promise<void>,
    intervalMs: number,
    active: boolean,
) {
    const fnRef = useRef(fn);
    fnRef.current = fn;

    useEffect(() => {
        if (!active) return;
        const tick = () => fnRef.current();
        const id = setInterval(tick, intervalMs);
        return () => clearInterval(id);
    }, [active, intervalMs]);

    const trigger = useCallback(() => {
        fnRef.current();
    }, []);

    return trigger;
}
