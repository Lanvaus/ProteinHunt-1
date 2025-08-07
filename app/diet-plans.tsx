import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ApiService from '../services/api-service';

interface DietPlan {
  id: number;
  planName: string;
  nutritionistName: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

const DietPlansScreen = () => {
  const router = useRouter();
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [activePlan, setActivePlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDietPlans();
  }, []);

  const fetchDietPlans = async () => {
    setLoading(true);
    try {
      // Get all plans
      const allPlansResponse = await ApiService.getAllDietPlans();
      if (allPlansResponse.success && allPlansResponse.data) {
        setPlans(allPlansResponse.data);
      }

      // Get active plan
      const activePlanResponse = await ApiService.getActiveDietPlan();
      if (activePlanResponse.success && activePlanResponse.data) {
        setActivePlan(activePlanResponse.data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching diet plans:', err);
      setError('Failed to load diet plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToPlanDetails = (planId: number) => {
    router.push(`/diet-plan-details/${planId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderPlanItem = ({ item }: { item: DietPlan }) => (
    <TouchableOpacity 
      style={[
        styles.planCard,
        item.active && styles.activePlanCard
      ]}
      onPress={() => navigateToPlanDetails(item.id)}
    >
      <View style={styles.planCardContent}>
        <View style={styles.planCardHeader}>
          <Text style={styles.planName}>{item.planName}</Text>
          {item.active && (
            <View style={styles.activeIndicator}>
              <Text style={styles.activeText}>Active</Text>
            </View>
          )}
        </View>
        
        <View style={styles.planCardDetails}>
          <Text style={styles.nutritionistName}>By {item.nutritionistName}</Text>
          <Text style={styles.dateText}>Created: {formatDate(item.createdAt)}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diet Plans</Text>
        <View style={{width: 24}} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#18853B" />
          <Text style={styles.loadingText}>Loading diet plans...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchDietPlans}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : plans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>You don't have any diet plans yet</Text>
          <TouchableOpacity 
            style={styles.consultButton}
            onPress={() => router.push('/consultation-upload')}
          >
            <Text style={styles.consultButtonText}>Book a Consultation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Active Plan Section (if exists) */}
          {activePlan && (
            <View style={styles.activePlanSection}>
              <Text style={styles.sectionTitle}>Your Active Plan</Text>
              <TouchableOpacity 
                style={styles.activePlanBanner}
                onPress={() => navigateToPlanDetails(activePlan.id)}
              >
                <View style={styles.activePlanContent}>
                  <Text style={styles.activePlanName}>{activePlan.planName}</Text>
                  <Text style={styles.activePlanSubtitle}>
                    Created by {activePlan.nutritionistName}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#18853B" />
              </TouchableOpacity>
            </View>
          )}

          {/* All Plans List */}
          <View style={styles.plansListSection}>
            <Text style={styles.sectionTitle}>All Diet Plans</Text>
            <FlatList
              data={plans}
              renderItem={renderPlanItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.plansList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#18853B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 16,
  },
  consultButton: {
    backgroundColor: '#18853B',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 16,
  },
  consultButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  activePlanSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  activePlanBanner: {
    backgroundColor: '#E7FFE8',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  activePlanContent: {
    flex: 1,
  },
  activePlanName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  activePlanSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  plansListSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  plansList: {
    paddingBottom: 20,
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  activePlanCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  planCardContent: {
    flex: 1,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  activeIndicator: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  planCardDetails: {
    flexDirection: 'column',
  },
  nutritionistName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
});

export default DietPlansScreen;
