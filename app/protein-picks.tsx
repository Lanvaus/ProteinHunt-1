import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
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
import { useCart } from '../context/CartContext';
import ApiService from '../services/api-service';

// Define interface for meal data
interface Meal {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  servingWeightGrams: number;
  caloriesKcal: number;
  nutritionValues: {
    [key: string]: number;
  };
  price: number;
  mealType: string;
  mealCategory: {
    id: number;
    name: string;
    imageUrl: string;
  };
  vegetarian: boolean;
}

const ProteinPicksScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialMealType = params.mealType as string;
  const screenTitle = params.title as string || 'Protein Picks';
  
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const { cart, loading: cartLoading, addToCart, updateQuantity, getItemQuantity } = useCart();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter mappings
  const filterMapping: Record<string, string | null> = {
    'All': initialMealType || null, // Default to initial meal type for "All"
    'Low Fat': 'PROTEIN_PICK',
    'High Protein': 'POWER_COMBO',
    'Breakfast': initialMealType || null, // Default to initial meal type for "Breakfast"
  };

  // Fetch meals on component mount with initial meal type
  useEffect(() => {
    fetchMeals(initialMealType ? 'All' : undefined);
  }, [initialMealType]);

  // Fetch meals with optional filtering
  const fetchMeals = async (filterType?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // If we have an initial meal type and are using the "All" filter,
      // we still want to filter by the initial meal type
      let mealTypeToUse = filterType ? filterMapping[filterType] : null;
      
      // If no specific filter but we have an initial meal type, use that
      if (!mealTypeToUse && initialMealType) {
        mealTypeToUse = initialMealType;
      }
      
      const response = await ApiService.getMeals(mealTypeToUse || undefined);
      
      if (response.success && response.data) {
        setMeals(response.data);
      } else {
        setError(response.error || 'Failed to fetch meals');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error fetching meals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    fetchMeals(filter);
  };

  // Handle adding meal to cart
  const handleAddToCart = async (meal: Meal) => {
    const currentQuantity = getItemQuantity(meal.id);
    
    if (currentQuantity > 0) {
      // Find the cart item to update
      const cartItem = cart?.items.find(item => item.mealId === meal.id);
      if (cartItem) {
        await updateQuantity(cartItem.cartItemId, cartItem.quantity + 1);
      }
    } else {
      // Add new item
      await addToCart(meal.id, 1);
    }
  };

  // Handle opening meal details modal
  const handleOpenMealModal = (meal: Meal) => {
    setSelectedMeal(meal);
    setModalVisible(true);
  };

  // Filter meals based on search query (client-side filtering)
  const filteredMeals = searchQuery 
    ? meals.filter(meal => 
        meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : meals;

  // Render meal item
  const renderMealItem = ({ item }: { item: Meal }) => {
    // Extract protein, carbs, and fat from nutritionValues with correct key names
    const protein = item.nutritionValues?.['Protein'] || 0;
    const carbs = item.nutritionValues?.['Carbohydrates'] || 0;
    const fat = item.nutritionValues?.['Fats'] || 0;
    const itemQuantity = getItemQuantity(item.id);
    
    return (
      <View style={styles.productCard}>
        <TouchableOpacity 
          style={styles.productCardInner}
          onPress={() => handleOpenMealModal(item)}
        >
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.productImage}
            // defaultSource={require('../assets/images/placeholder.png')}
            onError={(e) => console.log('Image failed to load:', e.nativeEvent.error)}
          />
          <View style={styles.productDetails}>
            <View style={styles.productHeader}>
              <Text style={styles.productName}>{item.name}</Text>
              {item.vegetarian && (
                <View style={styles.vegBadge}>
                  <Text style={styles.vegBadgeText}>VEG</Text>
                </View>
              )}
            </View>
            <Text style={styles.productPrice}>₹ {item.price}</Text>

            <View style={styles.nutritionInfo}>
              <View style={styles.nutritionItem}>
                <View style={styles.nutritionBarContainer}>
                  <View 
                    style={[
                      styles.nutritionBar, 
                      styles.proteinBar,
                      { height: `${Math.min(100, (protein / 30) * 100)}%` }
                    ]} 
                  />
                </View>
                <View style={styles.nutritionTextContainer}>
                  <Text style={styles.nutritionValue}>{protein}g</Text>
                  <Text style={[styles.nutritionLabel, styles.proteinLabel]}>Protein</Text>
                </View>
              </View>
              <View style={styles.nutritionItem}>
                <View style={styles.nutritionBarContainer}>
                  <View 
                    style={[
                      styles.nutritionBar, 
                      styles.carbsBar,
                      { height: `${Math.min(100, (carbs / 30) * 100)}%` }
                    ]} 
                  />
                </View>
                <View style={styles.nutritionTextContainer}>
                  <Text style={styles.nutritionValue}>{carbs}g</Text>
                  <Text style={[styles.nutritionLabel, styles.carbsLabel]}>Carbs</Text>
                </View>
              </View>
              <View style={styles.nutritionItem}>
                <View style={styles.nutritionBarContainer}>
                  <View 
                    style={[
                      styles.nutritionBar, 
                      styles.fatBar,
                      { height: `${Math.min(100, (fat / 20) * 100)}%` }
                    ]} 
                  />
                </View>
                <View style={styles.nutritionTextContainer}>
                  <Text style={styles.nutritionValue}>{fat}g</Text>
                  <Text style={[styles.nutritionLabel, styles.fatLabel]}>Fat</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        
        <View style={styles.buttonContainer}>
          {itemQuantity > 0 ? (
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={async () => {
                  const cartItem = cart?.items.find(cartItem => cartItem.mealId === item.id);
                  if (cartItem) {
                    if (cartItem.quantity > 1) {
                      await updateQuantity(cartItem.cartItemId, cartItem.quantity - 1);
                    } else {
                      // Show confirmation before removing last item
                      Alert.alert(
                        'Remove Item',
                        `Remove ${item.name} from your cart?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Remove', 
                            style: 'destructive',
                            onPress: async () => {
                              const cartItem = cart?.items.find(ci => ci.mealId === item.id);
                              if (cartItem) {
                                await ApiService.removeFromCart(cartItem.cartItemId);
                              }
                            }
                          }
                        ]
                      );
                    }
                  }
                }}
              >
                <Ionicons name="remove" size={16} color="white" />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{itemQuantity}</Text>
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={async () => {
                  const cartItem = cart?.items.find(cartItem => cartItem.mealId === item.id);
                  if (cartItem) {
                    await updateQuantity(cartItem.cartItemId, cartItem.quantity + 1);
                  }
                }}
              >
                <Ionicons name="add" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const filters = ['All', 'Low Fat', 'High Protein', 'Breakfast'];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F5F5F5', '#E8F5E9']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <View style={{width: 24}} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for Protein Products"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={[styles.filtersContainer, { marginBottom: 28 }]}
          contentContainerStyle={[styles.filtersContent, { paddingBottom: 12 }]}
        >
          {filters.map((filter) => (
            <TouchableOpacity 
              key={filter} 
              style={[
                styles.filterTab,
                activeFilter === filter && styles.activeFilterTab
              ]}
              onPress={() => handleFilterChange(filter)}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter && styles.activeFilterText
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Loading, Error, or Content */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#18853B" />
          <Text style={styles.loaderText}>Loading meals...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchMeals(filterMapping[activeFilter] || undefined)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredMeals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="nutrition-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No meals match your search' : 'No meals available'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMeals}
          renderItem={renderMealItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.productList}
        />
      )}

      {/* Cart Summary Bar */}
      {cart && cart.totalItems > 0 && (
        <TouchableOpacity 
          style={styles.cartBar}
          onPress={() => router.push('/cart')}
        >
          <Text style={styles.cartItemsCount}>{cart.totalItems} Item{cart.totalItems > 1 ? 's' : ''} added</Text>
          <View style={styles.cartAction}>
            <Text style={styles.cartActionText}>Go to Cart</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </View>
        </TouchableOpacity>
      )}

      {/* Meal Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close-circle" size={28} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>
              {selectedMeal?.name}
            </Text>
            
            <Image 
              source={selectedMeal?.imageUrl ? { uri: selectedMeal.imageUrl } : null}
              style={styles.modalImage}
              // defaultSource={require('../assets/images/placeholder.png')}
            />
            
            {selectedMeal?.vegetarian && (
              <View style={styles.vegBadgeModal}>
                <Text style={styles.vegBadgeText}>Vegetarian</Text>
              </View>
            )}
            
            <Text style={styles.modalDescription}>
              {selectedMeal?.description}
            </Text>
            
            <View style={styles.nutritionInfoModal}>
              <View style={styles.nutritionItemModal}>
                <Text style={styles.nutritionLabelModal}>Calories</Text>
                <Text style={styles.nutritionValueModal}>{selectedMeal?.caloriesKcal} kcal</Text>
              </View>
              <View style={styles.nutritionItemModal}>
                <Text style={styles.nutritionLabelModal}>Protein</Text>
                <Text style={styles.nutritionValueModal}>{selectedMeal?.nutritionValues?.Protein || 0}g</Text>
              </View>
              <View style={styles.nutritionItemModal}>
                <Text style={styles.nutritionLabelModal}>Carbs</Text>
                <Text style={styles.nutritionValueModal}>{selectedMeal?.nutritionValues?.Carbohydrates || 0}g</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.modalAddButton}
              onPress={() => {
                if (selectedMeal) handleAddToCart(selectedMeal);
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalAddButtonText}>ADD TO CART · ₹{selectedMeal?.price}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Reset marginTop to avoid overlap with status bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  filtersWrapper: {
    backgroundColor: 'transparent',
    zIndex: 10,
    elevation: 10,
  },
  filtersContainer: {
    marginVertical: 8,
  },
  filtersContent: {
    paddingHorizontal: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#E5FFF4',
  },
  filterText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#18853B',
    fontWeight: '600',
  },
  productList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  productCardInner: {
    flexDirection: 'row',
    padding: 16,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  productDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
    color: '#333',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 12,
  },
  nutritionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginRight: 10,
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  nutritionBarContainer: {
    height: 40,
    width: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    justifyContent: 'flex-end',
    marginRight: 8,
  },
  nutritionBar: {
    width: 6,
    height: '80%', // This will be dynamically calculated in a real app
    borderRadius: 3,
  },
  nutritionTextContainer: {
    justifyContent: 'center',
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  nutritionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  proteinLabel: {
    color: '#4CAF50',
  },
  carbsLabel: {
    color: '#FFC107',
  },
  fatLabel: {
    color: '#F44336',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  addButton: {
    backgroundColor: '#01893F',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  cartBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#18853B',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#18853B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  cartItemsCount: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  cartAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartActionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
    color: '#333',
  },
  modalImage: {
    width: '80%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
  modalAddButton: {
    backgroundColor: '#01893F',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 12,
    marginTop: 10,
  },
  modalAddButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
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
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  vegBadge: {
    backgroundColor: '#E5FFF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vegBadgeText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  vegBadgeModal: {
    backgroundColor: '#E5FFF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 16,
  },
  nutritionInfoModal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
    paddingVertical: 16,
  },
  nutritionItemModal: {
    alignItems: 'center',
  },
  nutritionLabelModal: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  nutritionValueModal: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#01893F',
    borderRadius: 6,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    paddingHorizontal: 8,
  },
});

export default ProteinPicksScreen;
