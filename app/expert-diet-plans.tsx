import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const ExpertDietPlansScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  
  const handleNotifyMe = () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email to be notified.');
      return;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    // Here you would normally send this to your backend
    Alert.alert(
      'Thank You!', 
      'We will notify you when expert diet plans become available.',
      [{ text: 'OK', onPress: () => setEmail('') }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expert Diet Plans</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.comingSoonContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="restaurant-outline" size={80} color="#18853B" />
          </View>
          
          <Text style={styles.comingSoonTitle}>Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            Our team of nutritionists is working hard to create expert diet plans 
            tailored to various health goals and dietary preferences.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.notifyText}>
            Be the first to know when our expert diet plans are available:
          </Text>
          
          <View style={styles.emailContainer}>
            <TextInput
              style={styles.emailInput}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TouchableOpacity 
              style={styles.notifyButton}
              onPress={handleNotifyMe}
            >
              <Text style={styles.notifyButtonText}>Notify Me</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>What to expect:</Text>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#18853B" />
              <Text style={styles.featureText}>
                Personalized meal plans based on your goals
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#18853B" />
              <Text style={styles.featureText}>
                Nutritionist-approved recipes and ingredient lists
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#18853B" />
              <Text style={styles.featureText}>
                Calorie and macro-nutrient optimized options
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#18853B" />
              <Text style={styles.featureText}>
                Dietary preference options (veg, non-veg, vegan, etc.)
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  comingSoonContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F9F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#18853B',
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    width: '100%',
    marginBottom: 24,
  },
  notifyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  emailContainer: {
    width: '100%',
    marginBottom: 24,
  },
  emailInput: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  notifyButton: {
    backgroundColor: '#18853B',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  notifyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  featuresContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#555',
    marginLeft: 10,
    flex: 1,
  },
});

export default ExpertDietPlansScreen;
