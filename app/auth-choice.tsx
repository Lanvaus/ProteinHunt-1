import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import ApiService from '../services/api-service';

const AuthChoiceScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleNext = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService.sendOtp(phoneNumber);
      
      if (response.success) {
        // Navigate to OTP verification screen with phone number as parameter
        router.push({
          pathname: '/verify-otp',
          params: { phoneNumber }
        });
      } else {
        Alert.alert('Error', response.error || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('./../assets/images/logo.png')}
          style={styles.logo}
        />
      </View>

      {/* Phone Number Input */}
      <View style={styles.phoneInputContainer}>
        <TextInput
          style={styles.phoneInput}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          editable={!isLoading}
        />
      </View>

      {/* Next Button */}
      <TouchableOpacity 
        style={[styles.nextButton, isLoading && styles.disabledButton]} 
        onPress={handleNext}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.nextButtonText}>Next</Text>
        )}
      </TouchableOpacity>

      {/* Divider with Or */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.orText}>Or</Text>
        <View style={styles.divider} />
      </View>

      {/* Social Buttons */}
      <TouchableOpacity style={styles.socialButton} onPress={() => { /* Handle Google */ }}>
        <Image
          source={require('./../assets/images/logo.png')}
          style={styles.socialIcon}
        />
        <Text style={styles.socialButtonText}>Continue with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialButton} onPress={() => { /* Handle Facebook */ }}>
        <Image
          source={require('./../assets/images/logo.png')}
          style={styles.socialIcon}
        />
        <Text style={styles.socialButtonText}>Continue with Facebook</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    marginTop: 80,
    alignItems: 'center',
    //  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  logoContainer: {
    marginTop: 40,
    marginBottom: 48,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    transform: [{ scale: 1.3 }],
  },
  phoneInputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#009944',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
  disabledButton: {
    opacity: 0.7,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  orText: {
    marginHorizontal: 12,
    color: '#777',
    fontSize: 16,
    fontWeight: '500',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 16,
  },
  socialIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
});

export default AuthChoiceScreen;
