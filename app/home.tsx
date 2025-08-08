import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import BottomTabNavigator from '../components/BottomTabNavigator';
import { useCart } from '../context/CartContext';
import ApiService from '../services/api-service';
import LocationService, { LocationPermissionStatus } from '../services/location-service';

interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: number;
}

interface Notification {
  id: number;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'order' | 'promo' | 'system';
}

const HomeScreen = () => {
  const router = useRouter();
  const { cart } = useCart();
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState<boolean | null>(null);
  const [deliveryMessage, setDeliveryMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>(
    LocationPermissionStatus.UNDETERMINED
  );
  
  // Add notification related state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      message: "Your order #2456 has been delivered. Enjoy your meal!",
      timestamp: "10 min ago",
      isRead: false,
      type: 'order'
    },
    {
      id: 2,
      message: "Special offer: Get 20% off on your next order with code PROTEIN20",
      timestamp: "2 hours ago",
      isRead: false,
      type: 'promo'
    },
    {
      id: 3,
      message: "Your subscription plan will renew in 3 days",
      timestamp: "Yesterday",
      isRead: true,
      type: 'system'
    },
    {
      id: 4,
      message: "New protein bowls added to our menu! Check them out!",
      timestamp: "2 days ago",
      isRead: true,
      type: 'promo'
    }
  ]);
  
  useEffect(() => {
    checkLocationPermissionAndSetup();
  }, []);
  
  const checkLocationPermissionAndSetup = async () => {
    setIsLoading(true);
    
    // Check permission status first
    const status = await LocationService.getPermissionStatus();
    setPermissionStatus(status);
    
    if (status === LocationPermissionStatus.GRANTED) {
      await checkLocationAndDelivery();
    } else if (status === LocationPermissionStatus.UNDETERMINED) {
      // If undetermined, request permission
      const newStatus = await LocationService.requestPermissions();
      setPermissionStatus(newStatus);
      
      if (newStatus === LocationPermissionStatus.GRANTED) {
        await checkLocationAndDelivery();
      } else {
        setIsLoading(false);
      }
    } else {
      // Permission already denied
      setIsLoading(false);
    }
  };
  
  const checkLocationAndDelivery = async () => {
    try {
      // First, try to get cached location
      let userLocation = await LocationService.getCachedLocation();
      
      // If no cached location, get current location
      if (!userLocation) {
        userLocation = await LocationService.getCurrentLocation();
      }
      
      setLocation(userLocation);
      
      // If we have a location, check delivery availability
      if (userLocation) {
        await checkDeliveryAvailability(userLocation.latitude, userLocation.longitude);
      }
    } catch (error) {
      console.error('Error in location setup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    const status = await LocationService.requestPermissions();
    setPermissionStatus(status);
    
    if (status === LocationPermissionStatus.GRANTED) {
      await checkLocationAndDelivery();
    } else if (status === LocationPermissionStatus.DENIED) {
      // Show an alert explaining why we need location and provide option to open settings
      Alert.alert(
        'Location Permission Required',
        'We need your location to check if we can deliver to you. Please enable location permission in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
    }
  };
  
  const checkDeliveryAvailability = async (latitude: number, longitude: number) => {
    try {
      const response = await ApiService.checkDeliveryAvailability(latitude, longitude);
      
      if (response.success && response.data) {
        setIsDeliveryAvailable(response.data.canDeliver);
        setDeliveryMessage(response.data.message);
        
        // If delivery is not available, show a notification to the user
        if (!response.data.canDeliver) {
          Alert.alert(
            'Delivery Not Available',
            `We're sorry, but we don't deliver to your location yet. ${response.data.message}`,
            [{ text: 'OK', style: 'default' }]
          );
        }
      }
    } catch (error) {
      console.error('Error checking delivery availability:', error);
    }
  };
  
  const handleLocationPress = async () => {
    if (permissionStatus !== LocationPermissionStatus.GRANTED) {
      await handleRequestPermission();
      return;
    }
    
    // If permission is granted, refresh location
    setIsLoading(true);
    try {
      const userLocation = await LocationService.getCurrentLocation();
      if (userLocation) {
        setLocation(userLocation);
        await checkDeliveryAvailability(userLocation.latitude, userLocation.longitude);
      }
    } catch (error) {
      console.error('Error updating location:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderLocationStatus = () => {
    if (isLoading) {
      return 'Getting location...';
    }
    
    if (permissionStatus !== LocationPermissionStatus.GRANTED) {
      return 'Location access required';
    }
    
    return location?.address || 'Set your location';
  };

  // Create a location refresh handler to pass to BottomTabNavigator
  const handleLocationRefresh = async () => {
    setIsLoading(true);
    try {
      // Check permission first
      if (permissionStatus !== LocationPermissionStatus.GRANTED) {
        await handleRequestPermission();
        return;
      }
      
      // Get current location
      const userLocation = await LocationService.getCurrentLocation();
      if (userLocation) {
        setLocation(userLocation);
        await checkDeliveryAvailability(userLocation.latitude, userLocation.longitude);
        
        // Show a success toast or feedback
        Alert.alert('Location Updated', 'Your location has been refreshed');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      Alert.alert('Error', 'Failed to update your location');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle notification panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
  };
  
  // Get unread notification count
  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Notification Panel - Show when the state is true */}
      {showNotifications && (
        <View style={styles.notificationPanelOverlay}>
          <TouchableOpacity 
            style={styles.notificationBackdrop}
            onPress={toggleNotifications}
            activeOpacity={1}
          />
          <View style={styles.notificationPanel}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>Notifications</Text>
              <TouchableOpacity onPress={toggleNotifications}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {notifications.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Ionicons name="notifications-outline" size={48} color="#CCC" />
                <Text style={styles.emptyNotificationsText}>
                  No notifications yet
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.notificationList}>
                {notifications.map(notification => (
                  <TouchableOpacity 
                    key={notification.id} 
                    style={[
                      styles.notificationItem,
                      !notification.isRead && styles.unreadNotification
                    ]}
                    onPress={() => markAsRead(notification.id)}
                  >
                    <View style={styles.notificationIconContainer}>
                      <Ionicons 
                        name={
                          notification.type === 'order' ? 'receipt-outline' :
                          notification.type === 'promo' ? 'pricetag-outline' :
                          'information-circle-outline'
                        } 
                        size={24} 
                        color={
                          notification.type === 'order' ? '#4CAF50' :
                          notification.type === 'promo' ? '#FF9800' :
                          '#2196F3'
                        } 
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text 
                        style={[
                          styles.notificationMessage,
                          !notification.isRead && styles.unreadNotificationText
                        ]}
                      >
                        {notification.message}
                      </Text>
                      <Text style={styles.notificationTimestamp}>
                        {notification.timestamp}
                      </Text>
                    </View>
                    {!notification.isRead && (
                      <View style={styles.unreadIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      )}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Location */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.locationContainer}
            onPress={handleLocationPress}
          >
            <Ionicons 
              name="location-outline" 
              size={24} 
              color={
                permissionStatus !== LocationPermissionStatus.GRANTED
                  ? "#FF8C00"
                  : isDeliveryAvailable === false
                  ? "#FF3B30"
                  : "#18853B"
              } 
            />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Current location</Text>
              <Text 
                style={[
                  styles.locationValue,
                  permissionStatus !== LocationPermissionStatus.GRANTED && styles.warningLocation,
                  isDeliveryAvailable === false && styles.unavailableLocation
                ]}
                numberOfLines={1}
              >
                {renderLocationStatus()}
              </Text>
            </View>
            {/* <Ionicons name="chevron-down" size={20} color="#333" /> */}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={toggleNotifications}
          >
            <Ionicons name="notifications-outline" size={24} color="#333" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Permission Required Banner */}
        {permissionStatus !== LocationPermissionStatus.GRANTED && (
          <TouchableOpacity 
            style={styles.permissionBanner}
            onPress={handleRequestPermission}
          >
            <Ionicons name="location-outline" size={20} color="#FF8C00" />
            <Text style={styles.permissionBannerText}>
              Location permission is required to check delivery availability
            </Text>
            <View style={styles.enableButton}>
              <Text style={styles.enableButtonText}>Enable</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Delivery Status Banner (only show if delivery is not available) */}
        {permissionStatus === LocationPermissionStatus.GRANTED && isDeliveryAvailable === false && (
          <View style={styles.deliveryBanner}>
            <Ionicons name="alert-circle-outline" size={20} color="#FF3B30" />
            <Text style={styles.deliveryBannerText}>
              {deliveryMessage || "We don't deliver to this area yet"}
            </Text>
          </View>
        )}

        {/* Promotional Banner */}
        <View style={styles.banner}>
          <Image
            source={require('../assets/images/promo.png')}
            style={styles.bannerBgImage}
          />
          {/* Overlay color */}
          <View style={styles.bannerOverlay} />
          <View style={styles.bannerContent}>
            {/* Left: Text */}
            <View style={styles.bannerTextHalf}>
              <View>
                <Text style={styles.bannerTitle}>
                  Claim your {'\n'} discount 30%  {'\n'} daily now!
                </Text>
                <TouchableOpacity style={styles.orderButton}  onPress={() => router.push({
              pathname: '/protein-picks',
              params: { mealType: 'PROTEIN_PICK', title: 'Protein Picks' }
            })}>
                  <Text style={styles.orderButtonText}>Order now</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Right: Image */}
            <View style={styles.bannerImageHalf}>
              <Image
                source={require('../assets/images/protein-bowl.png')}
                style={styles.bannerImageFill}
              />
            </View>
          </View>
          {/* Dots: bottom center */}
          <View style={styles.bannerIndicatorsBottom}>
            <View style={[styles.indicator, styles.activeIndicator]} />
            <View style={styles.indicator} />
            <View style={styles.indicator} />
          </View>
        </View>

        {/* Top Categories */}
        <View style={styles.categoriesHeader}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          {/* <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity> */}
        </View>

        <View style={styles.categoriesContainer}>
          <TouchableOpacity 
            style={styles.categoryCard} 
            onPress={() => router.push({
              pathname: '/protein-picks',
              params: { mealType: 'PROTEIN_PICK', title: 'Protein Picks' }
            })}
          >
            <Image
              source={require('../assets/images/protein-picks.png')}
              style={styles.categoryImage}
            />
            <Image
              source={require('../assets/images/rectangle.png')}
              style={styles.categoryOverlayImage}
            />
            <View style={styles.categoryTextOverlay}>
              <Text style={styles.categoryTitle}>Protein Picks</Text>
              <Text style={styles.categorySubtitle}>Lorem ipsum is simply dummy</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => router.push({
              pathname: '/protein-picks',
              params: { mealType: 'POWER_COMBO', title: 'Power Combos' }
            })}
          >
            <Image
              source={require('../assets/images/protein-combos.png')}
              style={styles.categoryImage}
            />
            <Image
              source={require('../assets/images/rectangle.png')}
              style={styles.categoryOverlayImage}
            />
            <View style={styles.categoryTextOverlay}>
              <Text style={styles.categoryTitle}>Protein Combos</Text>
              <Text style={styles.categorySubtitle}>Lorem ipsum is simply dummy</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Nutritionist Consultation */}
        <View style={styles.nutritionistCard}>
          <View style={styles.nutritionistTextContainer}>
            <Text style={styles.nutritionistTitle}>Consult a Certified Nutritionist</Text>
            <View style={styles.consultationActions}>
              <TouchableOpacity 
                style={styles.bookButton}
                onPress={() => router.push('/consultation-booking')}
              >
                <Text style={styles.bookButtonText}>Book Consultation</Text>
              </TouchableOpacity>
              
              {/* <TouchableOpacity 
                style={styles.viewConsultationsButton}
                onPress={() => router.push('/consultations')}
              >
                <Text style={styles.viewConsultationsText}>View Ongoing</Text>
              </TouchableOpacity> */}
            </View>
          </View>
          <View style={styles.nutritionistImageWrapper}>
            <Image
              source={require('../assets/images/nutritionist.png')}
              style={styles.nutritionistImageEdge}
            />
          </View>
        </View>

        {/* Feature Cards */}
        <View style={styles.featureCardsRow}>
          <TouchableOpacity 
            style={[styles.featureCard, styles.featureCardLeft]}
            onPress={() => router.push('/diet-plan-home')}
          >
            <Image
              source={require('../assets/images/diet-plan.png')}
              style={styles.featureImage}
            />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Diet Plan</Text>
              <Text style={styles.featureDescription}>View your plan</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.featureCard, styles.featureCardRight]}
            onPress={() => router.push('/build-a-bowl')}
          >
            <Image
              source={require('../assets/images/build-a-bowl.png')}
              style={styles.featureImage}
            />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Build-a-Bowl</Text>
              <Text style={styles.featureDescription}>Customize your bowl</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Pass the location refresh handler to BottomTabNavigator */}
      <BottomTabNavigator 
        activeTab="home" 
        onLocationRefresh={handleLocationRefresh} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  locationLabel: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  locationValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '700',
  },
  unavailableLocation: {
    color: '#FF3B30',
  },
  notificationButton: {
    padding: 10,
    backgroundColor: '#F0F9F4',
    borderRadius: 16,
    elevation: 2,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  deliveryBanner: {
    backgroundColor: '#FFEBEA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  deliveryBannerText: {
    color: '#FF3B30',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  banner: {
    borderRadius: 20,
    margin: 16,
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#4FAF5A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    height: 120,
    position: 'relative',
    backgroundColor: '#5DCB6A',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#4FAF5A',
    opacity: 0.55, // adjust for desired overlay strength
    borderRadius: 20,
    zIndex: 1,
  },
  bannerBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 20,
    zIndex: 0,
  },
  bannerContent: {
    flexDirection: 'row',
    height: '100%',
    zIndex: 2,
  },
  bannerImageHalf: {
    width: '50%',
    height: '100%',
    overflow: 'hidden',
  },
  bannerImageFill: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerTextHalf: {
    width: '50%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 10,
    paddingRight: 12,
    height: '100%',
  },
  bannerTextContainer: {
    alignItems: 'flex-end',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: 'left',
  },
  orderButton: {
    backgroundColor: '#101010',
    borderRadius: 22,
    paddingVertical: 7,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FCFCFB',
    marginHorizontal: 2,
  },
  activeIndicator: {
    backgroundColor: '#FDBF0A',
    width: 8,
    height: 8,
    borderColor: '#18853B',
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 0.3,
  },
  seeAllText: {
    color: '#18853B',
    fontSize: 15,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: '#fff',
    shadowColor: '#4FAF5A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    elevation: 6,
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 16,
  },
  categoryOverlayImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50, // adjust as needed for overlay height
    width: '100%',
    resizeMode: 'stretch',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 1,
  },
  categoryTextOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 2,
    // backgroundColor removed
  },
  categoryTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 2,
  },
  categorySubtitle: {
    color: 'white',
    fontSize: 10,
    opacity: 0.85,
  },
  nutritionistCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF9E5',
    borderRadius: 18,
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 18,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 6,
    alignItems: 'center',
  },
  nutritionistTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nutritionistTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D21',
    marginBottom: 10,
  },
  consultationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: '#18853B',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    shadowColor: '#18853B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 4,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  viewConsultationsButton: {
    marginLeft: 12,
    paddingVertical: 8,
  },
  viewConsultationsText: {
    color: '#18853B',
    fontWeight: '600',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  nutritionistImageWrapper: {
    borderRadius: 50,
    padding: 0,
    marginRight: -16,
    marginBottom: -16, // add this to touch bottom edge
    alignSelf: 'flex-end',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 6,
  },
  nutritionistImageEdge: {
    width: 90,
    height: 110,
    resizeMode: 'contain',
    borderRadius: 45,
    transform: [{ scale: 1.9 }],
    marginRight: 30,
    marginBottom: 5,
  },
  featureCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    paddingHorizontal: 18,
    marginTop: 16,
    marginBottom: 80,
  },
  featureCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
    minWidth: 0,
    maxWidth: '50%',
    shadowColor: '#18853B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 6,
  },
  featureCardLeft: {
    backgroundColor: '#E5FFF4',
  },
  featureCardRight: {
    backgroundColor: '#E7FFE8',
  },
  featureTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1D1D21',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666',
    opacity: 0.9,
  },
  featureImage: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
    marginRight: 10,
  },
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
  permissionBanner: {
    backgroundColor: '#FFF9E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderRadius: 8, 
  },
  permissionBannerText: {
    color: '#FF8C00',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  enableButton: {
    backgroundColor: '#FF8C00',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  enableButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  warningLocation: {
    color: '#FF8C00',
  },
  bannerIndicatorsBottom: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  // Notification styles
  notificationPanelOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  notificationBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  notificationPanel: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '80%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  notificationList: {
    maxHeight: 500,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  unreadNotification: {
    backgroundColor: '#F0F9F4',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  unreadNotificationText: {
    fontWeight: '600',
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#18853B',
    marginLeft: 8,
  },
  emptyNotifications: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
})

export default HomeScreen;