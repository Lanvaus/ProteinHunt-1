import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import BottomTabNavigator from '../components/BottomTabNavigator';
import CustomMealService, { SavedCustomMeal } from '../services/custom-meal-service';

const SavedBowlsScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savedBowls, setSavedBowls] = useState<SavedCustomMeal[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Load saved bowls
  const fetchSavedBowls = async () => {
    setLoading(true);
    try {
      const data = await CustomMealService.getSavedCustomMeals();
      if (data) {
        setSavedBowls(data);
        setError(null);
      } else {
        setError('Failed to load saved bowls');
      }
    } catch (err) {
      console.error('Error loading saved bowls:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSavedBowls();
  }, []);
  
  // Handle adding a saved bowl to cart
  const handleAddToCart = async (bowl: SavedCustomMeal) => {
    try {
      const success = await CustomMealService.addCustomMealToCart({
        baseComponentId: bowl.baseComponentId,
        proteinOptionId: bowl.selectedProteinOptionIds[0],
        proteinOptionIds: bowl.selectedProteinOptionIds,
        addOnIds: bowl.selectedAddOnIds,
        totalCalories: bowl.totalCaloriesKcalSnapshot,
        totalPrice: bowl.totalPriceSnapshot
      });
      
      if (success) {
        Alert.alert(
          'Success',
          'Your saved bowl has been added to the cart!',
          [
            { text: 'Continue', style: 'cancel' },
            { text: 'Go to Cart', onPress: () => router.push('/cart') }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to add saved bowl to cart');
      }
    } catch (err) {
      console.error('Error adding saved bowl to cart:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };
  
  // Handle deleting a saved bowl
  const handleDeleteBowl = async (bowl: SavedCustomMeal) => {
    Alert.alert(
      'Delete Bowl',
      `Are you sure you want to delete "${bowl.customMealName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await CustomMealService.deleteSavedCustomMeal(bowl.id);
              if (success) {
                setSavedBowls(prev => prev.filter(b => b.id !== bowl.id));
              } else {
                Alert.alert('Error', 'Failed to delete saved bowl');
              }
            } catch (err) {
              console.error('Error deleting saved bowl:', err);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          }
        }
      ]
    );
  };
  
  // Render a saved bowl item
  const renderBowlItem = ({ item }: { item: SavedCustomMeal }) => {
    const date = new Date(item.createdAt).toLocaleDateString();
    const nutritionValues = item.totalNutritionValuesSnapshot;
    
    return (
      <View style={styles.bowlCard}>
        <View style={styles.bowlHeader}>
          <Text style={styles.bowlName}>{item.customMealName}</Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteBowl(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.bowlDetails}>
          <Text style={styles.bowlSection}>Base: {item.baseComponentNameSnapshot}</Text>
          
          <Text style={styles.bowlSection}>
            Protein: {item.selectedProteinOptionNamesSnapshot.join(', ')}
          </Text>
          
          {item.selectedAddOnNamesSnapshot.length > 0 && (
            <Text style={styles.bowlSection}>
              Add-ons: {item.selectedAddOnNamesSnapshot.join(', ')}
            </Text>
          )}
        </View>
        
        <View style={styles.bowlNutrition}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{item.totalCaloriesKcalSnapshot}</Text>
            <Text style={styles.nutritionLabel}>Calories</Text>
          </View>
          
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, styles.proteinValue]}>
              {nutritionValues?.Protein || 0}g
            </Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
          
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, styles.carbsValue]}>
              {nutritionValues?.Carbohydrates || 0}g
            </Text>
            <Text style={styles.nutritionLabel}>Carbs</Text>
          </View>
          
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, styles.fatValue]}>
              {nutritionValues?.Fats || 0}g
            </Text>
            <Text style={styles.nutritionLabel}>Fat</Text>
          </View>
        </View>
        
        <View style={styles.bowlActions}>
          <Text style={styles.bowlPrice}>₹{item.totalPriceSnapshot}</Text>
          
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.bowlDate}>Created on {date}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Bowls</Text>
        <TouchableOpacity onPress={() => router.push('/build-a-bowl')}>
          <Ionicons name="add" size={24} color="#18853B" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#18853B" />
          <Text style={styles.loaderText}>Loading saved bowls...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchSavedBowls}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : savedBowls.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>No saved bowls yet</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/build-a-bowl')}
          >
            <Text style={styles.createButtonText}>Create a Bowl</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedBowls}
          renderItem={renderBowlItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      {/* Bottom Tab Navigation */}
      <BottomTabNavigator activeTab="home" />
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
    fontWeight: 'bold',
    color: '#333',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 16,
  },
  createButton: {
    backgroundColor: '#18853B',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 16,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // To account for bottom navigation
  },
  bowlCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bowlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bowlName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  bowlDetails: {
    marginBottom: 12,
  },
  bowlSection: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bowlNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
    color: '#333',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
  },
  proteinValue: {
    color: '#4CAF50',
  },
  carbsValue: {
    color: '#FFC107',
  },
  fatValue: {
    color: '#F44336',
  },
  bowlActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bowlPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18853B',
  },
  addToCartButton: {
    backgroundColor: '#18853B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addToCartButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  bowlDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
});

export default SavedBowlsScreen;
