import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const LOCATION_CACHE_KEY = 'user_location';

interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: number;
}

export enum LocationPermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  UNDETERMINED = 'undetermined'
}

class LocationService {
  // Cache duration in milliseconds (1 hour)
  static CACHE_DURATION = 60 * 60 * 1000;

  static async getPermissionStatus(): Promise<LocationPermissionStatus> {
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status === 'granted') return LocationPermissionStatus.GRANTED;
    if (status === 'denied') return LocationPermissionStatus.DENIED;
    return LocationPermissionStatus.UNDETERMINED;
  }

  static async requestPermissions(): Promise<LocationPermissionStatus> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status === 'granted') return LocationPermissionStatus.GRANTED;
    if (status === 'denied') return LocationPermissionStatus.DENIED;
    return LocationPermissionStatus.UNDETERMINED;
  }

  static async getCurrentLocation(): Promise<UserLocation | null> {
    try {
      const permissionStatus = await this.getPermissionStatus();
      
      if (permissionStatus !== LocationPermissionStatus.GRANTED) {
        throw new Error('Location permission not granted');
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const userLocation: UserLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
      };
      
      // Try to get the address
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        });
        
        if (address) {
          userLocation.address = this.formatAddress(address);
          await this.cacheLocation(userLocation);
        }
      } catch (error) {
        console.warn('Failed to get address:', error);
      }
      
      return userLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }
  
  static async getCachedLocation(): Promise<UserLocation | null> {
    try {
      const cachedLocationStr = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
      
      if (!cachedLocationStr) {
        return null;
      }
      
      const cachedLocation: UserLocation = JSON.parse(cachedLocationStr);
      
      // Check if the cached location is still valid
      if (Date.now() - cachedLocation.timestamp < this.CACHE_DURATION) {
        return cachedLocation;
      }
      
      return null;
    } catch (error) {
      console.error('Error reading cached location:', error);
      return null;
    }
  }
  
  static async cacheLocation(location: UserLocation): Promise<void> {
    try {
      await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location));
    } catch (error) {
      console.error('Error caching location:', error);
    }
  }
  
  static formatAddress(addressObj: Location.Address): string {
    const parts = [];
    
    if (addressObj.name) parts.push(addressObj.name);
    if (addressObj.street) parts.push(addressObj.street);
    if (addressObj.district) parts.push(addressObj.district);
    if (addressObj.city) parts.push(addressObj.city);
    
    const formattedAddress = parts.join(', ');
    return formattedAddress.length > 35 ? 
      formattedAddress.substring(0, 32) + '...' : 
      formattedAddress;
  }
}

export default LocationService;
