import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CurvedBottomBar } from 'react-native-curved-bottom-bar';
import { useCart } from '../context/CartContext';
import ApiService from '../services/api-service';
import LocationService from '../services/location-service';

interface BottomTabNavigatorProps {
  activeTab: 'home' | 'consultations' | 'orders' | 'cart';
  onLocationRefresh?: () => void;
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

  // Define routes for CurvedBottomBar
  const _renderIcon = (routeName: string, selectedTab: string) => {
    let iconName = '';
    switch (routeName) {
      case 'home':
        iconName = selectedTab === 'home' ? 'home' : 'home-outline';
        break;
      case 'consultations':
        iconName = selectedTab === 'consultations' ? 'clipboard' : 'clipboard-outline';
        break;
      case 'orders':
        iconName = selectedTab === 'orders' ? 'receipt' : 'receipt-outline';
        break;
      case 'cart':
        iconName = selectedTab === 'cart' ? 'cart' : 'cart-outline';
        break;
    }
    
    return (
      <View style={routeName === selectedTab ? styles.selectedTabContainer : null}>
        <Ionicons name={iconName as any} size={24} color="#FFFFFF" />
        {routeName === 'cart' && cart && cart.totalItems > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>
              {cart.totalItems > 99 ? '99+' : cart.totalItems}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Handle route press
  const handleTabPress = (routeName: string) => {
    router.push(`/${routeName}`);
  };

  return (
    <View style={styles.container}>
      <CurvedBottomBar.Navigator
        type="DOWN"
        style={styles.bottomBar}
        shadowStyle={styles.shawdow}
        height={75}
        circleWidth={60}
        bgColor="#01893F"
        initialRouteName={activeTab}
        borderTopLeftRight
        renderCircle={() => (
          <TouchableOpacity
            style={styles.btnCircle}
            onPress={handleLocationRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="locate" size={28} color="#FFF" />
            )}
          </TouchableOpacity>
        )}
        tabBar={({ routeName, selectedTab, navigate }) => {
          return (
            <TouchableOpacity
              onPress={() => handleTabPress(routeName)}
              style={styles.tabButton}
            >
              {_renderIcon(routeName, selectedTab)}
              {routeName === selectedTab && <View style={styles.activeNavDot} />}
            </TouchableOpacity>
          );
        }}
      >
        <CurvedBottomBar.Screen
          name="home"
          position="LEFT"
          component={() => <View />}
        />
        <CurvedBottomBar.Screen
          name="consultations"
          position="LEFT"
          component={() => <View />}
        />
        <CurvedBottomBar.Screen
          name="orders"
          position="RIGHT"
          component={() => <View />}
        />
        <CurvedBottomBar.Screen
          name="cart"
          position="RIGHT"
          component={() => <View />}
        />
      </CurvedBottomBar.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
  },
  bottomBar: {
    backgroundColor: 'transparent',
  },
  shawdow: {
    shadowColor: '#01893F',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  btnCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#01893F',
    bottom: 30,
    shadowColor: '#01893F',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  selectedTabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: -10,
  },
  cartBadge: {
    position: 'absolute',
    right: -10,
    top: -10,
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
});

export default BottomTabNavigator;
   