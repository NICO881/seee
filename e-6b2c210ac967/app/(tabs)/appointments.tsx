
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, Modal } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { mockDoctors, mockAppointments, mockHospitals } from '@/data/mockData';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AppointmentsScreen() {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'history'>('upcoming');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');

  const upcomingAppointments = mockAppointments.filter(apt => apt.status === 'Scheduled');
  const pastAppointments = mockAppointments.filter(apt => apt.status === 'Completed');

  const handleBookAppointment = () => {
    console.log('Booking appointment:', { selectedDoctor, selectedDate, selectedTime });
    setShowBookingModal(false);
    // Reset form
    setSelectedDoctor('');
    setSelectedDate(new Date());
    setSelectedTime('');
  };

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Appointments</Text>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => setShowBookingModal(true)}
          >
            <IconSymbol 
              ios_icon_name="plus" 
              android_material_icon_name="add" 
              size={20} 
              color="#FFFFFF"
            />
            <Text style={styles.bookButtonText}>Book</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'upcoming' && styles.activeTab]}
            onPress={() => setSelectedTab('upcoming')}
          >
            <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.activeTabText]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
            onPress={() => setSelectedTab('history')}
          >
            <Text style={[styles.tabText, selectedTab === 'history' && styles.activeTabText]}>
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Appointments List */}
        <View style={styles.appointmentsList}>
          {selectedTab === 'upcoming' ? (
            upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment, index) => (
                <View key={index} style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <View style={styles.doctorInfo}>
                      <View style={styles.doctorAvatar}>
                        <IconSymbol 
                          ios_icon_name="person.fill" 
                          android_material_icon_name="person" 
                          size={24} 
                          color={colors.primary}
                        />
                      </View>
                      <View>
                        <Text style={styles.doctorName}>{appointment.doctorName}</Text>
                        <Text style={styles.appointmentType}>{appointment.type}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                      <Text style={[styles.statusText, { color: colors.success }]}>
                        {appointment.status}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.appointmentDetails}>
                    <View style={styles.detailRow}>
                      <IconSymbol 
                        ios_icon_name="calendar" 
                        android_material_icon_name="event" 
                        size={18} 
                        color={colors.textSecondary}
                      />
                      <Text style={styles.detailText}>{appointment.date}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <IconSymbol 
                        ios_icon_name="clock" 
                        android_material_icon_name="schedule" 
                        size={18} 
                        color={colors.textSecondary}
                      />
                      <Text style={styles.detailText}>{appointment.time}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <IconSymbol 
                        ios_icon_name="building.2.fill" 
                        android_material_icon_name="local_hospital" 
                        size={18} 
                        color={colors.textSecondary}
                      />
                      <Text style={styles.detailText}>{appointment.hospitalName}</Text>
                    </View>
                  </View>

                  <View style={styles.appointmentActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Reschedule</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
                      <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <IconSymbol 
                  ios_icon_name="calendar" 
                  android_material_icon_name="event" 
                  size={48} 
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyStateText}>No upcoming appointments</Text>
                <TouchableOpacity 
                  style={styles.emptyStateButton}
                  onPress={() => setShowBookingModal(true)}
                >
                  <Text style={styles.emptyStateButtonText}>Book an Appointment</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol 
                ios_icon_name="clock" 
                android_material_icon_name="history" 
                size={48} 
                color={colors.textSecondary}
              />
              <Text style={styles.emptyStateText}>No appointment history</Text>
            </View>
          )}
        </View>

        {/* Available Doctors */}
        <View style={[styles.section, { marginBottom: 120 }]}>
          <Text style={styles.sectionTitle}>Available Doctors</Text>
          {mockDoctors.filter(d => d.available).map((doctor, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.doctorCard}
              onPress={() => {
                setSelectedDoctor(doctor.id);
                setShowBookingModal(true);
              }}
            >
              <View style={styles.doctorCardAvatar}>
                <IconSymbol 
                  ios_icon_name="person.fill" 
                  android_material_icon_name="person" 
                  size={32} 
                  color={colors.primary}
                />
              </View>
              <View style={styles.doctorCardInfo}>
                <Text style={styles.doctorCardName}>{doctor.name}</Text>
                <Text style={styles.doctorCardSpecialty}>{doctor.specialty}</Text>
                <View style={styles.doctorCardMeta}>
                  <View style={styles.ratingContainer}>
                    <IconSymbol 
                      ios_icon_name="star.fill" 
                      android_material_icon_name="star" 
                      size={14} 
                      color={colors.accent}
                    />
                    <Text style={styles.ratingText}>{doctor.rating}</Text>
                  </View>
                  <Text style={styles.experienceText}>{doctor.experience} years exp.</Text>
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
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Appointment</Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <IconSymbol 
                  ios_icon_name="xmark" 
                  android_material_icon_name="close" 
                  size={24} 
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Select Doctor */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Select Doctor</Text>
                {mockDoctors.filter(d => d.available).map((doctor, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.doctorOption,
                      selectedDoctor === doctor.id && styles.selectedDoctorOption
                    ]}
                    onPress={() => setSelectedDoctor(doctor.id)}
                  >
                    <View style={styles.doctorOptionInfo}>
                      <Text style={styles.doctorOptionName}>{doctor.name}</Text>
                      <Text style={styles.doctorOptionSpecialty}>{doctor.specialty}</Text>
                    </View>
                    {selectedDoctor === doctor.id && (
                      <IconSymbol 
                        ios_icon_name="checkmark.circle.fill" 
                        android_material_icon_name="check_circle" 
                        size={24} 
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Select Date */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Select Date</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <IconSymbol 
                    ios_icon_name="calendar" 
                    android_material_icon_name="event" 
                    size={20} 
                    color={colors.primary}
                  />
                  <Text style={styles.dateButtonText}>
                    {selectedDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) setSelectedDate(date);
                    }}
                  />
                )}
              </View>

              {/* Select Time */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Select Time</Text>
                <View style={styles.timeSlots}>
                  {timeSlots.map((time, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeSlot,
                        selectedTime === time && styles.selectedTimeSlot
                      ]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        selectedTime === time && styles.selectedTimeSlotText
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                style={[
                  styles.bookAppointmentButton,
                  (!selectedDoctor || !selectedTime) && styles.disabledButton
                ]}
                onPress={handleBookAppointment}
                disabled={!selectedDoctor || !selectedTime}
              >
                <Text style={styles.bookAppointmentButtonText}>Confirm Booking</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  appointmentsList: {
    marginBottom: 24,
  },
  appointmentCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  appointmentType: {
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
  },
  appointmentDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.error,
  },
  cancelButtonText: {
    color: colors.error,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  doctorCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  doctorCardAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorCardInfo: {
    flex: 1,
  },
  doctorCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  doctorCardSpecialty: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  doctorCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  experienceText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalScroll: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  doctorOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedDoctorOption: {
    backgroundColor: colors.highlight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  doctorOptionInfo: {
    flex: 1,
  },
  doctorOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  doctorOptionSpecialty: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.background,
  },
  selectedTimeSlot: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeSlotText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedTimeSlotText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bookAppointmentButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  bookAppointmentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
