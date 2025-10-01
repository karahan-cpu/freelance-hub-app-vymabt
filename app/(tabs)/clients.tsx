
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { useTimeEntries } from '@/hooks/useTimeEntries';

export default function ClientsScreen() {
  const { clients } = useClients();
  const { projects } = useProjects();
  const { timeEntries } = useTimeEntries();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getClientStats = (clientId: string) => {
    const clientProjects = projects.filter(p => p.clientId === clientId);
    const clientTimeEntries = timeEntries.filter(e => e.clientId === clientId);
    const totalHours = clientTimeEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60;
    const totalEarnings = clientTimeEntries.reduce((sum, entry) => 
      sum + (entry.duration / 60) * entry.hourlyRate, 0
    );

    return {
      projectCount: clientProjects.length,
      totalHours,
      totalEarnings,
    };
  };

  const ClientCard = ({ client }: { client: any }) => {
    const stats = getClientStats(client.id);

    return (
      <Pressable 
        style={commonStyles.card}
        onPress={() => router.push(`/clients/${client.id}`)}
      >
        <View style={commonStyles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.clientName}>{client.name}</Text>
            {client.company && (
              <Text style={commonStyles.textSecondary}>{client.company}</Text>
            )}
            <Text style={commonStyles.textSecondary}>{client.email}</Text>
          </View>
          <View style={styles.clientStats}>
            <Text style={styles.statText}>${stats.totalEarnings.toFixed(0)}</Text>
            <Text style={commonStyles.textSecondary}>{stats.totalHours.toFixed(1)}h</Text>
          </View>
        </View>
        
        <View style={[commonStyles.row, { marginTop: 12 }]}>
          <View style={commonStyles.rowStart}>
            <IconSymbol name="folder" color={colors.textSecondary} size={16} />
            <Text style={[commonStyles.textSecondary, { marginLeft: 4 }]}>
              {stats.projectCount} project{stats.projectCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={styles.hourlyRate}>${client.hourlyRate}/hr</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.content}>
        <View style={styles.header}>
          <Text style={commonStyles.title}>Clients</Text>
          <Pressable 
            style={styles.addButton}
            onPress={() => router.push('/clients/add')}
          >
            <IconSymbol name="plus" color="#ffffff" size={20} />
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" color={colors.textSecondary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredClients.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="person.2" color={colors.textSecondary} size={48} />
              <Text style={styles.emptyTitle}>No Clients Yet</Text>
              <Text style={commonStyles.textSecondary}>
                Add your first client to start tracking projects and time
              </Text>
              <Pressable 
                style={[commonStyles.button, { marginTop: 16 }]}
                onPress={() => router.push('/clients/add')}
              >
                <Text style={commonStyles.buttonText}>Add Client</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ paddingBottom: 20 }}>
              {filteredClients.map(client => (
                <ClientCard key={client.id} client={client} />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  clientStats: {
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  hourlyRate: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
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
