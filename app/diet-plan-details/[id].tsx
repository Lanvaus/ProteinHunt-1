import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import ApiService from '../../services/api-service';

// This is a simplification - in a real app you should use the full interfaces 
// as defined in api-service.ts
interface DietPlan {
  id: number;
  planName: string;
  nutritionistName: string;
  generalNotes: string;
  createdAt: string;
  dailyPlans: DailyPlan[];
  active: boolean;
}

interface DailyPlan {
  id: number;
  weekNumber: number;
  dayOfWeek: string;
  scheduledMeals: ScheduledMeal[];
}

interface ScheduledMeal {
  id: number;
  mealSlot: string;
  mealType: string;
  nutritionistNotes: string;
  standardMeal?: any;
  customizedMeal?: any;
  genericMeal?: any;
}

const DietPlanDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchPlanDetails(parseInt(id));
  }, [id]);

  const fetchPlanDetails = async (planId: number) => {
    setLoading(true);
    try {
      const response = await ApiService.getDietPlanById(planId);
      if (response.success && response.data) {
        setPlan(response.data);
        // Select the first day by default if available
        if (response.data.dailyPlans && response.data.dailyPlans.length > 0) {
          setSelectedDay(response.data.dailyPlans[0].dayOfWeek);
        }
      } else {
        setError('Failed to load diet plan details');
      }
    } catch (err) {
      console.error('Error fetching diet plan details:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMealName = (meal: ScheduledMeal): string => {
    if (meal.mealType === 'STANDARD' && meal.standardMeal) {
      return meal.standardMeal.name;
    } else if (meal.mealType === 'CUSTOM' && meal.customizedMeal) {
      return meal.customizedMeal.customizedMealName;
    } else if (meal.mealType === 'GENERIC' && meal.genericMeal) {
      return meal.genericMeal.name;
    }
    return 'Unknown Meal';
  };

  const getMealCalories = (meal: ScheduledMeal): number => {
    if (meal.mealType === 'STANDARD' && meal.standardMeal) {
      return meal.standardMeal.caloriesKcal;
    } else if (meal.mealType === 'CUSTOM' && meal.customizedMeal) {
      return meal.customizedMeal.totalCaloriesKcal;
    } else if (meal.mealType === 'GENERIC' && meal.genericMeal) {
      // Generic meals might not have calories info
      return 0;
    }
    return 0;
  };

  // Get the selected daily plan
  const selectedDailyPlan = plan?.dailyPlans.find(
    day => day.dayOfWeek === selectedDay
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
        <Text style={styles.headerTitle}>Diet Plan Details</Text>
        <View style={{width: 24}} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#18853B" />
          <Text style={styles.loadingText}>Loading diet plan...</Text>
        </View>
      ) : error || !plan ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>{error || 'Plan not found'}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => id && fetchPlanDetails(parseInt(id))}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.contentContainer}>
          {/* Plan header info */}
          <View style={styles.planHeader}>
            <View style={styles.planTitleSection}>
              <Text style={styles.planTitle}>{plan.planName}</Text>
              {plan.active && (
                <View style={styles.activeIndicator}>
                  <Text style={styles.activeText}>Active Plan</Text>
                </View>
              )}
            </View>
            <Text style={styles.planSubtitle}>Created by {plan.nutritionistName}</Text>
            <Text style={styles.planDate}>Created on {formatDate(plan.createdAt)}</Text>
          </View>
          
          {/* General Notes */}
          {plan.generalNotes && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>General Notes</Text>
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>{plan.generalNotes}</Text>
              </View>
            </View>
          )}
          
          {/* Day Selector */}
          <View style={styles.daysSelectorSection}>
            <Text style={styles.sectionTitle}>Daily Plans</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.daysScrollContainer}
            >
              {plan.dailyPlans.map((day) => (
                <TouchableOpacity
                  key={day.id}
                  style={[
                    styles.dayButton,
                    selectedDay === day.dayOfWeek && styles.selectedDayButton
                  ]}
                  onPress={() => setSelectedDay(day.dayOfWeek)}
                >
                  <Text 
                    style={[
                      styles.dayButtonText,
                      selectedDay === day.dayOfWeek && styles.selectedDayText
                    ]}
                  >
                    {day.dayOfWeek}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Selected Day Meals */}
          {selectedDailyPlan ? (
            <View style={styles.mealsSection}>
              {['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].map((mealSlot) => {
                const meals = selectedDailyPlan.scheduledMeals.filter(
                  meal => meal.mealSlot === mealSlot
                );
                
                if (meals.length === 0) return null;
                
                return (
                  <View key={mealSlot} style={styles.mealSlotSection}>
                    <Text style={styles.mealSlotTitle}>{mealSlot}</Text>
                    
                    {meals.map((meal) => (
                      <View key={meal.id} style={styles.mealCard}>
                        <View style={styles.mealInfo}>
                          <Text style={styles.mealName}>{getMealName(meal)}</Text>
                          <Text style={styles.mealCalories}>{getMealCalories(meal)} calories</Text>
                        </View>
                        
                        {meal.nutritionistNotes && (
                          <View style={styles.mealNotes}>
                            <Text style={styles.mealNotesTitle}>Notes:</Text>
                            <Text style={styles.mealNotesText}>{meal.nutritionistNotes}</Text>
                          </View>
                        )}
                        
                        {meal.mealType === 'STANDARD' && (
                          <TouchableOpacity 
                            style={styles.addToCartButton}
                            onPress={() => {
                              // Logic to add this meal to cart would go here
                              console.log('Add to cart:', meal.standardMeal.id);
                            }}
                          >
                            <Text style={styles.addToCartText}>Add to Cart</Text>
                            <Ionicons name="cart-outline" size={16} color="#FFF" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.noDaySelectedContainer}>
              <Text style={styles.noDaySelectedText}>
                Select a day to see your meal plan
              </Text>
            </View>
          )}
          
          {/* Bottom spacing */}
          <View style={{ height: 40 }} />
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
  contentContainer: {
    flex: 1,
  },
  planHeader: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  planTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginRight: 8,
  },
  activeIndicator: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  planSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  planDate: {
    fontSize: 13,
    color: '#999',
  },
  notesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  notesCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  daysSelectorSection: {
    padding: 16,
    paddingBottom: 8,
  },
  daysScrollContainer: {
    paddingBottom: 8,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  selectedDayButton: {
    backgroundColor: '#18853B',
    borderColor: '#18853B',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FFF',
    fontWeight: '600',
  },
  mealsSection: {
    padding: 16,
    paddingTop: 8,
  },
  mealSlotSection: {
    marginBottom: 16,
  },
  mealSlotTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  mealCard: {
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
  mealInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  mealCalories: {
    fontSize: 14,
    color: '#666',
  },
  mealNotes: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  mealNotesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  mealNotesText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  addToCartButton: {
    backgroundColor: '#18853B',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  noDaySelectedContainer: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDaySelectedText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default DietPlanDetailsScreen;
