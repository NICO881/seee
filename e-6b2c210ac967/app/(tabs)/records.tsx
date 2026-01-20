
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Share } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { mockMedicalRecords, mockPrescriptions } from '@/data/mockData';

export default function RecordsScreen() {
  const [selectedTab, setSelectedTab] = useState<'all' | 'lab' | 'imaging' | 'prescriptions'>('all');

  const filteredRecords = selectedTab === 'all' 
    ? mockMedicalRecords 
    : mockMedicalRecords.filter(record => {
        if (selectedTab === 'lab') return record.type === 'Lab Result';
        if (selectedTab === 'imaging') return record.type === 'Imaging';
        if (selectedTab === 'prescriptions') return record.type === 'Prescription';
        return true;
      });

  const handleDownload = (recordId: string) => {
    console.log('Downloading record:', recordId);
    // Simulate download
  };

  const handleShare = async (record: any) => {
    try {
      await Share.share({
        message: `Medical Record: ${record.title}\nDate: ${record.date}\n${record.description}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'Lab Result':
        return { ios: 'flask.fill', android: 'science' };
      case 'Imaging':
        return { ios: 'camera.fill', android: 'image' };
      case 'Prescription':
        return { ios: 'pills.fill', android: 'medication' };
      case 'Diagnosis':
        return { ios: 'stethoscope', android: 'medical_services' };
      default:
        return { ios: 'doc.fill', android: 'description' };
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
          <Text style={styles.headerTitle}>Medical Records</Text>
        </View>

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabScrollView}
          contentContainerStyle={styles.tabContainer}
        >
          <TouchableOpacity 
            style={[styles.filterTab, selectedTab === 'all' && styles.activeFilterTab]}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={[styles.filterTabText, selectedTab === 'all' && styles.activeFilterTabText]}>
              All Records
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterTab, selectedTab === 'lab' && styles.activeFilterTab]}
            onPress={() => setSelectedTab('lab')}
          >
            <Text style={[styles.filterTabText, selectedTab === 'lab' && styles.activeFilterTabText]}>
              Lab Results
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterTab, selectedTab === 'imaging' && styles.activeFilterTab]}
            onPress={() => setSelectedTab('imaging')}
          >
            <Text style={[styles.filterTabText, selectedTab === 'imaging' && styles.activeFilterTabText]}>
              Imaging
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterTab, selectedTab === 'prescriptions' && styles.activeFilterTab]}
            onPress={() => setSelectedTab('prescriptions')}
          >
            <Text style={[styles.filterTabText, selectedTab === 'prescriptions' && styles.activeFilterTabText]}>
              Prescriptions
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Records List */}
        <View style={styles.recordsList}>
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record, index) => {
              const icon = getRecordIcon(record.type);
              return (
                <View key={index} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <View style={styles.recordIconContainer}>
                      <IconSymbol 
                        ios_icon_name={icon.ios} 
                        android_material_icon_name={icon.android} 
                        size={24} 
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.recordInfo}>
                      <Text style={styles.recordTitle}>{record.title}</Text>
                      <Text style={styles.recordType}>{record.type}</Text>
                      <Text style={styles.recordDate}>{record.date}</Text>
                    </View>
                  </View>
                  <Text style={styles.recordDescription}>{record.description}</Text>
                  <View style={styles.recordActions}>
                    <TouchableOpacity 
                      style={styles.recordActionButton}
                      onPress={() => handleDownload(record.id)}
                    >
                      <IconSymbol 
                        ios_icon_name="arrow.down.circle" 
                        android_material_icon_name="download" 
                        size={18} 
                        color={colors.primary}
                      />
                      <Text style={styles.recordActionText}>Download</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.recordActionButton}
                      onPress={() => handleShare(record)}
                    >
                      <IconSymbol 
                        ios_icon_name="square.and.arrow.up" 
                        android_material_icon_name="share" 
                        size={18} 
                        color={colors.primary}
                      />
                      <Text style={styles.recordActionText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol 
                ios_icon_name="doc.text" 
                android_material_icon_name="description" 
                size={48} 
                color={colors.textSecondary}
              />
              <Text style={styles.emptyStateText}>No records found</Text>
            </View>
          )}
        </View>

        {/* Active Prescriptions */}
        <View style={[styles.section, { marginBottom: 120 }]}>
          <Text style={styles.sectionTitle}>Active Prescriptions</Text>
          {mockPrescriptions.map((prescription, index) => (
            <View key={index} style={styles.prescriptionCard}>
              <View style={styles.prescriptionHeader}>
                <View style={styles.prescriptionIconContainer}>
                  <IconSymbol 
                    ios_icon_name="pills.fill" 
                    android_material_icon_name="medication" 
                    size={24} 
                    color={colors.secondary}
                  />
                </View>
                <View style={styles.prescriptionInfo}>
                  <Text style={styles.prescriptionMedication}>{prescription.medication}</Text>
                  <Text style={styles.prescriptionDoctor}>Prescribed by {prescription.doctorName}</Text>
                </View>
              </View>
              <View style={styles.prescriptionDetails}>
                <View style={styles.prescriptionDetailRow}>
                  <Text style={styles.prescriptionDetailLabel}>Dosage:</Text>
                  <Text style={styles.prescriptionDetailValue}>{prescription.dosage}</Text>
                </View>
                <View style={styles.prescriptionDetailRow}>
                  <Text style={styles.prescriptionDetailLabel}>Frequency:</Text>
                  <Text style={styles.prescriptionDetailValue}>{prescription.frequency}</Text>
                </View>
                <View style={styles.prescriptionDetailRow}>
                  <Text style={styles.prescriptionDetailLabel}>Duration:</Text>
                  <Text style={styles.prescriptionDetailValue}>{prescription.duration}</Text>
                </View>
                <View style={styles.prescriptionDetailRow}>
                  <Text style={styles.prescriptionDetailLabel}>Date:</Text>
                  <Text style={styles.prescriptionDetailValue}>{prescription.date}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.refillButton}>
                <Text style={styles.refillButtonText}>Request Refill</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
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
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  tabScrollView: {
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.card,
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  recordsList: {
    marginBottom: 24,
  },
  recordCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  recordIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  recordType: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recordDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
    lineHeight: 20,
  },
  recordActions: {
    flexDirection: 'row',
    gap: 12,
  },
  recordActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  recordActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
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
  prescriptionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  prescriptionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  prescriptionInfo: {
    flex: 1,
  },
  prescriptionMedication: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  prescriptionDoctor: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  prescriptionDetails: {
    marginBottom: 16,
  },
  prescriptionDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  prescriptionDetailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  prescriptionDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  refillButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refillButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
