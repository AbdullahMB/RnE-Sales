import { useCallback, useSyncExternalStore } from 'react';

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();

function emitChange(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function subscribe(key: string) {
  return (callback: Listener) => {
    let set = listeners.get(key);
    if (!set) {
      set = new Set();
      listeners.set(key, set);
    }
    set.add(callback);
    return () => set!.delete(callback);
  };
}

function getSnapshot(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function getServerSnapshot() {
  return null;
}

export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const subscribeToKey = useCallback((callback: Listener) => subscribe(key)(callback), [key]);
  const getKeySnapshot = useCallback(() => getSnapshot(key), [key]);

  const raw = useSyncExternalStore(subscribeToKey, getKeySnapshot, getServerSnapshot);

  let value: T = initial;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = initial;
    }
  }

  const set = useCallback((v: T | ((prev: T) => T)) => {
    try {
      const rawCurrent = getSnapshot(key);
      const prev: T = rawCurrent !== null ? (JSON.parse(rawCurrent) as T) : initial;
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      localStorage.setItem(key, JSON.stringify(next));
      emitChange(key);
    } catch {}
  }, [key, initial]);

  return [value, set];
}
