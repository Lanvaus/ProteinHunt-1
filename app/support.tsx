import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Linking,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface FAQItem {
  question: string;
  answer: string;
  isExpanded: boolean;
}

const SupportScreen = () => {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      question: 'How do I track my order?',
      answer: 'You can track your order by going to "My Orders" section in the app and clicking on the specific order. You will see real-time updates on the status of your delivery.',
      isExpanded: false
    },
    {
      question: 'How do I cancel my order?',
      answer: 'You can cancel your order within 5 minutes of placing it by going to "My Orders" section and selecting the cancel option. After 5 minutes, please contact our customer support for assistance.',
      isExpanded: false
    },
    {
      question: 'Are there any delivery charges?',
      answer: 'Delivery charges depend on your location and order value. Orders above ₹500 typically qualify for free delivery within our service areas.',
      isExpanded: false
    },
    {
      question: 'How do I modify my diet plan?',
      answer: 'You can modify your diet plan by navigating to "Diet Plans" section and selecting the current plan. From there, you can make changes or create a new customized plan.',
      isExpanded: false
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept credit/debit cards, UPI, net banking, and popular digital wallets. All transactions are secure and encrypted.',
      isExpanded: false
    }
  ]);

  const toggleFAQ = (index: number) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index].isExpanded = !updatedFaqs[index].isExpanded;
    setFaqs(updatedFaqs);
  };

  const handleCall = () => {
    Linking.openURL('tel:+919876543210');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@proteinhunt.com');
  };

  const handleChat = () => {
    // This would normally open your chat interface
    router.push('/chat-support');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.welcomeText}>How can we help you today?</Text>
        
        {/* Contact Options */}
        <View style={styles.contactOptionsContainer}>
          {/* <TouchableOpacity style={styles.contactOption} onPress={handleChat}>
            <View style={[styles.iconContainer, styles.chatIcon]}>
              <Ionicons name="chatbubble-outline" size={24} color="#FFF" />
            </View>
            <Text style={styles.contactOptionTitle}>Live Chat</Text>
            <Text style={styles.contactOptionDescription}>Chat with our support team</Text>
          </TouchableOpacity> */}
          
          {/* <TouchableOpacity style={styles.contactOption} onPress={handleEmail}>
            <View style={[styles.iconContainer, styles.emailIcon]}>
              <Ionicons name="mail-outline" size={24} color="#FFF" />
            </View>
            <Text style={styles.contactOptionTitle}>Email</Text>
            <Text style={styles.contactOptionDescription}>support@proteinhunt.com</Text>
          </TouchableOpacity> */}
          
          {/* <TouchableOpacity style={styles.contactOption} onPress={handleCall}>
            <View style={[styles.iconContainer, styles.callIcon]}>
              <Ionicons name="call-outline" size={24} color="#FFF" />
            </View>
            <Text style={styles.contactOptionTitle}>Call Us</Text>
            <Text style={styles.contactOptionDescription}>9AM - 6PM (Mon-Sat)</Text>
          </TouchableOpacity> */}
        </View>
        
        {/* Operating Hours */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#18853B" />
            <Text style={styles.infoText}>Support Hours: 9:00 AM - 9:00 PM, Monday to Saturday</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#18853B" />
            <Text style={styles.infoText}>Service available in select cities only</Text>
          </View>
        </View>
        
        {/* FAQs Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {faqs.map((faq, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.faqItem}
              onPress={() => toggleFAQ(index)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons 
                  name={faq.isExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#666" 
                />
              </View>
              
              {faq.isExpanded && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Bottom space for navigation */}
        <View style={{height: 80}} />
      </ScrollView>
      
      {/* Quick Action */}
      <View style={styles.quickActionContainer}>
        {/* <TouchableOpacity style={styles.quickActionButton} onPress={handleChat}>
          <Ionicons name="chatbubble-ellipses" size={22} color="#FFF" />
          <Text style={styles.quickActionText}>Start Chat</Text>
        </TouchableOpacity> */}
      </View>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  contactOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  contactOption: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '31%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  chatIcon: {
    backgroundColor: '#18853B',
  },
  emailIcon: {
    backgroundColor: '#FF9500',
  },
  callIcon: {
    backgroundColor: '#007AFF',
  },
  contactOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactOptionDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  faqSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 14,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  quickActionContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 100,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18853B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#18853B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  quickActionText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SupportScreen;
