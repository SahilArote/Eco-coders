import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { AppButton } from '../../components/AppButton';
import { useAppStore } from '../../state/useAppStore';

interface ProfileSetupScreenProps {
  onBack?: () => void;
  onSave: () => void;
}

const AVAILABLE_CROPS = [
  'Wheat',
  'Soybean',
  'Chana / Gram',
  'Cotton',
  'Paddy',
  'Maize',
  'Onion',
];

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  onBack,
  onSave,
}) => {
  const { t } = useTranslation();
  const { farmer, updateFarmerProfile } = useAppStore();

  const [fullName, setFullName] = useState(farmer.fullName);
  const [village, setVillage] = useState(farmer.village);
  const [district, setDistrict] = useState(farmer.district);
  const [landSize, setLandSize] = useState(String(farmer.landSizeAcres));
  const [selectedCrops, setSelectedCrops] = useState<string[]>(
    farmer.registeredCrops
  );

  const toggleCrop = (crop: string) => {
    if (selectedCrops.includes(crop)) {
      setSelectedCrops(selectedCrops.filter((c) => c !== crop));
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  const handleSave = () => {
    updateFarmerProfile({
      fullName,
      village,
      district,
      landSizeAcres: parseFloat(landSize) || 5.0,
      registeredCrops: selectedCrops,
    });
    onSave();
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={t('auth.profileSetupTitle')}
        subtitle={t('auth.profileSetupSubtitle')}
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Verification Status Banner */}
        <View style={styles.verifiedCard}>
          <View style={styles.verifiedIconBox}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.verifiedTextGroup}>
            <Text style={styles.verifiedTitle}>{t('auth.aadhaarVerified')}</Text>
            <Text style={styles.verifiedSubtitle}>
              {t('auth.linkedPhone', { phone: farmer.phone })}
            </Text>
          </View>
        </View>

        {/* Profile Inputs */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('auth.fullNameLabel')}</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder={t('auth.fullNamePlaceholder')}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.section, { flex: 1, marginRight: SPACING.md }]}>
            <Text style={styles.label}>{t('auth.villageLabel')}</Text>
            <TextInput
              style={styles.input}
              value={village}
              onChangeText={setVillage}
              placeholder="e.g. Ozar"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.label}>{t('auth.districtLabel')}</Text>
            <TextInput
              style={styles.input}
              value={district}
              onChangeText={setDistrict}
              placeholder="e.g. Nashik"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('auth.landSizeLabel')}</Text>
          <View style={styles.landInputWrapper}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={landSize}
              onChangeText={setLandSize}
              keyboardType="decimal-pad"
              placeholder="6.5"
              placeholderTextColor={COLORS.textMuted}
            />
            <View style={styles.unitPill}>
              <Text style={styles.unitText}>{t('common.acres')}</Text>
            </View>
          </View>
        </View>

        {/* Crop Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('auth.registeredCropsLabel')}</Text>
          <Text style={styles.helperText}>
            {t('auth.selectCropsHelper')}
          </Text>
          <View style={styles.cropsWrap}>
            {AVAILABLE_CROPS.map((crop) => {
              const isSelected = selectedCrops.includes(crop);
              return (
                <TouchableOpacity
                  key={crop}
                  style={[
                    styles.cropTag,
                    isSelected && styles.cropTagSelected,
                  ]}
                  onPress={() => toggleCrop(crop)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                    size={16}
                    color={isSelected ? COLORS.textInverse : COLORS.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.cropTagText,
                      isSelected && styles.cropTagTextSelected,
                    ]}
                  >
                    {crop}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <AppButton
          title={t('auth.saveProfileBtn')}
          onPress={handleSave}
          size="lg"
          style={styles.saveBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySurface,
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  verifiedIconBox: {
    marginRight: SPACING.md,
  },
  verifiedTextGroup: {
    flex: 1,
  },
  verifiedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  verifiedSubtitle: {
    fontSize: 12,
    color: COLORS.primaryDark,
    marginTop: 2,
    opacity: 0.85,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  landInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitPill: {
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1.5,
    borderLeftWidth: 0,
    borderColor: COLORS.border,
    borderTopRightRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  cropsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  cropTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  cropTagSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.subtle,
  },
  cropTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  cropTagTextSelected: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  saveBtn: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
});
