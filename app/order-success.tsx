import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ApiService from '../services/api-service';

// Order response interface
interface OrderItem {
  mealId: number | null;
  mealNameSnapshot: string;
  quantity: number;
  pricePerItemSnapshot: number;
  lineItemTotal: number;
}

interface OrderDetails {
  id: number;
  userId: number;
  items: OrderItem[];
  deliveryAddressLabel: string;
  deliveryAddressLine1: string;
  deliveryAddressLine2: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPostalCode: string;
  deliveryCountry: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  deliveryPhoneNumber: string;
  subtotalAmount: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  orderDate: string;
  createdAt: string;
}

const OrderSuccessScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.orderId;
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    if (!orderId) {
      Alert.alert("Error", "Order ID not found");
      router.replace('/home');
      return;
    }

    try {
      const response = await ApiService.getOrderDetails(Number(orderId));
      if (response.success && response.data) {
        setOrderDetails(response.data);
      } else {
        Alert.alert("Error", "Failed to load order details");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      Alert.alert("Error", "Something went wrong while fetching order details");
    } finally {
      setLoading(false);
    }
  };

  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render a loading state while fetching order details
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#18853B" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="checkmark-circle" size={80} color="#18853B" />
          <Text style={styles.title}>Order Placed Successfully!</Text>
          <Text style={styles.orderIdText}>Order ID: #{orderDetails?.id}</Text>
          <Text style={styles.statusText}>
            Status: <Text style={styles.statusValue}>{orderDetails?.status}</Text>
          </Text>
          <Text style={styles.dateText}>
            {orderDetails?.orderDate ? formatDate(orderDetails.orderDate) : ''}
          </Text>
        </View>

        {/* Order Items */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {orderDetails?.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.mealNameSnapshot}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{item.lineItemTotal.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.addressLabel}>{orderDetails?.deliveryAddressLabel}</Text>
            </View>
            <Text style={styles.addressText}>
              {orderDetails?.deliveryAddressLine1}
              {orderDetails?.deliveryAddressLine2 && `, ${orderDetails.deliveryAddressLine2}`}
            </Text>
            <Text style={styles.addressText}>
              {orderDetails?.deliveryCity}, {orderDetails?.deliveryState}, {orderDetails?.deliveryPostalCode}
            </Text>
            <Text style={styles.addressText}>{orderDetails?.deliveryCountry}</Text>
            <Text style={styles.phoneText}>Phone: {orderDetails?.deliveryPhoneNumber}</Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.paymentMethod}>
            <Text style={styles.paymentLabel}>Payment Method:</Text>
            <Text style={styles.paymentValue}>
              {orderDetails?.paymentMethod === 'COD' ? 'Cash on Delivery' : orderDetails?.paymentMethod}
            </Text>
          </View>
          
          <View style={styles.paymentSummary}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Subtotal</Text>
              <Text style={styles.paymentAmount}>₹{orderDetails?.subtotalAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Delivery Fee</Text>
              <Text style={styles.paymentAmount}>
                {orderDetails?.deliveryFee > 0 
                  ? `₹${orderDetails.deliveryFee.toFixed(2)}` 
                  : 'Free'}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Tax</Text>
              <Text style={styles.paymentAmount}>₹{orderDetails?.taxAmount.toFixed(2)}</Text>
            </View>
            <View style={[styles.paymentRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>₹{orderDetails?.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.thankYouMessage}>
          Thank you for your order. We'll notify you once your delicious meal is on the way!
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.trackButton}
            onPress={() => router.push('/orders')}
          >
            <Text style={styles.trackButtonText}>Track Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => router.replace('/home')}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#18853B',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  orderIdText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  statusValue: {
    fontWeight: '600',
    color: '#18853B',
  },
  dateText: {
    fontSize: 15,
    color: '#888',
  },
  sectionContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  itemInfo: {
    flex: 1,
    paddingRight: 10,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  addressContainer: {
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  labelContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5FFF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  addressLabel: {
    color: '#18853B',
    fontWeight: '500',
    fontSize: 14,
  },
  addressText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 15,
    color: '#333',
    marginTop: 4,
  },
  paymentMethod: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginBottom: 10,
  },
  paymentSummary: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 15,
    color: '#666',
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  paymentAmount: {
    fontSize: 15,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#18853B',
  },
  thankYouMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 16,
  },
  trackButton: {
    backgroundColor: '#18853B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  trackButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#F0FFF4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#18853B',
  },
  homeButtonText: {
    color: '#18853B',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderSuccessScreen;
