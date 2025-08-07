import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import LocationService from '../services/location-service';

interface Kitchen {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  deliveryRadiusKm: number;
  address: string;
}

const DeliveryZonesScreen = () => {
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [kitchens, setKitchens] = useState<Kitchen[]>([
    {
      id: 1,
      name: 'Downtown Kitchen',
      latitude: 17.4478,
      longitude: 78.3489,
      deliveryRadiusKm: 5,
      address: "123 Main Street, Downtown"
    },
    {
      id: 2,
      name: 'Hitech City Kitchen',
      latitude: 17.4427,
      longitude: 78.3794,
      deliveryRadiusKm: 6,
      address: "456 Tech Park Road, Hitech City"
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [nearbyKitchens, setNearbyKitchens] = useState<Kitchen[]>([]);

  useEffect(() => {
    const getUserLocation = async () => {
      setLoading(true);
      try {
        const location = await LocationService.getCurrentLocation();
        if (location) {
          setCurrentLocation({
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address,
          });
          
          // Calculate distances and find nearby kitchens
          // In a real app, this would be a server call
          const nearby = kitchens.filter(kitchen => {
            const distance = calculateDistance(
              location.latitude, 
              location.longitude, 
              kitchen.latitude, 
              kitchen.longitude
            );
            return distance <= kitchen.deliveryRadiusKm;
          });
          
          setNearbyKitchens(nearby);
        }
      } catch (error) {
        console.error('Error getting location', error);
      } finally {
        setLoading(false);
      }
    };

    getUserLocation();
  }, []);

  // Simple function to calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };
  
  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Zones</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#18853B" />
          <Text style={styles.loadingText}>Checking nearby delivery zones...</Text>
        </View>
      ) : (
        <ScrollView style={styles.contentContainer}>
          {/* Current location */}
          <View style={styles.locationContainer}>
            <Text style={styles.sectionTitle}>Your Location</Text>
            <View style={styles.locationCard}>
              <Ionicons name="location" size={24} color="#18853B" />
              <Text style={styles.locationText}>
                {currentLocation?.address || "Unknown location"}
              </Text>
            </View>
          </View>

          {/* Nearby kitchens */}
          <View style={styles.kitchensContainer}>
            <Text style={styles.sectionTitle}>Nearby Delivery Kitchens</Text>
            
            {nearbyKitchens.length === 0 ? (
              <View style={styles.noKitchenContainer}>
                <Ionicons name="restaurant-outline" size={48} color="#CCC" />
                <Text style={styles.noKitchenText}>
                  No delivery kitchens available in your area yet
                </Text>
              </View>
            ) : (
              nearbyKitchens.map(kitchen => (
                <View key={kitchen.id} style={styles.kitchenCard}>
                  <View style={styles.kitchenHeader}>
                    <View style={styles.kitchenIcon}>
                      <Ionicons name="restaurant" size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.kitchenInfo}>
                      <Text style={styles.kitchenName}>{kitchen.name}</Text>
                      <Text style={styles.kitchenAddress}>{kitchen.address}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.deliveryInfo}>
                    <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                    <Text style={styles.deliveryText}>
                      Delivers to your location
                    </Text>
                  </View>
                  
                  <TouchableOpacity style={styles.orderButton} onPress={() => router.push('/home')}>
                    <Text style={styles.orderButtonText}>Order from this Kitchen</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
          
          {/* Note about delivery */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={24} color="#18853B" />
              <Text style={styles.infoText}>
                Our kitchens deliver within a {kitchens[0]?.deliveryRadiusKm} km radius to ensure 
                your food arrives fresh and on time!
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  contentContainer: {
    flex: 1,
  },
  locationContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  kitchensContainer: {
    padding: 16,
    paddingTop: 0,
  },
  noKitchenContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  noKitchenText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  kitchenCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  kitchenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  kitchenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  kitchenInfo: {
    flex: 1,
  },
  kitchenName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  kitchenAddress: {
    fontSize: 14,
    color: '#666',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  deliveryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  orderButton: {
    backgroundColor: '#18853B',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  orderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  infoSection: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E7FFE8',
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default DeliveryZonesScreen;
