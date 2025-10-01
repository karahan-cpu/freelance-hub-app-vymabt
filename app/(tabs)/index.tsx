
import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useClients } from '@/hooks/useClients';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useInvoices } from '@/hooks/useInvoices';
import { useProjects } from '@/hooks/useProjects';

export default function DashboardScreen() {
  const { clients } = useClients();
  const { timeEntries, getRunningTimer } = useTimeEntries();
  const { invoices } = useInvoices();
  const { projects } = useProjects();

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalOutstanding = invoices
      .filter(inv => inv.status !== 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    const totalPaid = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    const hoursThisWeek = timeEntries
      .filter(entry => new Date(entry.createdAt) >= weekStart)
      .reduce((sum, entry) => sum + entry.duration, 0) / 60;

    const hoursThisMonth = timeEntries
      .filter(entry => new Date(entry.createdAt) >= monthStart)
      .reduce((sum, entry) => sum + entry.duration, 0) / 60;

    const activeProjects = projects.filter(p => p.status === 'active').length;

    const overdueInvoices = invoices.filter(inv => 
      inv.status !== 'paid' && new Date(inv.dueDate) < new Date()
    ).length;

    return {
      totalOutstanding,
      totalPaid,
      hoursThisWeek,
      hoursThisMonth,
      activeProjects,
      overdueInvoices,
    };
  }, [invoices, timeEntries, projects]);

  const runningTimer = getRunningTimer();

  const StatCard = ({ title, value, subtitle, color = colors.primary, onPress }: {
    title: string;
    value: string;
    subtitle?: string;
    color?: string;
    onPress?: () => void;
  }) => (
    <Pressable 
      style={[styles.statCard, { borderLeftColor: color }]} 
      onPress={onPress}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </Pressable>
  );

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.content}>
        <View style={styles.header}>
          <Text style={commonStyles.title}>Dashboard</Text>
          <Text style={commonStyles.subtitle}>Welcome back! Here's your overview</Text>
        </View>

        {runningTimer && (
          <View style={[commonStyles.card, styles.runningTimer]}>
            <View style={commonStyles.rowStart}>
              <IconSymbol name="timer" color={colors.success} size={20} />
              <Text style={[commonStyles.text, { marginLeft: 8, color: colors.success }]}>
                Timer Running
              </Text>
            </View>
            <Text style={commonStyles.textSecondary}>{runningTimer.description}</Text>
            <Pressable 
              style={styles.stopButton}
              onPress={() => router.push('/time')}
            >
              <Text style={styles.stopButtonText}>View Timer</Text>
            </Pressable>
          </View>
        )}

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Financial Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Outstanding"
              value={`$${stats.totalOutstanding.toFixed(2)}`}
              color={colors.warning}
              onPress={() => router.push('/invoices')}
            />
            <StatCard
              title="Paid This Month"
              value={`$${stats.totalPaid.toFixed(2)}`}
              color={colors.success}
            />
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Time Tracking</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Hours This Week"
              value={stats.hoursThisWeek.toFixed(1)}
              subtitle="hours"
              onPress={() => router.push('/time')}
            />
            <StatCard
              title="Hours This Month"
              value={stats.hoursThisMonth.toFixed(1)}
              subtitle="hours"
            />
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Projects & Clients</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Active Projects"
              value={stats.activeProjects.toString()}
              color={colors.primary}
            />
            <StatCard
              title="Total Clients"
              value={clients.length.toString()}
              onPress={() => router.push('/clients')}
            />
          </View>
        </View>

        {stats.overdueInvoices > 0 && (
          <View style={commonStyles.section}>
            <View style={[commonStyles.card, styles.alertCard]}>
              <View style={commonStyles.rowStart}>
                <IconSymbol name="exclamationmark.triangle" color={colors.danger} size={20} />
                <Text style={[commonStyles.text, { marginLeft: 8, color: colors.danger }]}>
                  {stats.overdueInvoices} Overdue Invoice{stats.overdueInvoices > 1 ? 's' : ''}
                </Text>
              </View>
              <Pressable 
                style={styles.alertButton}
                onPress={() => router.push('/invoices')}
              >
                <Text style={styles.alertButtonText}>Review</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.quickActions}>
          <Text style={commonStyles.sectionTitle}>Quick Actions</Text>
          <Pressable 
            style={[commonStyles.button, styles.actionButton]}
            onPress={() => router.push('/clients/add')}
          >
            <IconSymbol name="plus" color="#ffffff" size={20} />
            <Text style={[commonStyles.buttonText, { marginLeft: 8 }]}>Add Client</Text>
          </Pressable>
          <Pressable 
            style={[commonStyles.buttonSecondary, commonStyles.button, styles.actionButton]}
            onPress={() => router.push('/time')}
          >
            <IconSymbol name="timer" color={colors.text} size={20} />
            <Text style={[commonStyles.buttonSecondaryText, commonStyles.buttonText, { marginLeft: 8 }]}>
              Start Timer
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingBottom: 10,
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
    fontSize: 24,
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
  runningTimer: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  stopButton: {
    backgroundColor: colors.success,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  stopButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  alertCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  alertButton: {
    backgroundColor: colors.danger,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  alertButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    marginBottom: 12,
  },
});
