import { Cart } from '../context/CartContext';
import TokenService from './token-service';

const BASE_URL = 'https://proteinhunt.in/api/v1';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ValidateTokenResponse {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface DeliveryCheckResponse {
  canDeliver: boolean;
  message: string;
  serviceableKitchenId: number;
  serviceableKitchenName: string;
  distanceToKitchenKm: number;
}

interface Meal {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  servingWeightGrams: number;
  caloriesKcal: number;
  nutritionValues: {
    [key: string]: number;
  };
  price: number;
  mealType: string;
  mealCategory: {
    id: number;
    name: string;
    imageUrl: string;
  };
  vegetarian: boolean;
}

interface Address {
  id?: number;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface OrderRequest {
  deliveryAddressId: number;  // Changed from addressId to deliveryAddressId
  paymentMethod: string;
  specialInstructions?: string;
}

interface OrderResponse {
  orderId: number;
  status: string;
  estimatedDeliveryTime: string;
  totalAmount: number;
}

interface OrderHistoryResponse {
  content: Order[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Consultation interfaces
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

// Add this interface with the paginated response structure
interface ConsultationPageResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  content: ConsultationRequest[];
}

class ApiService {
  static async sendOtp(phoneNumber: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${BASE_URL}/auth/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to send OTP',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      };
    }
  }

  static async verifyOtp(phoneNumber: string, otp: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${BASE_URL}/auth/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Invalid OTP',
        };
      }

      // If verification is successful, save the JWT token
      if (data.jwtResponse && data.jwtResponse.token) {
        await TokenService.saveAuthData(data.jwtResponse);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      };
    }
  }

  static async validateToken(): Promise<ApiResponse<ValidateTokenResponse>> {
    try {
      const token = await TokenService.getToken();
      
      if (!token) {
        return {
          success: false,
          error: 'No token found',
        };
      }
      
      const response = await fetch(`${BASE_URL}/auth/validate-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // If token validation fails, clear stored data
        await TokenService.clearAuthData();
        return {
          success: false,
          error: 'Token is invalid or expired',
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      };
    }
  }

  static async checkDeliveryAvailability(latitude: number, longitude: number): Promise<ApiResponse<DeliveryCheckResponse>> {
    try {
      const response = await fetch(`${BASE_URL}/location/check-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to check delivery availability',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      };
    }
  }

  static async getMeals(mealType?: string, mealCategoryId?: number): Promise<ApiResponse<Meal[]>> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (mealType) queryParams.append('mealType', mealType);
      if (mealCategoryId) queryParams.append('mealCategory', mealCategoryId.toString());

      const queryString = queryParams.toString();
      const url = `/meals${queryString ? `?${queryString}` : ''}`;

      // Use the authenticatedRequest helper method to include the auth token
      return await this.authenticatedRequest<Meal[]>(url);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      };
    }
  }

  // Cart related methods
  static async getCart(): Promise<ApiResponse<Cart>> {
    return await this.authenticatedRequest<Cart>('/cart');
  }

  static async addToCart(mealId: number, quantity: number): Promise<ApiResponse<any>> {
    return await this.authenticatedRequest('/cart/items', 'POST', { mealId, quantity });
  }

  static async updateCartItem(cartItemId: number, quantity: number): Promise<ApiResponse<any>> {
    return await this.authenticatedRequest(`/cart/items/${cartItemId}`, 'PUT', { quantity });
  }

  static async removeFromCart(cartItemId: number): Promise<ApiResponse<any>> {
    return await this.authenticatedRequest(`/cart/items/${cartItemId}`, 'DELETE');
  }

  // Checkout related methods
  static async getSavedAddresses(): Promise<ApiResponse<Address[]>> {
    return await this.authenticatedRequest<Address[]>('/user/addresses');
  }

  static async saveAddress(address: Address): Promise<ApiResponse<Address>> {
    return await this.authenticatedRequest<Address>('/user/addresses', 'POST', address);
  }

  static async placeOrder(orderRequest: OrderRequest): Promise<ApiResponse<OrderResponse>> {
    return await this.authenticatedRequest<OrderResponse>('/orders', 'POST', orderRequest);
  }

  static async applyPromoCode(code: string): Promise<ApiResponse<{ discount: number }>> {
    return await this.authenticatedRequest<{ discount: number }>('/cart/promo', 'POST', { code });
  }

  // Get order details by ID
  static async getOrderDetails(orderId: number): Promise<ApiResponse<any>> {
    return await this.authenticatedRequest(`/orders/${orderId}`);
  }

  static async getOrderHistory(page: number = 1, pageSize: number = 10): Promise<ApiResponse<OrderHistoryResponse>> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });
    
    return await this.authenticatedRequest<OrderHistoryResponse>(`/orders?${queryParams.toString()}`);
  }

  // Consultation related methods
  static async submitConsultation(planDocument: FormData, userNotes: string): Promise<ApiResponse<ConsultationRequest>> {
    const formData = new FormData();
    formData.append('planDocument', planDocument);
    formData.append('userNotes', userNotes);
    
    return await this.authenticatedRequest<ConsultationRequest>('/user/consultations', 'POST', formData);
  }

  static async getConsultationDetails(requestId: number): Promise<ApiResponse<ConsultationRequest>> {
    return await this.authenticatedRequest<ConsultationRequest>(`/user/consultations/${requestId}`);
  }

  static async sendConsultationMessage(requestId: number, messageContent: string): Promise<ApiResponse<ConsultationMessage>> {
    return await this.authenticatedRequest<ConsultationMessage>(
      `/user/consultations/${requestId}/messages`, 
      'POST', 
      { messageContent }
    );
  }

  // Update this method to handle pagination
  static async getUserConsultations(
    page: number = 0, 
    size: number = 10,
    sort?: string[]
  ): Promise<ApiResponse<ConsultationPageResponse>> {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    
    // Add optional sort parameters
    if (sort && sort.length > 0) {
      sort.forEach(sortParam => {
        queryParams.append('sort', sortParam);
      });
    }
    
    return await this.authenticatedRequest<ConsultationPageResponse>(
      `/user/consultations?${queryParams.toString()}`
    );
  }

  static async acceptDietPlan(requestId: number): Promise<ApiResponse<ConsultationRequest>> {
    return await this.authenticatedRequest<ConsultationRequest>(
      `/user/consultations/${requestId}/accept`, 
      'POST'
    );
  }

  static async rejectDietPlan(requestId: number): Promise<ApiResponse<ConsultationRequest>> {
    return await this.authenticatedRequest<ConsultationRequest>(
      `/user/consultations/${requestId}/reject`, 
      'POST'
    );
  }

  // Helper method for authenticated requests
  static async authenticatedRequest<T>(
    url: string,
    method: string = 'GET',
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      const token = await TokenService.getToken();
      
      if (!token) {
        return {
          success: false,
          error: 'No token found',
        };
      }

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
      };

      if (body && !(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      const options: RequestInit = {
        method,
        headers,
      };

      if (body) {
        options.body = body instanceof FormData ? body : JSON.stringify(body);
      }

      const response = await fetch(`${BASE_URL}${url}`, options);
      const data = await response.json();

      if (!response.ok) {
        // Handle 401 errors (unauthorized) by clearing auth data
        if (response.status === 401) {
          await TokenService.clearAuthData();
        }

        return {
          success: false,
          error: data.message || `Request failed with status ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      };
    }
  }
}

export default ApiService;
