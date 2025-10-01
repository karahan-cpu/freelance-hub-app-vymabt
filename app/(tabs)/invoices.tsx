
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useInvoices } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';

export default function InvoicesScreen() {
  const { invoices, markAsPaid, deleteInvoice } = useInvoices();
  const { clients } = useClients();
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all');

  const getFilteredInvoices = () => {
    let filtered = invoices;
    
    if (filter === 'overdue') {
      filtered = invoices.filter(inv => 
        inv.status !== 'paid' && new Date(inv.dueDate) < new Date()
      );
    } else if (filter !== 'all') {
      filtered = invoices.filter(inv => inv.status === filter);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getStatusColor = (status: string, dueDate: Date) => {
    if (status === 'paid') return colors.success;
    if (status === 'overdue' || (status !== 'paid' && new Date(dueDate) < new Date())) return colors.danger;
    if (status === 'sent') return colors.warning;
    return colors.textSecondary;
  };

  const getStatusText = (status: string, dueDate: Date) => {
    if (status === 'paid') return 'Paid';
    if (status !== 'paid' && new Date(dueDate) < new Date()) return 'Overdue';
    if (status === 'sent') return 'Sent';
    if (status === 'draft') return 'Draft';
    return status;
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    Alert.alert(
      'Mark as Paid',
      'Are you sure you want to mark this invoice as paid?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Mark Paid', 
          onPress: () => markAsPaid(invoiceId)
        }
      ]
    );
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    Alert.alert(
      'Delete Invoice',
      'Are you sure you want to delete this invoice?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteInvoice(invoiceId)
        }
      ]
    );
  };

  const filteredInvoices = getFilteredInvoices();

  const FilterButton = ({ value, label }: { value: typeof filter, label: string }) => (
    <Pressable
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive
      ]}
      onPress={() => setFilter(value)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === value && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </Pressable>
  );

  const InvoiceCard = ({ invoice }: { invoice: any }) => {
    const client = clients.find(c => c.id === invoice.clientId);
    const statusColor = getStatusColor(invoice.status, invoice.dueDate);
    const statusText = getStatusText(invoice.status, invoice.dueDate);

    return (
      <Pressable 
        style={[commonStyles.card, { borderLeftWidth: 4, borderLeftColor: statusColor }]}
        onPress={() => router.push(`/invoices/${invoice.id}`)}
      >
        <View style={commonStyles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
            <Text style={commonStyles.textSecondary}>{client?.name}</Text>
            <Text style={commonStyles.textSecondary}>
              Due: {new Date(invoice.dueDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.invoiceStats}>
            <Text style={styles.invoiceAmount}>${invoice.total.toFixed(2)}</Text>
            <Text style={[styles.invoiceStatus, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
        </View>

        {invoice.status !== 'paid' && (
          <View style={[commonStyles.row, { marginTop: 12 }]}>
            <Pressable 
              style={styles.actionButton}
              onPress={() => handleMarkAsPaid(invoice.id)}
            >
              <Text style={styles.actionButtonText}>Mark Paid</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionButton, styles.deleteActionButton]}
              onPress={() => handleDeleteInvoice(invoice.id)}
            >
              <IconSymbol name="trash" color={colors.danger} size={16} />
            </Pressable>
          </View>
        )}
      </Pressable>
    );
  };

  const totalStats = {
    outstanding: invoices
      .filter(inv => inv.status !== 'paid')
      .reduce((sum, inv) => sum + inv.total, 0),
    paid: invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0),
    overdue: invoices
      .filter(inv => inv.status !== 'paid' && new Date(inv.dueDate) < new Date())
      .length,
  };

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.content}>
        <View style={styles.header}>
          <Text style={commonStyles.title}>Invoices</Text>
          <Pressable 
            style={styles.addButton}
            onPress={() => router.push('/invoices/add')}
          >
            <IconSymbol name="plus" color="#ffffff" size={20} />
          </Pressable>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${totalStats.outstanding.toFixed(0)}</Text>
            <Text style={commonStyles.textSecondary}>Outstanding</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              ${totalStats.paid.toFixed(0)}
            </Text>
            <Text style={commonStyles.textSecondary}>Paid</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.danger }]}>
              {totalStats.overdue}
            </Text>
            <Text style={commonStyles.textSecondary}>Overdue</Text>
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          <FilterButton value="all" label="All" />
          <FilterButton value="draft" label="Draft" />
          <FilterButton value="sent" label="Sent" />
          <FilterButton value="overdue" label="Overdue" />
          <FilterButton value="paid" label="Paid" />
        </ScrollView>

        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredInvoices.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="doc.text" color={colors.textSecondary} size={48} />
              <Text style={styles.emptyTitle}>No Invoices Yet</Text>
              <Text style={commonStyles.textSecondary}>
                Create your first invoice to start billing clients
              </Text>
              <Pressable 
                style={[commonStyles.button, { marginTop: 16 }]}
                onPress={() => router.push('/invoices/add')}
              >
                <Text style={commonStyles.buttonText}>Create Invoice</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ paddingBottom: 20 }}>
              {filteredInvoices.map(invoice => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  invoiceStats: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  invoiceStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteActionButton: {
    backgroundColor: 'transparent',
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
});
