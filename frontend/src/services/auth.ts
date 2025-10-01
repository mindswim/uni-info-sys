import axios from 'axios';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

// Create a separate axios instance for auth requests
const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // withCredentials not needed for token-based auth
});

// User interface
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  two_factor_enabled?: boolean;
  created_at: string;
  updated_at: string;
  roles?: Role[];
  permissions?: Permission[];
  student?: {
    id: number;
    student_number: string;
    first_name: string;
    last_name: string;
    enrollment_status?: string;
    academic_status?: string;
    gpa?: number;
  };
  staff?: {
    id: number;
    employee_number: string;
    first_name: string;
    last_name: string;
    title?: string;
    department?: {
      id: number;
      name: string;
      code: string;
    };
  };
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'user';

  /**
   * Login with email and password
   * Note: Laravel Sanctum token-based auth doesn't require CSRF cookie for API tokens
   */
  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    try {
      console.log('AuthService: Attempting login to:', `${API_BASE_URL}/api/v1/tokens/create`);
      // Directly attempt login without CSRF (using token-based auth)
      const response = await authClient.post('/api/v1/tokens/create', {
        email: credentials.email,
        password: credentials.password,
        device_name: 'web-browser', // Required by Laravel Sanctum
      });

      const { token, user } = response.data;

      // Store token and user data
      this.setToken(token);
      this.setUser(user);

      // Set the token for future requests
      authClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Log API activity
      this.logApiActivity('POST', '/api/v1/tokens/create', credentials, response.status, response.data);

      return { token, user };
    } catch (error: any) {
      // Log error
      this.logApiActivity('POST', '/api/v1/tokens/create', credentials, error.response?.status || 0, error.response?.data || error.message);

      if (error.response?.status === 422) {
        throw new Error(error.response.data.message || 'Invalid credentials');
      }
      throw new Error('Login failed. Please try again.');
    }
  }

  /**
   * Logout the user
   */
  async logout(): Promise<void> {
    try {
      const token = this.getToken();

      if (token) {
        // Set auth header for this request
        authClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Call logout endpoint to revoke token on server
        await authClient.post('/api/v1/tokens/revoke');

        // Log API activity
        this.logApiActivity('POST', '/api/v1/tokens/revoke', null, 200, { message: 'Logged out' });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      this.clearAuth();
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();

      if (!token) {
        return null;
      }

      // Set auth header
      authClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const response = await authClient.get('/api/v1/auth/user');

      // Update stored user data
      this.setUser(response.data);

      // Log API activity
      this.logApiActivity('GET', '/api/v1/auth/user', null, response.status, response.data);

      return response.data;
    } catch (error: any) {
      // Log error
      this.logApiActivity('GET', '/api/v1/auth/user', null, error.response?.status || 0, error.response?.data || error.message);

      // If unauthorized, clear auth
      if (error.response?.status === 401) {
        this.clearAuth();
      }
      return null;
    }
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<{ token: string; user: User }> {
    try {
      const response = await authClient.post('/api/v1/register', data);

      const { token, user } = response.data;

      // Store token and user data
      this.setToken(token);
      this.setUser(user);

      // Set the token for future requests
      authClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Log API activity
      this.logApiActivity('POST', '/api/v1/register', data, response.status, response.data);

      return { token, user };
    } catch (error: any) {
      // Log error
      this.logApiActivity('POST', '/api/v1/register', data, error.response?.status || 0, error.response?.data || error.message);

      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const firstError = errors ? Object.values(errors)[0] : 'Registration failed';
        throw new Error(Array.isArray(firstError) ? firstError[0] : firstError as string);
      }
      throw new Error('Registration failed. Please try again.');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  /**
   * Set auth token
   */
  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  /**
   * Get stored user data
   */
  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.userKey);
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Set user data
   */
  private setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  /**
   * Clear all auth data
   */
  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      delete authClient.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Check if user has a specific role
   */
  hasRole(roleName: string): boolean {
    const user = this.getUser();
    if (!user || !user.roles) return false;
    // Handle both string array and object array formats
    if (typeof user.roles[0] === 'string') {
      return (user.roles as string[]).includes(roleName);
    }
    return user.roles.some(role => role.name === roleName);
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roleNames: string[]): boolean {
    const user = this.getUser();
    if (!user || !user.roles || !user.roles.length) return false;
    // Handle both string array and object array formats
    if (typeof user.roles[0] === 'string') {
      return (user.roles as string[]).some(role => roleNames.includes(role));
    }
    return user.roles.some(role => roleNames.includes(role.name));
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permissionName: string): boolean {
    const user = this.getUser();
    if (!user) return false;

    // Check direct permissions
    if (user.permissions?.some(perm => perm.name === permissionName)) {
      return true;
    }

    // Check role permissions
    if (user.roles) {
      for (const role of user.roles) {
        if (role.permissions?.some(perm => perm.name === permissionName)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get user's primary role
   */
  getPrimaryRole(): string | null {
    const user = this.getUser();
    if (!user || !user.roles || user.roles.length === 0) return null;

    // Priority order for roles
    const rolePriority = ['admin', 'staff', 'instructor', 'student'];

    for (const priority of rolePriority) {
      if (user.roles.some(role => role.name === priority)) {
        return priority;
      }
    }

    return user.roles[0].name;
  }

  /**
   * Log API activity for demo purposes
   */
  private logApiActivity(method: string, url: string, data: any, status: number, response: any): void {
    if (typeof window !== 'undefined') {
      const activity = {
        method,
        url,
        data: data ? { ...data, password: '***' } : null, // Hide password in logs
        status,
        response: response?.password ? { ...response, password: '***' } : response,
        timestamp: new Date().toISOString(),
      };

      const activities = JSON.parse(sessionStorage.getItem('api_activities') || '[]');
      activities.push(activity);

      // Keep only last 50 activities
      if (activities.length > 50) {
        activities.shift();
      }

      sessionStorage.setItem('api_activities', JSON.stringify(activities));
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;