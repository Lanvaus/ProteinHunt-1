import ApiService from './api-service';

export interface NutritionValues {
  Protein?: number;
  Carbohydrates?: number; 
  Fats?: number;
  [key: string]: number | undefined;
}

export interface CustomizationOption {
  id: number;
  name: string;
  description?: string;
  price: number;
  vegetarian: boolean;
  imageUrl?: string;
  caloriesKcal: number;
  nutritionValues?: NutritionValues;
}

export interface CustomMealOptions {
  bases: CustomizationOption[];
  addOns: CustomizationOption[];
  proteinOptions: CustomizationOption[];
}

export interface CustomMealSelection {
  baseComponentId: number;
  addOnIds: number[];
  proteinOptionId: number; // For backward compatibility
  proteinOptionIds: number[]; // Support multiple protein selections
  totalCalories: number;
  totalPrice: number;
}

export interface SavedCustomMeal {
  id: number;
  customMealName: string;
  baseComponentId: number;
  selectedProteinOptionIds: number[];
  selectedAddOnIds: number[];
  baseComponentNameSnapshot: string;
  selectedProteinOptionNamesSnapshot: string[];
  selectedAddOnNamesSnapshot: string[];
  totalServingWeightGramsSnapshot: number;
  totalCaloriesKcalSnapshot: number;
  totalNutritionValuesSnapshot: {
    [key: string]: number;
  };
  totalPriceSnapshot: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveCustomMealRequest {
  customMealName: string;
  baseComponentId: number;
  proteinOptionIds: number[];
  addOnIds: number[];
}

export interface SavedCustomMealDetails {
  customMealName: string;
  baseComponentId: number;
  proteinOptionIds: number[];
  addOnIds: number[];
}

class CustomMealService {
  async getCustomMealOptions(): Promise<CustomMealOptions | null> {
    const response = await ApiService.authenticatedRequest<CustomMealOptions>('/customize-meal/options');
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  }

  async addCustomMealToCart(selection: CustomMealSelection): Promise<boolean> {
    const response = await ApiService.authenticatedRequest('/cart/items/custom', 'POST', selection);
    return response.success;
  }

  async saveCustomMeal(request: SaveCustomMealRequest): Promise<SavedCustomMeal | null> {
    const response = await ApiService.authenticatedRequest<SavedCustomMeal>('/customize-meal/save', 'POST', request);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  }

  async getSavedCustomMeals(): Promise<SavedCustomMeal[] | null> {
    const response = await ApiService.authenticatedRequest<SavedCustomMeal[]>('/customize-meal/save');
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  async updateSavedCustomMeal(savedMealId: number, request: SaveCustomMealRequest): Promise<SavedCustomMeal | null> {
    const response = await ApiService.authenticatedRequest<SavedCustomMeal>(`/customize-meal/save/${savedMealId}`, 'PUT', request);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  }

  async getSavedCustomMealById(savedMealId: number): Promise<SavedCustomMealDetails | null> {
    const response = await ApiService.authenticatedRequest<SavedCustomMealDetails>(`/customize-meal/save/${savedMealId}`);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  }

  async deleteSavedCustomMeal(savedMealId: number): Promise<boolean> {
    const response = await ApiService.authenticatedRequest(`/customize-meal/save/${savedMealId}`, 'DELETE');
    return response.success;
  }
}

export default new CustomMealService();
