
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { mockReferralHospitals, mockReferrals } from '@/data/mockData';
import { ReferralHospital, Referral } from '@/types';

export default function ReferralsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedHospital, setSelectedHospital] = useState<ReferralHospital | null>(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralReason, setReferralReason] = useState('');
  const [referrals] = useState<Referral[]>(mockReferrals);

  const levels = ['All', 'National Referral', 'Regional Referral', 'Private', 'Community'];
  const types = ['All', 'Public', 'Private', 'Not-for-Profit'];

  const filteredHospitals = mockReferralHospitals.filter((hospital) => {
    const matchesSearch =
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'All' || hospital.level === selectedLevel;
    const matchesType = selectedType === 'All' || hospital.type === selectedType;
    return matchesSearch && matchesLevel && matchesType;
  });

  const handleCall = (phone?: string) => {
    if (!phone) {
      Alert.alert('No Phone Number', 'Phone number not available for this hospital');
      return;
    }
    const phoneNumber = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email?: string) => {
    if (!email) {
      Alert.alert('No Email', 'Email address not available for this hospital');
      return;
    }
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsite = (website?: string) => {
    if (!website) {
      Alert.alert('No Website', 'Website not available for this hospital');
      return;
    }
    Linking.openURL(website);
  };

  const handleGetDirections = (hospital: ReferralHospital) => {
    if (hospital.coordinates) {
      const { latitude, longitude } = hospital.coordinates;
      const url = Platform.select({
        ios: `maps:0,0?q=${hospital.name}@${latitude},${longitude}`,
        android: `geo:0,0?q=${latitude},${longitude}(${hospital.name})`,
        default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      });
      Linking.openURL(url);
    } else {
      const query = encodeURIComponent(`${hospital.name} ${hospital.location}`);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

  const handleCreateReferral = () => {
    if (!selectedHospital || !referralReason.trim()) {
      Alert.alert('Missing Information', 'Please provide a reason for referral');
      return;
    }

    Alert.alert(
      'Referral Created',
      `Referral to ${selectedHospital.name} has been created successfully.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowReferralModal(false);
            setReferralReason('');
            setSelectedHospital(null);
          },
        },
      ]
    );
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'National Referral':
        return colors.error;
      case 'Regional Referral':
        return colors.warning;
      case 'Private':
        return colors.primary;
      case 'Community':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Public':
        return colors.primary;
      case 'Private':
        return colors.accent;
      case 'Not-for-Profit':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Referral Hospital Directory</Text>
          <Text style={styles.subtitle}>
            Find and connect with key referral hospitals in Uganda
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol
            ios_icon_name="magnifyingglass"
            android_material_icon_name="search"
            size={20}
            color={colors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search hospitals by name or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="cancel"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips - Level */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Level:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              {levels.map((level, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.chip,
                    selectedLevel === level && styles.chipSelected,
                  ]}
                  onPress={() => setSelectedLevel(level)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedLevel === level && styles.chipTextSelected,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Filter Chips - Type */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Type:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              {types.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.chip,
                    selectedType === type && styles.chipSelected,
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedType === type && styles.chipTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Results Count */}
        <Text style={styles.resultsCount}>
          {filteredHospitals.length} hospital{filteredHospitals.length !== 1 ? 's' : ''} found
        </Text>

        {/* My Referrals Section */}
        {referrals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Referrals</Text>
            {referrals.map((referral, index) => (
              <View key={index} style={styles.referralCard}>
                <View style={styles.referralHeader}>
                  <IconSymbol
                    ios_icon_name="arrow.right.circle.fill"
                    android_material_icon_name="send"
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.referralInfo}>
                    <Text style={styles.referralHospital}>{referral.hospitalName}</Text>
                    <Text style={styles.referralDate}>{referral.date}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: referral.status === 'Pending' ? colors.warning : colors.success },
                    ]}
                  >
                    <Text style={styles.statusText}>{referral.status}</Text>
                  </View>
                </View>
                <Text style={styles.referralReason}>{referral.reason}</Text>
                {referral.referringDoctor && (
                  <Text style={styles.referralDoctor}>Referred by: {referral.referringDoctor}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Hospital List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Hospitals</Text>
          {filteredHospitals.map((hospital, index) => (
            <View key={index} style={styles.hospitalCard}>
              {/* Hospital Header */}
              <View style={styles.hospitalHeader}>
                <View style={styles.hospitalTitleRow}>
                  <IconSymbol
                    ios_icon_name="cross.case.fill"
                    android_material_icon_name="local_hospital"
                    size={28}
                    color={colors.primary}
                  />
                  <View style={styles.hospitalTitleContainer}>
                    <Text style={styles.hospitalName}>{hospital.name}</Text>
                    <View style={styles.badgeRow}>
                      <View style={[styles.badge, { backgroundColor: getLevelColor(hospital.level) }]}>
                        <Text style={styles.badgeText}>{hospital.level}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: getTypeColor(hospital.type) }]}>
                        <Text style={styles.badgeText}>{hospital.type}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Location */}
              <View style={styles.infoRow}>
                <IconSymbol
                  ios_icon_name="location.fill"
                  android_material_icon_name="location_on"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={styles.infoText}>
                  {hospital.address}, {hospital.location}
                </Text>
              </View>

              {/* Departments */}
              {hospital.departments && hospital.departments.length > 0 && (
                <View style={styles.departmentsContainer}>
                  <IconSymbol
                    ios_icon_name="building.2.fill"
                    android_material_icon_name="business"
                    size={18}
                    color={colors.textSecondary}
                  />
                  <View style={styles.departmentsList}>
                    {hospital.departments.slice(0, 3).map((dept, idx) => (
                      <Text key={idx} style={styles.departmentText}>
                        {dept}
                        {idx < Math.min(2, hospital.departments!.length - 1) ? ' • ' : ''}
                      </Text>
                    ))}
                    {hospital.departments.length > 3 && (
                      <Text style={styles.departmentText}> +{hospital.departments.length - 3} more</Text>
                    )}
                  </View>
                </View>
              )}

              {/* Notes */}
              {hospital.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesText}>{hospital.notes}</Text>
                </View>
              )}

              {/* Contact Actions */}
              <View style={styles.actionsContainer}>
                {hospital.phone && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleCall(hospital.phone)}
                  >
                    <IconSymbol
                      ios_icon_name="phone.fill"
                      android_material_icon_name="phone"
                      size={20}
                      color={colors.card}
                    />
                    <Text style={styles.actionButtonText}>Call</Text>
                  </TouchableOpacity>
                )}

                {hospital.email && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEmail(hospital.email)}
                  >
                    <IconSymbol
                      ios_icon_name="envelope.fill"
                      android_material_icon_name="email"
                      size={20}
                      color={colors.card}
                    />
                    <Text style={styles.actionButtonText}>Email</Text>
                  </TouchableOpacity>
                )}

                {hospital.website && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleWebsite(hospital.website)}
                  >
                    <IconSymbol
                      ios_icon_name="globe"
                      android_material_icon_name="language"
                      size={20}
                      color={colors.card}
                    />
                    <Text style={styles.actionButtonText}>Website</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleGetDirections(hospital)}
                >
                  <IconSymbol
                    ios_icon_name="map.fill"
                    android_material_icon_name="directions"
                    size={20}
                    color={colors.card}
                  />
                  <Text style={styles.actionButtonText}>Directions</Text>
                </TouchableOpacity>
              </View>

              {/* Create Referral Button */}
              <TouchableOpacity
                style={styles.referralButton}
                onPress={() => {
                  setSelectedHospital(hospital);
                  setShowReferralModal(true);
                }}
              >
                <IconSymbol
                  ios_icon_name="arrow.right.circle"
                  android_material_icon_name="send"
                  size={20}
                  color={colors.card}
                />
                <Text style={styles.referralButtonText}>Create Referral</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Empty State */}
        {filteredHospitals.length === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="magnifyingglass"
              android_material_icon_name="search_off"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>No hospitals found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
          </View>
        )}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Referral Modal */}
      <Modal
        visible={showReferralModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReferralModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Referral</Text>
              <TouchableOpacity onPress={() => setShowReferralModal(false)}>
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={28}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {selectedHospital && (
              <View style={styles.modalHospitalInfo}>
                <Text style={styles.modalHospitalName}>{selectedHospital.name}</Text>
                <Text style={styles.modalHospitalLocation}>{selectedHospital.location}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Reason for Referral *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter the reason for this referral..."
              value={referralReason}
              onChangeText={setReferralReason}
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.textSecondary}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowReferralModal(false);
                  setReferralReason('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateReferral}
              >
                <Text style={styles.submitButtonText}>Create Referral</Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: colors.card,
  },
  resultsCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  referralCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  referralInfo: {
    flex: 1,
    marginLeft: 12,
  },
  referralHospital: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  referralDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
  referralReason: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  referralDoctor: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  hospitalCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  hospitalHeader: {
    marginBottom: 12,
  },
  hospitalTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hospitalTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.card,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  departmentsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  departmentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    marginLeft: 8,
  },
  departmentText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  notesContainer: {
    backgroundColor: colors.highlight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
  },
  referralButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  referralButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.card,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  bottomPadding: {
    height: 120,
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
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  modalHospitalInfo: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  modalHospitalName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  modalHospitalLocation: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.success,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
  },
});
