import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, ExternalLink, Crown, X, Star, Navigation } from 'lucide-react-native';
import { COLORS } from '../constants';
import MapView from './MapView';

interface PremiumMapViewProps {
  location?: {
    latitude: number;
    longitude: number;
    name: string;
  };
  isPremium?: boolean;
  onUpgrade?: () => void;
}

const PremiumMapView: React.FC<PremiumMapViewProps> = ({ 
  location, 
  isPremium = false, 
  onUpgrade 
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleMapPress = () => {
    if (!isPremium) {
      setShowUpgradeModal(true);
    }
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    onUpgrade?.();
  };

  const PremiumFeatures = () => (
    <View style={styles.premiumFeatures}>
      <View style={styles.featureItem}>
        <Star size={16} color={COLORS.primary} />
        <Text style={styles.featureText}>실시간 교통 정보</Text>
      </View>
      <View style={styles.featureItem}>
        <Navigation size={16} color={COLORS.primary} />
        <Text style={styles.featureText}>상세 경로 안내</Text>
      </View>
      <View style={styles.featureItem}>
        <MapPin size={16} color={COLORS.primary} />
        <Text style={styles.featureText}>주변 관광지 추천</Text>
      </View>
    </View>
  );

  if (!location) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <MapPin size={48} color={COLORS.gray} />
          <Text style={styles.placeholderText}>위치 정보가 없습니다</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isPremium && (
        <View style={styles.premiumBanner}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.bannerGradient}
          >
            <Crown size={20} color="#FFF" />
            <Text style={styles.bannerText}>프리미엄 지도 기능을 이용해보세요</Text>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleMapPress}>
              <Text style={styles.upgradeButtonText}>업그레이드</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

      <MapView location={location} onMapPress={handleMapPress} />

      {/* 업그레이드 모달 */}
      <Modal
        visible={showUpgradeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>프리미엄 지도 기능</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowUpgradeModal(false)}
              >
                <X size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.premiumHeader}
            >
              <Crown size={32} color="#FFF" />
              <Text style={styles.premiumTitle}>프리미엄 지도</Text>
              <Text style={styles.premiumSubtitle}>고급 지도 기능을 이용하세요</Text>
            </LinearGradient>

            <PremiumFeatures />

            <View style={styles.pricingSection}>
              <Text style={styles.pricingTitle}>구독 요금</Text>
              <View style={styles.pricingOptions}>
                <TouchableOpacity style={styles.pricingOption}>
                  <Text style={styles.pricingPeriod}>월 구독</Text>
                  <Text style={styles.pricingPrice}>₩4,900</Text>
                  <Text style={styles.pricingUnit}>/월</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pricingOption, styles.recommended]}>
                  <Text style={styles.pricingPeriod}>연 구독</Text>
                  <Text style={styles.pricingPrice}>₩39,900</Text>
                  <Text style={styles.pricingUnit}>/년</Text>
                  <Text style={styles.savings}>32% 할인</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.subscribeButton} onPress={handleUpgrade}>
              <Text style={styles.subscribeButtonText}>프리미엄 구독하기</Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              구독은 언제든지 취소할 수 있습니다. 자동 갱신됩니다.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  premiumBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  upgradeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  upgradeButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  placeholderText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  closeButton: {
    padding: 4,
  },
  premiumHeader: {
    alignItems: 'center',
    padding: 24,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  premiumFeatures: {
    padding: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  pricingSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  pricingOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pricingOption: {
    flex: 0.48,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  recommended: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.lightPrimary,
  },
  pricingPeriod: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  pricingPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  pricingUnit: {
    fontSize: 12,
    color: COLORS.gray,
  },
  savings: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  subscribeButton: {
    backgroundColor: COLORS.primary,
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default PremiumMapView; 