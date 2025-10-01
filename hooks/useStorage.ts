
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredValue();
  }, []);

  const loadStoredValue = async () => {
    try {
      console.log(`Loading stored value for key: ${key}`);
      const item = await AsyncStorage.getItem(key);
      if (item) {
        try {
          const parsedValue = JSON.parse(item);
          console.log(`Loaded ${key}:`, parsedValue);
          setStoredValue(parsedValue);
        } catch (parseError) {
          console.log(`Error parsing stored value for ${key}:`, parseError);
          // If parsing fails, use initial value and clear the corrupted data
          await AsyncStorage.removeItem(key);
          setStoredValue(initialValue);
        }
      } else {
        console.log(`No stored value found for ${key}, using initial value`);
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.log(`Error loading stored value for ${key}:`, error);
      setStoredValue(initialValue);
    } finally {
      setIsLoading(false);
    }
  };

  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      console.log(`Storing value for ${key}:`, valueToStore);
      setStoredValue(valueToStore);
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      console.log(`Successfully stored ${key}`);
    } catch (error) {
      console.log(`Error storing value for ${key}:`, error);
      throw error; // Re-throw to allow calling code to handle the error
    }
  };

  return [storedValue, setValue, isLoading] as const;
}
