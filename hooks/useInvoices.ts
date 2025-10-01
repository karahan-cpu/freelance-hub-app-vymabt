
import { useState, useCallback } from 'react';
import { Invoice } from '../types';
import { useStorage } from './useStorage';

export function useInvoices() {
  const [invoices, setInvoices, isLoading] = useStorage<Invoice[]>('invoices', []);

  const addInvoice = useCallback(async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setInvoices(prev => [...prev, newInvoice]);
    return newInvoice;
  }, [setInvoices]);

  const updateInvoice = useCallback(async (id: string, updates: Partial<Invoice>) => {
    await setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === id 
          ? { ...invoice, ...updates, updatedAt: new Date() }
          : invoice
      )
    );
  }, [setInvoices]);

  const deleteInvoice = useCallback(async (id: string) => {
    await setInvoices(prev => prev.filter(invoice => invoice.id !== id));
  }, [setInvoices]);

  const getInvoice = useCallback((id: string) => {
    return invoices.find(invoice => invoice.id === id);
  }, [invoices]);

  const getInvoicesByClient = useCallback((clientId: string) => {
    return invoices.filter(invoice => invoice.clientId === clientId);
  }, [invoices]);

  const markAsPaid = useCallback(async (id: string) => {
    await updateInvoice(id, { 
      status: 'paid', 
      paidDate: new Date() 
    });
  }, [updateInvoice]);

  return {
    invoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoice,
    getInvoicesByClient,
    markAsPaid,
    isLoading,
  };
}
