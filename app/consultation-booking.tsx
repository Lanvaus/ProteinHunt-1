import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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
import ApiService from '../services/api-service';

interface NutritionistProfile {
  id: number;
  name: string;
  title: string;
  experience: string;
  imageUrl: string;
  languages: string[];
  consultationTime: string;
  price: number;
  available: boolean;
}

const ConsultationBookingScreen = () => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample nutritionists data based on the image
  const nutritionists: NutritionistProfile[] = [
    {
      id: 1,
      name: 'Dr. Rohith Mehra',
      title: 'Functional Nutritionist',
      experience: '12+ yrs experience',
      imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      languages: ['English', 'Hindi'],
      consultationTime: '30 Min Consultation',
      price: 500,
      available: true,
    },
    {
      id: 2,
      name: 'Dr. Rohith Mehra',
      title: 'Functional Nutritionist',
      experience: '12+ yrs experience',
      imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
      languages: ['English', 'Hindi'],
      consultationTime: '30 Min Consultation',
      price: 500,
      available: true,
    },
    {
      id: 3,
      name: 'Dr. Rohith Mehra',
      title: 'Functional Nutritionist',
      experience: '12+ yrs experience',
      imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      languages: ['English', 'Hindi'],
      consultationTime: '30 Min Consultation',
      price: 500,
      available: true,
    }
  ];

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled === false) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      Alert.alert('Required', 'Please upload a document or image');
      return;
    }

    setLoading(true);

    try {
      // Create form data for the file upload
      const formData = new FormData();
      formData.append('planDocument', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'application/octet-stream'
      } as any);
      
      // Add the notes
      formData.append('userNotes', notes);
      
      // Call API service to submit consultation
      const response = await ApiService.submitConsultation(formData, notes);
      
      if (response.success) {
        Alert.alert(
          'Success', 
          'Consultation request submitted successfully!',
          [{ text: 'OK', onPress: () => router.push('/consultations') }]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to submit consultation');
      }
    } catch (error) {
      console.error('Error submitting consultation:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = (nutritionistId: number) => {
    Alert.alert('Booking Confirmation', 'Are you sure you want to book this consultation?', [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Confirm',
        onPress: () => {
          // Handle booking logic here
          console.log(`Booking confirmed for nutritionist ID: ${nutritionistId}`);
        }
      }
    ]);
  };

  const renderNutritionistCard = (nutritionist: NutritionistProfile) => (
    <View key={nutritionist.id} style={styles.doctorCard}>
      <View style={styles.doctorCardContent}>
        <Image 
          source={{ uri: nutritionist.imageUrl }} 
          style={styles.doctorImage} 
          resizeMode="cover"
        />
        
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{nutritionist.name}</Text>
          <Text style={styles.doctorTitle}>{nutritionist.title}</Text>
          <Text style={styles.doctorExperience}>{nutritionist.experience}</Text>
          <Text style={styles.consultationInfo}>
            {nutritionist.consultationTime} | {nutritionist.languages.join(', ')}
          </Text>
        </View>
      </View>

      <View style={styles.cardButtons}>
        {/* <TouchableOpacity style={styles.viewProfileButton} onPress={() => console.log(`View profile: ${nutritionist.id}`)}>
          <Text style={styles.viewProfileText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.bookButton} 
          onPress={() => handleBooking(nutritionist.id)}
        >
          <Text style={styles.bookButtonText}>Book for Rs. {nutritionist.price}</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Consultation</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for Nutritionist"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="options-outline" size={20} color="#999" style={styles.filterIcon} />
        </View>
        
        {/* Nutritionists List */}
        <View style={styles.nutritionistsContainer}>
          {nutritionists.map(renderNutritionistCard)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 50,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  searchIcon: {
    marginRight: 8,
  },
  filterIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 8,
  },
  nutritionistsContainer: {
    marginBottom: 20,
  },
  doctorCard: {
    backgroundColor: '#ECFFED',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  doctorCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 16,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  doctorTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  doctorExperience: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  consultationInfo: {
    fontSize: 14,
    color: '#666',
  },
  cardButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewProfileButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    alignItems: 'center',
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  bookButton: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#387B45',
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  sectionContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9F4',
    borderWidth: 1,
    borderColor: '#18853B',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18853B',
    marginLeft: 8,
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F4',
    padding: 12,
    borderRadius: 8,
  },
  fileNameText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginHorizontal: 8,
  },
  notesInput: {
    height: 120,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#18853B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default ConsultationBookingScreen;
   