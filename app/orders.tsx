import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ApiService from '../services/api-service';

// Order interfaces
interface OrderItem {
  mealId: number | null;
  mealNameSnapshot: string;
  quantity: number;
  pricePerItemSnapshot: number;
  lineItemTotal: number;
}

interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  subtotalAmount: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  orderDate: string;
}

interface OrderHistoryResponse {
  content: Order[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

const OrdersScreen = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (page: number = 1, refresh: boolean = false) => {
    if (refresh) {
      setRefreshing(true);
    } else if (!refresh && page === 1) {
      setLoading(true);
    }

    try {
      const response = await ApiService.getOrderHistory(page);
      
      if (response.success && response.data) {
        const orderData = response.data;
        
        if (refresh || page === 1) {
          setOrders(orderData.content);
        } else {
          setOrders(prevOrders => [...prevOrders, ...orderData.content]);
        }
        
        setCurrentPage(orderData.currentPage);
        setTotalPages(orderData.totalPages);
      } else {
        Alert.alert('Error', response.error || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMoreOrders = () => {
    if (currentPage < totalPages && !loading && !refreshing) {
      fetchOrders(currentPage + 1);
    }
  };

  const handleRefresh = () => {
    fetchOrders(1, true);
  };

  const handleOrderPress = (order: Order) => {
    router.push({
      pathname: '/order-details',
      params: { orderId: order.id }
    });
  };

  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Get status color based on order status
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return '#FFC107'; // Yellow
      case 'PREPARING':
        return '#FF9800'; // Orange
      case 'OUT_FOR_DELIVERY':
        return '#2196F3'; // Blue
      case 'DELIVERED':
        return '#4CAF50'; // Green
      case 'CANCELLED':
        return '#F44336'; // Red
      default:
        return '#757575'; // Grey
    }
  };

  // Render order list item
  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderInfo}>
        <Text style={styles.orderDate}>
          <Ionicons name="calendar-outline" size={14} color="#666" /> {formatDate(item.orderDate)}
        </Text>
        <Text style={styles.orderItemsCount}>
          <Ionicons name="fast-food-outline" size={14} color="#666" /> {item.items.length} items
        </Text>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>₹{item.totalAmount.toFixed(2)}</Text>
        <View style={styles.viewDetailsContainer}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#18853B" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={{width: 24}} />
      </View>

      {/* Order List */}
      {loading && orders.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#18853B" />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>You haven't placed any orders yet</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.push('/home')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.ordersList}
          onEndReached={loadMoreOrders}
          onEndReachedThreshold={0.2}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={
            currentPage < totalPages ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#18853B" />
                <Text style={styles.footerLoaderText}>Loading more orders...</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#18853B',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 16,
  },
  shopButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  orderInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginRight: 16,
  },
  orderItemsCount: {
    fontSize: 14,
    color: '#666',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#18853B',
    fontWeight: '500',
    marginRight: 2,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerLoaderText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default OrdersScreen;
