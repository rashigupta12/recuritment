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

const frappeFileClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_dev_prod_FRAPPE_BASE_URL,
  timeout: 30000, // Longer timeout for file uploads
  withCredentials: true,
  headers: {
    // Don't set Content-Type for multipart - let browser handle it
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
    // First check User Settings
 
    const response = await frappeClient.get(
      `/resource/User Setting/${encodeURIComponent(username)}`
    );
  
    
    if (response.data && response.data.data) {
      
      
      // Handle both array and object responses
      const userSettings = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
      
      if (userSettings) {
        
        
        const requiresPasswordReset = userSettings.first_password === 1 || userSettings.first_password === '1';
        

        
        return {
          success: true,
          requiresPasswordReset,
          userSettings
        };
      }
    }
    
    
    
    // Fallback: check User table
    const userResponse = await frappeClient.get(
      `/resource/User/${username}?fields=["last_login"]`
    );
    
    
    
    if (userResponse.data && userResponse.data.data) {
      const requiresPasswordReset = !userResponse.data.data.last_login;
 
      
      return {
        success: true,
        requiresPasswordReset,
        lastLogin: userResponse.data.data.last_login
      };
    }
    
   
    return {
      success: true,
      requiresPasswordReset: false
    };
    
  } catch (error) {

    
    // Enhanced error logging
    if (axios.isAxiosError(error)) {
      console.error('🌐 Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
    }
    
    let errorMessage = 'Error checking first login status';
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      requiresPasswordReset: false,
      error: errorMessage
    };
  }
},

 resetFirstTimePassword: async (username: string, newPassword: string) => {
  try {
    // Validate password strength
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Step 1: Update the user's password
    const passwordUpdateResponse = await frappeClient.put(
      `/resource/User/${encodeURIComponent(username)}`,
      {
        new_password: newPassword
      }
    );

    if (passwordUpdateResponse.status !== 200) {
      throw new Error('Failed to update password');
    }

    // Step 2: Update the first_password flag to 0
    try {
      const flagUpdateResponse = await frappeClient.put(
        `/resource/User Setting/${encodeURIComponent(username)}`,
        {
          first_password: 0
        }
      );

      console.log('Password reset successful:', {
        username,
        passwordUpdate: passwordUpdateResponse.status,
        flagUpdate: flagUpdateResponse.status
      });

      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (flagError) {
      console.warn('Password updated but failed to update flag:', flagError);
      // Password was updated successfully, but flag update failed
      // This is still considered a success since the password was changed
      return {
        success: true,
        message: 'Password updated successfully',
        warning: 'Flag update failed but password was changed'
      };
    }
  } catch (error) {
    console.error('Password reset error:', error);
    
    let errorMessage = 'Password reset failed';
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
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

  getAllLeads: async (email: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Lead?filters=[["lead_owner", "=", "${email}"]]&order_by=creation%20desc`);
  },
  //  getAllLeads: async () => {
  //   return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Lead`);
  // },

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
    getAllLeadsbyContract: async (email:string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Lead?filters=[["custom_stage", "=", "onboarded"] , ["lead_owner", "=", "${email}"]]`);
  },

 


  getAllOpportunity: async (email: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Opportunity?filters= [["custom_assigned_to_" ,"=","${email}"]]`);
  },
  getOpportunityBYId: async (TodoId: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Opportunity/${TodoId}`);
  },

  createStaffingPlan: async(StaffingData :Record<string, unknown>)=>{
 return await frappeAPI.makeAuthenticatedRequest('POST', '/resource/Staffing Plan', StaffingData);
  }, 
  updateStaffingPLan: async (StaffingId: string, StaffingData: Record<string, unknown>) => {
    return await frappeAPI.makeAuthenticatedRequest('PUT', `/resource/Company/${StaffingId}`, StaffingData);
  },
  getAllTodos: async (email: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/ToDo?filters=[["allocated_to" ,"=","${email}"]]`);
  },
  getTodoBYId: async (TodoId: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/ToDo/${TodoId}`);
  },
   getStaffingPlanById: async (PlanId: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Staffing Plan/${PlanId}`);
  },


  
   upload: async (file: File, options: {
    is_private?: boolean;
    folder?: string;
    doctype?: string;
    docname?: string;
    method?: string;
  } = {}) => {
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file object');
    }

    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append('is_private', options.is_private ? '1' : '0');
    formData.append('folder', options.folder || 'Home');

    if (options.doctype) {
      formData.append('doctype', options.doctype);
    }
    if (options.docname) {
      formData.append('docname', options.docname);
    }
    if (options.method) {
      formData.append('method', options.method);
    }



    try {
      const response = await frappeFileClient.post('/method/upload_file', formData, {
        timeout: 30000,
        headers: {
          // Remove any Content-Type header to let browser set multipart boundary
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`📈 Upload progress: ${percentCompleted}%`);
          }
        }
      });


      return {
        success: true,
        data: response.data,
        file_url: response.data.message?.file_url || response.data.file_url,
        file_name: response.data.message?.file_name || response.data.file_name
      };

    } catch (error) {
      console.error('🔍 Error details:', error);

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message ||
          error.response?.data?.exc ||
          error.message;
        const errorDetails = {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        };
        return {
          success: false,
          error: errorMessage,
          details: errorDetails
        };
      }

      return {
        success: false,
        error: (error as Error).message,
        details: error
      };
    }
  }

  

};

export default frappeClient;
