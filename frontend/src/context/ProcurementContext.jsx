/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { mockCenters } from '../data/mockCenters';
import { mockCrops } from '../data/mockCrops';
import { mockFarmers } from '../data/mockFarmers';
import { mockTokens } from '../data/mockTokens';
import { mockLots } from '../data/mockLots';
import { mockPayments } from '../data/mockPayments';
import { mockNotifications } from '../data/mockNotifications';
import { mockGrievances } from '../data/mockGrievances';
import { mockAuctions } from '../data/mockAuctions';
import { mockVehicles } from '../data/mockVehicles';

export const APMC_ROLES = [
  {
    id: 'gate_operator',
    title: 'Gate / Entry Operator',
    shortTitle: 'Gate Entry',
    badge: 'Security & Inward',
    desk: 'Gate #2 Kiosk',
    dashboardPath: '/dashboard/gate',
    icon: 'Truck',
    color: 'emerald',
    description: 'Vehicle security inward check-in, token generation, and gate passes'
  },
  {
    id: 'weighbridge_operator',
    title: 'Weighbridge Operator',
    shortTitle: 'Weighbridge',
    badge: 'Scale Station',
    desk: 'Scale #1 & #2 Cabin',
    dashboardPath: '/dashboard/weighbridge',
    icon: 'Scale',
    color: 'amber',
    description: 'Dual-phase gross and tare capture, net weight math, and weighment slips'
  },
  {
    id: 'quality_assayer',
    title: 'Quality / Assay Officer',
    shortTitle: 'Quality Lab',
    badge: 'Grading Lab',
    desk: 'Testing Bench A',
    dashboardPath: '/dashboard/quality',
    icon: 'FlaskConical',
    color: 'sky',
    description: 'Moisture testing, foreign matter inspection, and Grade A/B/C certification'
  },
  {
    id: 'auction_officer',
    title: 'Auction / Mandi Officer',
    shortTitle: 'Auction Yard',
    badge: 'Bidding Floor',
    desk: 'Bidding Yard 1',
    dashboardPath: '/dashboard/auction',
    icon: 'Gavel',
    color: 'purple',
    description: 'Price discovery, MSP floor price validation, live bidding, and buyer allotment'
  },
  {
    id: 'procurement_officer',
    title: 'Procurement Officer',
    shortTitle: 'Procurement',
    badge: 'Clearance',
    desk: 'Procurement Cell',
    dashboardPath: '/dashboard/procurement',
    icon: 'PackageCheck',
    color: 'indigo',
    description: 'Lot approvals, quota tracking, MSP compliance, and Tak-Patti Form J'
  },
  {
    id: 'accounts_officer',
    title: 'Payment / Accounts Officer',
    shortTitle: 'Accounts & DBT',
    badge: 'Disbursement',
    desk: 'Treasury Section',
    dashboardPath: '/dashboard/accounts',
    icon: 'CreditCard',
    color: 'teal',
    description: 'PFMS Direct Benefit Transfer batch clearance, UTR generation, and vouchers'
  },
  {
    id: 'admin',
    title: 'Mandi Supervisor / Admin',
    shortTitle: 'Supervisor',
    badge: 'APMC Administration',
    desk: 'Command Center',
    dashboardPath: '/dashboard/admin',
    icon: 'ShieldCheck',
    color: 'rose',
    description: 'Complete operational KPIs, counter consoles, center configuration, and audit'
  }
];

const ProcurementContext = createContext(null);

const STORAGE_PREFIX = 'krishi_setu_';

