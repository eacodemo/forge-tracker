import { useRef, useCallback } from "react";

interface UndoEntry {
  undo: () => void;
  timestamp: number;
}

export function useUndo(graceMs = 10000) {
  const stackRef = useRef<UndoEntry[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const push = useCallback((undoFn: () => void) => {
    stackRef.current = [{ undo: undoFn, timestamp: Date.now() }];
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { stackRef.current = []; }, graceMs);
  }, [graceMs]);

  const undo = useCallback(() => {
    const entry = stackRef.current.pop();
    if (entry) { entry.undo(); stackRef.current = []; if (timerRef.current) clearTimeout(timerRef.current); }
  }, []);

  return { push, undo };
}
