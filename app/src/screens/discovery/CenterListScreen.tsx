import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { useAppStore } from '../../state/useAppStore';
import { ProcurementCenter } from '../../types';

interface CenterListScreenProps {
  onSelectCenter: (center: ProcurementCenter) => void;
  onBack?: () => void;
}

export const CenterListScreen: React.FC<CenterListScreenProps> = ({
  onSelectCenter,
  onBack,
}) => {
  const { t } = useTranslation();
  const { centers, crops } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('ALL');

  const filteredCenters = centers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.village.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCrop =
      selectedCropFilter === 'ALL' ||
      c.acceptedCropIds.includes(selectedCropFilter);

    return matchesSearch && matchesCrop;
  });

  return (
    <View style={styles.container}>
      <AppHeader
        title={t('discovery.title')}
        subtitle={t('discovery.subtitle')}
        onBack={onBack}
      />

      <View style={styles.searchSection}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('discovery.searchPlaceholder')}
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Crop Filter Horizontal Scroll */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedCropFilter === 'ALL' && styles.filterPillActive,
            ]}
            onPress={() => setSelectedCropFilter('ALL')}
          >
            <Text
              style={[
                styles.filterText,
                selectedCropFilter === 'ALL' && styles.filterTextActive,
              ]}
            >
              {t('discovery.allCrops')}
            </Text>
          </TouchableOpacity>
          {crops.map((crop) => (
            <TouchableOpacity
              key={crop.id}
              style={[
                styles.filterPill,
                selectedCropFilter === crop.id && styles.filterPillActive,
              ]}
              onPress={() => setSelectedCropFilter(crop.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedCropFilter === crop.id && styles.filterTextActive,
                ]}
              >
                {crop.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Centers List */}
      <FlatList
        data={filteredCenters}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.centerCard}
            onPress={() => onSelectCenter(item)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={styles.nameGroup}>
                <Text style={styles.centerName}>{item.name}</Text>
                <Text style={styles.centerAddress}>
                  {item.village}, {item.district}
                </Text>
              </View>
              <StatusBadge status={item.status} size="sm" />
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color={COLORS.primary} />
                <Text style={styles.metaText}>
                  {t('discovery.distanceAway', { distance: item.distanceKm })}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="speedometer-outline" size={14} color={COLORS.accentDark} />
                <Text style={styles.metaText}>
                  {t('discovery.countersStatus', {
                    active: item.activeCounters,
                    total: item.totalCounters,
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.cropTagsWrap}>
              {item.acceptedCropIds.map((cropId) => {
                const cropObj = crops.find((c) => c.id === cropId);
                return (
                  <View key={cropId} style={styles.cropTag}>
                    <Text style={styles.cropTagText}>
                      {cropObj?.name.split(' ')[0] || 'Crop'}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.capacityBox}>
                <Text style={styles.capacityLabel}>{t('home.dailyCapacity')}</Text>
                <Text style={styles.capacityValue}>
                  {t('discovery.dailyCapacityQtl', { count: item.dailyCapacityQuintals })}
                </Text>
              </View>
              <View style={styles.actionBtn}>
                <Text style={styles.actionBtnText}>{t('discovery.bookSlot')}</Text>
                <Ionicons name="arrow-forward" size={14} color={COLORS.textInverse} />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchSection: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  centerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameGroup: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  centerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  centerAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  cropTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: SPACING.md,
  },
  cropTag: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  cropTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  capacityBox: {},
  capacityLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  capacityValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
});
