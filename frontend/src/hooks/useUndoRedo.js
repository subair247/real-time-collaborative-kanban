import { useState, useCallback } from 'react';

export const useUndoRedo = () => {
    const [past, setPast] = useState([]);
    const [future, setFuture] = useState([]);

    const recordAction = useCallback((action) => {
        setPast((prev) => [...prev, action]);
        setFuture([]);
    }, []);

    const undo = useCallback(async () => {
        if (past.length === 0) return;

        const previousAction = past[past.length - 1];
        setPast((prev) => prev.slice(0, prev.length - 1));
        setFuture((prev) => [previousAction, ...prev]);

        try {
            await previousAction.undo();
        } catch (err) {
            console.error('Failed to undo action:', err);
        }
    }, [past]);

    const redo = useCallback(async () => {
        if (future.length === 0) return;

        const nextAction = future[0];
        setFuture((prev) => prev.slice(1));
        setPast((prev) => [...prev, nextAction]);

        try {
            await nextAction.redo();
        } catch (err) {
            console.error('Failed to redo action:', err);
        }
    }, [future]);

    return {
        canUndo: past.length > 0,
        canRedo: future.length > 0,
        recordAction,
        undo,
        redo,
    };
};