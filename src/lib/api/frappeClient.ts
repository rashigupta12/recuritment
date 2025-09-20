// /* eslint-disable @typescript-eslint/no-explicit-any */
// import axios from 'axios';

// // Create axios instance with base URL pointing to proxy
// const frappeClient = axios.create({
//   baseURL: 'http://localhost:3000/api/frappe',
//   timeout: 15000,
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json',
//   }
// });

// // Request interceptor
// frappeClient.interceptors.request.use(
//   (config) => {
//     console.log('API request:', config.method?.toUpperCase(), config.url);
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor
// frappeClient.interceptors.response.use(
//   (response) => {
//     console.log('API response:', response.status, response.config.url);
//     return response;
//   },
//   (error) => {
//     console.error('API Error:', {
//       status: error.response?.status,
//       message: error.response?.data?.message || error.message,
//       url: error.config?.url
//     });

//     // Handle authentication errors but don't auto-clear localStorage
//     if (error.response?.status === 401 || error.response?.status === 403) {
//       console.warn('Authentication error detected, but keeping session for now');
//     }

//     return Promise.reject(error);
//   }
// );

// export const frappeAPI = {
//   // Simple login that validates credentials and stores user data
//   login: async (username: string, password: string) => {
//     try {
//       console.log('Attempting login for:', username);
      
//       const response = await frappeClient.post('/method/login', {
//         usr: username,
//         pwd: password
//       });

//       console.log('Login response:', response.status, response.data);

//       if (response.data.message === 'Logged In') {
//         console.log('Login successful');
        
//         // Create user data from login response
//         const userData = {
//           username,
//           full_name: response.data.full_name || username,
//           email: username,
//           roles: ['User'], // Default role, will be updated if we can fetch from server
//           authenticated: true,
//           loginTime: Date.now()
//         };

//         // Store user data
//         localStorage.setItem('frappe_user', JSON.stringify(userData));

//         return {
//           success: true,
//           data: response.data,
//           user: userData,
//           details: {
//             full_name: response.data.full_name,
//             home_page: response.data.home_page,
//             roles: ['User'] // Default for now
//           }
//         };
//       }

//       return {
//         success: false,
//         error: response.data.message || 'Login failed'
//       };
//     } catch (error) {
//       console.error('Login error:', error);
//       return {
//         success: false,
//         error: axios.isAxiosError(error) ? 
//           (error.response?.data?.message || error.message) : 
//           'Login failed'
//       };
//     }
//   },

//   // Session check that relies on localStorage
//   checkSession: async () => {
//     try {
//       // Check localStorage first
//       const storedUser = localStorage.getItem('frappe_user');
//       if (storedUser) {
//         const userData = JSON.parse(storedUser);
        
//         // Check if session is still valid (less than 7 days old)
//         const sessionAge = Date.now() - (userData.loginTime || 0);
//         const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
//         if (sessionAge < maxAge && userData.authenticated) {
//           console.log('Valid session found in localStorage');
//           return {
//             authenticated: true,
//             user: userData,
//             details: {
//               full_name: userData.full_name,
//               roles: userData.roles || ['User']
//             }
//           };
//         } else {
//           console.log('Session expired');
//           localStorage.removeItem('frappe_user');
//         }
//       }

//       // Try server check as fallback (but don't rely on it due to 403 issues)
//       try {
//         const response = await frappeClient.get('/method/frappe.auth.get_logged_user');
        
//         if (response.data && response.data.message && response.data.message !== 'Guest') {
//           const username = response.data.message;
          
//           const userData = {
//             username,
//             full_name: username,
//             email: username,
//             roles: ['User'],
//             authenticated: true,
//             loginTime: Date.now()
//           };

//           localStorage.setItem('frappe_user', JSON.stringify(userData));

//           return {
//             authenticated: true,
//             user: userData,
//             details: userData
//           };
//         }
//       } catch (serverError) {
//         console.log('Server session check failed, using localStorage only');
//       }

