
/**
 * SMS utility functions for emergency alerts
 */

import { Alert, Linking, Platform } from 'react-native';

export interface EmergencyDetails {
  patientName?: string;
  contactNumber?: string;
  emergencyType: string;
  latitude: number;
  longitude: number;
  allergies?: string[];
  medicalHistory?: string[];
}

export interface SMSQueueItem {
  id: string;
  phoneNumber: string;
  message: string;
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'sent' | 'failed';
}

// SMS Queue for retry mechanism
let smsQueue: SMSQueueItem[] = [];

/**
 * Format emergency SMS message
 */
export function formatEmergencySMS(details: EmergencyDetails): string {
  const { patientName, contactNumber, emergencyType, latitude, longitude, allergies, medicalHistory } = details;
  
  let message = '🚨 EMERGENCY ALERT 🚨\n\n';
  message += `Type: ${emergencyType}\n`;
  
  if (patientName) {
    message += `Patient: ${patientName}\n`;
  }
  
  if (contactNumber) {
    message += `Contact: ${contactNumber}\n`;
  }
  
  if (allergies && allergies.length > 0) {
    message += `Allergies: ${allergies.join(', ')}\n`;
  }
  
  if (medicalHistory && medicalHistory.length > 0) {
    message += `Medical History: ${medicalHistory.join(', ')}\n`;
  }
  
  message += `\nLocation:\n`;
  message += `${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n`;
  message += `https://maps.google.com/?q=${latitude},${longitude}\n\n`;
  message += `Sent via Emergency Hospital App`;
  
  return message;
}

/**
 * Format location update SMS for live tracking
 */
export function formatLocationUpdateSMS(
  latitude: number,
  longitude: number,
  emergencyId: string,
  updateNumber: number
): string {
  let message = '📍 LOCATION UPDATE\n\n';
  message += `Emergency ID: ${emergencyId}\n`;
  message += `Update #${updateNumber}\n`;
  message += `Time: ${new Date().toLocaleTimeString()}\n\n`;
  message += `Current Location:\n`;
  message += `${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n`;
  message += `https://maps.google.com/?q=${latitude},${longitude}`;
  
  return message;
}

/**
 * Send SMS using device's native SMS app
 * Note: This opens the SMS app with pre-filled message, user must send manually
 */
