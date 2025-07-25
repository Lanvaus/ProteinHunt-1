import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useCart } from '../context/CartContext';
import ApiService from '../services/api-service';

interface Address {
  id?: number;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const PAYMENT_METHODS = [
  { id: 'cod', name: 'Cash on Delivery', icon: 'cash-outline' },
  { id: 'card', name: 'Credit/Debit Card', icon: 'card-outline' },
  { id: 'upi', name: 'UPI', icon: 'wallet-outline' },
];

const DEFAULT_ADDRESS: Address = {
  label: 'Home',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: true,
};

const CheckoutScreen = () => {
  const router = useRouter();
  const { cart, loading: cartLoading, fetchCart } = useCart();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  
  // Address modal state
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({ ...DEFAULT_ADDRESS });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [savingAddress, setSavingAddress] = useState(false);

  // Load saved addresses on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Refresh cart data
        await fetchCart();
        
        // Load saved addresses
        const response = await ApiService.getSavedAddresses();
        if (response.success && response.data) {
          setAddresses(response.data);
          
          // Select default address if available
          const defaultAddress = response.data.find(addr => addr.isDefault);
          setSelectedAddress(defaultAddress || response.data[0] || null);
        }
      } catch (error) {
        console.error('Error loading checkout data:', error);
        Alert.alert('Error', 'Failed to load checkout data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Calculate total with delivery fee and discount
  const deliveryFee = 30;
  const subtotal = cart?.grandTotal || 0;
  const total = subtotal + deliveryFee - discount;

  // Handle promo code application
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }
    
    try {
      const response = await ApiService.applyPromoCode(promoCode);
      if (response.success && response.data) {
        setDiscount(response.data.discount);
        Alert.alert('Success', `Promo code applied! You saved ₹${response.data.discount}`);
      } else {
        Alert.alert('Error', response.error || 'Invalid promo code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to apply promo code');
    }
  };

  // Validate address form
  const validateAddress = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!newAddress.addressLine1.trim()) {
      errors.addressLine1 = 'Address is required';
    }
    
    if (!newAddress.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!newAddress.state.trim()) {
      errors.state = 'State is required';
    }
    
    if (!newAddress.pincode.trim()) {
      errors.pincode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(newAddress.pincode)) {
      errors.pincode = 'Enter a valid 6-digit PIN code';
    }
    
