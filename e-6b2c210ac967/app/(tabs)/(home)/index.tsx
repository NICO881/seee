
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { mockAppointments, mockHospitals, mockNotifications, mockReferralHospitals } from '@/data/mockData';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const [notifications] = useState(mockNotifications);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Emergency Hospital App</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.error }]}
              onPress={() => router.push('/(tabs)/emergency')}
            >
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="emergency"
                size={32}
                color={colors.card}
              />
              <Text style={styles.quickActionText}>Emergency</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/appointments')}
            >
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar_today"
                size={32}
                color={colors.card}
              />
              <Text style={styles.quickActionText}>Book Appointment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.success }]}
              onPress={() => router.push('/(tabs)/referrals')}
            >
              <IconSymbol
                ios_icon_name="cross.case.fill"
                android_material_icon_name="local_hospital"
                size={32}
                color={colors.card}
              />
              <Text style={styles.quickActionText}>Referral Hospitals</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: colors.secondary }]}
              onPress={() => router.push('/(tabs)/chat')}
            >
              <IconSymbol
                ios_icon_name="message.fill"
                android_material_icon_name="chat"
                size={32}
                color={colors.card}
              />
              <Text style={styles.quickActionText}>AI Assistant</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Referral Hospitals Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Referral Hospitals</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/referrals')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {mockReferralHospitals.slice(0, 3).map((hospital, index) => (
            <TouchableOpacity
              key={index}
              style={styles.hospitalPreviewCard}
              onPress={() => router.push('/(tabs)/referrals')}
            >
              <View style={styles.hospitalIconContainer}>
                <IconSymbol
                  ios_icon_name="cross.case.fill"
                  android_material_icon_name="local_hospital"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName}>{hospital.name}</Text>
                <Text style={styles.hospitalLocation}>{hospital.location}</Text>
                <View style={styles.hospitalBadges}>
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.badgeText}>{hospital.level}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                    <Text style={styles.badgeText}>{hospital.type}</Text>
                  </View>
                </View>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron_right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/appointments')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {mockAppointments.length > 0 ? (
            mockAppointments.map((appointment, index) => (
              <View key={index} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <IconSymbol
                    ios_icon_name="calendar"
                    android_material_icon_name="calendar_today"
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentDoctor}>{appointment.doctorName}</Text>
                    <Text style={styles.appointmentType}>{appointment.type}</Text>
                  </View>
                </View>
                <View style={styles.appointmentDetails}>
                  <View style={styles.detailRow}>
                    <IconSymbol
                      ios_icon_name="clock"
                      android_material_icon_name="schedule"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.detailText}>
                      {appointment.date} at {appointment.time}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <IconSymbol
                      ios_icon_name="location.fill"
                      android_material_icon_name="location_on"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.detailText}>{appointment.hospitalName}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No upcoming appointments</Text>
            </View>
          )}
        </View>

        {/* Nearby Hospitals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Hospitals</Text>
          {mockHospitals.map((hospital, index) => (
            <View key={index} style={styles.hospitalCard}>
              <View style={styles.hospitalHeader}>
                <View style={styles.hospitalTitleRow}>
                  <IconSymbol
                    ios_icon_name="cross.case.fill"
                    android_material_icon_name="local_hospital"
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.hospitalTitleContainer}>
                    <Text style={styles.hospitalCardName}>{hospital.name}</Text>
                    <Text style={styles.hospitalCardLocation}>{hospital.location}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        hospital.erStatus === 'Available'
                          ? colors.success
                          : hospital.erStatus === 'Busy'
                          ? colors.warning
                          : colors.error,
                    },
                  ]}
                >
                  <Text style={styles.statusText}>{hospital.erStatus}</Text>
                </View>
              </View>
              <View style={styles.hospitalStats}>
                <View style={styles.statItem}>
                  <IconSymbol
                    ios_icon_name="bed.double.fill"
                    android_material_icon_name="hotel"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.statText}>
                    {hospital.availableBeds}/{hospital.beds} beds
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <IconSymbol
                    ios_icon_name="location.fill"
                    android_material_icon_name="location_on"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.statText}>{hospital.distance} km away</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {notifications.map((notification, index) => (
            <View key={index} style={styles.notificationCard}>
              <View style={styles.notificationHeader}>
                <IconSymbol
                  ios_icon_name={
                    notification.type === 'Appointment'
                      ? 'calendar'
                      : notification.type === 'Order'
                      ? 'bag.fill'
                      : notification.type === 'Emergency'
                      ? 'exclamationmark.triangle.fill'
                      : 'bell.fill'
                  }
                  android_material_icon_name={
                    notification.type === 'Appointment'
                      ? 'calendar_today'
                      : notification.type === 'Order'
                      ? 'shopping_bag'
                      : notification.type === 'Emergency'
                      ? 'emergency'
                      : 'notifications'
                  }
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.notificationMessage}>{notification.message}</Text>
              </View>
              <Text style={styles.notificationTime}>
                {new Date(notification.timestamp).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.card,
    marginTop: 12,
    textAlign: 'center',
  },
  hospitalPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  hospitalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  hospitalLocation: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  hospitalBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.card,
  },
  appointmentCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  appointmentDoctor: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  appointmentType: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  appointmentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  hospitalCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hospitalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hospitalTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  hospitalCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  hospitalCardLocation: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
  hospitalStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  notificationCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationMessage: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 32,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bottomPadding: {
    height: 120,
  },
});