//       return { authenticated: false };
//     } catch (error) {
//       console.error('Session check failed:', error);
//       return { authenticated: false };
//     }
//   },

//   // Get user details from localStorage
//   getUserDetails: async (username: string) => {
//     try {
//       const storedUser = localStorage.getItem('frappe_user');
//       if (storedUser) {
//         const userData = JSON.parse(storedUser);
//         if (userData.username === username) {
//           return {
//             success: true,
//             data: userData
//           };
//         }
//       }

//       // Fallback user data
//       return {
//         success: true,
//         data: {
//           username,
//           full_name: username,
//           email: username,
//           roles: ['User']
//         }
//       };
//     } catch (error) {
//       console.error('Error fetching user details:', error);
//       return {
//         success: false,
//         error: 'Failed to fetch user details'
//       };
//     }
//   },

//   // Simple first login check - return false to skip password reset for now
//   checkFirstLogin: async (username: string) => {
//     return {
//       success: true,
//       requiresPasswordReset: false // Skip for now to avoid 403 errors
//     };
//   },

//   // Password reset (keep for future use)
//   resetFirstTimePassword: async (username: string, newPassword: string) => {
//     try {
//       if (!newPassword || newPassword.length < 8) {
//         throw new Error('Password must be at least 8 characters long');
//       }

//       const response = await frappeClient.post('/method/frappe.core.doctype.user.user.update_password', {
//         old_password: '',
//         new_password: newPassword
//       });

//       if (response.data && response.data.message === 'Password Updated') {
//         return {
//           success: true,
//           message: 'Password updated successfully'
//         };
//       }

//       return {
//         success: false,
//         error: response.data?.message || 'Failed to update password'
//       };
//     } catch (error) {
//       console.error('Password reset error:', error);
//       return {
//         success: false,
//         error: axios.isAxiosError(error) ? 
//           (error.response?.data?.message || error.message) : 
//           'Password reset failed'
//       };
//     }
//   },

//   // Logout
//   logout: async () => {
//     try {
//       // Try to logout from server, but don't fail if it doesn't work
//       await frappeClient.post('/method/logout').catch((error) => {
//         console.log('Server logout failed, continuing with local logout:', error);
//       });
      
//       // Clear local storage regardless
//       localStorage.removeItem('frappe_user');
//       return { success: true };
//     } catch (error) {
//       // Clear local storage even if server logout fails
//       localStorage.removeItem('frappe_user');
//       console.error('Logout error:', error);
//       return { success: true }; // Always return success for logout
//     }
//   },

//   // Generic authenticated request
//   makeAuthenticatedRequest: async (method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, data?: any) => {
//     try {
//       const config: any = { method, url };
//       if (data) {
//         config.data = data;
//       }
//       const response = await frappeClient(config);
//       return response.data;
//     } catch (error) {
//       // Don't automatically clear session on errors for now
//       console.error('Authenticated request failed:', error);
//       throw error;
//     }
//   },

//   get: async (url: string, config?: any) => {
//     try {
//       const response = await frappeClient.get(url, config);
//       return response;
//     } catch (error) {
//       console.error('GET request failed:', error);
//       throw error;
//     }
//   }
// };

// export default frappeClient;


// src/api/frappeclient
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// // Create axios instance with base URL pointing to proxy
const frappeClient = axios.create({
  baseURL: 'https://recuritment.vercel.app/api/frappe',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});
