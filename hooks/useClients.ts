
import { useState, useCallback } from 'react';
import { Client } from '../types';
import { useStorage } from './useStorage';

export function useClients() {
  const [clients, setClients, isLoading] = useStorage<Client[]>('clients', []);

  const addClient = useCallback(async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setClients(prev => [...prev, newClient]);
    return newClient;
  }, [setClients]);

  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
    await setClients(prev => 
      prev.map(client => 
        client.id === id 
          ? { ...client, ...updates, updatedAt: new Date() }
          : client
      )
    );
  }, [setClients]);

  const deleteClient = useCallback(async (id: string) => {
    await setClients(prev => prev.filter(client => client.id !== id));
  }, [setClients]);

  const getClient = useCallback((id: string) => {
    return clients.find(client => client.id === id);
  }, [clients]);

  return {
    clients,
    addClient,
    updateClient,
    deleteClient,
    getClient,
    isLoading,
  };
}
