import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useCart } from '../context/CartContext';
import ApiService from '../services/api-service';
import LocationService from '../services/location-service';

interface BottomTabNavigatorProps {
  activeTab: 'home' | 'consultations' | 'orders' | 'cart';
  onLocationRefresh?: () => void; // Add callback for location refresh
}

const BottomTabNavigator: React.FC<BottomTabNavigatorProps> = ({ 
  activeTab,
  onLocationRefresh 
}) => {
  const router = useRouter();
  const { cart } = useCart();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  // Handle location refresh when center button is pressed
  const handleLocationRefresh = async () => {
    // If there's a parent callback, use that
    if (onLocationRefresh) {
      onLocationRefresh();
      return;
    }
    
    // Otherwise handle location refresh here
    setIsRefreshing(true);
    try {
      const userLocation = await LocationService.getCurrentLocation();
      
      if (userLocation) {
        // Check delivery availability at the current location
        const response = await ApiService.checkDeliveryAvailability(
          userLocation.latitude, 
          userLocation.longitude
        );
        
        if (response.success) {
          // Navigate to the nearest kitchen or show availability
          router.push('/delivery-zones');
        }
      }
    } catch (error) {
      console.error('Error refreshing location:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <View style={styles.navigationContainer}>
      {/* SVG curved background */}
      <View style={styles.navigationBarBg}>
        <Svg
          width="100%"
          height={74}
          viewBox="0 0 400 74"
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
        >
          <Path
            d="M0 0 H120 Q145 0 160 38 Q200 64 240 38 Q255 0 280 0 H400 V74 H0 Z"
            fill="#01893F"
          />
        </Svg>
      </View>
      <View style={styles.navigationBarContent}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/home')}
        >
          <Ionicons 
            name={activeTab === 'home' ? "home" : "home-outline"} 
            size={24} 
            color="#FFFFFF" 
          />
          {activeTab === 'home' && <View style={styles.activeNavDot} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/consultations')}
        >
          <Ionicons 
            name={activeTab === 'consultations' ? "clipboard" : "clipboard-outline"} 
            size={24} 
            color="#FFFFFF" 
          />
          {activeTab === 'consultations' && <View style={styles.activeNavDot} />}
        </TouchableOpacity>
        <View style={styles.navCenterItemPlaceholder} />
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/orders')}
        >
          <Ionicons 
            name={activeTab === 'orders' ? "receipt" : "receipt-outline"} 
            size={24} 
            color="#FFFFFF" 
          />
          {activeTab === 'orders' && <View style={styles.activeNavDot} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/cart')}
        >
          <Ionicons 
            name={activeTab === 'cart' ? "cart" : "cart-outline"} 
            size={24} 
            color="#FFFFFF" 
          />
          {activeTab === 'cart' && <View style={styles.activeNavDot} />}
          {cart && cart.totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cart.totalItems > 99 ? '99+' : cart.totalItems}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      {/* Floating center button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity 
          style={styles.navCenterButton}
          onPress={handleLocationRefresh}
          disabled={isRefreshing}
        >
          <View style={styles.innerCircle}>
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="locate" size={32} color="#FFF" />
            )}
          </View>
        </TouchableOpacity>
        {/* Tooltip for the center button */}
      
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 74,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  navigationBarBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 74,
    zIndex: 1,
  },
  navigationBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 74,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingHorizontal: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
    flex: 1,
  },
  activeNavDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 12,
  },
  cartBadge: {
    position: 'absolute',
    right: 10,
    top: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  navCenterItemPlaceholder: {
    width: 68,
    flex: 1,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 37,
    alignSelf: 'center',
    zIndex: 3,
    alignItems: 'center',
  },
  navCenterButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#01893F',
    shadowColor: '#01893F',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 3,
    borderColor: 'white',
  },
  innerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTooltip: {
    position: 'absolute',
    bottom: -22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tooltipText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default BottomTabNavigator;