export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  try {
    const url = `sms:${phoneNumber}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;
    const canOpen = await Linking.canOpenURL(url);
    
    if (canOpen) {
      await Linking.openURL(url);
      console.log(`SMS opened for ${phoneNumber}`);
      return true;
    } else {
      console.log('Cannot open SMS app');
      addToSMSQueue(phoneNumber, message);
      return false;
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    addToSMSQueue(phoneNumber, message);
    return false;
  }
}

/**
 * Send SMS to multiple recipients with delay
 */
export async function sendBulkSMS(
  phoneNumbers: string[],
  message: string
): Promise<{ success: boolean; failedNumbers: string[]; sentNumbers: string[] }> {
  const failedNumbers: string[] = [];
  const sentNumbers: string[] = [];
  
  for (const number of phoneNumbers) {
    const success = await sendSMS(number, message);
    if (success) {
      sentNumbers.push(number);
    } else {
      failedNumbers.push(number);
    }
    // Add delay between SMS to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return {
    success: failedNumbers.length === 0,
    failedNumbers,
    sentNumbers,
  };
}

/**
 * Add failed SMS to queue for retry
 */
function addToSMSQueue(phoneNumber: string, message: string): void {
  const queueItem: SMSQueueItem = {
    id: Date.now().toString(),
    phoneNumber,
    message,
    timestamp: new Date().toISOString(),
    retryCount: 0,
    status: 'pending',
  };
  
  smsQueue.push(queueItem);
  console.log(`Added SMS to queue: ${phoneNumber}`);
}

/**
 * Retry sending queued SMS messages
 */
export async function retryQueuedSMS(): Promise<{ processed: number; successful: number; failed: number }> {
  const pendingMessages = smsQueue.filter(item => item.status === 'pending' && item.retryCount < 3);
  let successful = 0;
  let failed = 0;
  
  for (const item of pendingMessages) {
    const success = await sendSMS(item.phoneNumber, item.message);
    
    if (success) {
      item.status = 'sent';
      successful++;
    } else {
      item.retryCount++;
      if (item.retryCount >= 3) {
        item.status = 'failed';
        failed++;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return {
    processed: pendingMessages.length,
    successful,
    failed,
  };
}

/**
 * Get queued SMS messages
 */
export function getSMSQueue(): SMSQueueItem[] {
  return [...smsQueue];
}

/**
 * Clear SMS queue
 */
export function clearSMSQueue(): void {
  smsQueue = [];
}

/**
 * Show fallback options if SMS fails
 */
export function showSMSFallback(phoneNumbers: string[]): void {
  Alert.alert(
    'SMS Failed',
    'Unable to send SMS automatically. Would you like to:\n\n- Call emergency services directly\n- Retry sending SMS later\n- View emergency numbers',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Call 999',
        onPress: () => Linking.openURL('tel:999'),
      },
      {
        text: 'Call 112',
        onPress: () => Linking.openURL('tel:112'),
      },
      {
        text: 'Retry Later',
        onPress: () => {
          Alert.alert(
            'SMS Queued',
            'Your emergency messages have been queued and will be retried when network is available.'
          );
        },
      },
    ]
  );
}

/**
 * Show enhanced fallback with more options
 */
export function showEnhancedSMSFallback(
  phoneNumbers: string[],
  emergencyType: string
): void {
  const hospitalNumbers = phoneNumbers.filter(num => !num.startsWith('999') && !num.startsWith('112'));
  
  Alert.alert(
    'Emergency Alert Status',
    `Unable to send SMS to ${phoneNumbers.length} recipient(s).\n\nEmergency Type: ${emergencyType}\n\nWhat would you like to do?`,
    [
      {
        text: 'Call Police (999)',
        onPress: () => Linking.openURL('tel:999'),
      },
      {
        text: 'Call Emergency (112)',
        onPress: () => Linking.openURL('tel:112'),
      },
      hospitalNumbers.length > 0 && {
        text: 'Call Hospital',
        onPress: () => Linking.openURL(`tel:${hospitalNumbers[0]}`),
      },
      {
        text: 'Retry SMS',
        onPress: async () => {
          const result = await retryQueuedSMS();
          Alert.alert(
            'Retry Complete',
            `Processed: ${result.processed}\nSuccessful: ${result.successful}\nFailed: ${result.failed}`
          );
        },
      },
      {
        text: 'Close',
        style: 'cancel',
      },
    ].filter(Boolean) as any[]
  );
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic validation for international and local formats
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-numeric characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Format based on length
  if (cleaned.startsWith('+256')) {
    // Uganda format: +256 XXX XXX XXX
    return cleaned.replace(/(\+256)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
  } else if (cleaned.startsWith('0')) {
    // Local format: 0XXX XXX XXX
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  return phoneNumber;
}

/**
 * Check if SMS service is available
 */
export async function isSMSAvailable(): Promise<boolean> {
  try {
    const url = 'sms:';
    return await Linking.canOpenURL(url);
  } catch (error) {
    console.error('Error checking SMS availability:', error);
    return false;
  }
}

/**
 * Send emergency notification with automatic retry
 */
export async function sendEmergencyNotification(
  recipients: Array<{ name: string; phone: string; type: 'hospital' | 'police' }>,
  message: string,
  onProgress?: (current: number, total: number) => void
): Promise<{
  success: boolean;
  sent: Array<{ name: string; phone: string }>;
  failed: Array<{ name: string; phone: string; reason: string }>;
}> {
  const sent: Array<{ name: string; phone: string }> = [];
  const failed: Array<{ name: string; phone: string; reason: string }> = [];
  
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    if (onProgress) {
      onProgress(i + 1, recipients.length);
    }
    
    if (!isValidPhoneNumber(recipient.phone)) {
      failed.push({
        name: recipient.name,
        phone: recipient.phone,
        reason: 'Invalid phone number',
      });
      continue;
    }
    
    const success = await sendSMS(recipient.phone, message);
    
    if (success) {
      sent.push({
        name: recipient.name,
        phone: recipient.phone,
      });
    } else {
      failed.push({
        name: recipient.name,
        phone: recipient.phone,
        reason: 'SMS failed to send',
      });
    }
    
    // Delay between messages
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  return {
    success: failed.length === 0,
    sent,
    failed,
  };
}