    if (!newAddress.label.trim()) {
      errors.label = 'Label is required';
    }
    
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save new address
  const saveAddress = async () => {
    if (!validateAddress()) return;
    
    setSavingAddress(true);
    try {
      const response = await ApiService.saveAddress(newAddress);
      if (response.success && response.data) {
        const updatedAddresses = [...addresses, response.data];
        setAddresses(updatedAddresses);
        setSelectedAddress(response.data);
        setAddressModalVisible(false);
        setNewAddress({ ...DEFAULT_ADDRESS });
      } else {
        Alert.alert('Error', response.error || 'Failed to save address');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred while saving the address');
    } finally {
      setSavingAddress(false);
    }
  };

  // Place order
  const placeOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }
    
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }
    
    setPlacingOrder(true);
    try {
      const orderRequest = {
        deliveryAddressId: selectedAddress.id!,  // Changed from addressId to deliveryAddressId
        paymentMethod: selectedPaymentMethod,
        specialInstructions: specialInstructions.trim() || undefined,
      };
      
      const response = await ApiService.placeOrder(orderRequest);
      
      if (response.success && response.data) {
        // Navigate to order success page
        router.replace({
          pathname: '/order-success',
          params: { orderId: response.data.orderId }
        });
      } else {
        Alert.alert('Error', response.error || 'Failed to place order');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred while placing your order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading || cartLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{width: 24}} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#18853B" />
          <Text style={styles.loadingText}>Loading checkout details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{width: 24}} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          {/* Delivery Address Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setAddressModalVisible(true)}
              >
                <Ionicons name="add" size={20} color="#18853B" />
                <Text style={styles.addButtonText}>Add New</Text>
              </TouchableOpacity>
            </View>
            
            {addresses.length === 0 ? (
              <TouchableOpacity
                style={styles.noAddressContainer}
                onPress={() => setAddressModalVisible(true)}
              >
                <Ionicons name="location-outline" size={24} color="#999" />
                <Text style={styles.noAddressText}>No addresses found. Add your first address</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.addressList}>
                {addresses.map((address) => (
                  <TouchableOpacity
                    key={address.id || address.label}
                    style={[
                      styles.addressCard,
                      selectedAddress?.id === address.id && styles.selectedAddressCard
                    ]}
                    onPress={() => setSelectedAddress(address)}
                  >
                    <View style={styles.addressHeader}>
                      <View style={styles.addressLabelContainer}>
                        <Text style={styles.addressLabel}>{address.label}</Text>
                        {address.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.radioButton}>
                        {selectedAddress?.id === address.id && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                    </View>
                    
                    <Text style={styles.addressLine}>
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                    </Text>
                    <Text style={styles.addressLine}>
                      {address.city}, {address.state}, {address.pincode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Payment Method Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentMethodList}>
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethodCard,
                    selectedPaymentMethod === method.id && styles.selectedPaymentMethod
                  ]}
                  onPress={() => setSelectedPaymentMethod(method.id)}
                >
                  <View style={styles.paymentMethodLeft}>
                    <View style={styles.paymentMethodIconContainer}>
                      <Ionicons name={method.icon as any} size={24} color="#333" />
                    </View>
                    <Text style={styles.paymentMethodName}>{method.name}</Text>
                  </View>
                  <View style={styles.radioButton}>
                    {selectedPaymentMethod === method.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Order Summary Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            
            {/* Items */}
            <View style={styles.orderItems}>
              {cart?.items.map((item) => (
                <View key={item.cartItemId} style={styles.orderItemRow}>
                  <View style={styles.orderItemDetails}>
                    <Text style={styles.orderItemName}>
                      {item.mealName} {item.quantity > 1 && `× ${item.quantity}`}
                    </Text>
                  </View>
                  <Text style={styles.orderItemPrice}>₹{item.subTotal}</Text>
                </View>
              ))}
            </View>
            
            {/* Promo Code */}
            <View style={styles.promoContainer}>
              <View style={styles.promoInputContainer}>
                <TextInput
                  style={styles.promoInput}
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChangeText={setPromoCode}
                />
              </View>
              <TouchableOpacity 
                style={styles.promoButton}
                onPress={applyPromoCode}
              >
                <Text style={styles.promoButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
            
            {/* Order Total Calculation */}
            <View style={styles.totalContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>₹{subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Delivery Fee</Text>
                <Text style={styles.totalValue}>₹{deliveryFee.toFixed(2)}</Text>
              </View>
              {discount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, styles.discountLabel]}>Discount</Text>
                  <Text style={[styles.totalValue, styles.discountValue]}>-₹{discount.toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.divider} />
              <View style={[styles.totalRow, styles.finalTotalRow]}>
                <Text style={styles.finalTotalLabel}>Total</Text>
                <Text style={styles.finalTotalValue}>₹{total.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Special Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <TextInput
              style={styles.instructionsInput}
              placeholder="Add any special delivery instructions..."
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Place Order Button */}
      <View style={styles.placeOrderContainer}>
        <View style={styles.orderSummary}>
          <Text style={styles.orderItemsCount}>{cart?.totalItems || 0} item{(cart?.totalItems || 0) !== 1 ? 's' : ''}</Text>
          <Text style={styles.orderTotal}>₹{total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.placeOrderButton, placingOrder && styles.disabledButton]}
          onPress={placeOrder}
          disabled={placingOrder}
        >
          {placingOrder ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.placeOrderText}>Place Order</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* New Address Modal */}
      <Modal
        visible={addressModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Address</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => {
                  setAddressModalVisible(false);
                  setNewAddress({ ...DEFAULT_ADDRESS });
                  setAddressErrors({});
                }}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Label</Text>
                <View style={styles.labelButtonsContainer}>
                  {['Home', 'Work', 'Other'].map((label) => (
                    <TouchableOpacity
                      key={label}
                      style={[
                        styles.labelButton,
                        newAddress.label === label && styles.activeLabelButton
                      ]}
                      onPress={() => setNewAddress({...newAddress, label})}
                    >
                      <Text 
                        style={[
                          styles.labelButtonText,
                          newAddress.label === label && styles.activeLabelButtonText
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {addressErrors.label && <Text style={styles.errorText}>{addressErrors.label}</Text>}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Address Line 1*</Text>
                <TextInput
                  style={[styles.formInput, addressErrors.addressLine1 && styles.inputError]}
                  value={newAddress.addressLine1}
                  onChangeText={(text) => setNewAddress({...newAddress, addressLine1: text})}
                  placeholder="House/Flat No., Building Name"
                />
                {addressErrors.addressLine1 && <Text style={styles.errorText}>{addressErrors.addressLine1}</Text>}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Address Line 2</Text>
                <TextInput
                  style={styles.formInput}
                  value={newAddress.addressLine2}
                  onChangeText={(text) => setNewAddress({...newAddress, addressLine2: text})}
                  placeholder="Road, Area, Colony (Optional)"
                />
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.formLabel}>City*</Text>
                  <TextInput
                    style={[styles.formInput, addressErrors.city && styles.inputError]}
                    value={newAddress.city}
                    onChangeText={(text) => setNewAddress({...newAddress, city: text})}
                    placeholder="City"
                  />
                  {addressErrors.city && <Text style={styles.errorText}>{addressErrors.city}</Text>}
                </View>
                
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>State*</Text>
                  <TextInput
                    style={[styles.formInput, addressErrors.state && styles.inputError]}
                    value={newAddress.state}
                    onChangeText={(text) => setNewAddress({...newAddress, state: text})}
                    placeholder="State"
                  />
                  {addressErrors.state && <Text style={styles.errorText}>{addressErrors.state}</Text>}
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>PIN Code*</Text>
                <TextInput
                  style={[styles.formInput, addressErrors.pincode && styles.inputError]}
                  value={newAddress.pincode}
                  onChangeText={(text) => setNewAddress({...newAddress, pincode: text})}
                  placeholder="6-digit PIN code"
                  keyboardType="number-pad"
                  maxLength={6}
                />
                {addressErrors.pincode && <Text style={styles.errorText}>{addressErrors.pincode}</Text>}
              </View>
              
              <View style={styles.formGroup}>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setNewAddress({...newAddress, isDefault: !newAddress.isDefault})}
                  >
                    {newAddress.isDefault && (
                      <Ionicons name="checkmark" size={18} color="#18853B" />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>Set as default address</Text>
                </View>
              </View>
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.saveAddressButton, savingAddress && styles.disabledButton]}
              onPress={saveAddress}
              disabled={savingAddress}
            >
              {savingAddress ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.saveAddressButtonText}>Save Address</Text>
              )}
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
    paddingTop: Platform.OS === 'android' ? 25 : 0, // Adjust for Android status bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#18853B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  noAddressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CCC',
    borderRadius: 8,
  },
  noAddressText: {
    marginTop: 8,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  addressList: {
    marginBottom: 8,
  },
  addressCard: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  selectedAddressCard: {
    borderColor: '#18853B',
    backgroundColor: '#F0FFF4',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  defaultBadge: {
    backgroundColor: '#E5FFF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultBadgeText: {
    color: '#18853B',
    fontSize: 12,
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#18853B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#18853B',
  },
  addressLine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  paymentMethodList: {
    marginTop: 8,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedPaymentMethod: {
    borderColor: '#18853B',
    backgroundColor: '#F0FFF4',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  orderItems: {
    marginTop: 8,
    marginBottom: 16,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 15,
    color: '#333',
  },
  orderItemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  promoContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  promoInputContainer: {
    flex: 1,
    marginRight: 12,
  },
  promoInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  promoButton: {
    backgroundColor: '#18853B',
    borderRadius: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  totalContainer: {
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 15,
    color: '#666',
  },
  totalValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  discountLabel: {
    color: '#4CAF50',
  },
  discountValue: {
    color: '#4CAF50',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 8,
  },
  finalTotalRow: {
    marginTop: 4,
  },
  finalTotalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  finalTotalValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#18853B',
  },
  instructionsInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    height: 80,
    fontSize: 15,
  },
  placeOrderContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderSummary: {
    flex: 1,
  },
  orderItemsCount: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  placeOrderButton: {
    backgroundColor: '#18853B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeOrderText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    marginTop: 4,
  },
  formRow: {
    flexDirection: 'row',
  },
  labelButtonsContainer: {
    flexDirection: 'row',
  },
  labelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginRight: 10,
  },
  activeLabelButton: {
    borderColor: '#18853B',
    backgroundColor: '#E5FFF4',
  },
  labelButtonText: {
    color: '#666',
  },
  activeLabelButtonText: {
    color: '#18853B',
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#18853B',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#333',
  },
  saveAddressButton: {
    backgroundColor: '#18853B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveAddressButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CheckoutScreen;