export function ProcurementProvider({ children }) {
  // Current active staff role
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem(STORAGE_PREFIX + 'role') || 'admin';
  });

  // Selected APMC Center ID
  const [selectedCenterId, setSelectedCenterId] = useState('C-01');

  // Core Data States
  const [centers, setCenters] = useState(mockCenters);
  const [crops, setCrops] = useState(mockCrops);
  const [farmers, setFarmers] = useState(mockFarmers);
  const [tokens, setTokens] = useState(mockTokens);
  const [lots, setLots] = useState(mockLots);
  const [payments, setPayments] = useState(mockPayments);
  const [auctions, setAuctions] = useState(mockAuctions);
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [notifications, setNotifications] = useState(() =>
    mockNotifications.map(n => ({
      ...n,
      isRead: n.isRead ?? n.read ?? false,
      read: n.read ?? n.isRead ?? false
    }))
  );
  const [grievances, setGrievances] = useState(mockGrievances);

  // Counters State
  const [counters, setCounters] = useState([
    { id: 1, name: 'Counter 1 (Weighbridge In)', currentToken: 'A088', operator: 'S. G. Shinde', status: 'ACTIVE', servedToday: 24, avgTimeMins: 12 },
    { id: 2, name: 'Counter 2 (Commercial Weighbridge)', currentToken: 'A105', operator: 'V. P. Deshmukh', status: 'ACTIVE', servedToday: 28, avgTimeMins: 14 },
    { id: 3, name: 'Counter 3 (Assay Lab Desk A)', currentToken: 'A090', operator: 'M. K. Kadam', status: 'ACTIVE', servedToday: 31, avgTimeMins: 10 },
    { id: 4, name: 'Counter 4 (Assay Lab Desk B)', currentToken: 'A091', operator: 'A. B. Patil', status: 'ACTIVE', servedToday: 19, avgTimeMins: 11 },
    { id: 5, name: 'Counter 5 (Settlement & Billing)', currentToken: null, operator: 'P. N. More', status: 'IDLE', servedToday: 42, avgTimeMins: 8 },
    { id: 6, name: 'Counter 6 (Gate Out Clearance)', currentToken: null, operator: 'Staff On Break', status: 'MAINTENANCE', servedToday: 35, avgTimeMins: 6 }
  ]);

  // Global Toast Alert State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'role', currentRole);
  }, [currentRole]);

  // Current active center helper
  const currentCenter = centers.find(c => c.id === selectedCenterId) || centers[0];
  const activeRoleObj = APMC_ROLES.find(r => r.id === currentRole) || APMC_ROLES[6];

  // Helper: Switch Role
  const switchRole = (roleId) => {
    setCurrentRole(roleId);
    const roleObj = APMC_ROLES.find(r => r.id === roleId);
    showToast(`Switched to ${roleObj?.title || roleId} console`, 'info');
  };

  // Helper: Book a slot & issue token (administrative entry)
  const bookSlot = (bookingData) => {
    const nextNum = 'A' + (100 + tokens.length + 1);
    const center = centers.find(c => c.id === bookingData.centerId) || currentCenter;
    const crop = crops.find(c => c.name === bookingData.commodity) || crops[0];

    const newToken = {
      tokenNumber: nextNum,
      farmerId: bookingData.farmerId || 'F-1001',
      farmerName: bookingData.farmerName || 'Ramesh Patil',
      farmerMobile: bookingData.farmerMobile || '9822101341',
      centerId: center.id,
      centerName: center.name,
      commodity: bookingData.commodity,
      variety: crop.variety,
      expectedQuantityQtl: parseFloat(bookingData.expectedQuantityQtl) || 30.0,
      appointmentDate: bookingData.appointmentDate || '2026-03-05',
      appointmentSlot: bookingData.appointmentSlot || '10:00 AM - 11:00 AM',
      currentTokenServing: counters[0]?.currentToken || 'A088',
      counterAssigned: 'Counter 2',
      peopleAhead: tokens.filter(t => ['ARRIVED', 'WAITING'].includes(t.status)).length + 1,
      estimatedWaitMinutes: (tokens.filter(t => ['ARRIVED', 'WAITING'].includes(t.status)).length + 1) * 3,
      status: 'BOOKED',
      lotId: 'LOT-2026-' + (lots.length + 1).toString().padStart(3, '0'),
      vehicleNumber: bookingData.vehicleNumber || 'MH-12-TR-9999',
      gateNumber: 'Gate 2 (North)',
      checkInTime: null,
      qrCodeData: 'KRISHI-SETU-' + nextNum + '-' + center.id
    };

    setTokens(prev => [newToken, ...prev]);
    setCenters(prev => prev.map(c => c.id === center.id ? { ...c, bookedSlots: c.bookedSlots + 1 } : c));

    addNotification({
      category: 'SUCCESS',
      title: 'Slot Booked & Token ' + nextNum + ' Generated',
      message: 'Slot confirmed for ' + bookingData.commodity + ' at ' + center.name + ' on ' + newToken.appointmentDate + ' (' + newToken.appointmentSlot + ').',
      referenceId: nextNum
    });

    showToast(`Token ${nextNum} successfully issued!`);
    return newToken;
  };

  // Helper: Gate Inward Check-in
  const checkInGate = (tokenNumber, vehicleNumber) => {
    setTokens(prev => prev.map(t => {
      if (t.tokenNumber === tokenNumber) {
        return {
          ...t,
          status: 'ARRIVED',
          checkInTime: '2026-03-05 10:00 AM',
          vehicleNumber: vehicleNumber || t.vehicleNumber
        };
      }
      return t;
    }));

    // Add to vehicles fleet
    const matchedToken = tokens.find(t => t.tokenNumber === tokenNumber);
    if (matchedToken) {
      const newVeh = {
        id: `VEH-${String(tokens.length + 100).padStart(4, '0')}`,
        vehicleNumber: vehicleNumber || matchedToken.vehicleNumber,
        vehicleType: 'Tractor Trolley',
        driverName: matchedToken.farmerName,
        driverMobile: matchedToken.farmerMobile,
        farmerId: matchedToken.farmerId,
        farmerName: matchedToken.farmerName,
        commodity: matchedToken.commodity,
        tokenNumber: tokenNumber,
        entryGate: 'Gate 2 (North)',
        arrivalTime: 'Just now',
        status: 'IN_YARD',
        tarePending: true
      };
      setVehicles(prev => [newVeh, ...prev]);
    }

    addNotification({
      category: 'ACTION_REQUIRED',
      title: 'Vehicle Inward Cleared: ' + tokenNumber,
      message: 'Vehicle ' + vehicleNumber + ' checked in at Gate 2. Staged for Weighbridge scale.',
      referenceId: tokenNumber
    });

    showToast(`Gate inward checked in for Token ${tokenNumber}`);
  };

  // Helper: Queue management actions
  const callNextToken = (counterId) => {
    const nextToken = tokens.find(t => t.status === 'ARRIVED');
    if (!nextToken) {
      showToast('No more waiting tokens in arrival queue', 'info');
      return;
    }

    setTokens(prev => prev.map(t => {
      if (t.tokenNumber === nextToken.tokenNumber) {
        return { ...t, status: 'PROCESSING' };
      }
      return t;
    }));

    setCounters(prev => prev.map(c => {
      if (c.id === counterId) {
        return {
          ...c,
          currentToken: nextToken.tokenNumber,
          servedToday: c.servedToday + 1
        };
      }
      return c;
    }));

    addNotification({
      category: 'ACTION_REQUIRED',
      title: 'Counter ' + counterId + ' Calling Token ' + nextToken.tokenNumber,
      message: 'Token ' + nextToken.tokenNumber + ' (' + nextToken.farmerName + ') summoned to Counter ' + counterId,
      referenceId: nextToken.tokenNumber
    });

    showToast(`Token ${nextToken.tokenNumber} called to Counter ${counterId}`);
  };

  const skipToken = (arg1, arg2) => {
    const tokenNumber = typeof arg2 === 'string' ? arg2 : arg1;
    const counterId = typeof arg2 === 'string' ? arg1 : null;

    setTokens(prev => prev.map(t => {
      if (t.tokenNumber === tokenNumber) {
        return { ...t, status: 'WAITING' };
      }
      return t;
    }));

    if (counterId) {
      setCounters(prev => prev.map(c => c.id === counterId ? { ...c, currentToken: null } : c));
    } else {
      setCounters(prev => prev.map(c => c.currentToken === tokenNumber ? { ...c, currentToken: null } : c));
    }

    showToast(`Token ${tokenNumber} skipped & rescheduled`);
  };

  const recallToken = (tokenNumber) => {
    setTokens(prev => prev.map(t => {
      if (t.tokenNumber === tokenNumber) {
        return { ...t, status: 'PROCESSING' };
      }
      return t;
    }));
    showToast(`Token ${tokenNumber} recalled to counter`);
  };

  // Helper: Record Laboratory Quality Assay
  const recordQuality = (lotId, assayData) => {
    setLots(prev => prev.map(l => {
      if (l.id === lotId || l.lotNumber === lotId) {
        return {
          ...l,
          assay: {
            ...l.assay,
            ...assayData,
            assayedAt: '2026-03-05 10:45 AM'
          },
          status: assayData.status === 'PASSED' ? 'ACCEPTED' : 'REJECTED'
        };
      }
      return l;
    }));

    addNotification({
      category: assayData.status === 'PASSED' ? 'SUCCESS' : 'WARNING',
      title: `Quality Assayed: ${lotId} (${assayData.grade})`,
      message: `Moisture: ${assayData.moisturePercent}% • Status: ${assayData.status}`,
      referenceId: lotId
    });

    showToast(`Assay recorded for Lot ${lotId}: ${assayData.grade}`);
  };

  // Helper: Record Weighbridge (Gross or Tare)
  const recordWeighment = (lotId, weighmentData) => {
    setLots(prev => prev.map(l => {
      if (l.id === lotId || l.lotNumber === lotId) {
        const gross = weighmentData.grossKg || l.grossWeightKg || 4850;
        const tare = weighmentData.tareKg !== undefined ? weighmentData.tareKg : l.tareWeightKg;
        const net = tare ? Math.max(0, gross - tare) : l.netWeightKg;
        const qtl = (net / 100);
        const rate = l.financials?.effectiveRatePerQtl || 2475;

        return {
          ...l,
          grossWeightKg: gross,
          tareWeightKg: tare,
          netWeightKg: net,
          quantityQuintals: qtl,
          weighment: {
            ...l.weighment,
            grossKg: gross,
            tareKg: tare,
            netKg: net,
            scaleId: weighmentData.scaleId || l.weighment?.scaleId,
            weighedAt: 'Just now'
          },
          financials: {
            ...l.financials,
            grossValue: qtl * rate,
            netPayableAmount: qtl * rate
          },
          status: tare ? 'ACCEPTED' : 'WEIGHING_GROSS'
        };
      }
      return l;
    }));

    showToast(`Weighment updated for Lot ${lotId}`);
  };

  // Helper: Live Auction Bidding
  const placeBid = (auctionId, incrementAmount, buyerName = 'Reliance Retail Agri Div') => {
    setAuctions(prev => prev.map(a => {
      if (a.id === auctionId) {
        const newBid = a.currentHighestBid + incrementAmount;
        const newBidObj = {
          id: `b-${Date.now()}`,
          bidderName: buyerName,
          bidAmount: newBid,
          time: 'Just now'
        };
        return {
          ...a,
          currentHighestBid: newBid,
          highestBidderName: buyerName,
          bidsCount: a.bidsCount + 1,
          bidsHistory: [newBidObj, ...a.bidsHistory]
        };
      }
      return a;
    }));

    showToast(`Bid placed: ₹${incrementAmount} higher on Auction ${auctionId}!`);
  };

  // Helper: Close Auction and Allot Lot
  const closeAuction = (auctionId) => {
    setAuctions(prev => prev.map(a => {
      if (a.id === auctionId) {
        return { ...a, status: 'SOLD', closingInMins: 0 };
      }
      return a;
    }));

    const auc = auctions.find(a => a.id === auctionId);
    if (auc) {
      setLots(prev => prev.map(l => {
        if (l.id === auc.lotId || l.lotNumber === auc.lotNumber) {
          return {
            ...l,
            status: 'COMPLETED',
            financials: {
              ...l.financials,
              effectiveRatePerQtl: auc.currentHighestBid,
              grossValue: l.quantityQuintals * auc.currentHighestBid,
              netPayableAmount: l.quantityQuintals * auc.currentHighestBid
            }
          };
        }
        return l;
      }));
    }

    showToast(`Auction ${auctionId} closed & allotted to highest bidder`);
  };

  // Helper: Complete Lot & Authorize Clearance
  const completeLot = (lotId) => {
    setLots(prev => prev.map(l => {
      if (l.id === lotId || l.lotNumber === lotId) {
        return { ...l, status: 'COMPLETED' };
      }
      return l;
    }));
    showToast(`Lot ${lotId} authorized & cleared for DBT payment`);
  };

  // Helper: Process Single DBT Payment
  const processSinglePayment = (paymentId) => {
    const utrNum = 'UTR-SBI-' + Date.now().toString().slice(-8);

    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: 'PAID',
          utrNumber: utrNum,
          disbursedAt: 'Just now'
        };
      }
      return p;
    }));

    showToast(`Payment ${paymentId} cleared via PFMS! UTR: ${utrNum}`);
  };

  // Helper: Process Bulk DBT Payments
  const processBulkPayment = (paymentIds) => {
    const timestamp = Date.now().toString().slice(-6);

    setPayments(prev => prev.map((p, idx) => {
      if (paymentIds.includes(p.id)) {
        return {
          ...p,
          status: 'PAID',
          utrNumber: `UTR-PFMS-${timestamp}-${idx + 1}`,
          disbursedAt: 'Just now'
        };
      }
      return p;
    }));

    showToast(`Batch of ${paymentIds.length} payments disbursed successfully!`);
  };

  // Helper: Notifications management
  const addNotification = (notif) => {
    const newNotif = {
      id: 'NOTIF-' + Date.now(),
      category: notif.category || 'INFO',
      title: notif.title,
      message: notif.message,
      timestamp: 'Just now',
      isRead: false,
      read: false,
      referenceId: notif.referenceId || null
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Helper: Submit Grievance
  const submitGrievance = (grievanceData) => {
    const newGrievance = {
      id: 'GRV-' + Date.now().toString().slice(-5),
      ...grievanceData,
      status: 'SUBMITTED',
      createdAt: 'Just now',
      submittedAt: 'Just now'
    };
    setGrievances(prev => [newGrievance, ...prev]);
    showToast(`Grievance #${newGrievance.id} lodged with APMC Redressal`);
    return newGrievance;
  };

  // Factory Reset Demo State
  const resetDemoData = () => {
    setCenters(mockCenters);
    setCrops(mockCrops);
    setFarmers(mockFarmers);
    setTokens(mockTokens);
    setLots(mockLots);
    setPayments(mockPayments);
    setAuctions(mockAuctions);
    setVehicles(mockVehicles);
    setNotifications(mockNotifications.map(n => ({
      ...n,
      isRead: n.isRead ?? n.read ?? false,
      read: n.read ?? n.isRead ?? false
    })));
    setCurrentRole('admin');
    setSelectedCenterId('C-01');
    localStorage.removeItem(STORAGE_PREFIX + 'role');
    showToast('Demo store restored to factory reference baseline', 'info');
  };

  return (
    <ProcurementContext.Provider
      value={{
        currentRole,
        setCurrentRole: switchRole,
        activeRoleObj,
        selectedCenterId,
        setSelectedCenterId,
        currentCenter,
        centers,
        crops,
        farmers,
        tokens,
        lots,
        payments,
        auctions,
        vehicles,
        counters,
        notifications,
        grievances,
        toast,
        showToast,
        bookSlot,
        checkInGate,
        callNextToken,
        skipToken,
        recallToken,
        recordQuality,
        recordWeighment,
        placeBid,
        closeAuction,
        completeLot,
        processSinglePayment,
        processBulkPayment,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsRead,
        clearAllNotifications,
        submitGrievance,
        resetDemoData
      }}
    >
      {children}
    </ProcurementContext.Provider>
  );
}

export function useProcurement() {
  const context = useContext(ProcurementContext);
  if (!context) {
    throw new Error('useProcurement must be used within a ProcurementProvider');
  }
  return context;
}
