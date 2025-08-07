import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Linking,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
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
  status: 'SUBMITTED_BY_USER' | 'IN_REVIEW' | 'FINALIZED' | 'ACCEPTED' | 'REJECTED';
  finalizedPlanDetails: string;
  messages: ConsultationMessage[];
  createdAt: string;
  updatedAt: string;
}

const ConsultationDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const consultationId = parseInt(id as string, 10);
  
  const [consultation, setConsultation] = useState<ConsultationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);

  // Fetch consultation details
  const fetchConsultationDetails = async () => {
    try {
      const response = await ApiService.getConsultationDetails(consultationId);
      
      if (response.success && response.data) {
        setConsultation(response.data);
      } else {
        setError(response.error || 'Failed to fetch consultation details');
      }
    } catch (error) {
      console.error('Error fetching consultation details:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConsultationDetails();
    
    // Set up polling for new messages (every 15 seconds)
    const interval = setInterval(() => {
      if (!sending) {
        fetchConsultationDetails();
      }
    }, 15000);
    
    return () => clearInterval(interval);
  }, [consultationId]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    try {
      const response = await ApiService.sendConsultationMessage(consultationId, message);
      
      if (response.success) {
        setMessage('');
        // Refresh consultation to get the new message
        await fetchConsultationDetails();
        // Scroll to bottom
        setTimeout(() => {
          if (flatListRef.current && consultation?.messages.length) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 200);
      } else {
        Alert.alert('Error', response.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSending(false);
    }
  };

  // Handle refreshing
  const handleRefresh = () => {
    setRefreshing(true);
    fetchConsultationDetails();
  };

  // Handle opening document
  const handleOpenDocument = () => {
    if (consultation?.uploadedPlanDocumentUrl) {
      Linking.openURL(consultation.uploadedPlanDocumentUrl);
    }
  };

  // Handle accepting the diet plan
  const handleAcceptPlan = async () => {
    Alert.alert(
      'Accept Diet Plan',
      'Are you sure you want to accept this diet plan? Your subscription will be activated.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          style: 'default',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await ApiService.acceptDietPlan(consultationId);
              
              if (response.success && response.data) {
                setConsultation(response.data);
                Alert.alert('Success', 'Diet plan accepted and subscription activated!');
              } else {
                Alert.alert('Error', response.error || 'Failed to accept diet plan');
              }
            } catch (error) {
              console.error('Error accepting diet plan:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Handle rejecting the diet plan
  const handleRejectPlan = async () => {
    Alert.alert(
      'Reject Diet Plan',
      'Are you sure you want to reject this diet plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await ApiService.rejectDietPlan(consultationId);
              
              if (response.success && response.data) {
                setConsultation(response.data);
                Alert.alert('Diet plan rejected', 'Your feedback has been submitted.');
              } else {
                Alert.alert('Error', response.error || 'Failed to reject diet plan');
              }
            } catch (error) {
              console.error('Error rejecting diet plan:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Render chat message
  const renderMessage = ({ item }: { item: ConsultationMessage }) => {
    const isUser = item.senderId === consultation?.userId;
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.nutritionistMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.nutritionistMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.nutritionistMessageText
          ]}>
            {item.messageContent}
          </Text>
          <Text style={[
            styles.messageTime,
            isUser ? styles.userMessageTime : styles.nutritionistMessageTime
          ]}>
            {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {!isUser && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}
      </View>
    );
  };

  // Render status badge based on consultation status
  const renderStatusBadge = () => {
    if (!consultation) return null;

    let bgColor = '#E5FFF4';
    let textColor = '#18853B';
    let statusText = 'Submitted';

    switch (consultation.status) {
      case 'IN_REVIEW':
        bgColor = '#FFF9E5';
        textColor = '#FF8C00';
        statusText = 'In Review';
        break;
      case 'FINALIZED':
        bgColor = '#E5F6FF';
        textColor = '#007AFF';
        statusText = 'Finalized';
        break;
      case 'ACCEPTED':
        bgColor = '#E5FFF4';
        textColor = '#18853B';
        statusText = 'Accepted';
        break;
      case 'REJECTED':
        bgColor = '#FFEBEA';
        textColor = '#FF3B30';
        statusText = 'Rejected';
        break;
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
        <Text style={[styles.statusBadgeText, { color: textColor }]}>{statusText}</Text>
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
        <Text style={styles.headerTitle}>Consultation Details</Text>
        {renderStatusBadge()}
      </View>

      {loading && !consultation ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#18853B" />
          <Text style={styles.loadingText}>Loading consultation details...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchConsultationDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : consultation ? (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
          keyboardVerticalOffset={90}
        >
          <View style={styles.content}>
            {/* Consultation Info */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nutritionist:</Text>
                <Text style={styles.infoValue}>
                  {consultation.nutritionistName || 'Pending Assignment'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Submitted on:</Text>
                <Text style={styles.infoValue}>
                  {new Date(consultation.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Document:</Text>
                <TouchableOpacity onPress={handleOpenDocument}>
                  <Text style={styles.documentLink}>View Document</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Finalized Diet Plan (if status is FINALIZED or ACCEPTED) */}
            {(consultation.status === 'FINALIZED' || consultation.status === 'ACCEPTED') && consultation.finalizedPlanDetails && (
              <View style={styles.finalizedPlanCard}>
                <Text style={styles.finalizedPlanTitle}>Diet Plan</Text>
                <Text style={styles.finalizedPlanContent}>{consultation.finalizedPlanDetails}</Text>
              </View>
            )}
            
            {/* Accept/Reject buttons (if status is FINALIZED) */}
            {consultation.status === 'FINALIZED' && (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={styles.rejectButton}
                  onPress={handleRejectPlan}
                >
                  <Text style={styles.rejectButtonText}>Reject Plan</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={handleAcceptPlan}
                >
                  <Text style={styles.acceptButtonText}>Accept Plan</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Status message if subscription is active */}
            {consultation.status === 'ACCEPTED' && (
              <View style={styles.subscriptionActiveCard}>
                <Ionicons name="checkmark-circle" size={24} color="#18853B" />
                <Text style={styles.subscriptionActiveText}>
                  Diet plan accepted! Your subscription is now active.
                </Text>
              </View>
            )}
            
            {/* Chat Messages */}
            <Text style={styles.chatTitle}>Consultation Chat</Text>
            
            {consultation.messages.length === 0 ? (
              <View style={styles.emptyChat}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color="#CCC" />
                <Text style={styles.emptyChatText}>
                  No messages yet. Start the conversation with your nutritionist.
                </Text>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={consultation.messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.messagesList}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                onContentSizeChange={() => {
                  if (flatListRef.current) {
                    flatListRef.current.scrollToEnd({ animated: false });
                  }
                }}
                onLayout={() => {
                  if (flatListRef.current) {
                    flatListRef.current.scrollToEnd({ animated: false });
                  }
                }}
              />
            )}
            
            {/* Message Input */}
            {consultation.status !== 'ACCEPTED' && consultation.status !== 'REJECTED' && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Type a message..."
                  placeholderTextColor="#999"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                />
                <TouchableOpacity 
                  style={[
                    styles.sendButton,
                    (!message.trim() || sending) && styles.disabledSendButton
                  ]}
                  onPress={handleSendMessage}
                  disabled={!message.trim() || sending}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Ionicons name="send" size={20} color="#FFF" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      ) : null}
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
    flex: 1,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
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
  infoCard: {
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  documentLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  finalizedPlanCard: {
    backgroundColor: '#E5FFF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  finalizedPlanTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18853B',
    marginBottom: 8,
  },
  finalizedPlanContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rejectButton: {
    backgroundColor: '#FFEBEA',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 0.48,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#18853B',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 0.48,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  subscriptionActiveCard: {
    backgroundColor: '#E5FFF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionActiveText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#18853B',
    fontWeight: '600',
    flex: 1,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyChatText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  messagesList: {
    flexGrow: 1,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  nutritionistMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    minWidth: 80,
  },
  userMessageBubble: {
    backgroundColor: '#18853B',
    borderBottomRightRadius: 4,
  },
  nutritionistMessageBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#FFF',
  },
  nutritionistMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  nutritionistMessageTime: {
    color: '#999',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: Platform.OS === 'ios' ? 16 : 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#18853B',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  disabledSendButton: {
    backgroundColor: '#CCC',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ConsultationDetailScreen;
