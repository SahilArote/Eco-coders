import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Booking,
  Crop,
  FarmerProfile,
  KycStatus,
  BankDetails,
  NotificationItem,
  ProcurementCenter,
  ProcurementStatus,
  QueueState,
  TimeSlot,
} from '../types';
import i18n, { AppLanguage, changeAppLanguage, initializeLanguage } from '../i18n';
import { maskAccountNumber } from '../services/authService';

const AUTH_STORAGE_KEY = '@kisan_eprocure_auth_v1';

interface AppState {
  // User Profile
  farmer: FarmerProfile;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  initLanguage: () => Promise<void>;
  updateFarmerProfile: (profile: Partial<FarmerProfile>) => void;

  // Auth & KYC State
  isAuthenticated: boolean;
  kycStatus: KycStatus;
  bankDetails: BankDetails | null;
  initAuthState: () => Promise<void>;
  registerNewUser: (phone: string) => Promise<void>;
  completeBankKyc: (details: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
  }) => Promise<void>;
  skipBankKyc: () => Promise<void>;
  login: (phone?: string) => void;
  logout: () => void;

  // Master Data
  crops: Crop[];
  centers: ProcurementCenter[];
  slots: TimeSlot[];

  // Active Transaction State
  activeBooking: Booking | null;
  queueState: QueueState;
  notifications: NotificationItem[];

  // Interactive Demo Operations
  bookSlot: (params: {
    centerId: string;
    cropId: string;
    slotId: string;
    slotDate: string;
    slotTimeRange: string;
    quantityQuintals: number;
  }) => Booking;
  cancelBooking: (bookingId: string) => void;
  advanceQueue: () => void;
  advanceProcurementStage: () => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetToInitialDemo: () => void;
}

const INITIAL_CROPS: Crop[] = [
  {
    id: 'crop-1',
    name: 'Wheat (गेहूं)',
    nameHi: 'गेहूं (Sharbati & Lokwan)',
    code: 'WHEAT',
    category: 'CEREALS',
    mspRatePerQuintal: 2275,
    unit: 'Quintal',
  },
  {
    id: 'crop-2',
    name: 'Soybean (सोयाबीन)',
    nameHi: 'सोयाबीन (Yellow)',
    code: 'SOYBEAN',
    category: 'OILSEEDS',
    mspRatePerQuintal: 4892,
    unit: 'Quintal',
  },
  {
    id: 'crop-3',
    name: 'Chana / Gram (चना)',
    nameHi: 'चना (Desi & Kabuli)',
    code: 'CHANA',
    category: 'PULSES',
    mspRatePerQuintal: 5440,
    unit: 'Quintal',
  },
  {
    id: 'crop-4',
    name: 'Maize (मक्का)',
    nameHi: 'मक्का (Hybrid Yellow)',
    code: 'MAIZE',
    category: 'CEREALS',
    mspRatePerQuintal: 2090,
    unit: 'Quintal',
  },
  {
    id: 'crop-5',
    name: 'Paddy / Rice (धान)',
    nameHi: 'धान (Common)',
    code: 'PADDY',
    category: 'CEREALS',
    mspRatePerQuintal: 2300,
    unit: 'Quintal',
  },
];