// Request interceptor
frappeClient.interceptors.request.use(
  (config) => {
    console.log('API request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
frappeClient.interceptors.response.use(
  (response) => {
    console.log('API response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });

    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('frappe_user');
      }
    }

    return Promise.reject(error);
  }
);

export const frappeAPI = {
  // Authentication methods
  login: async (username: string, password: string) => {
    try {
      const response = await frappeClient.post('method/login', {
        usr: username,
        pwd: password
      });

      if (response.data.message === 'Logged In') {
        // Get user details after login
        const userDetails = await frappeAPI.getUserDetails(username);
        
        const userData = {
          username,
          full_name: userDetails.data?.full_name || username,
          email: userDetails.data?.email || username,
          roles: userDetails.data?.roles || [],
          authenticated: true,
          loginTime: Date.now()
        };

        // Store in localStorage for middleware access
        localStorage.setItem('frappe_user', JSON.stringify(userData));

        return {
          success: true,
          data: response.data,
          user: userData,
          details: userDetails.data
        };
      }

      return {
        success: false,
        error: response.data.message || 'Login failed'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: axios.isAxiosError(error) ? 
          (error.response?.data?.message || error.message) : 
          'Login failed'
      };
    }
  },

  checkSession: async () => {
    try {
      const response = await frappeClient.get('method/frappe.auth.get_logged_user');
      
      if (response.data && response.data.message && response.data.message !== 'Guest') {
        const username = response.data.message;
        
        // Get fresh user details
        const userDetails = await frappeAPI.getUserDetails(username);
        
        const userData = {
          username,
          full_name: userDetails.data?.full_name || username,
          email: userDetails.data?.email || username,
          roles: userDetails.data?.roles || [],
          authenticated: true,
          loginTime: Date.now()
        };

        localStorage.setItem('frappe_user', JSON.stringify(userData));

        return {
          authenticated: true,
          user: userData,
          details: userDetails.data
        };
      }

      return { authenticated: false };
    } catch (error) {
      console.error('Session check failed:', error);
      localStorage.removeItem('frappe_user');
      return { authenticated: false };
    }
  },

  getUserDetails: async (username: string) => {
    try {
      const response = await frappeClient.get(`resource/User/${encodeURIComponent(username)}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching user details:', error);
      return {
        success: false,
        error: axios.isAxiosError(error) ? 
          (error.response?.data?.message || error.message) : 
          'Failed to fetch user details'
      };
    }
  },

  checkFirstLogin: async (username: string) => {
    try {
      // Check user's last login to determine if it's first login
      const response = await frappeClient.get(
        `resource/User/${encodeURIComponent(username)}?fields=["last_login","creation"]`
      );
      
      if (response.data && response.data.data) {
        const user = response.data.data;
        // If last_login is null, it's first login
        const requiresPasswordReset = !user.last_login;
        
        return {
          success: true,
          requiresPasswordReset
        };
      }
      
      return {
        success: true,
        requiresPasswordReset: false
      };
    } catch (error) {
      console.error('Error checking first login:', error);
      return {
        success: false,
        requiresPasswordReset: false
      };
    }
  },

  resetFirstTimePassword: async (username: string, newPassword: string) => {
    try {
      if (!newPassword || newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Use the correct Frappe endpoint for password reset
      const response = await frappeClient.post('method/frappe.core.doctype.user.user.update_password', {
        old_password: '', // Empty for first-time reset
        new_password: newPassword
      });

      if (response.data && response.data.message === 'Password Updated') {
        return {
          success: true,
          message: 'Password updated successfully'
        };
      }

      return {
        success: false,
        error: response.data?.message || 'Failed to update password'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: axios.isAxiosError(error) ? 
          (error.response?.data?.message || error.message) : 
          'Password reset failed'
      };
    }
  },

  logout: async () => {
    try {
      await frappeClient.post('method/logout');
      localStorage.removeItem('frappe_user');
      return { success: true };
    } catch (error) {
      localStorage.removeItem('frappe_user');
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed but local session cleared' };
    }
  },

  // Generic API method
  makeAuthenticatedRequest: async (method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, data?: any) => {
    try {
      const config: any = { method, url };
      if (data) {
        config.data = data;
      }
      const response = await frappeClient(config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 401)) {
        localStorage.removeItem('frappe_user');
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  },

  get: async (url: string, config?: any) => {
    try {
      const response = await frappeClient.get(url, config);
      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 401)) {
        localStorage.removeItem('frappe_user');
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  }
};

export default frappeClient;
