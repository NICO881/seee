
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  allergies: string[];
  medicalHistory: string[];
  prescriptions: Prescription[];
  appointments: Appointment[];
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  erStatus: 'Available' | 'Busy' | 'Full';
  beds: number;
  availableBeds: number;
  departments: string[];
  distance?: number;
  latitude?: number;
  longitude?: number;
}

export interface ReferralHospital {
  id: string;
  name: string;
  level: 'National Referral' | 'Regional Referral' | 'Private' | 'Community';
  type: 'Public' | 'Private' | 'Not-for-Profit';
  email?: string;
  phone?: string;
  website?: string;
  address: string;
  location: string;
  notes?: string;
  departments?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Referral {
  id: string;
  patientId: string;
  hospitalId: string;
  hospitalName: string;
  reason: string;
  date: string;
  status: 'Pending' | 'Accepted' | 'Completed' | 'Cancelled';
  referringDoctor?: string;
  notes?: string;
}

export interface PoliceStation {
  id: string;
  station_name: string;
  division: string;
  district: string;
  phone_number: string;
  emergency_number?: string;
  type: 'Main Station' | 'Post' | 'Division HQ';
  latitude?: number;
  longitude?: number;
  distance?: number;
}

export interface PoliceEmergencyContact {
  id: string;
  contact_name: string;
  phone_number: string;
  description: string;
  category: 'General' | 'Specialized' | 'Fire/Rescue';
  priority: number;
}

export interface Emergency {
  id: string;
  patient_name?: string;
  contact_number: string;
  emergency_type: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  status: 'Pending' | 'Responded' | 'Cancelled';
  notified_hospitals: string[];
  notified_police: string[];
  allergies?: string[];
  medical_history?: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospitalId: string;
  available: boolean;
  rating: number;
  experience: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  type: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  date: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  type: 'Lab Result' | 'Imaging' | 'Prescription' | 'Diagnosis';
  title: string;
  date: string;
  description: string;
  fileUrl?: string;
}

export interface PharmacyOrder {
  id: string;
  patientId: string;
  prescriptionId?: string;
  medicines: OrderMedicine[];
  totalPrice: number;
  status: 'Pending' | 'Processing' | 'Ready' | 'Delivered' | 'Cancelled';
  deliveryMethod: 'Pickup' | 'Delivery';
  orderDate: string;
}

export interface OrderMedicine {
  name: string;
  quantity: number;
  price: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isAI: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'Appointment' | 'Order' | 'Emergency' | 'Reminder';
  message: string;
  timestamp: string;
  read: boolean;
}
