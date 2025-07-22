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
