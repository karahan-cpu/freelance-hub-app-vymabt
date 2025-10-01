
import { useState, useCallback } from 'react';
import { Invoice } from '../types';
import { useStorage } from './useStorage';

export function useInvoices() {
  const [invoices, setInvoices, isLoading] = useStorage<Invoice[]>('invoices', []);

  const addInvoice = useCallback(async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('Adding invoice with data:', invoiceData);
      
      const newInvoice: Invoice = {
        ...invoiceData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      console.log('Created new invoice object:', newInvoice);
      
      await setInvoices(prev => {
        const updated = [...prev, newInvoice];
        console.log('Updated invoices array:', updated);
        return updated;
      });
      
      console.log('Invoice added successfully');
      return newInvoice;
    } catch (error) {
      console.log('Error in addInvoice:', error);
      throw error;
    }
  }, [setInvoices]);

  const updateInvoice = useCallback(async (id: string, updates: Partial<Invoice>) => {
    try {
      console.log(`Updating invoice ${id} with:`, updates);
      
      await setInvoices(prev => 
        prev.map(invoice => 
          invoice.id === id 
            ? { ...invoice, ...updates, updatedAt: new Date() }
            : invoice
        )
      );
      
      console.log('Invoice updated successfully');
    } catch (error) {
      console.log('Error in updateInvoice:', error);
      throw error;
    }
  }, [setInvoices]);

  const deleteInvoice = useCallback(async (id: string) => {
    try {
      console.log(`Deleting invoice ${id}`);
      
      await setInvoices(prev => prev.filter(invoice => invoice.id !== id));
      
      console.log('Invoice deleted successfully');
    } catch (error) {
      console.log('Error in deleteInvoice:', error);
      throw error;
    }
  }, [setInvoices]);

  const getInvoice = useCallback((id: string) => {
    const invoice = invoices.find(invoice => invoice.id === id);
    console.log(`Getting invoice ${id}:`, invoice);
    return invoice;
  }, [invoices]);

  const getInvoicesByClient = useCallback((clientId: string) => {
    const clientInvoices = invoices.filter(invoice => invoice.clientId === clientId);
    console.log(`Getting invoices for client ${clientId}:`, clientInvoices);
    return clientInvoices;
  }, [invoices]);

  const markAsPaid = useCallback(async (id: string) => {
    try {
      console.log(`Marking invoice ${id} as paid`);
      
      await updateInvoice(id, { 
        status: 'paid', 
        paidDate: new Date() 
      });
      
      console.log('Invoice marked as paid successfully');
    } catch (error) {
      console.log('Error in markAsPaid:', error);
      throw error;
    }
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