const INITIAL_CENTERS: ProcurementCenter[] = [
  {
    id: 'center-1',
    code: 'MH-NSK-01',
    name: 'APMC Nashik Main Yard',
    address: 'Panchavati Mandi Complex, Nashik',
    village: 'Panchavati',
    district: 'Nashik',
    state: 'Maharashtra',
    latitude: 20.011,
    longitude: 73.791,
    distanceKm: 4.8,
    status: 'OPEN',
    activeCounters: 4,
    totalCounters: 5,
    dailyCapacityQuintals: 1500,
    acceptedCropIds: ['crop-1', 'crop-2', 'crop-3', 'crop-4'],
    contactPhone: '+91 253 251 4488',
  },
  {
    id: 'center-2',
    code: 'MH-NSK-02',
    name: 'Pimpalgaon Baswant Grain Hub',
    address: 'Highway Sub-Mandi, Pimpalgaon',
    village: 'Pimpalgaon',
    district: 'Nashik',
    state: 'Maharashtra',
    latitude: 20.174,
    longitude: 73.987,
    distanceKm: 18.2,
    status: 'OPEN',
    activeCounters: 3,
    totalCounters: 4,
    dailyCapacityQuintals: 1200,
    acceptedCropIds: ['crop-1', 'crop-2', 'crop-4'],
    contactPhone: '+91 255 422 1090',
  },
  {
    id: 'center-3',
    code: 'MH-NSK-03',
    name: 'Dindori Taluka Procurement Sub-Center',
    address: 'Near Old Tehsil Office, Dindori',
    village: 'Dindori',
    district: 'Nashik',
    state: 'Maharashtra',
    latitude: 20.201,
    longitude: 73.834,
    distanceKm: 24.5,
    status: 'OPEN',
    activeCounters: 2,
    totalCounters: 3,
    dailyCapacityQuintals: 800,
    acceptedCropIds: ['crop-1', 'crop-3'],
    contactPhone: '+91 255 723 4511',
  },
  {
    id: 'center-4',
    code: 'MH-NSK-04',
    name: 'Malegaon East Grain Center',
    address: 'Industrial APMC Extension, Malegaon',
    village: 'Malegaon',
    district: 'Nashik',
    state: 'Maharashtra',
    latitude: 20.553,
    longitude: 74.529,
    distanceKm: 62.0,
    status: 'BUSY',
    activeCounters: 3,
    totalCounters: 5,
    dailyCapacityQuintals: 1400,
    acceptedCropIds: ['crop-1', 'crop-2', 'crop-3', 'crop-5'],
    contactPhone: '+91 255 423 8812',
  },
];

const INITIAL_SLOTS: TimeSlot[] = [
  {
    id: 'slot-1',
    centerId: 'center-1',
    scheduleId: 'sch-1',
    slotDate: 'Today',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    capacity: 20,
    bookedCount: 20,
    status: 'FULL',
  },
  {
    id: 'slot-2',
    centerId: 'center-1',
    scheduleId: 'sch-1',
    slotDate: 'Today',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    capacity: 20,
    bookedCount: 17,
    status: 'FEW_LEFT',
  },
  {
    id: 'slot-3',
    centerId: 'center-1',
    scheduleId: 'sch-1',
    slotDate: 'Today',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    capacity: 20,
    bookedCount: 8,
    status: 'AVAILABLE',
  },
  {
    id: 'slot-4',
    centerId: 'center-1',
    scheduleId: 'sch-1',
    slotDate: 'Today',
    startTime: '01:00 PM',
    endTime: '02:00 PM',
    capacity: 20,
    bookedCount: 6,
    status: 'AVAILABLE',
  },
  {
    id: 'slot-5',
    centerId: 'center-1',
    scheduleId: 'sch-1',
    slotDate: 'Today',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    capacity: 20,
    bookedCount: 3,
    status: 'AVAILABLE',
  },
];

const INITIAL_BOOKING: Booking = {
  id: 'bk-2026-0904-105',
  tokenNumber: 'A105',
  farmerId: 'farmer-ramesh-01',
  centerId: 'center-1',
  centerName: 'APMC Nashik Main Yard',
  cropId: 'crop-1',
  cropName: 'Wheat (गेहूं)',
  slotId: 'slot-2',
  slotDate: 'Today',
  slotTimeRange: '10:00 AM – 11:00 AM',
  estimatedQuantityQuintals: 40,
  status: 'PROCESSING',
  createdAt: '2026-09-05T08:30:00Z',
  qrPayload: 'AGRI-PROC-TOKEN|A105|MH-NSK-01|WHEAT|40Q|RAMESH_PATIL',
  qualityReport: {
    id: 'qc-8941',
    moisturePercentage: 11.4,
    moistureStandardMax: 12.0,
    foreignMatterPercentage: 0.7,
    qualityGrade: 'GRADE_A',
    qualityStatus: 'PASSED',
    inspectorName: 'K. S. Sharma (Agri Officer)',
    checkedAt: '10:24 AM',
    remarks: 'Produce meets FAQ standards. Clean golden grain.',
  },
  weighmentSlip: {
    id: 'ws-44102',
    grossWeightKg: 4850,
    tareWeightKg: 850,
    netWeightKg: 4000,
    netQuintals: 40.0,
    weighedBy: 'Electronic Weighbridge #2',
    weighedAt: '10:38 AM',
    weighbridgeId: 'WB-02-CERTIFIED',
  },
  paymentDetails: {
    id: 'pay-77401',
    netAmount: 91000, // 40 Q * 2275
    mspRate: 2275,
    quantityQuintals: 40.0,
    currency: 'INR',
    status: 'INITIATED',
    bankName: 'State Bank of India',
    accountMasked: '•••• •••• •••• 4819',
    dbtReferenceNumber: 'DBT-PFMS-MH-2026-0914820',
    initiatedAt: '10:45 AM',
  },
};

