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
    TouchableOpacity,
    View
} from 'react-native';

const DietPlansScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('diet');
  
  const handleUploadDietChart = async () => {
    try {
      
        router.push('/consultation-upload');
      
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const navigateToExpertPlans = () => {
    router.push('/expert-diet-plans');
  };

  const navigateToCustomize = () => {
    router.push('/build-a-bowl');
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'consultants') {
      router.push('/consultations');
    }
    else if (tab === 'support') {
      router.push('/support');
    }
    else {
      router.push('/diet-plans');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diet Plans</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.titleText}>Choose your Diet Plan</Text>
        <Text style={styles.subtitleText}>Select the option that suits you best</Text>
        
        {/* Upload Diet Chart Option */}
        <View style={styles.optionCard}>
          <View style={styles.cardContent}>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>Upload your Diet Chart</Text>
              <Text style={styles.cardDescription}>
                We will prepare meals according to your existing diet plan
              </Text>
              
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleUploadDietChart}
              >
                <Text style={styles.actionButtonText}>Upload Chart</Text>
              </TouchableOpacity>
              
              <Text style={styles.supportedFormatsText}>
                Supported formats PDF, JPG, PNG
              </Text>
            </View>
            
            <View style={styles.iconContainer}>
              <Ionicons name="cloud-upload-outline" size={24} color="#18853B" />
            </View>
          </View>
        </View>
        
        {/* Choose from Us Option */}
        <View style={styles.optionCard}>
          <View style={styles.cardContent}>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>Choose from Us</Text>
              <Text style={styles.cardDescription}>
                Select from our expert-crafted diet plans
              </Text>
              
              <View style={styles.badgeContainer}>
                <View style={styles.nutritionistBadge}>
                  <Text style={styles.nutritionistBadgeText}>Nutritionist Approved</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={navigateToExpertPlans}
              >
                <Text style={styles.actionButtonText}>View Plans</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.iconContainer}>
              <Ionicons name="restaurant-outline" size={24} color="#18853B" />
            </View>
          </View>
        </View>
        
        {/* Customize Option */}
        <View style={styles.optionCard}>
          <View style={styles.cardContent}>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>Customize your meals</Text>
              <Text style={styles.cardDescription}>
                Build your perfect meal plan from scratch
              </Text>
              
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={navigateToCustomize}
              >
                <Text style={styles.actionButtonText}>Start Customizing</Text>
              </TouchableOpacity>
              
              <Text style={styles.ingredientsText}>
                100+ ingredients to choose from
              </Text>
            </View>
            
            <View style={styles.iconContainer}>
              <Ionicons name="nutrition-outline" size={24} color="#18853B" />
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Navigation Tabs - Now positioned at bottom */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[styles.navTab, activeTab === 'diet' && styles.activeNavTab]} 
          onPress={() => handleTabPress('diet')}
        >
          <Ionicons 
            name="nutrition-outline" 
            size={22} 
            color={activeTab === 'diet' ? "#18853B" : "#666"} 
          />
          <Text style={[styles.navTabText, activeTab === 'diet' && styles.activeNavTabText]}>
            Diet Plans
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navTab, activeTab === 'consultants' && styles.activeNavTab]} 
          onPress={() => handleTabPress('consultants')}
        >
          <Ionicons 
            name="person-outline" 
            size={22} 
            color={activeTab === 'consultants' ? "#18853B" : "#666"} 
          />
          <Text style={[styles.navTabText, activeTab === 'consultants' && styles.activeNavTabText]}>
            Consultants
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navTab, activeTab === 'support' && styles.activeNavTab]} 
          onPress={() => handleTabPress('support')}
        >
          <Ionicons 
            name="chatbubble-ellipses-outline" 
            size={22} 
            color={activeTab === 'support' ? "#18853B" : "#666"} 
          />
          <Text style={[styles.navTabText, activeTab === 'support' && styles.activeNavTabText]}>
            Get Support
          </Text>
        </TouchableOpacity>
      </View>
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
    padding: 12,
  },
  contentContainer: {
    paddingBottom: 70, // Add padding to bottom to ensure content isn't hidden behind nav
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
    marginTop: 6,
  },
  subtitleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 18,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#18853B',
    borderStyle: 'dashed',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTextContent: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  actionButton: {
    backgroundColor: '#18853B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: '100%',
    marginBottom: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  supportedFormatsText: {
    fontSize: 11,
    color: '#999',
  },
  ingredientsText: {
    fontSize: 11,
    color: '#999',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    marginBottom: 12,
  },
  nutritionistBadge: {
    backgroundColor: '#F0F9F4',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  nutritionistBadgeText: {
    color: '#18853B',
    fontSize: 11,
    fontWeight: '600',
  },
  // Updated navigation styles for sticky bottom positioning
  navigationContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavTab: {
    backgroundColor: '#F0F9F4',
  },
  navTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginTop: 4,
  },
  activeNavTabText: {
    color: '#18853B',
    fontWeight: '700',
  },
});

export default DietPlansScreen;
