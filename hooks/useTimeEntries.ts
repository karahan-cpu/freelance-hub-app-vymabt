
import { useState, useCallback } from 'react';
import { TimeEntry } from '../types';
import { useStorage } from './useStorage';

export function useTimeEntries() {
  const [timeEntries, setTimeEntries, isLoading] = useStorage<TimeEntry[]>('timeEntries', []);

  const addTimeEntry = useCallback(async (entryData: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: TimeEntry = {
      ...entryData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setTimeEntries(prev => [...prev, newEntry]);
    return newEntry;
  }, [setTimeEntries]);

  const updateTimeEntry = useCallback(async (id: string, updates: Partial<TimeEntry>) => {
    await setTimeEntries(prev => 
      prev.map(entry => 
        entry.id === id 
          ? { ...entry, ...updates, updatedAt: new Date() }
          : entry
      )
    );
  }, [setTimeEntries]);

  const deleteTimeEntry = useCallback(async (id: string) => {
    await setTimeEntries(prev => prev.filter(entry => entry.id !== id));
  }, [setTimeEntries]);

  const startTimer = useCallback(async (projectId: string, clientId: string, description: string, hourlyRate: number) => {
    // Stop any running timers first
    await setTimeEntries(prev => 
      prev.map(entry => 
        entry.isRunning 
          ? { 
              ...entry, 
              isRunning: false, 
              endTime: new Date(),
              duration: Math.floor((new Date().getTime() - entry.startTime.getTime()) / 60000),
              updatedAt: new Date()
            }
          : entry
      )
    );

    // Start new timer
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      projectId,
      clientId,
      description,
      startTime: new Date(),
      duration: 0,
      hourlyRate,
      isRunning: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setTimeEntries(prev => [...prev, newEntry]);
    return newEntry;
  }, [setTimeEntries]);

  const stopTimer = useCallback(async (id: string) => {
    await setTimeEntries(prev => 
      prev.map(entry => 
        entry.id === id && entry.isRunning
          ? { 
              ...entry, 
              isRunning: false, 
              endTime: new Date(),
              duration: Math.floor((new Date().getTime() - entry.startTime.getTime()) / 60000),
              updatedAt: new Date()
            }
          : entry
      )
    );
  }, [setTimeEntries]);

  const getRunningTimer = useCallback(() => {
    return timeEntries.find(entry => entry.isRunning);
  }, [timeEntries]);

  const getEntriesByProject = useCallback((projectId: string) => {
    return timeEntries.filter(entry => entry.projectId === projectId);
  }, [timeEntries]);

  const getEntriesByClient = useCallback((clientId: string) => {
    return timeEntries.filter(entry => entry.clientId === clientId);
  }, [timeEntries]);

  return {
    timeEntries,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    startTimer,
    stopTimer,
    getRunningTimer,
    getEntriesByProject,
    getEntriesByClient,
    isLoading,
  };
}
