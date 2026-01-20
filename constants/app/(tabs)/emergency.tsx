
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, Linking, Modal, TextInput, ActivityIndicator } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { mockHospitals, mockPoliceEmergencyContacts, mockPoliceStations, mockEmergencies } from '@/data/mockData';
import { Hospital, PoliceStation, Emergency } from '@/types';
import * as Location from 'expo-location';
import { 
  calculateDistance, 
  generateMapsLink, 
  formatCoordinates, 
  calculateETA, 
  hasLocationChanged,
  getAccuracyDescription,
  formatDistance,
  getNearestLocations 
} from '@/utils/locationUtils';
import { 
  formatEmergencySMS, 
  sendEmergencyNotification, 
  showEnhancedSMSFallback,
  retryQueuedSMS,
  getSMSQueue,
  formatLocationUpdateSMS,
  isSMSAvailable 
} from '@/utils/smsUtils';
import { 
  getTriageGuidance, 
  getEmergencySeverity, 
  getResponseTimeMessage,
  TriageGuidance 
} from '@/utils/aiTriageUtils';

export default function EmergencyScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showPolicePrompt, setShowPolicePrompt] = useState(false);
  const [showEmergencyTypeModal, setShowEmergencyTypeModal] = useState(false);
  const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'medical' | 'police'>('medical');
  const [liveTracking, setLiveTracking] = useState(false);
  const [emergencyType, setEmergencyType] = useState('Medical Emergency');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAllergies, setPatientAllergies] = useState('');
  const [nearestHospitals, setNearestHospitals] = useState<Hospital[]>([]);
  const [nearestPoliceStations, setNearestPoliceStations] = useState<PoliceStation[]>([]);
  const [currentEmergency, setCurrentEmergency] = useState<Emergency | null>(null);
  const [showAITriageModal, setShowAITriageModal] = useState(false);
  const [triageGuidance, setTriageGuidance] = useState<TriageGuidance | null>(null);
  const [sendingProgress, setSendingProgress] = useState<{ current: number; total: number } | null>(null);
  const [locationUpdateCount, setLocationUpdateCount] = useState(0);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<{ lat: number; lon: number } | null>(null);
  const [smsAvailable, setSmsAvailable] = useState(true);
  
  const locationWatchRef = useRef<Location.LocationSubscription | null>(null);
  const locationUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeLocation();
    checkSMSAvailability();
  }, []);

  const initializeLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(currentLocation);
        console.log('Current location:', currentLocation);
        console.log('Accuracy:', getAccuracyDescription(currentLocation.coords.accuracy || 0));
        
        updateNearestLocations(currentLocation);
      } else {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to send your exact position to emergency services. Please enable location permissions in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (error) {
      console.error('Error initializing location:', error);
      Alert.alert('Location Error', 'Unable to get your location. Please check your device settings.');
    }
  };

  const checkSMSAvailability = async () => {
    const available = await isSMSAvailable();
    setSmsAvailable(available);
    if (!available) {
      console.log('SMS not available on this device');
    }
  };

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      handleEmergencyConfirm();
    }
  }, [countdown]);

  useEffect(() => {
    if (liveTracking && locationPermission) {
      startLiveTracking();
    } else {
      stopLiveTracking();
    }
    
    return () => {
      stopLiveTracking();
    };
  }, [liveTracking, locationPermission]);

  const updateNearestLocations = (currentLocation: Location.LocationObject) => {
    const { latitude, longitude } = currentLocation.coords;
    
    const hospitalsWithDistance = getNearestLocations(mockHospitals, latitude, longitude, 3);
    setNearestHospitals(hospitalsWithDistance);
    
    const stationsWithDistance = getNearestLocations(mockPoliceStations, latitude, longitude, 3);
    setNearestPoliceStations(stationsWithDistance);
    
    console.log('Nearest hospitals:', hospitalsWithDistance.map(h => `${h.name} (${formatDistance(h.distance)})`));
    console.log('Nearest police stations:', stationsWithDistance.map(s => `${s.station_name} (${formatDistance(s.distance)})`));
  };

  const startLiveTracking = async () => {
    try {
      locationWatchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 60000, // Update every minute
          distanceInterval: 50, // Update every 50 meters
        },
        (newLocation) => {
          handleLocationUpdate(newLocation);
        }
      );
      
      // Also set up periodic updates every 2 minutes
      locationUpdateIntervalRef.current = setInterval(() => {
        if (location && currentEmergency) {
          sendLocationUpdate(location);
        }
      }, 120000); // 2 minutes
      
      console.log('Live tracking started');
    } catch (error) {
      console.error('Error starting live tracking:', error);
      Alert.alert('Tracking Error', 'Unable to start live location tracking.');
    }
  };

  const stopLiveTracking = () => {
    if (locationWatchRef.current) {
      locationWatchRef.current.remove();
      locationWatchRef.current = null;
    }
    
    if (locationUpdateIntervalRef.current) {
      clearInterval(locationUpdateIntervalRef.current);
      locationUpdateIntervalRef.current = null;
    }
    
    console.log('Live tracking stopped');
  };

  const handleLocationUpdate = (newLocation: Location.LocationObject) => {
    const { latitude, longitude } = newLocation.coords;
    
    // Check if location has changed significantly
    if (lastLocationUpdate && !hasLocationChanged(
      lastLocationUpdate.lat,
      lastLocationUpdate.lon,
      latitude,
      longitude
    )) {
      console.log('Location change not significant, skipping update');
      return;
    }
    
    setLocation(newLocation);
    setLastLocationUpdate({ lat: latitude, lon: longitude });
    updateNearestLocations(newLocation);
    
    console.log('Location updated:', formatCoordinates(latitude, longitude));
    
    // Send location update to emergency contacts
    if (currentEmergency && emergencyActive) {
      sendLocationUpdate(newLocation);
    }
  };

  const sendLocationUpdate = async (currentLocation: Location.LocationObject) => {
    if (!currentEmergency) return;
    
    const updateNumber = locationUpdateCount + 1;
    setLocationUpdateCount(updateNumber);
    
    const { latitude, longitude } = currentLocation.coords;
    const message = formatLocationUpdateSMS(
      latitude,
      longitude,
      currentEmergency.id,
      updateNumber
    );
    
    console.log(`Sending location update #${updateNumber}`);
    
    // Send to hospitals and police that were notified
    const recipients = [
      ...nearestHospitals.slice(0, 2).map(h => ({
        name: h.name,
        phone: h.phone,
        type: 'hospital' as const,
      })),
      ...nearestPoliceStations.slice(0, 2).map(s => ({
        name: s.station_name,
        phone: s.phone_number,
        type: 'police' as const,
      })),
    ];
    
    // Send updates silently in background
    sendEmergencyNotification(recipients, message);
  };

  const handleEmergencyPress = () => {
    if (!locationPermission) {
      Alert.alert(
        'Location Required',
        'Please enable location services to use emergency features.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: initializeLocation },
        ]
      );
      return;
    }
    
    setShowEmergencyTypeModal(true);
  };

  const handleEmergencyTypeSelected = (type: string) => {
    setEmergencyType(type);
    setShowEmergencyTypeModal(false);
    
    // Load triage guidance
    const guidance = getTriageGuidance(type);
    setTriageGuidance(guidance);
    
    setShowPatientDetailsModal(true);
  };

  const handleStartEmergency = () => {
    setShowPatientDetailsModal(false);
    
    const severity = getEmergencySeverity(emergencyType);
    const responseTime = getResponseTimeMessage(severity);
    
    Alert.alert(
      'Confirm Emergency Alert',
      `This will send emergency alerts to the nearest hospitals and police stations.\n\nType: ${emergencyType}\nSeverity: ${severity.toUpperCase()}\nPatient: ${patientName || 'Not provided'}\n\n${responseTime}\n\nAre you sure?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: () => setCountdown(5),
        },
      ]
    );
  };

  const handleEmergencyConfirm = async () => {
    if (!location) {
      Alert.alert('Location Error', 'Unable to get your location. Please try again.');
      setCountdown(null);
      return;
    }

    setEmergencyActive(true);
    setCountdown(null);
    setLiveTracking(true);
    
    const { latitude, longitude } = location.coords;
    
    // Create emergency record
    const emergency: Emergency = {
      id: Date.now().toString(),
      patient_name: patientName || undefined,
      contact_number: patientPhone || 'Not provided',
      emergency_type: emergencyType,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
      status: 'Pending',
      notified_hospitals: nearestHospitals.map(h => h.id),
      notified_police: nearestPoliceStations.map(s => s.id),
      allergies: patientAllergies ? patientAllergies.split(',').map(a => a.trim()) : undefined,
    };
    
    setCurrentEmergency(emergency);
    mockEmergencies.push(emergency);
    setLastLocationUpdate({ lat: latitude, lon: longitude });
    
    console.log('Emergency created:', emergency);
    
    // Format SMS message
    const smsMessage = formatEmergencySMS({
      patientName: patientName || undefined,
      contactNumber: patientPhone || 'Not provided',
      emergencyType,
      latitude,
      longitude,
      allergies: patientAllergies ? patientAllergies.split(',').map(a => a.trim()) : undefined,
    });
    
    console.log('SMS Message:', smsMessage);
    
    // Show AI triage guidance immediately
    setShowAITriageModal(true);
    
    // Prepare recipients
    const recipients = [
      ...nearestHospitals.slice(0, 2).map(h => ({
        name: h.name,
        phone: h.phone,
        type: 'hospital' as const,
      })),
    ];
    
    // Send SMS to hospitals
    try {
      const result = await sendEmergencyNotification(
        recipients,
        smsMessage,
        (current, total) => {
          setSendingProgress({ current, total });
        }
      );
      
      setSendingProgress(null);
      
      if (result.success) {
        console.log('All emergency notifications sent successfully');
        Alert.alert(
          'Alert Sent',
          `Emergency alert sent to ${result.sent.length} recipient(s):\n${result.sent.map(r => r.name).join('\n')}`
        );
      } else {
        console.log('Some notifications failed:', result.failed);
        showEnhancedSMSFallback(
          result.failed.map(f => f.phone),
          emergencyType
        );
      }
    } catch (error) {
      console.error('Error sending emergency notifications:', error);
      setSendingProgress(null);
      showEnhancedSMSFallback(
        recipients.map(r => r.phone),
        emergencyType
      );
    }
    
    // Show police prompt after 3 seconds
    setTimeout(() => {
      setShowPolicePrompt(true);
    }, 3000);
  };

  const handleCancelEmergency = () => {
    Alert.alert(
      'Cancel Emergency',
      'Are you sure you want to cancel the emergency alert? This will stop live location tracking.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setCountdown(null);
            setEmergencyActive(false);
            setShowPolicePrompt(false);
            setLiveTracking(false);
            setShowAITriageModal(false);
            setLocationUpdateCount(0);
            setLastLocationUpdate(null);
            
            if (currentEmergency) {
              currentEmergency.status = 'Cancelled';
              console.log('Emergency cancelled:', currentEmergency.id);
            }
            
            Alert.alert('Emergency Cancelled', 'The emergency alert has been cancelled.');
          },
        },
      ]
    );
  };

  const handleCallEmergency = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleGetDirections = (name: string, lat?: number, lon?: number) => {
    if (location && lat && lon) {
      const url = Platform.select({
        ios: `maps:${lat},${lon}?q=${encodeURIComponent(name)}`,
        android: `geo:${lat},${lon}?q=${encodeURIComponent(name)}`,
        default: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
      });
      Linking.openURL(url);
    } else {
      const url = Platform.select({
        ios: `maps:0,0?q=${encodeURIComponent(name)}`,
        android: `geo:0,0?q=${encodeURIComponent(name)}`,
        default: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`,
      });
      Linking.openURL(url);
    }
  };

  const handleAlertPolice = async () => {
    setShowPolicePrompt(false);
    
    if (!location) {
      Alert.alert('Location Error', 'Unable to get your location.');
      return;
    }
    
    const { latitude, longitude } = location.coords;
    
    // Format SMS for police
    const smsMessage = formatEmergencySMS({
      patientName: patientName || undefined,
      contactNumber: patientPhone || 'Not provided',
      emergencyType,
      latitude,
      longitude,
    });
    
    // Prepare police recipients
    const recipients = nearestPoliceStations.slice(0, 2).map(s => ({
      name: s.station_name,
      phone: s.phone_number,
      type: 'police' as const,
    }));
    
    try {
      const result = await sendEmergencyNotification(
        recipients,
        smsMessage,
        (current, total) => {
          setSendingProgress({ current, total });
        }
      );
      
      setSendingProgress(null);
      
      if (result.success) {
        Alert.alert(
          'Police Alerted',
          `Police alert sent to ${result.sent.length} station(s):\n${result.sent.map(r => r.name).join('\n')}`
        );
        setActiveTab('police');
      } else {
        showEnhancedSMSFallback(
          result.failed.map(f => f.phone),
          emergencyType
        );
      }
    } catch (error) {
      console.error('Error alerting police:', error);
      setSendingProgress(null);
      showEnhancedSMSFallback(
        recipients.map(r => r.phone),
        emergencyType
      );
    }
  };

  const handleRetryFailedSMS = async () => {
    const queue = getSMSQueue();
    if (queue.length === 0) {
      Alert.alert('No Failed Messages', 'There are no failed messages to retry.');
      return;
    }
    
    Alert.alert(
      'Retry Failed Messages',
      `You have ${queue.length} failed message(s) in the queue. Would you like to retry sending them?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retry',
          onPress: async () => {
            const result = await retryQueuedSMS();
            Alert.alert(
              'Retry Complete',
              `Processed: ${result.processed}\nSuccessful: ${result.successful}\nFailed: ${result.failed}`
            );
          },
        },
      ]
    );
  };

  const sortedPoliceContacts = [...mockPoliceEmergencyContacts].sort((a, b) => a.priority - b.priority);

  const emergencyTypes = [
    { label: 'Medical Emergency', icon: 'cross.fill', androidIcon: 'local_hospital' },
    { label: 'Cardiac Emergency', icon: 'heart.fill', androidIcon: 'favorite' },
    { label: 'Accident/Trauma', icon: 'car.fill', androidIcon: 'directions_car' },
    { label: 'Respiratory Emergency', icon: 'lungs.fill', androidIcon: 'air' },
    { label: 'Allergic Reaction', icon: 'allergens', androidIcon: 'warning' },
    { label: 'Stroke', icon: 'brain', androidIcon: 'psychology' },
    { label: 'Seizure', icon: 'bolt.fill', androidIcon: 'flash_on' },
    { label: 'Choking', icon: 'exclamationmark.triangle.fill', androidIcon: 'emergency' },
    { label: 'Burns', icon: 'flame.fill', androidIcon: 'local_fire_department' },
    { label: 'Poisoning', icon: 'drop.fill', androidIcon: 'science' },
    { label: 'Other Emergency', icon: 'exclamationmark.circle.fill', androidIcon: 'error' },
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
          <Text style={styles.headerTitle}>Emergency</Text>
          {emergencyActive && (
            <View style={styles.activeIndicator}>
              <View style={styles.pulseDot} />
              <Text style={styles.activeText}>Active</Text>
            </View>
          )}
        </View>

        {/* SMS Status Warning */}
        {!smsAvailable && (
          <View style={styles.warningCard}>
            <IconSymbol 
              ios_icon_name="exclamationmark.triangle.fill" 
              android_material_icon_name="warning" 
              size={24} 
              color={colors.warning}
            />
            <Text style={styles.warningText}>
              SMS not available on this device. Emergency calls will be used instead.
            </Text>
          </View>
        )}

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'medical' && styles.activeTabButton]}
            onPress={() => setActiveTab('medical')}
          >
            <IconSymbol 
              ios_icon_name="cross.fill" 
              android_material_icon_name="local_hospital" 
              size={20} 
              color={activeTab === 'medical' ? '#FFFFFF' : colors.text}
            />
            <Text style={[styles.tabText, activeTab === 'medical' && styles.activeTabText]}>
              Medical
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'police' && styles.activeTabButton]}
            onPress={() => setActiveTab('police')}
          >
            <IconSymbol 
              ios_icon_name="shield.fill" 
              android_material_icon_name="local_police" 
              size={20} 
              color={activeTab === 'police' ? '#FFFFFF' : colors.text}
            />
            <Text style={[styles.tabText, activeTab === 'police' && styles.activeTabText]}>
              Police
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'medical' ? (
          <React.Fragment>
            {/* Emergency Button */}
            <View style={styles.emergencySection}>
              {countdown !== null ? (
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdownText}>Sending alert in</Text>
                  <Text style={styles.countdownNumber}>{countdown}</Text>
                  <TouchableOpacity 
                    style={styles.cancelCountdownButton}
                    onPress={handleCancelEmergency}
                  >
                    <Text style={styles.cancelCountdownText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : emergencyActive ? (
                <View style={styles.activeEmergencyContainer}>
                  <View style={styles.activeEmergencyIcon}>
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={64} 
                      color={colors.success}
                    />
                  </View>
                  <Text style={styles.activeEmergencyTitle}>Emergency Alert Sent</Text>
                  <Text style={styles.activeEmergencyText}>
                    Help is on the way. Stay calm and follow the AI guidance.
                  </Text>
                  {liveTracking && (
                    <View style={styles.liveTrackingBadge}>
                      <View style={styles.liveTrackingDot} />
                      <Text style={styles.liveTrackingText}>
                        Live tracking active • {locationUpdateCount} update{locationUpdateCount !== 1 ? 's' : ''} sent
                      </Text>
                    </View>
                  )}
                  {sendingProgress && (
                    <View style={styles.progressContainer}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={styles.progressText}>
                        Sending {sendingProgress.current} of {sendingProgress.total}...
                      </Text>
                    </View>
                  )}
                  <View style={styles.emergencyActions}>
                    <TouchableOpacity 
                      style={styles.aiGuidanceButton}
                      onPress={() => setShowAITriageModal(true)}
                    >
                      <IconSymbol 
                        ios_icon_name="brain" 
                        android_material_icon_name="psychology" 
                        size={20} 
                        color="#FFFFFF"
                      />
                      <Text style={styles.aiGuidanceButtonText}>AI Guidance</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.retryButton}
                      onPress={handleRetryFailedSMS}
                    >
                      <IconSymbol 
                        ios_icon_name="arrow.clockwise" 
                        android_material_icon_name="refresh" 
                        size={20} 
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.cancelEmergencyButton}
                      onPress={handleCancelEmergency}
                    >
                      <Text style={styles.cancelEmergencyText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.emergencyButton}
                  onPress={handleEmergencyPress}
                  activeOpacity={0.8}
                >
                  <View style={styles.emergencyButtonInner}>
                    <IconSymbol 
                      ios_icon_name="exclamationmark.triangle.fill" 
                      android_material_icon_name="emergency" 
                      size={64} 
                      color="#FFFFFF"
                    />
                    <Text style={styles.emergencyButtonText}>EMERGENCY</Text>
                    <Text style={styles.emergencyButtonSubtext}>Tap to send alert</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Location Status */}
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <IconSymbol 
                  ios_icon_name="location.fill" 
                  android_material_icon_name="location_on" 
                  size={24} 
                  color={locationPermission ? colors.success : colors.error}
                />
                <Text style={styles.locationTitle}>Your Location</Text>
              </View>
              {locationPermission && location ? (
                <View>
                  <Text style={styles.locationText}>
                    {formatCoordinates(location.coords.latitude, location.coords.longitude)}
                  </Text>
                  {location.coords.accuracy && (
                    <Text style={styles.locationAccuracy}>
                      Accuracy: {getAccuracyDescription(location.coords.accuracy)} ({Math.round(location.coords.accuracy)}m)
                    </Text>
                  )}
                  <Text style={styles.locationSubtext}>
                    Location services are enabled. Emergency services will be able to find you.
                  </Text>
                  <TouchableOpacity 
                    style={styles.viewMapButton}
                    onPress={() => {
                      const url = generateMapsLink(location.coords.latitude, location.coords.longitude);
                      Linking.openURL(url);
                    }}
                  >
                    <IconSymbol 
                      ios_icon_name="map.fill" 
                      android_material_icon_name="map" 
                      size={16} 
                      color={colors.primary}
                    />
                    <Text style={styles.viewMapButtonText}>View on Map</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <Text style={styles.locationErrorText}>
                    Location services are disabled
                  </Text>
                  <Text style={styles.locationSubtext}>
                    Please enable location services to use emergency features.
                  </Text>
                  <TouchableOpacity 
                    style={styles.enableLocationButton}
                    onPress={initializeLocation}
                  >
                    <Text style={styles.enableLocationButtonText}>Enable Location</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Emergency Contacts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Emergency Contacts</Text>
              <View style={styles.contactCard}>
                <View style={styles.contactIcon}>
                  <IconSymbol 
                    ios_icon_name="phone.fill" 
                    android_material_icon_name="phone" 
                    size={24} 
                    color={colors.error}
                  />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>Emergency Services</Text>
                  <Text style={styles.contactNumber}>999 / 112</Text>
                </View>
                <TouchableOpacity 
                  style={styles.callButton}
                  onPress={() => handleCallEmergency('999')}
                >
                  <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Nearby Hospitals */}
            <View style={[styles.section, { marginBottom: 120 }]}>
              <Text style={styles.sectionTitle}>Nearest Hospitals</Text>
              <Text style={styles.sectionSubtitle}>
                {nearestHospitals.length > 0 ? 'Sorted by distance from your location' : 'Enable location to see nearby hospitals'}
              </Text>
              {nearestHospitals.map((hospital, index) => (
                <View key={index} style={styles.hospitalCard}>
                  <View style={styles.hospitalHeader}>
                    <View style={styles.hospitalIcon}>
                      <IconSymbol 
                        ios_icon_name="building.2.fill" 
                        android_material_icon_name="local_hospital" 
                        size={24} 
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.hospitalInfo}>
                      <Text style={styles.hospitalName}>{hospital.name}</Text>
                      <Text style={styles.hospitalAddress}>{hospital.address}</Text>
                      <View style={styles.hospitalMeta}>
                        <View style={[
                          styles.erStatusBadge,
                          { backgroundColor: hospital.erStatus === 'Available' ? colors.success : colors.warning }
                        ]}>
                          <Text style={styles.erStatusText}>ER: {hospital.erStatus}</Text>
                        </View>
                        {hospital.distance && (
                          <React.Fragment>
                            <Text style={styles.distanceText}>{formatDistance(hospital.distance)}</Text>
                            <Text style={styles.etaText}>ETA: {calculateETA(hospital.distance)}</Text>
                          </React.Fragment>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.hospitalActions}>
                    <TouchableOpacity 
                      style={styles.hospitalActionButton}
                      onPress={() => handleCallEmergency(hospital.phone)}
                    >
                      <IconSymbol 
                        ios_icon_name="phone.fill" 
                        android_material_icon_name="phone" 
                        size={18} 
                        color={colors.primary}
                      />
                      <Text style={styles.hospitalActionText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.hospitalActionButton}
                      onPress={() => handleGetDirections(hospital.name, hospital.latitude, hospital.longitude)}
                    >
                      <IconSymbol 
                        ios_icon_name="map.fill" 
                        android_material_icon_name="directions" 
                        size={18} 
                        color={colors.primary}
                      />
                      <Text style={styles.hospitalActionText}>Directions</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {/* Police Emergency Numbers */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Police Emergency Numbers</Text>
              <Text style={styles.sectionSubtitle}>
                National emergency lines - available 24/7
              </Text>
              {sortedPoliceContacts.slice(0, 6).map((contact, index) => (
                <View key={index} style={styles.policeContactCard}>
                  <View style={[
                    styles.policeContactIcon,
                    { backgroundColor: contact.category === 'General' ? colors.error + '20' : 
                                       contact.category === 'Fire/Rescue' ? colors.warning + '20' : 
                                       colors.primary + '20' }
                  ]}>
                    <IconSymbol 
                      ios_icon_name={
                        contact.category === 'General' ? 'shield.fill' :
                        contact.category === 'Fire/Rescue' ? 'flame.fill' :
                        'exclamationmark.shield.fill'
                      }
                      android_material_icon_name={
                        contact.category === 'General' ? 'local_police' :
                        contact.category === 'Fire/Rescue' ? 'local_fire_department' :
                        'security'
                      }
                      size={24} 
                      color={
                        contact.category === 'General' ? colors.error :
                        contact.category === 'Fire/Rescue' ? colors.warning :
                        colors.primary
                      }
                    />
                  </View>
                  <View style={styles.policeContactInfo}>
                    <Text style={styles.policeContactName}>{contact.contact_name}</Text>
                    <Text style={styles.policeContactNumber}>{contact.phone_number}</Text>
                    <Text style={styles.policeContactDescription}>{contact.description}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[
                      styles.policeCallButton,
                      { backgroundColor: contact.priority === 1 ? colors.error : colors.primary }
                    ]}
                    onPress={() => handleCallEmergency(contact.phone_number)}
                  >
                    <IconSymbol 
                      ios_icon_name="phone.fill" 
                      android_material_icon_name="phone" 
                      size={18} 
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Nearby Police Stations */}
            <View style={[styles.section, { marginBottom: 120 }]}>
              <Text style={styles.sectionTitle}>Nearest Police Stations</Text>
              <Text style={styles.sectionSubtitle}>
                {nearestPoliceStations.length > 0 ? 'Sorted by distance from your location' : 'Enable location to see nearby stations'}
              </Text>
              {nearestPoliceStations.map((station, index) => (
                <View key={index} style={styles.stationCard}>
                  <View style={styles.stationHeader}>
                    <View style={styles.stationIcon}>
                      <IconSymbol 
                        ios_icon_name="building.2.fill" 
                        android_material_icon_name="account_balance" 
                        size={24} 
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.stationInfo}>
                      <Text style={styles.stationName}>{station.station_name}</Text>
                      <Text style={styles.stationAddress}>
                        {station.division}, {station.district}
                      </Text>
                      <View style={styles.stationMeta}>
                        <View style={styles.stationTypeBadge}>
                          <Text style={styles.stationTypeText}>{station.type}</Text>
                        </View>
                        {station.distance && (
                          <React.Fragment>
                            <Text style={styles.distanceText}>{formatDistance(station.distance)}</Text>
                            <Text style={styles.etaText}>ETA: {calculateETA(station.distance)}</Text>
                          </React.Fragment>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.stationActions}>
                    <TouchableOpacity 
                      style={styles.stationActionButton}
                      onPress={() => handleCallEmergency(station.phone_number)}
                    >
                      <IconSymbol 
                        ios_icon_name="phone.fill" 
                        android_material_icon_name="phone" 
                        size={18} 
                        color={colors.primary}
                      />
                      <Text style={styles.stationActionText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.stationActionButton}
                      onPress={() => handleGetDirections(
                        station.station_name, 
                        station.latitude, 
                        station.longitude
                      )}
                    >
                      <IconSymbol 
                        ios_icon_name="map.fill" 
                        android_material_icon_name="directions" 
                        size={18} 
                        color={colors.primary}
                      />
                      <Text style={styles.stationActionText}>Directions</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </React.Fragment>
        )}
      </ScrollView>

      {/* Emergency Type Selection Modal */}
      <Modal
        visible={showEmergencyTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEmergencyTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Emergency Type</Text>
            <Text style={styles.modalText}>
              Choose the type of emergency to help responders prepare
            </Text>
            <ScrollView style={styles.emergencyTypeList}>
              {emergencyTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emergencyTypeItem}
                  onPress={() => handleEmergencyTypeSelected(type.label)}
                >
                  <IconSymbol 
                    ios_icon_name={type.icon} 
                    android_material_icon_name={type.androidIcon} 
                    size={24} 
                    color={colors.error}
                  />
                  <Text style={styles.emergencyTypeText}>{type.label}</Text>
                  <IconSymbol 
                    ios_icon_name="chevron.right" 
                    android_material_icon_name="chevron_right" 
                    size={20} 
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalButtonSecondary}
              onPress={() => setShowEmergencyTypeModal(false)}
            >
              <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Patient Details Modal */}
      <Modal
        visible={showPatientDetailsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPatientDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Patient Details (Optional)</Text>
            <Text style={styles.modalText}>
              Providing details helps emergency responders prepare better
            </Text>
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Patient Name"
                placeholderTextColor={colors.textSecondary}
                value={patientName}
                onChangeText={setPatientName}
              />
              <TextInput
                style={styles.input}
                placeholder="Contact Phone"
                placeholderTextColor={colors.textSecondary}
                value={patientPhone}
                onChangeText={setPatientPhone}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Known Allergies (comma separated)"
                placeholderTextColor={colors.textSecondary}
                value={patientAllergies}
                onChangeText={setPatientAllergies}
                multiline
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonSecondary}
                onPress={() => {
                  setPatientName('');
                  setPatientPhone('');
                  setPatientAllergies('');
                  handleStartEmergency();
                }}
              >
                <Text style={styles.modalButtonSecondaryText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonPrimary}
                onPress={handleStartEmergency}
              >
                <Text style={styles.modalButtonPrimaryText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* AI Triage Guidance Modal */}
      <Modal
        visible={showAITriageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAITriageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalIcon}>
              <IconSymbol 
                ios_icon_name="brain" 
                android_material_icon_name="psychology" 
                size={48} 
                color={colors.primary}
              />
            </View>
            <Text style={styles.modalTitle}>AI Emergency Guidance</Text>
            <Text style={styles.modalSubtitle}>{emergencyType}</Text>
            
            {triageGuidance && (
              <ScrollView style={styles.guidanceScrollView} showsVerticalScrollIndicator={true}>
                {/* Immediate Steps */}
                <Text style={styles.guidanceSectionTitle}>Immediate Steps:</Text>
                {triageGuidance.steps.map((step, index) => (
                  <View key={index} style={styles.guidanceItem}>
                    <View style={styles.guidanceNumber}>
                      <Text style={styles.guidanceNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.guidanceText}>{step}</Text>
                  </View>
                ))}
                
                {/* Warnings */}
                {triageGuidance.warnings.length > 0 && (
                  <React.Fragment>
                    <Text style={styles.guidanceSectionTitle}>⚠️ Important Warnings:</Text>
                    {triageGuidance.warnings.map((warning, index) => (
                      <View key={index} style={styles.warningItem}>
                        <Text style={styles.warningItemText}>• {warning}</Text>
                      </View>
                    ))}
                  </React.Fragment>
                )}
                
                {/* Do Nots */}
                {triageGuidance.doNots.length > 0 && (
                  <React.Fragment>
                    <Text style={styles.guidanceSectionTitle}>🚫 Do NOT:</Text>
                    {triageGuidance.doNots.map((doNot, index) => (
                      <View key={index} style={styles.doNotItem}>
                        <Text style={styles.doNotItemText}>• {doNot}</Text>
                      </View>
                    ))}
                  </React.Fragment>
                )}
                
                {/* When to Call 911 */}
                {triageGuidance.whenToCall911.length > 0 && (
                  <React.Fragment>
                    <Text style={styles.guidanceSectionTitle}>📞 Call 999/112 If:</Text>
                    {triageGuidance.whenToCall911.map((condition, index) => (
                      <View key={index} style={styles.call911Item}>
                        <Text style={styles.call911ItemText}>• {condition}</Text>
                      </View>
                    ))}
                  </React.Fragment>
                )}
                
                {/* Additional Info */}
                {triageGuidance.additionalInfo && (
                  <React.Fragment>
                    <Text style={styles.guidanceSectionTitle}>ℹ️ Additional Information:</Text>
                    <Text style={styles.additionalInfoText}>{triageGuidance.additionalInfo}</Text>
                  </React.Fragment>
                )}
              </ScrollView>
            )}
            
            <TouchableOpacity 
              style={styles.modalButtonPrimary}
              onPress={() => setShowAITriageModal(false)}
            >
              <Text style={styles.modalButtonPrimaryText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Police Prompt Modal */}
      <Modal
        visible={showPolicePrompt}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPolicePrompt(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <IconSymbol 
                ios_icon_name="shield.fill" 
                android_material_icon_name="local_police" 
                size={48} 
                color={colors.primary}
              />
            </View>
            <Text style={styles.modalTitle}>Also Alert Police?</Text>
            <Text style={styles.modalText}>
              In many medical emergencies, police assistance can help with coordination, crowd control, and ensuring your safety.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonSecondary}
                onPress={() => setShowPolicePrompt(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Not Now</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonPrimary}
                onPress={handleAlertPolice}
              >
                <Text style={styles.modalButtonPrimaryText}>Alert Police</Text>
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
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.error,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  emergencySection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emergencyButton: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 8px 24px rgba(244, 67, 54, 0.4)',
    elevation: 8,
  },
  emergencyButtonInner: {
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emergencyButtonSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 8,
  },
  countdownContainer: {
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 48,
    borderRadius: 24,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  countdownText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },
  countdownNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 24,
  },
  cancelCountdownButton: {
    backgroundColor: colors.textSecondary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  cancelCountdownText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  activeEmergencyContainer: {
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 32,
    borderRadius: 24,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)',
    elevation: 4,
    width: '100%',
  },
  activeEmergencyIcon: {
    marginBottom: 16,
  },
  activeEmergencyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  activeEmergencyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  liveTrackingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    gap: 6,
  },
  liveTrackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  liveTrackingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emergencyActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  aiGuidanceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  aiGuidanceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: colors.primary + '20',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelEmergencyButton: {
    flex: 1,
    backgroundColor: colors.textSecondary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelEmergencyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  locationCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  locationAccuracy: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  locationErrorText: {
    fontSize: 14,
    color: colors.error,
    marginBottom: 8,
  },
  locationSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 12,
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '20',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  viewMapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  enableLocationButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  enableLocationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  contactCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  callButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  hospitalCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  hospitalHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  hospitalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  hospitalAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  hospitalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  erStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  erStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  distanceText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  etaText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  hospitalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  hospitalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  hospitalActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  policeContactCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  policeContactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  policeContactInfo: {
    flex: 1,
  },
  policeContactName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  policeContactNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  policeContactDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  policeCallButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stationCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  stationHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  stationAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  stationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  stationTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.primary + '20',
  },
  stationTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  stationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  stationActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  stationActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    alignItems: 'center',
    boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.2)',
    elevation: 8,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emergencyTypeList: {
    width: '100%',
    maxHeight: 300,
    marginBottom: 16,
  },
  emergencyTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  emergencyTypeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  guidanceScrollView: {
    width: '100%',
    maxHeight: 400,
    marginBottom: 24,
  },
  guidanceSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  guidanceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  guidanceNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidanceNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  guidanceText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  warningItem: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  warningItemText: {
    fontSize: 14,
    color: colors.warning,
    lineHeight: 20,
  },
  doNotItem: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  doNotItemText: {
    fontSize: 14,
    color: colors.error,
    lineHeight: 20,
  },
  call911Item: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  call911ItemText: {
    fontSize: 14,
    color: colors.primary,
    lineHeight: 20,
    fontWeight: '600',
  },
  additionalInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
