import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api-service';

const COUNTDOWN_SECONDS = 30;

const VerifyOTP = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(COUNTDOWN_SECONDS);
  const [resendActive, setResendActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const { login } = useAuth();

  // Handle timer for resend code
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setResendActive(true);
    }
  }, [timer]);

  // Handle OTP input change
  const handleOtpChange = (value: string, index: number) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if current input is filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle resend code
  const handleResend = async () => {
    if (!resendActive) return;
    
    setResendActive(false);
    setIsLoading(true);
    
    try {
      const response = await ApiService.sendOtp(phoneNumber);
      
      if (response.success) {
        // Reset timer and OTP
        setTimer(COUNTDOWN_SECONDS);
        setOtp(['', '', '', '', '', '']);
        Alert.alert('Success', 'OTP resent successfully');
      } else {
        Alert.alert('Error', response.error || 'Failed to resend OTP');
        setResendActive(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setResendActive(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Format timer to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirm = async () => {
    if (otp.some(digit => !digit)) {
      Alert.alert('Error', 'Please enter all 6 digits of the OTP');
      return;
    }
    
    const otpString = otp.join('');
    setIsLoading(true);
    
    try {
      const response = await ApiService.verifyOtp(phoneNumber, otpString);
      
      if (response.success && response.data) {
        // Handle successful verification
        const { jwtResponse } = response.data;
        
        if (jwtResponse && jwtResponse.token) {
          // Use the auth context to login
          await login(jwtResponse.token, {
            id: jwtResponse.id,
            firstName: jwtResponse.firstName,
            lastName: jwtResponse.lastName,
            email: jwtResponse.email,
            roles: jwtResponse.roles
          });
          
          // Navigate to home screen
          router.replace('/home');
        } else {
          Alert.alert('Error', 'Authentication token not received');
        }
      } else {
        Alert.alert('Error', response.error || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify OTP</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.description}>
          Enter your OTP which has been sent to your phone and completely verify your account.
        </Text>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              editable={!isLoading}
            />
          ))}
        </View>

        <Text style={styles.sentInfo}>
          A code has been sent to {phoneNumber ? phoneNumber : 'your phone'}
        </Text>
        
        <TouchableOpacity onPress={handleResend} disabled={!resendActive || isLoading}>
          <Text style={[
            styles.resendText, 
            (!resendActive || isLoading) && styles.resendInactive
          ]}>
            {isLoading && resendActive ? 'Resending...' : 
             !resendActive ? `Resend in ${formatTime(timer)}` : 'Resend'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.confirmButton, isLoading && styles.disabledButton]} 
          onPress={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#009944',
    paddingTop: 60,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginRight: 30,
  },
  content: {
    padding: 24,
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 40,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 40,
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
    fontSize: 24,
    fontWeight: '500',
  },
  sentInfo: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
  },
  resendText: {
    textAlign: 'center',
    color: '#009944',
    fontWeight: '500',
    marginBottom: 40,
  },
  resendInactive: {
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#009944',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default VerifyOTP;
