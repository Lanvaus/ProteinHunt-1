import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
import ApiService from '../services/api-service';

const ConsultationUploadScreen = () => {
  const router = useRouter();
  const [document, setDocument] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [userNotes, setUserNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelectDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) return;
      
      setDocument(result.assets[0]);
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const handleSubmit = async () => {
    if (!document) {
      Alert.alert('Required', 'Please select a diet plan document to upload');
      return;
    }

    if (!userNotes.trim()) {
      Alert.alert('Required', 'Please provide some notes about your diet plan or goals');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      
      // Create form data for document
      formData.append('planDocument', {
        uri: document.uri,
        name: document.name,
        type: document.mimeType
      } as any);
      
      // Add user notes
      formData.append('userNotes', userNotes);

      const response = await ApiService.submitConsultation(formData as any, userNotes);
      
      if (response.success && response.data) {
        Alert.alert(
          'Success', 
          'Your diet plan has been submitted for consultation',
          [
            { 
              text: 'View Consultation', 
              onPress: () => router.push({
                pathname: '/consultation-detail',
                params: { id: response.data.id }
              })
            }
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to submit consultation request');
      }
    } catch (error) {
      console.error('Error submitting consultation:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nutritionist Consultation</Text>
          <View style={{width: 24}} />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color="#18853B" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Upload your current diet plan and provide details about your goals. Our nutritionist will review and suggest improvements.
            </Text>
          </View>
          
          {/* Document Upload Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upload Diet Plan</Text>
            <Text style={styles.sectionSubtitle}>Upload a PDF, Word document, or image of your current diet plan</Text>
            
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={handleSelectDocument}
            >
              <Ionicons name="cloud-upload-outline" size={32} color="#18853B" />
              <Text style={styles.uploadText}>
                {document ? 'Change Document' : 'Select Document'}
              </Text>
            </TouchableOpacity>
            
            {document && (
              <View style={styles.selectedFileCard}>
                <Ionicons 
                  name={document.mimeType?.includes('pdf') ? "document" : "image-outline"} 
                  size={24} 
                  color="#18853B" 
                />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={1}>{document.name}</Text>
                  <Text style={styles.fileSize}>
                    {(document.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setDocument(null)}>
                  <Ionicons name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Notes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <Text style={styles.sectionSubtitle}>Please provide any additional details about your diet goals</Text>
            
            <TextInput
              style={styles.notesInput}
              placeholder="Describe your fitness goals, dietary preferences, restrictions, etc."
              placeholderTextColor="#999"
              multiline
              value={userNotes}
              onChangeText={setUserNotes}
              textAlignVertical="top"
            />
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!document || !userNotes.trim()) && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={!document || !userNotes.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit for Consultation</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Add the bottom tab navigator */}
      {/* <BottomTabNavigator activeTab="consultations" /> */}
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
  contentContainer: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#E5FFF4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 24,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#18853B',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#18853B',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9F4',
  },
  uploadText: {
    color: '#18853B',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  selectedFileCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fileDetails: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  notesInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    height: 120,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  submitButton: {
    backgroundColor: '#18853B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ConsultationUploadScreen;
