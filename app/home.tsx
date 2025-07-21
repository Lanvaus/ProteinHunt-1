import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
      <LinearGradient
        colors={['#F5F5F5', '#E8F5E9']}
        style={StyleSheet.absoluteFill}
      />
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
        <LinearGradient
          colors={['#4FAF5A', '#18853B']}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.banner}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>
                Claim your {'\n'} discount 30%  {'\n'} daily now!
              </Text>
              <TouchableOpacity style={styles.orderButton}>
                <Text style={styles.orderButtonText}>Order now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bannerImageWrapper}>
              <Image
                source={require('../assets/images/protein-bowl.png')}
                style={styles.bannerImage}
              />
            </View>
          </View>
          <View style={styles.bannerIndicators}>
            <View style={[styles.indicator, styles.activeIndicator]} />
            <View style={styles.indicator} />
            <View style={styles.indicator} />
          </View>
        </LinearGradient>

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
          <View style={styles.nutritionistImageWrapper}>
            <Image
              source={require('../assets/images/nutritionist.png')}
              style={styles.nutritionistImage}
            />
          </View>
        </View>

        {/* Feature Cards */}
        <View style={styles.featureCardsContainer}>
          <TouchableOpacity style={styles.featureCard}>
            <Image
              source={require('../assets/images/diet-plan.png')}
              style={styles.featureImage}
            />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Diet Plan</Text>
              <Text style={styles.featureDescription}>Upload your diet or choose a curated one</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.featureCard}>
            <Image
              source={require('../assets/images/build-a-bowl.png')}
              style={styles.featureImage}
            />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Build-a-Bowl</Text>
              <Text style={styles.featureDescription}>Customize your bowl</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Navigation Bar */}
      <LinearGradient
        colors={['#FFFFFF', '#E8F5E9']}
        style={styles.navigationBar}
      >
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#18853B" />
          <View style={styles.activeNavDot} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#999" />
        </TouchableOpacity>
        <View style={styles.navCenterItem}>
          <LinearGradient
            colors={['#4FAF5A', '#18853B']}
            style={styles.navCenterButton}
          >
            <Ionicons name="locate" size={24} color="#FFF" />
          </LinearGradient>
        </View>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbox-outline" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="cart-outline" size={24} color="#999" />
        </TouchableOpacity>
      </LinearGradient>
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
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 2,
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
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  locationValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '700',
  },
  notificationButton: {
    padding: 10,
    backgroundColor: '#F0F9F4',
    borderRadius: 16,
    elevation: 2,
  },
  banner: {
    borderRadius: 20,
    margin: 16,
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#4FAF5A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTextContainer: {
    flex: 1,
    paddingRight: 10,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  bannerImageWrapper: {
    // backgroundColor: '#fff',
    borderRadius: 60,
    padding: 15,
    shadowColor: '#4FAF5A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    transform: [{ scale: 1.6 }],
  },
  bannerImage: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
    borderRadius: 55,
  },
  orderButton: {
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  orderButtonText: {
    color: '#18853B',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  bannerIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#18853B',
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 0.3,
  },
  seeAllText: {
    color: '#18853B',
    fontSize: 15,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: '#fff',
    shadowColor: '#4FAF5A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    elevation: 6,
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 16,
  },
  categoryTextOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(24, 133, 59, 0.7)',
    padding: 10,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  categoryTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 2,
  },
  categorySubtitle: {
    color: 'white',
    fontSize: 13,
    opacity: 0.85,
  },
  nutritionistCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF9E5',
    borderRadius: 18,
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 18,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 6,
    alignItems: 'center',
  },
  nutritionistTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nutritionistTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  bookButton: {
    backgroundColor: '#18853B',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    marginTop: 2,
    shadowColor: '#18853B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 4,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  nutritionistImageWrapper: {
    // backgroundColor: '#fff',
    borderRadius: 50,
    padding: 4,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 6,
  },
  nutritionistImage: {
    width: 90,
    height: 110,
    resizeMode: 'contain',
    borderRadius: 45,
    transform: [{ scale: 1.9 }],
  },
  featureCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 16,
    marginBottom: 80,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#F0F9F4',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#18853B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 6,
  },
  featureTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666',
    opacity: 0.9,
  },
  featureImage: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
    marginRight: 10,
  },
  navigationBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 74,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingHorizontal: 10,
    shadowColor: '#18853B',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 8,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: 'transparent',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
    flex: 1,
  },
  activeNavDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#18853B',
    position: 'absolute',
    bottom: 12,
  },
  navCenterItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navCenterButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#18853B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 18,
  },
});

export default HomeScreen;
