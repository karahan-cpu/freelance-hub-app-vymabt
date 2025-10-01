
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useInvoices } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { useTimeEntries } from '@/hooks/useTimeEntries';

export default function AddInvoiceScreen() {
  const { addInvoice } = useInvoices();
  const { clients } = useClients();
  const { timeEntries } = useTimeEntries();
  
  const [formData, setFormData] = useState({
    clientId: '',
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tax: '0',
    selectedTimeEntries: [] as string[],
  });

  // Check if we have the prerequisites for creating an invoice
  useEffect(() => {
    console.log('Checking invoice prerequisites...');
    console.log('Clients available:', clients.length);
    console.log('Time entries available:', timeEntries.length);
    
    if (clients.length === 0) {
      Alert.alert(
        'No Clients Found',
        'You need to create at least one client before creating an invoice. Would you like to create a client now?',
        [
          { text: 'Cancel', onPress: () => router.back() },
          { 
            text: 'Create Client', 
            onPress: () => {
              router.back();
              router.push('/clients/add');
            }
          }
        ]
      );
      return;
    }

    const completedTimeEntries = timeEntries.filter(entry => !entry.isRunning);
    if (completedTimeEntries.length === 0) {
      Alert.alert(
        'No Time Entries Found',
        'You need to have completed time entries to create an invoice. Please track some time first.',
        [
          { text: 'Cancel', onPress: () => router.back() },
          { 
            text: 'Track Time', 
            onPress: () => {
              router.back();
              router.push('/(tabs)/time');
            }
          }
        ]
      );
      return;
    }
  }, [clients.length, timeEntries.length]);

  const selectedClient = clients.find(c => c.id === formData.clientId);
  const availableTimeEntries = timeEntries.filter(entry => 
    entry.clientId === formData.clientId && !entry.isRunning
  );

  const selectedEntries = timeEntries.filter(entry => 
    formData.selectedTimeEntries.includes(entry.id)
  );

  const subtotal = selectedEntries.reduce((sum, entry) => 
    sum + (entry.duration / 60) * entry.hourlyRate, 0
  );
  const taxAmount = subtotal * (parseFloat(formData.tax || '0') / 100);
  const total = subtotal + taxAmount;

  const handleSave = async () => {
    console.log('Attempting to save invoice...');
    console.log('Form data:', formData);
    console.log('Selected entries:', selectedEntries.length);
    
    if (!formData.clientId) {
      Alert.alert('Missing Information', 'Please select a client.');
      return;
    }

    if (formData.selectedTimeEntries.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one time entry.');
      return;
    }

    if (!formData.invoiceNumber.trim()) {
      Alert.alert('Missing Information', 'Please enter an invoice number.');
      return;
    }

    try {
      console.log('Creating invoice with data:', {
        clientId: formData.clientId,
        invoiceNumber: formData.invoiceNumber,
        status: 'draft',
        issueDate: new Date(formData.issueDate),
        dueDate: new Date(formData.dueDate),
        subtotal,
        tax: taxAmount,
        total,
        timeEntries: formData.selectedTimeEntries,
      });

      const newInvoice = await addInvoice({
        clientId: formData.clientId,
        invoiceNumber: formData.invoiceNumber,
        status: 'draft',
        issueDate: new Date(formData.issueDate),
        dueDate: new Date(formData.dueDate),
        subtotal,
        tax: taxAmount,
        total,
        timeEntries: formData.selectedTimeEntries,
      });

      console.log('Invoice created successfully:', newInvoice);
      Alert.alert(
        'Success',
        'Invoice created successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.log('Error creating invoice:', error);
      Alert.alert('Error', 'Failed to create invoice. Please try again.');
    }
  };

  const updateFormData = (field: string, value: any) => {
    console.log(`Updating ${field} to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTimeEntry = (entryId: string) => {
    console.log('Toggling time entry:', entryId);
    setFormData(prev => ({
      ...prev,
      selectedTimeEntries: prev.selectedTimeEntries.includes(entryId)
        ? prev.selectedTimeEntries.filter(id => id !== entryId)
        : [...prev.selectedTimeEntries, entryId]
    }));
  };

  const TimeEntryItem = ({ entry }: { entry: any }) => {
    const isSelected = formData.selectedTimeEntries.includes(entry.id);
    const earnings = (entry.duration / 60) * entry.hourlyRate;

    return (
      <Pressable 
        style={[styles.timeEntryItem, isSelected && styles.timeEntryItemSelected]}
        onPress={() => toggleTimeEntry(entry.id)}
      >
        <View style={commonStyles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.entryDescription}>{entry.description}</Text>
            <Text style={commonStyles.textSecondary}>
              {new Date(entry.startTime).toLocaleDateString()} • 
              {Math.floor(entry.duration / 60)}h {entry.duration % 60}m
            </Text>
          </View>
          <View style={styles.entryAmount}>
            <Text style={styles.amountText}>${earnings.toFixed(2)}</Text>
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <IconSymbol name="checkmark" color="#ffffff" size={12} />}
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  // Don't render the form if we don't have prerequisites
  if (clients.length === 0 || timeEntries.filter(entry => !entry.isRunning).length === 0) {
    return (
      <View style={commonStyles.container}>
        <Stack.Screen 
          options={{
            title: 'Create Invoice',
            headerLeft: () => (
              <Pressable onPress={() => router.back()}>
                <IconSymbol name="chevron.left" color={colors.text} size={24} />
              </Pressable>
            ),
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={commonStyles.text}>Checking prerequisites...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <Stack.Screen 
        options={{
          title: 'Create Invoice',
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <IconSymbol name="chevron.left" color={colors.text} size={24} />
            </Pressable>
          ),
        }}
      />
      
      <ScrollView style={commonStyles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Invoice Number *</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.invoiceNumber}
              onChangeText={(value) => updateFormData('invoiceNumber', value)}
              placeholder="Enter invoice number"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Client *</Text>
            <View style={styles.clientSelector}>
              {clients.map(client => (
                <Pressable
                  key={client.id}
                  style={[
                    styles.clientOption,
                    formData.clientId === client.id && styles.clientOptionSelected
                  ]}
                  onPress={() => {
                    updateFormData('clientId', client.id);
                    updateFormData('selectedTimeEntries', []);
                  }}
                >
                  <Text style={[
                    styles.clientOptionText,
                    formData.clientId === client.id && styles.clientOptionTextSelected
                  ]}>
                    {client.name}
                  </Text>
                  {client.company && (
                    <Text style={[
                      styles.clientCompany,
                      formData.clientId === client.id && styles.clientCompanySelected
                    ]}>
                      {client.company}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Issue Date</Text>
              <TextInput
                style={commonStyles.input}
                value={formData.issueDate}
                onChangeText={(value) => updateFormData('issueDate', value)}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Due Date</Text>
              <TextInput
                style={commonStyles.input}
                value={formData.dueDate}
                onChangeText={(value) => updateFormData('dueDate', value)}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          {formData.clientId && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time Entries *</Text>
              {availableTimeEntries.length === 0 ? (
                <View style={styles.emptyState}>
                  <IconSymbol name="clock" color={colors.textSecondary} size={32} />
                  <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
                    No unbilled time entries for this client.{'\n'}
                    Track some time first to create an invoice.
                  </Text>
                  <Pressable 
                    style={[commonStyles.button, { marginTop: 16 }]}
                    onPress={() => {
                      router.back();
                      router.push('/(tabs)/time');
                    }}
                  >
                    <Text style={commonStyles.buttonText}>Track Time</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.timeEntriesList}>
                  <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
                    Select time entries to include in this invoice:
                  </Text>
                  {availableTimeEntries.map(entry => (
                    <TimeEntryItem key={entry.id} entry={entry} />
                  ))}
                </View>
              )}
            </View>
          )}

          {formData.selectedTimeEntries.length > 0 && (
            <View style={styles.invoiceSummary}>
              <Text style={styles.summaryTitle}>Invoice Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>

              <View style={styles.taxRow}>
                <Text style={styles.summaryLabel}>Tax (%)</Text>
                <View style={styles.taxInput}>
                  <TextInput
                    style={[commonStyles.input, { textAlign: 'right' }]}
                    value={formData.tax}
                    onChangeText={(value) => updateFormData('tax', value)}
                    keyboardType="decimal-pad"
                    placeholder="0"
                  />
                </View>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax Amount</Text>
                <Text style={styles.summaryValue}>${taxAmount.toFixed(2)}</Text>
              </View>

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Pressable 
              style={[commonStyles.buttonSecondary, commonStyles.button, styles.button]}
              onPress={() => router.back()}
            >
              <Text style={[commonStyles.buttonSecondaryText, commonStyles.buttonText]}>
                Cancel
              </Text>
            </Pressable>
            
            <Pressable 
              style={[
                commonStyles.button, 
                styles.button,
                (!formData.clientId || formData.selectedTimeEntries.length === 0 || !formData.invoiceNumber.trim()) && styles.buttonDisabled
              ]}
              onPress={handleSave}
              disabled={!formData.clientId || formData.selectedTimeEntries.length === 0 || !formData.invoiceNumber.trim()}
            >
              <Text style={commonStyles.buttonText}>Create Invoice</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  form: {
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
  },
  clientSelector: {
    gap: 8,
  },
  clientOption: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
  },
  clientOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  clientOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  clientOptionTextSelected: {
    color: '#ffffff',
  },
  clientCompany: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  clientCompanySelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timeEntriesList: {
    gap: 8,
  },
  timeEntryItem: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
  },
  timeEntryItemSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  entryDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  entryAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  invoiceSummary: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.text,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taxInput: {
    width: 80,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
  buttonDisabled: {
    backgroundColor: colors.grey,
  },
});
