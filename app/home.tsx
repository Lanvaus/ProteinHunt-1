import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Location */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={24} color="#18853B" />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Current location</Text>
              <Text style={styles.locationValue}>Jl. Soekarno Hatta 15A...</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#333" />
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Promotional Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>
                Claim your discount 30% daily now!
              </Text>
              <TouchableOpacity style={styles.orderButton}>
                <Text style={styles.orderButtonText}>Order now</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={require('../assets/images/protein-bowl.png')}
              style={styles.bannerImage}
            />
          </View>
          <View style={styles.bannerIndicators}>
            <View style={[styles.indicator, styles.activeIndicator]} />
            <View style={styles.indicator} />
            <View style={styles.indicator} />
          </View>
        </View>

        {/* Top Categories */}
        <View style={styles.categoriesHeader}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesContainer}>
          <TouchableOpacity style={styles.categoryCard}>
            <Image
              source={require('../assets/images/protein-picks.png')}
              style={styles.categoryImage}
            />
            <View style={styles.categoryTextOverlay}>
              <Text style={styles.categoryTitle}>Protein Picks</Text>
              <Text style={styles.categorySubtitle}>Lorem ipsum is simply dummy</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryCard}>
            <Image
              source={require('../assets/images/protein-combos.png')}
              style={styles.categoryImage}
            />
            <View style={styles.categoryTextOverlay}>
              <Text style={styles.categoryTitle}>Protein Combos</Text>
              <Text style={styles.categorySubtitle}>Lorem ipsum is simply dummy</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Nutritionist Consultation */}
        <View style={styles.nutritionistCard}>
          <View style={styles.nutritionistTextContainer}>
            <Text style={styles.nutritionistTitle}>Consult a Certified Nutritionist</Text>
            <TouchableOpacity style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Book Consultation</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={require('../assets/images/nutritionist.png')}
            style={styles.nutritionistImage}
          />
        </View>

        {/* Feature Cards */}
        <View style={styles.featureCardsContainer}>
          <TouchableOpacity style={styles.featureCard}>
            <Ionicons name="arrow-up-outline" size={28} color="#18853B" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Diet Plan</Text>
              <Text style={styles.featureDescription}>Upload your diet or choose a curated one</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.featureCard}>
            <MaterialCommunityIcons name="bowl-mix" size={28} color="#18853B" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Build-a-Bowl</Text>
              <Text style={styles.featureDescription}>Customize your bowl</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#18853B" />
          <View style={styles.activeNavDot} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#999" />
        </TouchableOpacity>
        <View style={styles.navCenterItem}>
          <View style={styles.navCenterButton}>
            <Ionicons name="locate" size={24} color="#FFF" />
          </View>
        </View>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbox-outline" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="cart-outline" size={24} color="#999" />
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#888',
  },
  locationValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  notificationButton: {
    padding: 8,
  },
  banner: {
    backgroundColor: '#4FAF5A',
    borderRadius: 16,
    margin: 14, // increased from 12
    padding: 14, // increased from 12
    overflow: 'hidden',
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bannerTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  bannerTitle: {
    fontSize: 18, // reduced from 20
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10, // reduced from 15
  },
  bannerImage: {
    width: 100, // reduced from 120
    height: 100, // reduced from 120
    resizeMode: 'contain',
  },
  orderButton: {
    backgroundColor: '#000',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  orderButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  bannerIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5, // reduced from 10
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 10, // reduced from 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#999',
    fontSize: 14,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    height: 120, // reduced from 150
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12, // reduced from 16
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryTextOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
  },
  categoryTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  categorySubtitle: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
  },
  nutritionistCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF9E5',
    borderRadius: 16,
    padding: 12, // reduced from 16
    marginVertical: 6, // reduced from 8
    marginHorizontal: 16,
  },
  nutritionistTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nutritionistTitle: {
    fontSize: 16, // reduced from 18
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12, // reduced from 16
  },
  bookButton: {
    backgroundColor: '#18853B',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  bookButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  nutritionistImage: {
    width: 80, // reduced from 100
    height: 100, // reduced from 120
    resizeMode: 'contain',
  },
  featureCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12, // reduced from 16
    marginBottom: 70, // reduced from 80
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#F0F9F4',
    borderRadius: 16,
    padding: 12, // reduced from 16
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
  },
  navigationBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  activeNavDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#18853B',
    position: 'absolute',
    bottom: 10,
  },
  navCenterItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCenterButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#18853B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 15,
  },
});

export default HomeScreen;