const INITIAL_QUEUE: QueueState = {
  centerId: 'center-1',
  currentToken: 'A098',
  yourToken: 'A105',
  peopleAhead: 7,
  activeCounters: 4,
  estimatedWaitMinutes: 21,
  isAiPrediction: true,
  predictionConfidence: 0.88,
  lastUpdatedAt: 'Just now',
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'TOKEN_CALLED',
    title: 'Counter 2 is calling Token A098',
    message: 'Your token is A105. 7 farmers ahead of you.',
    timestamp: '2 mins ago',
    isRead: false,
  },
  {
    id: 'notif-2',
    type: 'STATUS_CHANGE',
    title: 'Quality Inspection Passed',
    message: 'Wheat Grade A verified (Moisture 11.4% < 12% max).',
    timestamp: '18 mins ago',
    isRead: true,
  },
  {
    id: 'notif-3',
    type: 'REMINDER',
    title: 'Slot Booking Confirmed: A105',
    message: 'APMC Nashik Main Yard, 10:00 AM – 11:00 AM slot.',
    timestamp: '1 hour ago',
    isRead: true,
  },
];

const INITIAL_BANK_DETAILS: BankDetails = {
  accountHolderName: 'Ramesh Balasaheb Patil',
  bankName: 'State Bank of India',
  accountNumberMasked: '•••• •••• •••• 4819',
  ifscCode: 'SBIN0001234',
  verifiedAt: '2026-09-01T10:00:00Z',
};

const INITIAL_FARMER: FarmerProfile = {
  id: 'farmer-ramesh-01',
  phone: '+91 98221 44589',
  fullName: 'Ramesh Balasaheb Patil',
  village: 'Ozar',
  district: 'Nashik',
  state: 'Maharashtra',
  preferredLanguage: 'en',
  landSizeAcres: 6.5,
  registeredCrops: ['Wheat', 'Soybean', 'Chana'],
  kycStatus: 'COMPLETED',
  bankDetails: INITIAL_BANK_DETAILS,
};

