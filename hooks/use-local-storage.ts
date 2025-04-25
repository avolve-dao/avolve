'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State to store our value
  // Initialize with initialValue to avoid hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  // Initialize state on first render, but only in the browser
  useEffect(() => {
    if (!isBrowser) return;

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      setStoredValue(item ? JSON.parse(item) : initialValue);
    } catch (error) {
      // If error also return initialValue
      console.error(error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue, isBrowser]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);

      // Save to local storage only if in browser environment
      if (isBrowser) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
