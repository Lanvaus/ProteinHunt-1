import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
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
import BottomTabNavigator from '../components/BottomTabNavigator';
import CustomMealService, {
    CustomMealOptions,
    CustomizationOption,
    SaveCustomMealRequest
} from '../services/custom-meal-service';

// Component to render a section of options (bases, proteins, add-ons)
const OptionSection = ({ 
  title, 
  options, 
  selectedIds, 
  onSelect, 
  multiSelect = false
}: { 
  title: string;
  options: CustomizationOption[];
  selectedIds: number[];
  onSelect: (id: number) => void;
  multiSelect?: boolean;
}) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.optionsContainer}
    >
      {options.map(option => {
        const isSelected = selectedIds.includes(option.id);
        
        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              isSelected && styles.selectedOptionCard
            ]}
            onPress={() => onSelect(option.id)}
          >
            {option.imageUrl ? (
              <Image
                source={{ uri: option.imageUrl }}
                style={styles.optionImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="restaurant" size={32} color="#CCC" />
              </View>
            )}
            
            <View style={styles.optionDetails}>
              <Text style={styles.optionName} numberOfLines={1}>{option.name}</Text>
              <Text style={styles.optionPrice}>₹{option.price}</Text>
              
              <View style={styles.optionMacros}>
                <Text style={[styles.macroText, styles.proteinText]}>
                  {option.nutritionValues?.Protein || 0}g P
                </Text>
                <Text style={[styles.macroText, styles.carbsText]}>
                  {option.nutritionValues?.Carbohydrates || 0}g C
                </Text>
                <Text style={[styles.macroText, styles.fatText]}>
                  {option.nutritionValues?.Fats || 0}g F
                </Text>
              </View>
            </View>
            
            {option.vegetarian && (
              <View style={styles.vegBadge}>
                <Text style={styles.vegBadgeText}>VEG</Text>
              </View>
            )}
            
            {isSelected && (
              <View style={styles.selectedCheckmark}>
                <Ionicons name="checkmark-circle" size={24} color="#18853B" />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const BuildABowlScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<CustomMealOptions | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Selection state
  const [selectedBase, setSelectedBase] = useState<number | null>(null);
  const [selectedProteins, setSelectedProteins] = useState<number[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<number[]>([]);
  const [bowlName, setBowlName] = useState('');
  
  // Nutrition summary
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFat, setTotalFat] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Loading options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const data = await CustomMealService.getCustomMealOptions();
        if (data) {
          setOptions(data);
          setError(null);
        } else {
          setError('Failed to load customization options');
        }
      } catch (err) {
        console.error('Error loading options:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    loadOptions();
  }, []);
  
  // Calculate nutrition and price when selections change
  useEffect(() => {
    if (!options) return;
    
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let price = 0;
    
    // Add base
    if (selectedBase) {
      const baseOption = options.bases.find(b => b.id === selectedBase);
      if (baseOption) {
        calories += baseOption.caloriesKcal || 0;
        protein += baseOption.nutritionValues?.Protein || 0;
        carbs += baseOption.nutritionValues?.Carbohydrates || 0;
        fat += baseOption.nutritionValues?.Fats || 0;
        price += baseOption.price;
      }
    }
    
    // Add proteins
    selectedProteins.forEach(proteinId => {
      const proteinOption = options.proteinOptions.find(p => p.id === proteinId);
      if (proteinOption) {
        calories += proteinOption.caloriesKcal || 0;
        protein += proteinOption.nutritionValues?.Protein || 0;
        carbs += proteinOption.nutritionValues?.Carbohydrates || 0;
        fat += proteinOption.nutritionValues?.Fats || 0;
        price += proteinOption.price;
      }
    });
    
    // Add add-ons
    selectedAddOns.forEach(addOnId => {
      const addOnOption = options.addOns.find(a => a.id === addOnId);
      if (addOnOption) {
        calories += addOnOption.caloriesKcal || 0;
        protein += addOnOption.nutritionValues?.Protein || 0;
        carbs += addOnOption.nutritionValues?.Carbohydrates || 0;
        fat += addOnOption.nutritionValues?.Fats || 0;
        price += addOnOption.price;
      }
    });
    
    setTotalCalories(calories);
    setTotalProtein(protein);
    setTotalCarbs(carbs);
    setTotalFat(fat);
    setTotalPrice(price);
  }, [options, selectedBase, selectedProteins, selectedAddOns]);
  
  // Handle base selection
  const handleBaseSelect = (id: number) => {
    setSelectedBase(selectedBase === id ? null : id);
  };
  
  // Handle protein selection
  const handleProteinSelect = (id: number) => {
    setSelectedProteins(prev => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Handle add-on selection
  const handleAddOnSelect = (id: number) => {
    setSelectedAddOns(prev => {
      if (prev.includes(id)) {
        return prev.filter(a => a !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Add to cart
  const handleAddToCart = async () => {
    if (!selectedBase) {
      Alert.alert('Selection Required', 'Please select a base for your bowl');
      return;
    }
    
    if (selectedProteins.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one protein');
      return;
    }
    
    try {
      const success = await CustomMealService.addCustomMealToCart({
        baseComponentId: selectedBase,
        proteinOptionId: selectedProteins[0], // For backward compatibility
        proteinOptionIds: selectedProteins,
        addOnIds: selectedAddOns,
        totalCalories,
        totalPrice
      });
      
      if (success) {
        Alert.alert(
          'Success',
          'Your custom bowl has been added to the cart!',
          [
            { text: 'Continue Customizing', style: 'cancel' },
            { text: 'Go to Cart', onPress: () => router.push('/cart') }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to add custom bowl to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };
  
  // Save custom bowl
  const handleSaveBowl = async () => {
    if (!selectedBase) {
      Alert.alert('Selection Required', 'Please select a base for your bowl');
      return;
    }
    
    if (selectedProteins.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one protein');
      return;
    }
    
    if (!bowlName.trim()) {
      Alert.alert('Name Required', 'Please name your custom bowl');
      return;
    }
    
    try {
      const request: SaveCustomMealRequest = {
        customMealName: bowlName,
        baseComponentId: selectedBase,
        proteinOptionIds: selectedProteins,
        addOnIds: selectedAddOns
      };
      
      const savedMeal = await CustomMealService.saveCustomMeal(request);
      
      if (savedMeal) {
        Alert.alert(
          'Success',
          'Your custom bowl has been saved!',
          [
            { text: 'OK', style: 'default' },
            { text: 'View Saved Bowls', onPress: () => router.push('/saved-bowls') }
          ]
        );
        
        // Clear bowl name after saving
        setBowlName('');
      } else {
        Alert.alert('Error', 'Failed to save custom bowl');
      }
    } catch (err) {
      console.error('Error saving bowl:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };
  
  // View saved bowls
  const handleViewSavedBowls = () => {
    router.push('/saved-bowls');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Build a Bowl</Text>
        <TouchableOpacity onPress={handleViewSavedBowls}>
          <Ionicons name="bookmark" size={24} color="#18853B" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#18853B" />
          <Text style={styles.loaderText}>Loading options...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => CustomMealService.getCustomMealOptions()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : options ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Instructions */}
          <View style={styles.instructionCard}>
            <Ionicons name="information-circle-outline" size={24} color="#18853B" style={styles.instructionIcon} />
            <Text style={styles.instructionText}>
              Create your perfect meal! Choose a base, at least one protein, and add optional toppings.
            </Text>
          </View>
          
          {/* Base Options */}
          <OptionSection
            title="Choose Your Base"
            options={options.bases}
            selectedIds={selectedBase ? [selectedBase] : []}
            onSelect={handleBaseSelect}
          />
          
          {/* Protein Options */}
          <OptionSection
            title="Select Proteins"
            options={options.proteinOptions}
            selectedIds={selectedProteins}
            onSelect={handleProteinSelect}
            multiSelect
          />
          
          {/* Add-On Options */}
          <OptionSection
            title="Optional Add-ons"
            options={options.addOns}
            selectedIds={selectedAddOns}
            onSelect={handleAddOnSelect}
            multiSelect
          />
          
          {/* Save Bowl Name */}
          <View style={styles.saveSection}>
            <Text style={styles.saveTitle}>Save Your Creation</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Name your bowl creation"
              value={bowlName}
              onChangeText={setBowlName}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveBowl}
            >
              <Ionicons name="bookmark" size={16} color="#FFF" style={styles.saveIcon} />
              <Text style={styles.saveButtonText}>Save This Bowl</Text>
            </TouchableOpacity>
          </View>
          
          {/* Nutrition Summary */}
          <View style={styles.nutritionSummary}>
            <Text style={styles.summaryTitle}>Nutrition Summary</Text>
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{totalCalories}</Text>
                <Text style={styles.macroLabel}>Calories</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={[styles.macroValue, styles.proteinValue]}>{totalProtein}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={[styles.macroValue, styles.carbsValue]}>{totalCarbs}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={[styles.macroValue, styles.fatValue]}>{totalFat}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
              </View>
            </View>
          </View>
          
          {/* Spacer to avoid bottom nav overlap */}
          <View style={{ height: 100 }} />
        </ScrollView>
      ) : null}
      
      {/* Fixed Bottom Price and Add to Cart */}
      {!loading && !error && options && (
        <View style={styles.bottomBar}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.priceValue}>₹{totalPrice}</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              (!selectedBase || selectedProteins.length === 0) && styles.disabledButton
            ]}
            onPress={handleAddToCart}
            disabled={!selectedBase || selectedProteins.length === 0}
          >
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
            <Ionicons name="cart" size={20} color="#FFF" style={styles.cartIcon} />
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    padding: 16,
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
  instructionCard: {
    backgroundColor: '#E5FFF4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'center',
  },
  instructionIcon: {
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#18853B',
    lineHeight: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionsContainer: {
    paddingBottom: 8,
  },
  optionCard: {
    width: 150,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  selectedOptionCard: {
    borderColor: '#18853B',
    borderWidth: 2,
    shadowColor: '#18853B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  optionImage: {
    width: '100%',
    height: 100,
  },
  placeholderImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionDetails: {
    padding: 12,
  },
  optionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#18853B',
    marginBottom: 8,
  },
  optionMacros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  macroText: {
    fontSize: 12,
    color: '#666',
  },
  proteinText: {
    color: '#4CAF50', // Green for protein
  },
  carbsText: {
    color: '#FFC107', // Amber for carbs
  },
  fatText: {
    color: '#F44336', // Red for fat
  },
  vegBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#E5FFF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vegBadgeText: {
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: '600',
  },
  selectedCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  saveSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  saveTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  nameInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#18853B',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  nutritionSummary: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    color: '#333',
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
  macroLabel: {
    fontSize: 12,
    color: '#666',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 74, // To account for the tab navigator
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  addToCartButton: {
    backgroundColor: '#18853B',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  addToCartButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    marginRight: 8,
  },
  cartIcon: {
    marginLeft: 4,
  },
});

export default BuildABowlScreen;
