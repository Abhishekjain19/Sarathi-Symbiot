
import { useState, useEffect } from "react";

// Generic hook for managing data with offline support
export function useOfflineStorage<T>(key: string, initialValue: T, maxItems?: number): [
  T, 
  (value: T | ((prevValue: T) => T)) => void,
  boolean
] {
  // State to track online status
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  // Get data from localStorage
  const readValue = (): T => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Set data to localStorage and update state
  const setValue = (value: T | ((prevValue: T) => T)) => {
    try {
      // Handle function or direct value
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // If maxItems is specified and value is an array, limit the number of items
      let limitedValue = valueToStore;
      if (Array.isArray(valueToStore) && maxItems && valueToStore.length > maxItems) {
        limitedValue = valueToStore.slice(-maxItems);
      }
      
      // Save to local state
      setStoredValue(limitedValue);
      
      // Save to localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(limitedValue));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Initialize if not already done
  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [storedValue, setValue, isOnline];
}
