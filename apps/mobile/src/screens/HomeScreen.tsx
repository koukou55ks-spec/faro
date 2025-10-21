import React from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning 👋</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <StatCard title="Balance" value="¥123,456" color="#4CAF50" />
        <StatCard title="This Month" value="¥45,000" color="#2196F3" />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <ActionButton icon="💬" label="Chat with Faro" />
          <ActionButton icon="📝" label="New Note" />
          <ActionButton icon="💰" label="Add Transaction" />
          <ActionButton icon="📊" label="Reports" />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <ActivityItem
          icon="💬"
          title="Chat about tax deductions"
          time="2 hours ago"
        />
        <ActivityItem
          icon="📝"
          title="Created note: Q1 Budget"
          time="Yesterday"
        />
        <ActivityItem
          icon="💰"
          title="Added transaction: ¥3,500"
          time="2 days ago"
        />
      </View>
    </ScrollView>
  )
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  )
}

function ActionButton({ icon, label }: { icon: string; label: string }) {
  return (
    <TouchableOpacity style={styles.actionButton}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

function ActivityItem({ icon, title, time }: { icon: string; title: string; time: string }) {
  return (
    <View style={styles.activityItem}>
      <Text style={styles.activityIcon}>{icon}</Text>
      <View style={styles.activityText}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#888',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: '#888',
  },
})
