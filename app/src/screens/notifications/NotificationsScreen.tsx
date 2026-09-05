import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { useAppStore } from '../../state/useAppStore';
import { NotificationItem } from '../../types';

interface NotificationsScreenProps {
  onBack?: () => void;
  onSelectNotification?: (item: NotificationItem) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onSelectNotification,
}) => {
  const { notifications, markNotificationRead, clearAllNotifications } =
    useAppStore();

  const getIconConfig = (type: NotificationItem['type']) => {
    switch (type) {
      case 'TOKEN_CALLED':
        return { name: 'megaphone' as const, color: '#DC2626', bg: '#FEF2F2' };
      case 'STATUS_CHANGE':
        return { name: 'git-branch' as const, color: COLORS.primary, bg: COLORS.primarySurface };
      case 'PAYMENT':
        return { name: 'cash' as const, color: COLORS.accentDark, bg: '#FEF3C7' };
      case 'REMINDER':
      default:
        return { name: 'time' as const, color: COLORS.info, bg: COLORS.infoSurface };
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Mandi Alerts"
        subtitle="Live Queue & Lifecycle Notifications"
        onBack={onBack}
        rightAction={
          notifications.length > 0 ? (
            <TouchableOpacity onPress={clearAllNotifications}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={54}
              color={COLORS.textMuted}
            />
            <Text style={styles.emptyTitle}>No Alerts Yet</Text>
            <Text style={styles.emptySubtitle}>
              You will receive real-time notifications when your token is called or status updates.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const icon = getIconConfig(item.type);
          return (
            <TouchableOpacity
              style={[
                styles.notifCard,
                !item.isRead && styles.unreadCard,
              ]}
              onPress={() => {
                markNotificationRead(item.id);
                if (onSelectNotification) onSelectNotification(item);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: icon.bg }]}>
                <Ionicons name={icon.name} size={20} color={icon.color} />
              </View>

              <View style={styles.textGroup}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.title,
                      !item.isRead && styles.unreadTitle,
                    ]}
                  >
                    {item.title}
                  </Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  clearText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  unreadCard: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  textGroup: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 6,
  },
  message: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 6,
  },
});
