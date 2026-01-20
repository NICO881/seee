
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function ProfileScreen() {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logged out') },
      ]
    );
  };

  const profileSections = [
    {
      title: 'Personal Information',
      items: [
        { label: 'Name', value: 'John Nicholas', icon: 'person' },
        { label: 'Email', value: 'johnnicholas8814@gmail.com', icon: 'email' },
        { label: 'Phone', value: '+1 (555) 123-4567', icon: 'phone' },
        { label: 'Date of Birth', value: 'January 15, 1990', icon: 'cake' },
      ],
    },
    {
      title: 'Medical Information',
      items: [
        { label: 'Blood Type', value: 'O+', icon: 'water_drop' },
        { label: 'Allergies', value: 'Penicillin, Peanuts', icon: 'warning' },
        { label: 'Emergency Contact', value: 'Jane Nicholas - (555) 987-6543', icon: 'contact_phone' },
      ],
    },
  ];

  const settingsOptions = [
    { label: 'Notifications', icon: 'notifications', action: () => console.log('Notifications') },
    { label: 'Privacy & Security', icon: 'lock', action: () => console.log('Privacy') },
    { label: 'Payment Methods', icon: 'payment', action: () => console.log('Payment') },
    { label: 'Help & Support', icon: 'help', action: () => console.log('Help') },
    { label: 'About', icon: 'info', action: () => console.log('About') },
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
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <IconSymbol 
                ios_icon_name="person.fill" 
                android_material_icon_name="person" 
                size={48} 
                color={colors.primary}
              />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <IconSymbol 
                ios_icon_name="camera.fill" 
                android_material_icon_name="camera_alt" 
                size={16} 
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>John Nicholas</Text>
          <Text style={styles.profileEmail}>johnnicholas8814@gmail.com</Text>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <IconSymbol 
                        ios_icon_name={item.icon} 
                        android_material_icon_name={item.icon} 
                        size={20} 
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>{item.label}</Text>
                      <Text style={styles.infoValue}>{item.value}</Text>
                    </View>
                  </View>
                  {itemIndex < section.items.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.sectionCard}>
            {settingsOptions.map((option, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity 
                  style={styles.settingsRow}
                  onPress={option.action}
                >
                  <View style={styles.settingsLeft}>
                    <View style={styles.settingsIconContainer}>
                      <IconSymbol 
                        ios_icon_name={option.icon} 
                        android_material_icon_name={option.icon} 
                        size={20} 
                        color={colors.primary}
                      />
                    </View>
                    <Text style={styles.settingsLabel}>{option.label}</Text>
                  </View>
                  <IconSymbol 
                    ios_icon_name="chevron.right" 
                    android_material_icon_name="chevron_right" 
                    size={20} 
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                {index < settingsOptions.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View style={[styles.section, { marginBottom: 120 }]}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <IconSymbol 
              ios_icon_name="arrow.right.square" 
              android_material_icon_name="logout" 
              size={20} 
              color={colors.error}
            />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
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
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.card,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  editProfileButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editProfileButtonText: {
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
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
});
