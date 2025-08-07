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
import BottomTabNavigator from '../components/BottomTabNavigator';
import ApiService from '../services/api-service';

interface ConsultationMessage {
  id: number;
  senderId: number;
  senderName: string;
  messageContent: string;
  sentAt: string;
}

interface ConsultationRequest {
  id: number;
  userId: number;
  userName: string;
  nutritionistId: number;
  nutritionistName: string;
  uploadedPlanDocumentUrl: string;
  userNotes: string;
  status: 'SUBMITTED_BY_USER' | 'ASSIGNED_TO_NUTRITIONIST' | 'UNDER_REVIEW' | 
         'SUGGESTIONS_PROVIDED' | 'USER_FEEDBACK_RECEIVED' | 'PLAN_FINALIZED' | 
         'CLOSED' | 'CANCELLED_BY_USER' | 'CANCELLED_BY_ADMIN';
  finalizedPlanDetails: string;
  messages: ConsultationMessage[];
  createdAt: string;
  updatedAt: string;
}

interface ConsultationPageResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  content: ConsultationRequest[];
}

type FilterType = 'ALL' | 'ACTIVE' | 'FINALIZED' | 'COMPLETED';

const ConsultationsScreen = () => {
  const router = useRouter();
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  // Fetch consultations with pagination
  const fetchConsultations = async (page: number = 0, refresh: boolean = false) => {
    if (refresh) {
      setRefreshing(true);
    } else if (page > 0) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await ApiService.getUserConsultations(page);
      
      if (response.success && response.data) {
        const { content, totalPages: pages } = response.data;
        
        if (page === 0 || refresh) {
          // First page or refresh - replace all data
          setConsultations(content);
        } else {
          // Subsequent pages - append data
          setConsultations(prev => [...prev, ...content]);
        }
        
        setTotalPages(pages);
        setCurrentPage(page);
        setHasMore(page < pages - 1);
        
        // Apply filtering
        filterConsultations(content, activeFilter);
      } else {
        setError(response.error || 'Failed to fetch consultations');
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  // Filter consultations based on status
  const filterConsultations = (data: ConsultationRequest[] = consultations, filter: FilterType = activeFilter) => {
    switch (filter) {
      case 'ACTIVE':
        setFilteredConsultations(data.filter(c => 
          c.status === 'SUBMITTED_BY_USER' || 
          c.status === 'ASSIGNED_TO_NUTRITIONIST' || 
          c.status === 'UNDER_REVIEW' ||
          c.status === 'SUGGESTIONS_PROVIDED' ||
          c.status === 'USER_FEEDBACK_RECEIVED'
        ));
        break;
      case 'FINALIZED':
        setFilteredConsultations(data.filter(c => c.status === 'PLAN_FINALIZED'));
        break;
      case 'COMPLETED':
        setFilteredConsultations(data.filter(c => 
          c.status === 'CLOSED' || 
          c.status === 'CANCELLED_BY_USER' || 
          c.status === 'CANCELLED_BY_ADMIN'
        ));
        break;
      case 'ALL':
      default:
        setFilteredConsultations(data);
        break;
    }
  };

  useEffect(() => {
    filterConsultations();
  }, [activeFilter, consultations]);

  // Handle refreshing
  const handleRefresh = () => {
    fetchConsultations(0, true);
  };

  // Handle loading more items
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchConsultations(currentPage + 1);
    }
  };

  // Change active filter
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  // Get status badge styles
  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'SUBMITTED_BY_USER':
        return {
          backgroundColor: '#E5FFF4',
          textColor: '#18853B',
          text: 'Submitted'
        };
      case 'ASSIGNED_TO_NUTRITIONIST':
        return {
          backgroundColor: '#E5F6FF',
          textColor: '#007AFF',
          text: 'Assigned'
        };
      case 'UNDER_REVIEW':
        return {
          backgroundColor: '#FFF9E5',
          textColor: '#FF8C00',
          text: 'Under Review'
        };
      case 'SUGGESTIONS_PROVIDED':
        return {
          backgroundColor: '#E5F6FF',
          textColor: '#007AFF',
          text: 'Feedback Received'
        };
      case 'USER_FEEDBACK_RECEIVED':
        return {
          backgroundColor: '#F0F0F0',
          textColor: '#666',
          text: 'Your Response Sent'
        };
      case 'PLAN_FINALIZED':
        return {
          backgroundColor: '#E5F6FF',
          textColor: '#007AFF',
          text: 'Plan Finalized'
        };
      case 'CLOSED':
        return {
          backgroundColor: '#E5FFF4',
          textColor: '#18853B',
          text: 'Completed'
        };
      case 'CANCELLED_BY_USER':
        return {
          backgroundColor: '#FFEBEA',
          textColor: '#FF3B30',
          text: 'Cancelled by You'
        };
      case 'CANCELLED_BY_ADMIN':
        return {
          backgroundColor: '#FFEBEA',
          textColor: '#FF3B30',
          text: 'Cancelled by Admin'
        };
      default:
        return {
          backgroundColor: '#F0F0F0',
          textColor: '#666',
          text: status
        };
    }
  };

  // Get consultation time elapsed
  const getTimeElapsed = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours > 0) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
  };

  // Render consultation item
  const renderConsultationItem = ({ item }: { item: ConsultationRequest }) => {
    const statusStyle = getStatusBadgeStyles(item.status);
    const timeElapsed = getTimeElapsed(item.updatedAt || item.createdAt);
    
    return (
      <TouchableOpacity 
        style={styles.consultationCard}
        onPress={() => router.push({
          pathname: '/consultation-detail',
          params: { id: item.id }
        })}
      >
        <View style={styles.consultationHeader}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: statusStyle.backgroundColor }
          ]}>
            <Text style={[
              styles.statusText,
              { color: statusStyle.textColor }
            ]}>
              {statusStyle.text}
            </Text>
          </View>
          <Text style={styles.timeElapsed}>{timeElapsed}</Text>
        </View>
        
        <Text style={styles.consultationTitle}>
          Diet Plan Consultation
        </Text>
        
        {item.nutritionistName && (
          <Text style={styles.nutritionistName}>
            with <Text style={styles.nutritionistNameBold}>{item.nutritionistName}</Text>
          </Text>
        )}
        
        <View style={styles.consultationFooter}>
          <View style={styles.messagesInfo}>
            <Ionicons name="chatbubble-outline" size={16} color="#666" />
            <Text style={styles.messagesCount}>
              {item.messages.length} {item.messages.length === 1 ? 'message' : 'messages'}
            </Text>
          </View>
          
          <View style={styles.viewDetailsContainer}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#18853B" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render loading indicator at the bottom when loading more items
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#18853B" />
        <Text style={styles.footerLoaderText}>Loading more...</Text>
      </View>
    );
  };

  // Render filter tabs
  const renderFilterTabs = () => {
    const filters: { key: FilterType, label: string }[] = [
      { key: 'ALL', label: 'All' },
      { key: 'ACTIVE', label: 'Active' },
      { key: 'FINALIZED', label: 'Finalized' },
      { key: 'COMPLETED', label: 'Completed' }
    ];
    
    return (
      <View style={styles.filterTabsContainer}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              activeFilter === filter.key && styles.activeFilterTab
            ]}
            onPress={() => handleFilterChange(filter.key)}
          >
            <Text style={[
              styles.filterTabText,
              activeFilter === filter.key && styles.activeFilterTabText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
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
        <Text style={styles.headerTitle}>My Consultations</Text>
        <TouchableOpacity 
          style={styles.newConsultationButton}
          onPress={() => router.push('/consultation-upload')}
        >
          <Ionicons name="add" size={24} color="#18853B" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#18853B" />
          <Text style={styles.loadingText}>Loading consultations...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchConsultations(0)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredConsultations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="nutrition-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>
            {activeFilter === 'ALL' 
              ? 'No consultations yet' 
              : `No ${activeFilter.toLowerCase()} consultations`}
          </Text>
          <TouchableOpacity 
            style={styles.newButton}
            onPress={() => router.push('/consultation-upload')}
          >
            <Text style={styles.newButtonText}>New Consultation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredConsultations}
          renderItem={renderConsultationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
        />
      )}
      
      {/* Add the BottomTabNavigator with consultations as the active tab */}
      <BottomTabNavigator activeTab="consultations" />
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
  newConsultationButton: {
    padding: 8,
  },
  filterTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeFilterTab: {
    backgroundColor: '#E5FFF4',
  },
  filterTabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#18853B',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
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
  newButton: {
    backgroundColor: '#18853B',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 16,
  },
  newButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  consultationCard: {
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
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeElapsed: {
    color: '#666',
    fontSize: 14,
  },
  consultationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  nutritionistName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  nutritionistNameBold: {
    fontWeight: '600',
    color: '#333',
  },
  consultationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  messagesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messagesCount: {
    marginLeft: 6,
    color: '#666',
    fontSize: 14,
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#18853B',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 4,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  footerLoaderText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  }
});

export default ConsultationsScreen;
