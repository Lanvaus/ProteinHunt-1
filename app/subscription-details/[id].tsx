import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import SubscriptionService, { Subscription } from '../../services/subscription-service';

const SubscriptionDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const fetchSubscriptionDetails = async () => {
    setLoading(true);
    try {
      const activeSubscription = await SubscriptionService.getActiveSubscription();
      if (activeSubscription) {
        setSubscription(activeSubscription);
        setError(null);
      } else {
        setError('Subscription not found');
      }
    } catch (err) {
      console.error('Error fetching subscription details:', err);
      setError('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSubscription = () => {
    Alert.alert(
      'Pause Subscription',
      'Are you sure you want to pause your subscription? You can resume it later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pause', 
          onPress: async () => {
            setProcessingAction(true);
            try {
              const updatedSubscription = await SubscriptionService.pauseSubscription();
              if (updatedSubscription) {
                setSubscription(updatedSubscription);
                Alert.alert('Success', 'Your subscription has been paused');
              } else {
                Alert.alert('Error', 'Failed to pause subscription');
              }
            } catch (error) {
              console.error('Error pausing subscription:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            } finally {
              setProcessingAction(false);
            }
          }
        }
      ]
    );
  };

  const handleResumeSubscription = () => {
    Alert.alert(
      'Resume Subscription',
      'Are you sure you want to resume your subscription?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Resume', 
          onPress: async () => {
            setProcessingAction(true);
            try {
              const updatedSubscription = await SubscriptionService.resumeSubscription();
              if (updatedSubscription) {
                setSubscription(updatedSubscription);
                Alert.alert('Success', 'Your subscription has been resumed');
              } else {
                Alert.alert('Error', 'Failed to resume subscription');
              }
            } catch (error) {
              console.error('Error resuming subscription:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            } finally {
              setProcessingAction(false);
            }
          }
        }
      ]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            setProcessingAction(true);
            try {
              const updatedSubscription = await SubscriptionService.cancelSubscription();
              if (updatedSubscription) {
                setSubscription(updatedSubscription);
                Alert.alert(
                  'Subscription Cancelled',
                  'Your subscription has been cancelled',
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              } else {
                Alert.alert('Error', 'Failed to cancel subscription');
              }
            } catch (error) {
              console.error('Error cancelling subscription:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            } finally {
              setProcessingAction(false);
            }
          }
        }
      ]
    );
  };

  const renderStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#4CAF50';
      case 'PAUSED':
        return '#FF9800';
      case 'CANCELED':
        return '#FF3B30';
      default:
        return '#666666';
    }
  };

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
        <Text style={styles.headerTitle}>Subscription Details</Text>
        <View style={{width: 24}} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#18853B" />
          <Text style={styles.loadingText}>Loading subscription details...</Text>
        </View>
      ) : error || !subscription ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>{error || 'Subscription not found'}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchSubscriptionDetails}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.contentContainer}>
          {/* Subscription Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusHeaderText}>Status</Text>
              <View 
                style={[
                  styles.statusBadge, 
                  { backgroundColor: `${renderStatusColor(subscription.status)}20` }
                ]}
              >
                <Text 
                  style={[
                    styles.statusBadgeText,
                    { color: renderStatusColor(subscription.status) }
                  ]}
                >
                  {subscription.status}
                </Text>
              </View>
            </View>

            <View style={styles.statusDivider} />
            
            <View style={styles.statusDetails}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Plan</Text>
                <Text style={styles.statusValue}>Diet Plan #{subscription.dietPlanId}</Text>
              </View>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Started on</Text>
                <Text style={styles.statusValue}>{SubscriptionService.formatDate(subscription.startDate)}</Text>
              </View>
              
              {subscription.status !== 'CANCELED' && (
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Next billing</Text>
                  <Text style={styles.statusValue}>{SubscriptionService.formatDate(subscription.endDate)}</Text>
                </View>
              )}
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Billing cycle</Text>
                <Text style={styles.statusValue}>
                  ₹{subscription.pricePerCycle} / {SubscriptionService.formatBillingCycle(subscription.billingCycle)}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Payment History Card */}
          <View style={styles.paymentCard}>
            <Text style={styles.cardTitle}>Payment History</Text>
            
            <View style={styles.paymentItem}>
              <View>
                <Text style={styles.paymentDate}>{SubscriptionService.formatDate(subscription.createdAt)}</Text>
                <Text style={styles.paymentMethod}>Credit Card •••• 1234</Text>
              </View>
              <Text style={styles.paymentAmount}>₹{subscription.pricePerCycle}</Text>
            </View>
            
            {/* Add more payment history items here as needed */}
            
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllButtonText}>View All Payments</Text>
              <Ionicons name="chevron-forward" size={16} color="#18853B" />
            </TouchableOpacity>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {subscription.status === 'ACTIVE' && (
              <TouchableOpacity 
                style={styles.pauseButton}
                onPress={handlePauseSubscription}
                disabled={processingAction}
              >
                {processingAction ? (
                  <ActivityIndicator size="small" color="#FF9800" />
                ) : (
                  <>
                    <Ionicons name="pause-circle-outline" size={20} color="#FF9800" />
                    <Text style={styles.pauseButtonText}>Pause Subscription</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            
            {subscription.status === 'PAUSED' && (
              <TouchableOpacity 
                style={styles.resumeButton}
                onPress={handleResumeSubscription}
                disabled={processingAction}
              >
                {processingAction ? (
                  <ActivityIndicator size="small" color="#4CAF50" />
                ) : (
                  <>
                    <Ionicons name="play-circle-outline" size={20} color="#4CAF50" />
                    <Text style={styles.resumeButtonText}>Resume Subscription</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            
            {subscription.status !== 'CANCELED' && (
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancelSubscription}
                disabled={processingAction}
              >
                {processingAction ? (
                  <ActivityIndicator size="small" color="#FF3B30" />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={20} color="#FF3B30" />
                    <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
          
          {/* Support Section */}
          <View style={styles.supportSection}>
            <Text style={styles.supportTitle}>Need Help?</Text>
            <Text style={styles.supportText}>
              If you have any questions about your subscription, please contact our support team.
            </Text>
            <TouchableOpacity style={styles.supportButton}>
              <Ionicons name="mail-outline" size={18} color="#18853B" />
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
          
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
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  statusDetails: {
    marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 15,
    color: '#666',
  },
  statusValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  paymentCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  paymentDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#666',
  },
  paymentAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  viewAllButtonText: {
    fontSize: 15,
    color: '#18853B',
    fontWeight: '600',
    marginRight: 4,
  },
  actionButtonsContainer: {
    margin: 16,
    marginTop: 8,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9E5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  pauseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
    marginLeft: 8,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  resumeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  supportSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F0F9F4',
    borderRadius: 12,
  },
  supportTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#18853B',
  },
  supportButtonText: {
    fontSize: 15,
    color: '#18853B',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SubscriptionDetailsScreen;
