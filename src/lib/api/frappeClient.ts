// src/api/frappeclient
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const frappeClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_dev_prod_FRAPPE_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
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
  },

  // getAllLeads: async (email: string) => {
  //   return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Lead?filters=[["lead_owner", "=", "${email}"]]&order_by=creation%20desc`);
  // },
   getAllLeads: async () => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Lead`);
  },

  getLeadById: async (leadId: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Lead/${leadId}`);
  },
  getAllInsdustryType:async()=>{
    return await frappeAPI.makeAuthenticatedRequest('GET','/resource/Industry Type')
  },

  createLead: async (leadData: Record<string, unknown>) => {
    return await frappeAPI.makeAuthenticatedRequest('POST', '/resource/Lead', leadData);
  },

  updateLead: async (leadId: string, leadData: Record<string, unknown>) => {
    return await frappeAPI.makeAuthenticatedRequest('PUT', `/resource/Lead/${leadId}`, leadData);
  },
  updateLeadStatus: async (LeaId: string, status: string) => {
    return await frappeAPI.makeAuthenticatedRequest('PUT', `/resource/Lead/${LeaId}`, { status });
  },
   createContact: async (contactData: Record<string, unknown>) => {
    return await frappeAPI.makeAuthenticatedRequest('POST', '/resource/Contact', contactData);
  },
   updateContact: async (contactId: string, contactData: Record<string, unknown>) => {
    return await frappeAPI.makeAuthenticatedRequest('PUT', `/resource/contact/${contactId}`, contactData);
  },
   createCompany: async (companyData: Record<string, unknown>) => {
    return await frappeAPI.makeAuthenticatedRequest('POST', '/resource/Company', companyData);
  },
   updateCompany: async (companyId: string, companyData: Record<string, unknown>) => {
    return await frappeAPI.makeAuthenticatedRequest('PUT', `/resource/Company/${companyId}`, companyData);
  },
  
};

export default frappeClient;
