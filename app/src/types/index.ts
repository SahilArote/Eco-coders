// Domain types aligned with SDD §6 and SRS §3

export type Role = 'FARMER' | 'CENTER_OPERATOR' | 'ADMIN';

export interface FarmerProfile {
  id: string;
  phone: string;
  fullName: string;
  village: string;
  district: string;
  state: string;
  preferredLanguage: 'en' | 'hi' | 'mr';
  landSizeAcres: number;
  registeredCrops: string[];
}

export interface Crop {
  id: string;
  name: string;
  nameHi: string;
  code: string;
  category: 'CEREALS' | 'PULSES' | 'OILSEEDS' | 'COMMERCIAL';
  mspRatePerQuintal: number; // in INR
  unit: string;
}

export interface ProcurementCenter {
  id: string;
  code: string;
  name: string;
  address: string;
  village: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  status: 'OPEN' | 'BUSY' | 'CLOSED';
  activeCounters: number;
  totalCounters: number;
  dailyCapacityQuintals: number;
  acceptedCropIds: string[];
  contactPhone: string;
}

export interface TimeSlot {
  id: string;
  centerId: string;
  scheduleId: string;
  slotDate: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:00"
  endTime: string;   // e.g. "11:00"
  capacity: number;
  bookedCount: number;
  status: 'AVAILABLE' | 'FEW_LEFT' | 'FULL';
}

export type ProcurementStatus =
  | 'BOOKED'
  | 'ARRIVED'
  | 'WAITING'
  | 'PROCESSING'
  | 'QUALITY_CHECK'
  | 'WEIGHMENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'PAYMENT_PROCESSING'
  | 'PAYMENT_COMPLETED';

export interface QualityReport {
  id: string;
  moisturePercentage: number;
  moistureStandardMax: number;
  foreignMatterPercentage: number;
  qualityGrade: 'GRADE_A' | 'GRADE_B' | 'REJECTED';
  qualityStatus: 'PASSED' | 'FAILED';
  inspectorName: string;
  checkedAt: string;
  remarks: string;
}

export interface WeighmentSlip {
  id: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  netQuintals: number;
  weighedBy: string;
  weighedAt: string;
  weighbridgeId: string;
}

export interface PaymentDetails {
  id: string;
  netAmount: number;
  mspRate: number;
  quantityQuintals: number;
  currency: string;
  status: 'PENDING' | 'INITIATED' | 'COMPLETED';
  bankName: string;
  accountMasked: string;
  dbtReferenceNumber?: string;
  initiatedAt?: string;
  completedAt?: string;
}

export interface Booking {
  id: string;
  tokenNumber: string; // e.g. "A105"
  farmerId: string;
  centerId: string;
  centerName: string;
  cropId: string;
  cropName: string;
  slotId: string;
  slotDate: string;
  slotTimeRange: string;
  estimatedQuantityQuintals: number;
  status: ProcurementStatus;
  createdAt: string;
  qrPayload: string;
  qualityReport?: QualityReport;
  weighmentSlip?: WeighmentSlip;
  paymentDetails?: PaymentDetails;
}

export interface QueueState {
  centerId: string;
  currentToken: string; // e.g. "A092"
  yourToken: string;    // e.g. "A105"
  peopleAhead: number;
  activeCounters: number;
  estimatedWaitMinutes: number;
  isAiPrediction: boolean;
  predictionConfidence: number;
  lastUpdatedAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'TOKEN_CALLED' | 'STATUS_CHANGE' | 'PAYMENT' | 'REMINDER';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  bookingId?: string;
}
