import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CustomMealService, {
    CustomMealOptions,
    CustomizationOption,
    SaveCustomMealRequest
} from '../services/custom-meal-service';

const { width } = Dimensions.get('window');

// Steps in the bowl building process
const STEPS = [
  { key: 'base', title: 'Choose Base', icon: 'restaurant-outline' },
  { key: 'protein', title: 'Add Protein', icon: 'nutrition-outline' },
  { key: 'addons', title: 'Add Toppings', icon: 'leaf-outline' },
  { key: 'review', title: 'Review', icon: 'checkmark-circle-outline' }
];

// Component for displaying a step indicator
const StepIndicator = ({ 
  currentStep,
  onStepPress
}: { 
  currentStep: number,
  onStepPress?: (stepIndex: number) => void
}) => (
  <View style={styles.stepIndicatorWrapper}>
    <View style={styles.stepIndicatorContainer}>
      {STEPS.map((step, index) => {
        const isActive = currentStep === index;
        const isCompleted = currentStep > index;
        
        return (
          <React.Fragment key={step.key}>
            {/* Step dot with number or check */}
            <TouchableOpacity 
              style={[
                styles.stepItemContainer,
                isActive && styles.activeStepItemContainer
              ]}
              onPress={() => onStepPress && isCompleted && onStepPress(index)}
              disabled={!onStepPress || (!isCompleted && !isActive)}
            >
              <View style={[
                styles.stepDot,
                isActive && styles.activeStepDot,
                isCompleted && styles.completedStepDot
              ]}>
                {isCompleted ? (
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                ) : (
                  <View style={styles.stepIconContainer}>
                    <Ionicons 
                      name={step.icon as any} 
                      size={16} 
                      color={isActive ? "#FFF" : "#999"} 
                    />
                  </View>
                )}
              </View>
              
              <Text style={[
                styles.stepTitle,
                isActive && styles.activeStepTitle,
                isCompleted && styles.completedStepTitle
              ]}>
                {step.title}
              </Text>
            </TouchableOpacity>
            
            {/* Connector between steps */}
            {index < STEPS.length - 1 && (
              <View style={[
                styles.stepConnector,
                isCompleted && styles.completedStepConnector
              ]}>
                <View style={[
                  styles.connectorLine,
                  isCompleted && styles.completedConnectorLine
                ]} />
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
    
    {/* Progress bar indicator */}
    <View style={styles.progressBarContainer}>
      <View 
        style={[
          styles.progressBar, 
          { width: `${(currentStep / (STEPS.length - 1)) * 100}%` }
        ]} 
      />
    </View>
  </View>
);

// Component for displaying an option card
const OptionCard = ({ 
  option, 
  selected, 
  onPress 
}: { 
  option: CustomizationOption;
  selected: boolean;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.optionCard,
        selected && styles.selectedOptionCard
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.optionHeader}>
        <View style={styles.optionImageContainer}>
          {option.imageUrl ? (
            <Image
              source={{ uri: option.imageUrl }}
              style={styles.optionImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.optionImagePlaceholder}>
              <Ionicons name="restaurant-outline" size={36} color="#DDD" />
            </View>
          )}
        </View>
        
        {selected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={24} color="#18853B" />
          </View>
        )}
        
        {option.vegetarian && (
          <View style={styles.vegBadge}>
            <View style={styles.vegSymbol}>
              <View style={styles.vegDot} />
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.optionInfo}>
        <Text style={styles.optionName} numberOfLines={1}>{option.name}</Text>
        <Text style={styles.optionCalories}>{option.caloriesKcal} cal</Text>
        
        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>
              {option.nutritionValues?.Protein || 0}g
            </Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>
              {option.nutritionValues?.Carbohydrates || 0}g
            </Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>
              {option.nutritionValues?.Fats || 0}g
            </Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>
        
        <View style={styles.optionFooter}>
          <Text style={styles.optionPrice}>₹{option.price}</Text>
          {selected && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedText}>Selected</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Component for selected option in summary
const SelectedOptionItem = ({
  option,
  onRemove
}: {
  option: CustomizationOption;
  onRemove: () => void;
}) => (
  <View style={styles.selectedOptionItem}>
    <Text style={styles.selectedOptionName}>{option.name}</Text>
    <TouchableOpacity onPress={onRemove}>
      <Ionicons name="close-circle" size={18} color="#FF3B30" />
    </TouchableOpacity>
  </View>
);

// Main component
const BuildABowlScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<CustomMealOptions | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Current step in the wizard
  const [currentStep, setCurrentStep] = useState(0);
  
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

  // Flag to control if the summary panel is expanded
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  
  // Loading options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const data = await CustomMealService.getCustomMealOptions();
        if (data) {
          setOptions(data);
        } else {
          setError('Failed to load options');
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
    
    setTotalCalories(Math.round(calories));
    setTotalProtein(Math.round(protein));
    setTotalCarbs(Math.round(carbs));
    setTotalFat(Math.round(fat));
    setTotalPrice(price);
  }, [options, selectedBase, selectedProteins, selectedAddOns]);
  
  // Move to next step if valid
  const goToNextStep = () => {
    // Validate current step
    if (currentStep === 0 && !selectedBase) {
      Alert.alert('Selection Required', 'Please select a base for your bowl');
      return;
    }
    
    if (currentStep === 1 && selectedProteins.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one protein');
      return;
    }
    
    // If current step is valid, go to next step
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Go to previous step
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
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
  
  // Handle removing base from selections
  const handleRemoveBase = () => {
    setSelectedBase(null);
  };
  
  // Handle removing protein from selections
  const handleRemoveProtein = (id: number) => {
    setSelectedProteins(prev => prev.filter(p => p !== id));
  };
  
  // Handle removing add-on from selections
  const handleRemoveAddOn = (id: number) => {
    setSelectedAddOns(prev => prev.filter(a => a !== id));
  };
  
  // Add bowl to cart
  const handleAddToCart = async () => {
    if (!selectedBase || selectedProteins.length === 0) {
      Alert.alert('Incomplete Bowl', 'Please select at least a base and one protein');
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
        // Reset selections
        setSelectedBase(null);
        setSelectedProteins([]);
        setSelectedAddOns([]);
        setBowlName('');
        setCurrentStep(0);
      } else {
        Alert.alert('Error', 'Failed to add custom bowl to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };
  
  // Save custom bowl
  const handleSaveBowl = () => {
    if (!selectedBase || selectedProteins.length === 0) {
      Alert.alert('Incomplete Bowl', 'Please select at least a base and one protein');
      return;
    }
    
    Alert.prompt(
      'Name Your Bowl',
      'Give your custom bowl a name to save it',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (name) => {
            if (!name || !name.trim()) {
              Alert.alert('Error', 'Please provide a name for your bowl');
              return;
            }
            
            try {
              const request: SaveCustomMealRequest = {
                customMealName: name.trim(),
                baseComponentId: selectedBase,
                proteinOptionIds: selectedProteins,
                addOnIds: selectedAddOns
              };
              
              const savedMeal = await CustomMealService.saveCustomMeal(request);
              
              if (savedMeal) {
                Alert.alert(
                  'Bowl Saved',
                  'Your custom bowl has been saved!',
                  [
                    { text: 'Continue', style: 'cancel' },
                    { text: 'View Saved Bowls', onPress: () => router.push('/saved-bowls') }
                  ]
                );
              } else {
                Alert.alert('Error', 'Failed to save your custom bowl');
              }
            } catch (err) {
              console.error('Error saving bowl:', err);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          }
        }
      ],
      'plain-text'
    );
  };
  
  // Render the content for the current step
  const renderStepContent = () => {
    if (!options) return null;
    
    switch (currentStep) {
      case 0: // Base selection
        return (
          <View style={styles.stepContentContainer}>
            <Text style={styles.stepInstructions}>
              Start with a base for your bowl
            </Text>
            <FlatList
              data={options.bases}
              renderItem={({ item }) => (
                <OptionCard
                  option={item}
                  selected={item.id === selectedBase}
                  onPress={() => {
                    handleBaseSelect(item.id);
                    // Auto-advance if a base is selected
                    if (item.id !== selectedBase) {
                      setTimeout(() => goToNextStep(), 500);
                    }
                  }}
                />
              )}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.optionsList}
            />
          </View>
        );
      
      case 1: // Protein selection
        return (
          <View style={styles.stepContentContainer}>
            <Text style={styles.stepInstructions}>
              Select protein options (you can choose multiple)
            </Text>
            <FlatList
              data={options.proteinOptions}
              renderItem={({ item }) => (
                <OptionCard
                  option={item}
                  selected={selectedProteins.includes(item.id)}
                  onPress={() => handleProteinSelect(item.id)}
                />
              )}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.optionsList}
            />
          </View>
        );
      
      case 2: // Add-ons selection
        return (
          <View style={styles.stepContentContainer}>
            <Text style={styles.stepInstructions}>
              Add optional toppings to enhance your bowl
            </Text>
            <FlatList
              data={options.addOns}
              renderItem={({ item }) => (
                <OptionCard
                  option={item}
                  selected={selectedAddOns.includes(item.id)}
                  onPress={() => handleAddOnSelect(item.id)}
                />
              )}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.optionsList}
            />
          </View>
        );
      
      case 3: // Review
        return (
          <View style={styles.reviewContainer}>
            <Text style={styles.reviewTitle}>Your Custom Bowl</Text>
            
            {/* Base section */}
            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>Base</Text>
              {selectedBase ? (
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewItemText}>
                    {options.bases.find(b => b.id === selectedBase)?.name}
                  </Text>
                  <Text style={styles.reviewItemPrice}>
                    ₹{options.bases.find(b => b.id === selectedBase)?.price}
                  </Text>
                </View>
              ) : (
                <Text style={styles.reviewEmptyText}>No base selected</Text>
              )}
            </View>
            
            {/* Proteins section */}
            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>Proteins</Text>
              {selectedProteins.length > 0 ? (
                selectedProteins.map(id => {
                  const protein = options.proteinOptions.find(p => p.id === id);
                  return protein ? (
                    <View key={id} style={styles.reviewItem}>
                      <Text style={styles.reviewItemText}>{protein.name}</Text>
                      <Text style={styles.reviewItemPrice}>₹{protein.price}</Text>
                    </View>
                  ) : null;
                })
              ) : (
                <Text style={styles.reviewEmptyText}>No proteins selected</Text>
              )}
            </View>
            
            {/* Add-ons section */}
            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionTitle}>Add-ons</Text>
              {selectedAddOns.length > 0 ? (
                selectedAddOns.map(id => {
                  const addOn = options.addOns.find(a => a.id === id);
                  return addOn ? (
                    <View key={id} style={styles.reviewItem}>
                      <Text style={styles.reviewItemText}>{addOn.name}</Text>
                      <Text style={styles.reviewItemPrice}>₹{addOn.price}</Text>
                    </View>
                  ) : null;
                })
              ) : (
                <Text style={styles.reviewEmptyText}>No add-ons selected</Text>
              )}
            </View>
            
            {/* Nutrition summary */}
            <View style={styles.reviewNutritionContainer}>
              <Text style={styles.reviewSectionTitle}>Nutrition Information</Text>
              <View style={styles.reviewNutritionInfo}>
                <View style={styles.nutritionInfoItem}>
                  <Text style={styles.nutritionInfoValue}>{totalCalories}</Text>
                  <Text style={styles.nutritionInfoLabel}>Calories</Text>
                </View>
                <View style={styles.nutritionInfoItem}>
                  <Text style={[styles.nutritionInfoValue, styles.proteinValue]}>
                    {totalProtein}g
                  </Text>
                  <Text style={styles.nutritionInfoLabel}>Protein</Text>
                </View>
                <View style={styles.nutritionInfoItem}>
                  <Text style={[styles.nutritionInfoValue, styles.carbsValue]}>
                    {totalCarbs}g
                  </Text>
                  <Text style={styles.nutritionInfoLabel}>Carbs</Text>
                </View>
                <View style={styles.nutritionInfoItem}>
                  <Text style={[styles.nutritionInfoValue, styles.fatValue]}>
                    {totalFat}g
                  </Text>
                  <Text style={styles.nutritionInfoLabel}>Fat</Text>
                </View>
              </View>
            </View>
            
            {/* Action buttons */}
            <View style={styles.reviewActions}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveBowl}
              >
                <Ionicons name="bookmark-outline" size={20} color="#18853B" />
                <Text style={styles.saveButtonText}>Save Bowl</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.addToCartButton}
                onPress={handleAddToCart}
              >
                <Ionicons name="cart-outline" size={20} color="#FFF" />
                <Text style={styles.addToCartButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };
  
  // Get selected option objects
  const getSelectedBase = () => {
    if (!options || !selectedBase) return null;
    return options.bases.find(b => b.id === selectedBase);
  };
  
  const getSelectedProteins = () => {
    if (!options) return [];
    return selectedProteins.map(id => 
      options.proteinOptions.find(p => p.id === id)
    ).filter(Boolean) as CustomizationOption[];
  };
  
  const getSelectedAddOns = () => {
    if (!options) return [];
    return selectedAddOns.map(id => 
      options.addOns.find(a => a.id === id)
    ).filter(Boolean) as CustomizationOption[];
  };

  // Handle direct step navigation
  const handleStepPress = (stepIndex: number) => {
    // Only allow navigating to completed steps or the next available step
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (currentStep === 0) {
              router.back();
            } else {
              goToPreviousStep();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Build Your Bowl</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.push('/saved-bowls')}
        >
          <Ionicons name="bookmark" size={24} color="#18853B" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#18853B" />
          <Text style={styles.loadingText}>Loading ingredients...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              CustomMealService.getCustomMealOptions()
                .then(data => {
                  if (data) setOptions(data);
                  else setError('Failed to load options');
                })
                .catch(err => setError('Error loading options'))
                .finally(() => setLoading(false));
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Step indicator with ability to navigate to previous steps */}
          <StepIndicator 
            currentStep={currentStep} 
            onStepPress={handleStepPress} 
          />
          
          {/* Step content */}
          {renderStepContent()}
          
          {/* Bottom navigation and summary (only show on steps 0-2) */}
          {currentStep < 3 && (
            <>
              {/* Summary panel (shows selections and nutrition info) */}
              <View style={styles.summaryPanel}>
                <TouchableOpacity 
                  style={styles.summaryHeader}
                  onPress={() => setSummaryExpanded(!summaryExpanded)}
                >
                  <View style={styles.summaryTitleContainer}>
                    <Text style={styles.summaryTitle}>Bowl Summary</Text>
                    <Ionicons
                      name={summaryExpanded ? 'chevron-down' : 'chevron-up'}
                      size={20}
                      color="#666"
                    />
                  </View>
                  
                  <View style={styles.summaryBasicInfo}>
                    <Text style={styles.summaryCalories}>{totalCalories} cal</Text>
                    <Text style={styles.summaryPrice}>₹{totalPrice.toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>
                
                {summaryExpanded && (
                  <View style={styles.summaryContent}>
                    {/* Selected base */}
                    {getSelectedBase() && (
                      <>
                        <Text style={styles.summaryLabel}>Base:</Text>
                        <SelectedOptionItem
                          option={getSelectedBase() as CustomizationOption}
                          onRemove={handleRemoveBase}
                        />
                      </>
                    )}
                    
                    {/* Selected proteins */}
                    {getSelectedProteins().length > 0 && (
                      <>
                        <Text style={styles.summaryLabel}>Proteins:</Text>
                        {getSelectedProteins().map(protein => (
                          <SelectedOptionItem
                            key={protein.id}
                            option={protein}
                            onRemove={() => handleRemoveProtein(protein.id)}
                          />
                        ))}
                      </>
                    )}
                    
                    {/* Selected add-ons */}
                    {getSelectedAddOns().length > 0 && (
                      <>
                        <Text style={styles.summaryLabel}>Add-ons:</Text>
                        {getSelectedAddOns().map(addOn => (
                          <SelectedOptionItem
                            key={addOn.id}
                            option={addOn}
                            onRemove={() => handleRemoveAddOn(addOn.id)}
                          />
                        ))}
                      </>
                    )}
                    
                    {/* Nutrition summary */}
                    <View style={styles.nutritionSummary}>
                      <View style={styles.nutrientRow}>
                        <Text style={styles.nutrientLabel}>Protein:</Text>
                        <Text style={styles.nutrientValue}>{totalProtein}g</Text>
                      </View>
                      <View style={styles.nutrientRow}>
                        <Text style={styles.nutrientLabel}>Carbs:</Text>
                        <Text style={styles.nutrientValue}>{totalCarbs}g</Text>
                      </View>
                      <View style={styles.nutrientRow}>
                        <Text style={styles.nutrientLabel}>Fat:</Text>
                        <Text style={styles.nutrientValue}>{totalFat}g</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
              
              {/* Navigation buttons */}
              <View style={styles.bottomNavigation}>
                {currentStep > 0 && (
                  <TouchableOpacity 
                    style={styles.navButtonBack}
                    onPress={goToPreviousStep}
                  >
                    <Ionicons name="arrow-back" size={20} color="#333" />
                    <Text style={styles.navButtonBackText}>
                      {STEPS[currentStep - 1].title}
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.navButtonNext}
                  onPress={goToNextStep}
                >
                  <Text style={styles.navButtonNextText}>
                    {currentStep === STEPS.length - 2 ? 'Review Order' : 'Next Step'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      )}
      
      {/* <BottomTabNavigator activeTab="home" /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerButton: {
    padding: 8,
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
  
  // Enhanced Step indicator styles
  stepIndicatorWrapper: {
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  stepItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width / 5,
  },
  activeStepItemContainer: {
    transform: [{scale: 1.05}],
  },
  stepDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeStepDot: {
    backgroundColor: '#18853B',
    borderColor: '#18853B',
  },
  completedStepDot: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stepIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontWeight: '500',
  },
  activeStepTitle: {
    color: '#18853B',
    fontWeight: '700',
  },
  completedStepTitle: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  stepConnector: {
    flex: 1,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectorLine: {
    height: 2,
    backgroundColor: '#E0E0E0',
    width: '100%',
  },
  completedConnectorLine: {
    backgroundColor: '#4CAF50',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#18853B',
    borderRadius: 2,
  },
  
  // Step content styles
  stepContentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  stepInstructions: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  optionsList: {
    paddingBottom: 180, // Extra padding to account for summary panel
  },
  
  // Option card styles
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  selectedOptionCard: {
    borderColor: '#18853B',
    borderWidth: 2,
  },
  optionHeader: {
    position: 'relative',
  },
  optionImageContainer: {
    height: 120,
    width: '100%',
    backgroundColor: '#F8F8F8',
  },
  optionImage: {
    width: '100%',
    height: '100%',
  },
  optionImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vegBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FFF',
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  vegSymbol: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vegDot: {
    width: 8,
    height: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  optionInfo: {
    padding: 12,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionCalories: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
  },
  optionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18853B',
  },
  selectedIndicator: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedText: {
    fontSize: 12,
    color: '#18853B',
    fontWeight: '600',
  },
  
  // Summary panel styles
  summaryPanel: {
    position: 'absolute',
    bottom: 70, // Space for navigation buttons
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  summaryBasicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryCalories: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  summaryPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18853B',
  },
  summaryContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  selectedOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  selectedOptionName: {
    fontSize: 14,
    color: '#333',
  },
  nutritionSummary: {
    marginTop: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nutrientLabel: {
    fontSize: 14,
    color: '#666',
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  
  // Bottom navigation styles
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    height: 70,
    alignItems: 'center',
  },
  navButtonBack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
  },
  navButtonBackText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  navButtonNext: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18853B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  navButtonNextText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  
  // Review screen styles
  reviewContainer: {
    flex: 1,
    padding: 16,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  reviewSection: {
    marginBottom: 20,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 8,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  reviewItemText: {
    fontSize: 15,
    color: '#333',
  },
  reviewItemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  reviewEmptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  reviewNutritionContainer: {
    marginBottom: 24,
  },
  reviewNutritionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 16,
  },
  nutritionInfoItem: {
    alignItems: 'center',
  },
  nutritionInfoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  nutritionInfoLabel: {
    fontSize: 12,
    color: '#666',
  },
  proteinValue: {
    color: '#4CAF50',
  },
  carbsValue: {
    color: '#FF9800',
  },
  fatValue: {
    color: '#FF5252',
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#18853B',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 0.48,
  },
  saveButtonText: {
    color: '#18853B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18853B',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 0.48,
  },
  addToCartButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default BuildABowlScreen;
