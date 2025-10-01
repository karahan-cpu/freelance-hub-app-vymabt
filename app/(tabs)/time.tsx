
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';

export default function TimeScreen() {
  const { timeEntries, getRunningTimer, startTimer, stopTimer, deleteTimeEntry } = useTimeEntries();
  const { clients } = useClients();
  const { projects } = useProjects();
  
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const runningTimer = getRunningTimer();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  const formatRunningDuration = (startTime: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const minutes = Math.floor(diffMs / 60000);
    return formatDuration(minutes);
  };

  const handleStartTimer = async () => {
    if (!selectedClientId || !selectedProjectId || !description.trim()) {
      Alert.alert('Missing Information', 'Please select a client, project, and enter a description.');
      return;
    }

    const client = clients.find(c => c.id === selectedClientId);
    const project = projects.find(p => p.id === selectedProjectId);
    
    if (!client || !project) {
      Alert.alert('Error', 'Selected client or project not found.');
      return;
    }

    const hourlyRate = project.hourlyRate || client.hourlyRate;
    
    try {
      await startTimer(selectedProjectId, selectedClientId, description, hourlyRate);
      setDescription('');
      console.log('Timer started successfully');
    } catch (error) {
      console.log('Error starting timer:', error);
      Alert.alert('Error', 'Failed to start timer.');
    }
  };

  const handleStopTimer = async () => {
    if (runningTimer) {
      try {
        await stopTimer(runningTimer.id);
        console.log('Timer stopped successfully');
      } catch (error) {
        console.log('Error stopping timer:', error);
        Alert.alert('Error', 'Failed to stop timer.');
      }
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    Alert.alert(
      'Delete Time Entry',
      'Are you sure you want to delete this time entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteTimeEntry(entryId)
        }
      ]
    );
  };

  const availableProjects = projects.filter(p => p.clientId === selectedClientId);
  const recentEntries = timeEntries
    .filter(entry => !entry.isRunning)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const TimeEntryCard = ({ entry }: { entry: any }) => {
    const client = clients.find(c => c.id === entry.clientId);
    const project = projects.find(p => p.id === entry.projectId);
    const earnings = (entry.duration / 60) * entry.hourlyRate;

    return (
      <View style={commonStyles.card}>
        <View style={commonStyles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.entryDescription}>{entry.description}</Text>
            <Text style={commonStyles.textSecondary}>
              {client?.name} • {project?.name}
            </Text>
            <Text style={commonStyles.textSecondary}>
              {new Date(entry.startTime).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.entryStats}>
            <Text style={styles.duration}>{formatDuration(entry.duration)}</Text>
            <Text style={styles.earnings}>${earnings.toFixed(2)}</Text>
            <Pressable 
              style={styles.deleteButton}
              onPress={() => handleDeleteEntry(entry.id)}
            >
              <IconSymbol name="trash" color={colors.danger} size={16} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.content}>
        <Text style={commonStyles.title}>Time Tracking</Text>

        {runningTimer ? (
          <View style={[commonStyles.card, styles.runningTimerCard]}>
            <View style={commonStyles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.runningDescription}>{runningTimer.description}</Text>
                <Text style={commonStyles.textSecondary}>
                  {clients.find(c => c.id === runningTimer.clientId)?.name} • 
                  {projects.find(p => p.id === runningTimer.projectId)?.name}
                </Text>
              </View>
              <View style={styles.timerDisplay}>
                <Text style={styles.timerText}>
                  {formatRunningDuration(runningTimer.startTime)}
                </Text>
              </View>
            </View>
            <Pressable 
              style={styles.stopButton}
              onPress={handleStopTimer}
            >
              <IconSymbol name="stop.fill" color="#ffffff" size={20} />
              <Text style={[commonStyles.buttonText, { marginLeft: 8 }]}>Stop Timer</Text>
            </Pressable>
          </View>
        ) : (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>Start New Timer</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Client</Text>
              <View style={styles.pickerContainer}>
                {clients.map(client => (
                  <Pressable
                    key={client.id}
                    style={[
                      styles.pickerOption,
                      selectedClientId === client.id && styles.pickerOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedClientId(client.id);
                      setSelectedProjectId(''); // Reset project selection
                    }}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      selectedClientId === client.id && styles.pickerOptionTextSelected
                    ]}>
                      {client.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {selectedClientId && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Project</Text>
                <View style={styles.pickerContainer}>
                  {availableProjects.map(project => (
                    <Pressable
                      key={project.id}
                      style={[
                        styles.pickerOption,
                        selectedProjectId === project.id && styles.pickerOptionSelected
                      ]}
                      onPress={() => setSelectedProjectId(project.id)}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        selectedProjectId === project.id && styles.pickerOptionTextSelected
                      ]}>
                        {project.name}
                      </Text>
                    </Pressable>
                  ))}
                  <Pressable
                    style={styles.addProjectButton}
                    onPress={() => router.push(`/projects/add?clientId=${selectedClientId}`)}
                  >
                    <IconSymbol name="plus" color={colors.primary} size={16} />
                    <Text style={[styles.pickerOptionText, { color: colors.primary, marginLeft: 4 }]}>
                      Add Project
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="What are you working on?"
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            <Pressable 
              style={[
                commonStyles.button,
                (!selectedClientId || !selectedProjectId || !description.trim()) && styles.buttonDisabled
              ]}
              onPress={handleStartTimer}
              disabled={!selectedClientId || !selectedProjectId || !description.trim()}
            >
              <IconSymbol name="play.fill" color="#ffffff" size={20} />
              <Text style={[commonStyles.buttonText, { marginLeft: 8 }]}>Start Timer</Text>
            </Pressable>
          </View>
        )}

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Recent Entries</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {recentEntries.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol name="timer" color={colors.textSecondary} size={48} />
                <Text style={styles.emptyTitle}>No Time Entries Yet</Text>
                <Text style={commonStyles.textSecondary}>
                  Start your first timer to begin tracking your work
                </Text>
              </View>
            ) : (
              <View style={{ paddingBottom: 20 }}>
                {recentEntries.map(entry => (
                  <TimeEntryCard key={entry.id} entry={entry} />
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  runningTimerCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    marginBottom: 20,
  },
  runningDescription: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  timerDisplay: {
    alignItems: 'flex-end',
  },
  timerText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.success,
  },
  stopButton: {
    backgroundColor: colors.danger,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pickerOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pickerOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  pickerOptionTextSelected: {
    color: '#ffffff',
  },
  addProjectButton: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.grey,
  },
  entryDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  entryStats: {
    alignItems: 'flex-end',
  },
  duration: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  earnings: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.success,
    marginTop: 2,
  },
  deleteButton: {
    marginTop: 8,
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
});
