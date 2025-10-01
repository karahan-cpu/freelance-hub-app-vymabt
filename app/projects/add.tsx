
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useProjects } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';

export default function AddProjectScreen() {
  const { addProject } = useProjects();
  const { clients } = useClients();
  const { clientId } = useLocalSearchParams();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: (clientId as string) || '',
    hourlyRate: '',
    status: 'active' as 'active' | 'completed' | 'paused',
  });

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.clientId) {
      Alert.alert('Missing Information', 'Please fill in project name and select a client.');
      return;
    }

    let hourlyRate: number | undefined;
    if (formData.hourlyRate.trim()) {
      hourlyRate = parseFloat(formData.hourlyRate);
      if (isNaN(hourlyRate) || hourlyRate <= 0) {
        Alert.alert('Invalid Rate', 'Please enter a valid hourly rate.');
        return;
      }
    }

    try {
      await addProject({
        name: formData.name.trim(),
        description: formData.description.trim(),
        clientId: formData.clientId,
        hourlyRate,
        status: formData.status,
      });

      console.log('Project added successfully');
      router.back();
    } catch (error) {
      console.log('Error adding project:', error);
      Alert.alert('Error', 'Failed to add project.');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedClient = clients.find(c => c.id === formData.clientId);

  return (
    <View style={commonStyles.container}>
      <Stack.Screen 
        options={{
          title: 'Add Project',
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
            <Text style={styles.label}>Project Name *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Project name"
              placeholderTextColor={colors.textSecondary}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
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
                  onPress={() => updateFormData('clientId', client.id)}
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[commonStyles.input, styles.textArea]}
              placeholder="Project description"
              placeholderTextColor={colors.textSecondary}
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Hourly Rate (Optional)
              {selectedClient && (
                <Text style={styles.defaultRate}>
                  {' '}• Default: ${selectedClient.hourlyRate}/hr
                </Text>
              )}
            </Text>
            <View style={styles.rateInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={[commonStyles.input, styles.rateInput]}
                placeholder={selectedClient ? selectedClient.hourlyRate.toString() : '0.00'}
                placeholderTextColor={colors.textSecondary}
                value={formData.hourlyRate}
                onChangeText={(value) => updateFormData('hourlyRate', value)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusSelector}>
              {[
                { value: 'active', label: 'Active', color: colors.success },
                { value: 'paused', label: 'Paused', color: colors.warning },
                { value: 'completed', label: 'Completed', color: colors.textSecondary },
              ].map(status => (
                <Pressable
                  key={status.value}
                  style={[
                    styles.statusOption,
                    formData.status === status.value && { backgroundColor: status.color }
                  ]}
                  onPress={() => updateFormData('status', status.value)}
                >
                  <Text style={[
                    styles.statusOptionText,
                    formData.status === status.value && { color: '#ffffff' }
                  ]}>
                    {status.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

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
              style={[commonStyles.button, styles.button]}
              onPress={handleSave}
            >
              <Text style={commonStyles.buttonText}>Save Project</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  defaultRate: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
    marginRight: 8,
  },
  rateInput: {
    flex: 1,
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
  statusSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
});
