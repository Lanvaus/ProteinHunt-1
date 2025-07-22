import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Sample product data
const productData = [
  {
    id: '1',
    name: 'Grilled Paneer Cubes',
    price: 90,
    rating: 4.5,
    protein: 25,
    carbs: 15,
    fat: 8,
    image: { uri: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=2070' },
    description: 'Fresh cottage cheese cubes grilled to perfection with herbs and spices, ideal for protein-rich diet.',
  },
  {
    id: '2',
    name: 'Grilled Chicken Bowl',
    price: 120,
    rating: 4.7,
    protein: 30,
    carbs: 20,
    fat: 5,
    image: { uri: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=2070' },
    description: 'Tender grilled chicken breast with mixed vegetables and brown rice. High in protein and perfect for muscle building.',
  },
  {
    id: '3',
    name: 'Protein Smoothie Bowl',
    price: 95,
    rating: 4.2,
    protein: 18,
    carbs: 22,
    fat: 6,
    image: { uri: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?q=80&w=1974' },
    description: 'A refreshing blend of whey protein, berries, banana and almond milk topped with nuts and seeds.',
  },
  {
    id: '4',
    name: 'Quinoa Protein Salad',
    price: 105,
    rating: 4.3,
    protein: 15,
    carbs: 25,
    fat: 7,
    image: { uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070' },
    description: 'Nutrient-rich quinoa with mixed vegetables, lean protein and a light vinaigrette dressing. Perfect for a healthy lunch.',
  },
  {
    id: '5',
    name: 'Egg White Omelette',
    price: 85,
    rating: 4.4,
    protein: 22,
    carbs: 8,
    fat: 4,
    image: { uri: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=2020' },
    description: 'Fluffy egg white omelette filled with spinach, tomatoes and low-fat cheese. High protein, low carb option.',
  },
  {
    id: '6',
    name: 'Tofu Stir Fry Bowl',
    price: 95,
    rating: 4.1,
    protein: 20,
    carbs: 18,
    fat: 10,
    image: { uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080' },
    description: 'Plant-based protein from tofu stir-fried with colorful vegetables in a light soy sauce.',
  },
];

const ProteinPicksScreen = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');

  const handleAddToCart = (product) => {
    setCartItems([...cartItems, product]);
  };

  const handleOpenProductModal = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <TouchableOpacity 
        style={styles.productCardInner}
        onPress={() => handleOpenProductModal(item)}
      >
        <Image source={item.image} style={styles.productImage} />
        <View style={styles.productDetails}>
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{item.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
          <Text style={styles.productPrice}>₹ {item.price}</Text>

          <View style={styles.nutritionInfo}>
            <View style={styles.nutritionItem}>
              <View style={styles.nutritionBarContainer}>
                <View style={[styles.nutritionBar, styles.proteinBar]} />
              </View>
              <View style={styles.nutritionTextContainer}>
                <Text style={styles.nutritionValue}>{item.protein}g</Text>
                <Text style={[styles.nutritionLabel, styles.proteinLabel]}>Protein</Text>
              </View>
            </View>
            <View style={styles.nutritionItem}>
              <View style={styles.nutritionBarContainer}>
                <View style={[styles.nutritionBar, styles.carbsBar]} />
              </View>
              <View style={styles.nutritionTextContainer}>
                <Text style={styles.nutritionValue}>{item.carbs}g</Text>
                <Text style={[styles.nutritionLabel, styles.carbsLabel]}>Carbs</Text>
              </View>
            </View>
            <View style={styles.nutritionItem}>
              <View style={styles.nutritionBarContainer}>
                <View style={[styles.nutritionBar, styles.fatBar]} />
              </View>
              <View style={styles.nutritionTextContainer}>
                <Text style={styles.nutritionValue}>{item.fat}g</Text>
                <Text style={[styles.nutritionLabel, styles.fatLabel]}>Fat</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addButtonText}>ADD</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filters = ['All', 'Low Fat', 'High Protein', 'Breakfast'];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F5F5F5', '#E8F5E9']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Protein Picks</Text>
        <View style={{width: 24}} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for Protein Products"
          placeholderTextColor="#999"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={[styles.filtersContainer, { marginBottom: 28 }]}
          contentContainerStyle={[styles.filtersContent, { paddingBottom: 12 }]}
        >
          {filters.map((filter) => (
            <TouchableOpacity 
              key={filter} 
              style={[
                styles.filterTab,
                activeFilter === filter && styles.activeFilterTab
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter && styles.activeFilterText
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product List */}
      <FlatList
        data={productData}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.productList, { paddingTop: 0 }]} // reduce top padding if any
      />

      {/* Cart Summary Bar */}
      {cartItems.length > 0 && (
        <TouchableOpacity style={styles.cartBar}>
          <Text style={styles.cartItemsCount}>{cartItems.length} Item added</Text>
          <View style={styles.cartAction}>
            <Text style={styles.cartActionText}>Go to Cart</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </View>
        </TouchableOpacity>
      )}

      {/* Product Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close-circle" size={28} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>
              {selectedProduct?.name}
            </Text>
            
            <Image 
              source={selectedProduct?.image}
              style={styles.modalImage}
            />
            
            <Text style={styles.modalDescription}>
              {selectedProduct?.description}
            </Text>
            
            <TouchableOpacity 
              style={styles.modalAddButton}
              onPress={() => {
                handleAddToCart(selectedProduct);
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalAddButtonText}>ADD</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  filtersWrapper: {
    backgroundColor: 'transparent',
    zIndex: 10,
    elevation: 10,
  },
  filtersContainer: {
    marginVertical: 8,
  },
  filtersContent: {
    paddingHorizontal: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#E5FFF4',
  },
  filterText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#18853B',
    fontWeight: '600',
  },
  productList: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  productCardInner: {
    flexDirection: 'row',
    padding: 16,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  productDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
    color: '#333',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 12,
  },
  nutritionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginRight: 10,
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  nutritionBarContainer: {
    height: 40,
    width: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    justifyContent: 'flex-end',
    marginRight: 8,
  },
  nutritionBar: {
    width: 6,
    height: '80%', // This will be dynamically calculated in a real app
    borderRadius: 3,
  },
  nutritionTextContainer: {
    justifyContent: 'center',
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  nutritionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  proteinLabel: {
    color: '#4CAF50',
  },
  carbsLabel: {
    color: '#FFC107',
  },
  fatLabel: {
    color: '#F44336',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  cartBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#18853B',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#18853B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  cartItemsCount: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  cartAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartActionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
    color: '#333',
  },
  modalImage: {
    width: '80%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
  modalAddButton: {
    backgroundColor: '#18853B',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 12,
    marginTop: 10,
  },
  modalAddButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProteinPicksScreen;
