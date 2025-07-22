import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  roles: string[];
}

interface JwtResponse {
  id: number;
  email: string | null;
  firstName: string;
  lastName: string;
  roles: string[];
  token: string;
  type: string;
}

class TokenService {
  static async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  static async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  }

  static async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }

  static async saveUser(userData: UserData): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
  }

  static async getUser(): Promise<UserData | null> {
    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  }

  static async saveAuthData(jwtResponse: JwtResponse): Promise<void> {
    await this.saveToken(jwtResponse.token);
    
    const userData: UserData = {
      id: jwtResponse.id,
      firstName: jwtResponse.firstName,
      lastName: jwtResponse.lastName,
      email: jwtResponse.email,
      roles: jwtResponse.roles
    };
    
    await this.saveUser(userData);
  }

  static async clearAuthData(): Promise<void> {
    await this.removeToken();
    await this.removeUser();
  }
}

export default TokenService;
