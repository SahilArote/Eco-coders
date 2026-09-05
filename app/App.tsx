import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import './src/i18n';
import { COLORS, RADIUS, SHADOWS, SPACING } from './src/theme';
import { useAppStore } from './src/state/useAppStore';
import { ProcurementCenter, TimeSlot } from './src/types';

// Screens
import { SplashScreen } from './src/screens/splash/SplashScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { ProfileSetupScreen } from './src/screens/auth/ProfileSetupScreen';
import { HomeScreen } from './src/screens/home/HomeScreen';
import { CenterListScreen } from './src/screens/discovery/CenterListScreen';
import { SlotPickerScreen } from './src/screens/booking/SlotPickerScreen';
import { BookingConfirmScreen } from './src/screens/booking/BookingConfirmScreen';
import { TokenPassScreen } from './src/screens/token/TokenPassScreen';
import { LiveQueueScreen } from './src/screens/queue/LiveQueueScreen';
import { ProcurementStatusScreen } from './src/screens/lifecycle/ProcurementStatusScreen';
import { PaymentStatusScreen } from './src/screens/payment/PaymentStatusScreen';
import { NotificationsScreen } from './src/screens/notifications/NotificationsScreen';
import { FeedbackScreen } from './src/screens/profile/FeedbackScreen';
import { ProfileScreen } from './src/screens/profile/ProfileScreen';