export const useAppStore = create<AppState>((set, get) => ({
  farmer: INITIAL_FARMER,
  language: 'en',
  setLanguage: (lang) => {
    changeAppLanguage(lang);
    set({ language: lang });
  },
  initLanguage: async () => {
    const saved = await initializeLanguage();
    set({ language: saved });
  },
  updateFarmerProfile: (profile) =>
    set((state) => ({ farmer: { ...state.farmer, ...profile } })),

  isAuthenticated: false,
  kycStatus: 'COMPLETED',
  bankDetails: INITIAL_BANK_DETAILS,

  initAuthState: async () => {
    try {
      const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.isAuthenticated === 'boolean') {
          const status = parsed.kycStatus || 'NOT_COMPLETED';
          const bank = parsed.bankDetails || null;
          set((state) => ({
            isAuthenticated: parsed.isAuthenticated,
            kycStatus: status,
            bankDetails: bank,
            farmer: {
              ...state.farmer,
              phone: parsed.phone || state.farmer.phone,
              fullName: parsed.fullName || state.farmer.fullName,
              kycStatus: status,
              bankDetails: bank || undefined,
            },
          }));
        }
      }
    } catch (error) {
      // Fallback silently
    }
  },

  registerNewUser: async (phone: string) => {
    const formattedPhone = phone.startsWith('+91') ? phone : `+91 ${phone}`;
    const newKycStatus: KycStatus = 'NOT_COMPLETED';
    set((state) => ({
      isAuthenticated: true,
      kycStatus: newKycStatus,
      bankDetails: null,
      farmer: {
        ...state.farmer,
        phone: formattedPhone,
        kycStatus: newKycStatus,
        bankDetails: undefined,
      },
    }));
    try {
      await AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          isAuthenticated: true,
          phone: formattedPhone,
          kycStatus: newKycStatus,
          bankDetails: null,
        })
      );
    } catch (error) {}
  },

  completeBankKyc: async ({ accountHolderName, bankName, accountNumber, ifscCode }) => {
    const masked = maskAccountNumber(accountNumber);
    const bankInfo: BankDetails = {
      accountHolderName,
      bankName,
      accountNumberMasked: masked,
      ifscCode: ifscCode.toUpperCase().trim(),
      verifiedAt: new Date().toISOString(),
    };
    set((state) => ({
      kycStatus: 'COMPLETED',
      bankDetails: bankInfo,
      farmer: {
        ...state.farmer,
        fullName: accountHolderName || state.farmer.fullName,
        kycStatus: 'COMPLETED',
        bankDetails: bankInfo,
      },
      activeBooking: state.activeBooking
        ? {
            ...state.activeBooking,
            paymentDetails: state.activeBooking.paymentDetails
              ? {
                  ...state.activeBooking.paymentDetails,
                  bankName,
                  accountMasked: masked,
                }
              : state.activeBooking.paymentDetails,
          }
        : state.activeBooking,
    }));
    try {
      const current = get();
      await AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          isAuthenticated: true,
          phone: current.farmer.phone,
          fullName: current.farmer.fullName,
          kycStatus: 'COMPLETED',
          bankDetails: bankInfo,
        })
      );
    } catch (error) {}
  },

  skipBankKyc: async () => {
    set((state) => ({
      kycStatus: 'NOT_COMPLETED',
      farmer: {
        ...state.farmer,
        kycStatus: 'NOT_COMPLETED',
      },
    }));
    try {
      const current = get();
      await AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          isAuthenticated: true,
          phone: current.farmer.phone,
          fullName: current.farmer.fullName,
          kycStatus: 'NOT_COMPLETED',
          bankDetails: null,
        })
      );
    } catch (error) {}
  },

  login: (phone?: string) => {
    const current = get();
    const phoneToUse = phone
      ? phone.startsWith('+91')
        ? phone
        : `+91 ${phone}`
      : current.farmer.phone;
    set((state) => ({
      isAuthenticated: true,
      farmer: {
        ...state.farmer,
        phone: phoneToUse,
      },
    }));
    try {
      AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          isAuthenticated: true,
          phone: phoneToUse,
          fullName: current.farmer.fullName,
          kycStatus: current.kycStatus,
          bankDetails: current.bankDetails,
        })
      );
    } catch (error) {}
  },

  logout: () => {
    set({ isAuthenticated: false });
    try {
      AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {}
  },

  crops: INITIAL_CROPS,
  centers: INITIAL_CENTERS,
  slots: INITIAL_SLOTS,

  activeBooking: INITIAL_BOOKING,
  queueState: INITIAL_QUEUE,
  notifications: INITIAL_NOTIFICATIONS,

  bookSlot: ({ centerId, cropId, slotId, slotDate, slotTimeRange, quantityQuintals }) => {
    const center = get().centers.find((c) => c.id === centerId) || get().centers[0];
    const crop = get().crops.find((c) => c.id === cropId) || get().crops[0];

    // Generate random realistic token like A112
    const tokenNum = `A${Math.floor(110 + Math.random() * 40)}`;

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      tokenNumber: tokenNum,
      farmerId: get().farmer.id,
      centerId: center.id,
      centerName: center.name,
      cropId: crop.id,
      cropName: crop.name,
      slotId,
      slotDate,
      slotTimeRange,
      estimatedQuantityQuintals: quantityQuintals,
      status: 'BOOKED',
      createdAt: new Date().toISOString(),
      qrPayload: `AGRI-PROC-TOKEN|${tokenNum}|${center.code}|${crop.code}|${quantityQuintals}Q|${get().farmer.fullName}`,
    };

    // Update slot booked count
    set((state) => ({
      activeBooking: newBooking,
      slots: state.slots.map((s) =>
        s.id === slotId
          ? {
              ...s,
              bookedCount: s.bookedCount + 1,
              status: s.bookedCount + 1 >= s.capacity ? 'FULL' : 'FEW_LEFT',
            }
          : s
      ),
      queueState: {
        centerId: center.id,
        currentToken: 'A085',
        yourToken: tokenNum,
        peopleAhead: 15,
        activeCounters: center.activeCounters,
        estimatedWaitMinutes: 42,
        isAiPrediction: true,
        predictionConfidence: 0.85,
        lastUpdatedAt: 'Just now',
      },
      notifications: [
        {
          id: `notif-${Date.now()}`,
          type: 'REMINDER',
          title: `Slot Booked: Token ${tokenNum}`,
          message: `${crop.name} at ${center.name} (${slotTimeRange}).`,
          timestamp: 'Just now',
          isRead: false,
        },
        ...state.notifications,
      ],
    }));

    return newBooking;
  },

  cancelBooking: (bookingId) => {
    set((state) => ({
      activeBooking:
        state.activeBooking?.id === bookingId ? null : state.activeBooking,
      notifications: [
        {
          id: `notif-${Date.now()}`,
          type: 'REMINDER',
          title: 'Booking Cancelled',
          message: 'Your slot booking has been cancelled.',
          timestamp: 'Just now',
          isRead: false,
        },
        ...state.notifications,
      ],
    }));
  },

  advanceQueue: () => {
    set((state) => {
      const q = state.queueState;
      const curNum = parseInt(q.currentToken.replace('A', ''), 10) || 92;
      const nextToken = `A${String(curNum + 1).padStart(3, '0')}`;
      const newAhead = Math.max(0, q.peopleAhead - 1);
      const newWait = Math.max(0, Math.round((newAhead * 11) / q.activeCounters));

      const isCallingMe = nextToken === q.yourToken;

      const newNotifs = [...state.notifications];
      if (isCallingMe) {
        newNotifs.unshift({
          id: `notif-${Date.now()}`,
          type: 'TOKEN_CALLED',
          title: `🚀 ${i18n.t('queue.urgentTitle')}`,
          message: i18n.t('queue.urgentSubtitle'),
          timestamp: i18n.t('common.today'),
          isRead: false,
        });
      } else {
        newNotifs.unshift({
          id: `notif-${Date.now()}`,
          type: 'TOKEN_CALLED',
          title: `${i18n.t('queue.servingNow')}: ${nextToken}`,
          message: `${newAhead} ${i18n.t('home.farmersAhead')}. ~${newWait} ${i18n.t('common.mins')}.`,
          timestamp: i18n.t('common.today'),
          isRead: false,
        });
      }

      return {
        queueState: {
          ...q,
          currentToken: nextToken,
          peopleAhead: newAhead,
          estimatedWaitMinutes: newWait,
          lastUpdatedAt: 'Updated live',
        },
        notifications: newNotifs.slice(0, 10),
      };
    });
  },

  advanceProcurementStage: () => {
    const STAGES: ProcurementStatus[] = [
      'BOOKED',
      'ARRIVED',
      'WAITING',
      'PROCESSING',
      'QUALITY_CHECK',
      'WEIGHMENT',
      'ACCEPTED',
      'PAYMENT_COMPLETED',
    ];

    set((state) => {
      if (!state.activeBooking) return state;
      const currentIndex = STAGES.indexOf(state.activeBooking.status);
      const nextStage =
        currentIndex >= 0 && currentIndex < STAGES.length - 1
          ? STAGES[currentIndex + 1]
          : STAGES[0];

      const crop = state.crops.find((c) => c.id === state.activeBooking?.cropId) || state.crops[0];
      const mspRate = crop.mspRatePerQuintal;
      const quantityQuintals = state.activeBooking.estimatedQuantityQuintals || 40;
      const netAmount = quantityQuintals * mspRate;

      // Populate qualityReport when reaching QUALITY_CHECK or later
      let qualityReport = state.activeBooking.qualityReport;
      if (
        !qualityReport &&
        ['QUALITY_CHECK', 'WEIGHMENT', 'ACCEPTED', 'PAYMENT_COMPLETED'].includes(nextStage)
      ) {
        qualityReport = {
          id: 'qc-8941',
          moisturePercentage: 11.4,
          moistureStandardMax: 12.0,
          foreignMatterPercentage: 0.7,
          qualityGrade: 'GRADE_A',
          qualityStatus: 'PASSED',
          inspectorName: 'K. S. Sharma (Agri Officer)',
          checkedAt: '10:24 AM',
          remarks: 'Produce meets FAQ standards. Clean golden grain.',
        };
      }

      // Populate weighmentSlip when reaching WEIGHMENT or later
      let weighmentSlip = state.activeBooking.weighmentSlip;
      if (
        !weighmentSlip &&
        ['WEIGHMENT', 'ACCEPTED', 'PAYMENT_COMPLETED'].includes(nextStage)
      ) {
        const netKg = quantityQuintals * 100;
        const tareKg = 850;
        weighmentSlip = {
          id: 'ws-44102',
          grossWeightKg: netKg + tareKg,
          tareWeightKg: tareKg,
          netWeightKg: netKg,
          netQuintals: quantityQuintals,
          weighedBy: 'Electronic Weighbridge #2',
          weighedAt: '10:38 AM',
          weighbridgeId: 'WB-02-CERTIFIED',
        };
      }

      // Populate paymentDetails when reaching ACCEPTED or PAYMENT_COMPLETED
      let paymentDetails = state.activeBooking.paymentDetails;
      if (['ACCEPTED', 'PAYMENT_COMPLETED'].includes(nextStage)) {
        paymentDetails = {
          id: paymentDetails?.id || 'pay-77401',
          netAmount,
          mspRate,
          quantityQuintals,
          currency: 'INR',
          status: nextStage === 'PAYMENT_COMPLETED' ? 'COMPLETED' : 'INITIATED',
          bankName: state.bankDetails?.bankName || paymentDetails?.bankName || 'State Bank of India',
          accountMasked: state.bankDetails?.accountNumberMasked || paymentDetails?.accountMasked || '•••• •••• •••• 4819',
          dbtReferenceNumber: paymentDetails?.dbtReferenceNumber || 'DBT-PFMS-MH-2026-0914820',
          initiatedAt: paymentDetails?.initiatedAt || '10:45 AM',
          completedAt: nextStage === 'PAYMENT_COMPLETED' ? '11:15 AM' : undefined,
        };
      }

      return {
        activeBooking: {
          ...state.activeBooking,
          status: nextStage,
          qualityReport,
          weighmentSlip,
          paymentDetails,
        },
        notifications: [
          {
            id: `notif-${Date.now()}`,
            type: 'STATUS_CHANGE',
            title: `${i18n.t('lifecycle.title')}: ${i18n.t('status.' + nextStage.toLowerCase(), { defaultValue: nextStage.replace('_', ' ') })}`,
            message: i18n.t('lifecycle.stepBookedDesc', { token: state.activeBooking.tokenNumber }),
            timestamp: i18n.t('common.today'),
            isRead: false,
          },
          ...state.notifications,
        ],
      };
    });
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
  },

  clearAllNotifications: () => set({ notifications: [] }),

  resetToInitialDemo: () => {
    try {
      AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {}
    set({
      farmer: INITIAL_FARMER,
      kycStatus: 'COMPLETED',
      bankDetails: INITIAL_BANK_DETAILS,
      crops: INITIAL_CROPS,
      centers: INITIAL_CENTERS,
      slots: INITIAL_SLOTS,
      activeBooking: INITIAL_BOOKING,
      queueState: INITIAL_QUEUE,
      notifications: INITIAL_NOTIFICATIONS,
    });
  },
}));
