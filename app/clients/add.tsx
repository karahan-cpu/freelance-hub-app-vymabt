
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useClients } from '@/hooks/useClients';

export default function AddClientScreen() {
  const { addClient } = useClients();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    hourlyRate: '',
  });

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.hourlyRate.trim()) {
      Alert.alert('Missing Information', 'Please fill in name, email, and hourly rate.');
      return;
    }

    const hourlyRate = parseFloat(formData.hourlyRate);
    if (isNaN(hourlyRate) || hourlyRate <= 0) {
      Alert.alert('Invalid Rate', 'Please enter a valid hourly rate.');
      return;
    }

    try {
      await addClient({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        address: formData.address.trim(),
        hourlyRate,
      });

      console.log('Client added successfully');
      router.back();
    } catch (error) {
      console.log('Error adding client:', error);
      Alert.alert('Error', 'Failed to add client.');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={commonStyles.container}>
      <Stack.Screen 
        options={{
          title: 'Add Client',
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
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Client name"
              placeholderTextColor={colors.textSecondary}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="client@example.com"
              placeholderTextColor={colors.textSecondary}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Phone number"
              placeholderTextColor={colors.textSecondary}
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Company name"
              placeholderTextColor={colors.textSecondary}
              value={formData.company}
              onChangeText={(value) => updateFormData('company', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[commonStyles.input, styles.textArea]}
              placeholder="Client address"
              placeholderTextColor={colors.textSecondary}
              value={formData.address}
              onChangeText={(value) => updateFormData('address', value)}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hourly Rate *</Text>
            <View style={styles.rateInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={[commonStyles.input, styles.rateInput]}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                value={formData.hourlyRate}
                onChangeText={(value) => updateFormData('hourlyRate', value)}
                keyboardType="decimal-pad"
              />
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
              <Text style={commonStyles.buttonText}>Save Client</Text>
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
});