type Tab = 'HOME' | 'CENTERS' | 'QUEUE' | 'PROFILE';
type ModalScreen =
  | null
  | 'SLOT_PICKER'
  | 'BOOKING_CONFIRM'
  | 'TOKEN_PASS'
  | 'PROCUREMENT_STATUS'
  | 'PAYMENT_STATUS'
  | 'NOTIFICATIONS'
  | 'FEEDBACK'
  | 'EDIT_PROFILE';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('HOME');
  const [modalScreen, setModalScreen] = useState<ModalScreen>(null);

  // Flow State
  const [selectedCenter, setSelectedCenter] = useState<ProcurementCenter | null>(
    null
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('Today');

  const { t } = useTranslation();
  const {
    isAuthenticated,
    login,
    logout,
    centers,
    activeBooking,
    notifications,
    initLanguage,
  } = useAppStore();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    initLanguage();
  }, []);

  // 1. App Startup: Branded Animated Splash / Loading Experience
  if (isInitializing) {
    return (
      <SafeAreaProvider style={{ flex: 1, backgroundColor: '#022c22' }}>
        <SplashScreen onFinish={() => setIsInitializing(false)} />
      </SafeAreaProvider>
    );
  }

  // 2. Authentication-First Guard: First screen after splash is ALWAYS Login for unauthenticated users
  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
          <LoginScreen onLoginSuccess={login} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Handle Modal Screen Overlays
  const renderModalContent = () => {
    switch (modalScreen) {
      case 'SLOT_PICKER':
        return (
          <SlotPickerScreen
            center={selectedCenter || centers[0]}
            onBack={() => setModalScreen(null)}
            onSelectSlot={(slot, date) => {
              setSelectedSlot(slot);
              setSelectedDateStr(date);
              setModalScreen('BOOKING_CONFIRM');
            }}
          />
        );

      case 'BOOKING_CONFIRM':
        return (
          <BookingConfirmScreen
            center={selectedCenter || centers[0]}
            slot={selectedSlot || {
              id: 'slot-default',
              centerId: 'center-1',
              scheduleId: 'sch-1',
              slotDate: 'Today',
              startTime: '10:00 AM',
              endTime: '11:00 AM',
              capacity: 20,
              bookedCount: 17,
              status: 'FEW_LEFT',
            }}
            dateStr={selectedDateStr}
            onBack={() => setModalScreen('SLOT_PICKER')}
            onBookingSuccess={() => {
              setModalScreen('TOKEN_PASS');
            }}
          />
        );

      case 'TOKEN_PASS':
        return (
          <TokenPassScreen
            onBack={() => setModalScreen(null)}
            onTrackQueue={() => {
              setModalScreen(null);
              setActiveTab('QUEUE');
            }}
            onViewProcurement={() => setModalScreen('PROCUREMENT_STATUS')}
          />
        );

      case 'PROCUREMENT_STATUS':
        return (
          <ProcurementStatusScreen
            onBack={() => setModalScreen(null)}
            onViewPayment={() => setModalScreen('PAYMENT_STATUS')}
          />
        );

      case 'PAYMENT_STATUS':
        return (
          <PaymentStatusScreen
            onBack={() => setModalScreen(null)}
            onGoHome={() => {
              setModalScreen(null);
              setActiveTab('HOME');
            }}
          />
        );

      case 'NOTIFICATIONS':
        return (
          <NotificationsScreen
            onBack={() => setModalScreen(null)}
            onSelectNotification={() => {
              setModalScreen(null);
              setActiveTab('QUEUE');
            }}
          />
        );

      case 'FEEDBACK':
        return (
          <FeedbackScreen
            onBack={() => setModalScreen(null)}
            onSubmitDone={() => setModalScreen(null)}
          />
        );

      case 'EDIT_PROFILE':
        return (
          <ProfileSetupScreen
            onBack={() => setModalScreen(null)}
            onSave={() => setModalScreen(null)}
          />
        );

      default:
        return null;
    }
  };

  // Render Primary Tab Screen
  const renderTabContent = () => {
    switch (activeTab) {
      case 'HOME':
        return (
          <HomeScreen
            onNavigateToBooking={() => {
              setSelectedCenter(centers[0]);
              setModalScreen('SLOT_PICKER');
            }}
            onNavigateToQueue={() => setActiveTab('QUEUE')}
            onNavigateToToken={() => setModalScreen('TOKEN_PASS')}
            onNavigateToProcurement={() => setModalScreen('PROCUREMENT_STATUS')}
            onNavigateToPayment={() => setModalScreen('PAYMENT_STATUS')}
            onNavigateToCenters={() => setActiveTab('CENTERS')}
            onNavigateToNotifications={() => setModalScreen('NOTIFICATIONS')}
            onNavigateToGrievance={() => setModalScreen('FEEDBACK')}
          />
        );

      case 'CENTERS':
        return (
          <CenterListScreen
            onSelectCenter={(center) => {
              setSelectedCenter(center);
              setModalScreen('SLOT_PICKER');
            }}
          />
        );

      case 'QUEUE':
        return (
          <LiveQueueScreen
            onViewTokenPass={() => setModalScreen('TOKEN_PASS')}
            onViewProcurementLifecycle={() => setModalScreen('PROCUREMENT_STATUS')}
          />
        );

      case 'PROFILE':
        return (
          <ProfileScreen
            onEditProfile={() => setModalScreen('EDIT_PROFILE')}
            onOpenGrievance={() => setModalScreen('FEEDBACK')}
            onLogout={logout}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        {/* Main View Container */}
        <View style={styles.mainContainer}>
          {modalScreen ? renderModalContent() : renderTabContent()}
        </View>

        {/* Bottom Tab Bar (Shown only when no modal is active) */}
        {!modalScreen && (
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab('HOME')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === 'HOME' ? 'home' : 'home-outline'}
                size={22}
                color={activeTab === 'HOME' ? COLORS.primary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'HOME' && styles.tabLabelActive,
                ]}
              >
                {t('tabs.home')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab('CENTERS')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === 'CENTERS' ? 'business' : 'business-outline'}
                size={22}
                color={activeTab === 'CENTERS' ? COLORS.primary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'CENTERS' && styles.tabLabelActive,
                ]}
              >
                {t('tabs.centers')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab('QUEUE')}
              activeOpacity={0.7}
            >
              <View style={styles.queueTabIconWrap}>
                <Ionicons
                  name={activeTab === 'QUEUE' ? 'pulse' : 'pulse-outline'}
                  size={22}
                  color={activeTab === 'QUEUE' ? COLORS.accentDark : COLORS.textMuted}
                />
                {activeBooking && (
                  <View style={styles.activeDot} />
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'QUEUE' && styles.tabLabelActiveAmber,
                ]}
              >
                {t('tabs.queue')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab('PROFILE')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === 'PROFILE' ? 'person' : 'person-outline'}
                size={22}
                color={activeTab === 'PROFILE' ? COLORS.primary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'PROFILE' && styles.tabLabelActive,
                ]}
              >
                {t('tabs.profile')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  mainContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
    ...SHADOWS.card,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 3,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  tabLabelActiveAmber: {
    color: COLORS.accentDark,
    fontWeight: '800',
  },
  queueTabIconWrap: {
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.accent,
  },
});
