
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useInvoices } from '@/hooks/useInvoices';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams();
  const { clients, deleteClient } = useClients();
  const { projects, getProjectsByClient } = useProjects();
  const { timeEntries, getEntriesByClient } = useTimeEntries();
  const { invoices, getInvoicesByClient } = useInvoices();

  const client = clients.find(c => c.id === id);
  const clientProjects = getProjectsByClient(id as string);
  const clientTimeEntries = getEntriesByClient(id as string);
  const clientInvoices = getInvoicesByClient(id as string);

  if (!client) {
    return (
      <View style={commonStyles.container}>
        <Text style={commonStyles.text}>Client not found</Text>
      </View>
    );
  }

  const stats = {
    totalHours: clientTimeEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60,
    totalEarnings: clientTimeEntries.reduce((sum, entry) => 
      sum + (entry.duration / 60) * entry.hourlyRate, 0
    ),
    activeProjects: clientProjects.filter(p => p.status === 'active').length,
    outstandingInvoices: clientInvoices.filter(inv => inv.status !== 'paid').length,
  };

  const handleDeleteClient = () => {
    Alert.alert(
      'Delete Client',
      'Are you sure you want to delete this client? This will also delete all associated projects and time entries.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteClient(client.id);
            router.back();
          }
        }
      ]
    );
  };

  const StatCard = ({ title, value, subtitle, color = colors.primary }: {
    title: string;
    value: string;
    subtitle?: string;
    color?: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const ProjectCard = ({ project }: { project: any }) => (
    <View style={commonStyles.card}>
      <View style={commonStyles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.projectName}>{project.name}</Text>
          {project.description && (
            <Text style={commonStyles.textSecondary}>{project.description}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
          <Text style={styles.statusText}>{project.status}</Text>
        </View>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'paused': return colors.warning;
      case 'completed': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={commonStyles.container}>
      <Stack.Screen 
        options={{
          title: client.name,
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <IconSymbol name="chevron.left" color={colors.text} size={24} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleDeleteClient}>
              <IconSymbol name="trash" color={colors.danger} size={20} />
            </Pressable>
          ),
        }}
      />
      
      <ScrollView style={commonStyles.content}>
        <View style={styles.header}>
          <Text style={commonStyles.title}>{client.name}</Text>
          {client.company && (
            <Text style={styles.company}>{client.company}</Text>
          )}
        </View>

        <View style={commonStyles.card}>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <IconSymbol name="envelope" color={colors.textSecondary} size={16} />
              <Text style={styles.contactText}>{client.email}</Text>
            </View>
            {client.phone && (
              <View style={styles.contactItem}>
                <IconSymbol name="phone" color={colors.textSecondary} size={16} />
                <Text style={styles.contactText}>{client.phone}</Text>
              </View>
            )}
            {client.address && (
              <View style={styles.contactItem}>
                <IconSymbol name="location" color={colors.textSecondary} size={16} />
                <Text style={styles.contactText}>{client.address}</Text>
              </View>
            )}
            <View style={styles.contactItem}>
              <IconSymbol name="dollarsign.circle" color={colors.primary} size={16} />
              <Text style={[styles.contactText, { color: colors.primary, fontWeight: '600' }]}>
                ${client.hourlyRate}/hr
              </Text>
            </View>
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Earnings"
              value={`$${stats.totalEarnings.toFixed(2)}`}
              color={colors.success}
            />
            <StatCard
              title="Total Hours"
              value={stats.totalHours.toFixed(1)}
              subtitle="hours"
            />
            <StatCard
              title="Active Projects"
              value={stats.activeProjects.toString()}
              color={colors.primary}
            />
            <StatCard
              title="Outstanding"
              value={stats.outstandingInvoices.toString()}
              subtitle="invoices"
              color={colors.warning}
            />
          </View>
        </View>

        <View style={commonStyles.section}>
          <View style={commonStyles.row}>
            <Text style={commonStyles.sectionTitle}>Projects</Text>
            <Pressable 
              style={styles.addButton}
              onPress={() => router.push(`/projects/add?clientId=${client.id}`)}
            >
              <IconSymbol name="plus" color={colors.primary} size={16} />
            </Pressable>
          </View>
          
          {clientProjects.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={commonStyles.textSecondary}>No projects yet</Text>
            </View>
          ) : (
            <View>
              {clientProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <Pressable 
            style={[commonStyles.button, styles.actionButton]}
            onPress={() => router.push('/time')}
          >
            <IconSymbol name="timer" color="#ffffff" size={20} />
            <Text style={[commonStyles.buttonText, { marginLeft: 8 }]}>Start Timer</Text>
          </Pressable>
          
          <Pressable 
            style={[commonStyles.buttonSecondary, commonStyles.button, styles.actionButton]}
            onPress={() => router.push('/invoices/add')}
          >
            <IconSymbol name="doc.text" color={colors.text} size={20} />
            <Text style={[commonStyles.buttonSecondaryText, commonStyles.buttonText, { marginLeft: 8 }]}>
              Create Invoice
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
  },
  company: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 4,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  statSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
