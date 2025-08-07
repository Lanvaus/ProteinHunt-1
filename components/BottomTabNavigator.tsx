import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useCart } from '../context/CartContext';

interface BottomTabNavigatorProps {
  activeTab: 'home' | 'consultations' | 'orders' | 'cart';
}

const BottomTabNavigator: React.FC<BottomTabNavigatorProps> = ({ activeTab }) => {
  const router = useRouter();
  const { cart } = useCart();
  
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
        <View style={styles.navCenterButton}>
          <View style={styles.innerCircle}>
            <Ionicons name="locate" size={32} color="#FFF" />
          </View>
        </View>
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
});

export default BottomTabNavigator;
