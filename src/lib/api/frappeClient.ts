// lib/api/frappeClient.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

// Safe localStorage helper for server-side compatibility
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  }
};

const frappeClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_dev_prod_FRAPPE_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
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

frappeFileClient.interceptors.request.use(
  (config) => {
    console.log('File upload request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL
    });

    // For development, add CORS headers
    config.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
    config.headers['Access-Control-Allow-Credentials'] = 'true';

    // Don't manually set browser-controlled headers
    delete config.headers['Origin'];
    delete config.headers['Referer'];

    // Ensure Content-Type is not set for FormData (let browser handle it)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

frappeFileClient.interceptors.response.use(
  (response) => {
    console.log('File upload response:', {
      status: response.status,
      url: response.config.url
    });

    if (response.headers['set-cookie']) {
      console.log('Cookies received:', response.headers['set-cookie']);
    }
    return response;
  },
  (error) => {
    console.error('File Upload Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      data: error.response?.data,
      requestData: error.config?.data instanceof FormData ? 'FormData object' : error.config?.data
    });

    // Enhanced server down detection for file uploads
    const isServerDown =
      error.response?.status === 502 || // Bad Gateway
      error.response?.status === 503 || // Service Unavailable
      error.response?.status === 500 || // Internal Server Error
      error.code === 'ERR_NETWORK' ||   // Network error
      error.code === 'ECONNREFUSED' ||  // Connection refused
      error.message?.includes('ERR_CONNECTION_REFUSED') ||
      // Database connection errors
      error.response?.data?.message?.includes('Can\'t connect to MySQL server') ||
      error.response?.data?.message?.includes('Connection refused') ||
      error.response?.data?.message?.includes('pymysql.err.OperationalError') ||
      error.response?.data?.message?.includes('Database connection failed') ||
      // Check for HTML error pages (Werkzeug debugger)
      (error.response?.data && typeof error.response.data === 'string' &&
        error.response.data.includes('Werkzeug Debugger')) ||
      // Exception patterns
      error.response?.data?.exc?.includes('OperationalError') ||
      error.response?.data?.exc?.includes('Can\'t connect to MySQL');

    if (isServerDown && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('serverDown', { detail: true }));
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      safeLocalStorage.removeItem('frappe_user');
      safeLocalStorage.removeItem('frappe_session');
      // Optionally redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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
        safeLocalStorage.removeItem('frappe_user');
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
        safeLocalStorage.setItem('frappe_user', JSON.stringify(userData));

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

        safeLocalStorage.setItem('frappe_user', JSON.stringify(userData));

        return {
          authenticated: true,
          user: userData,
          details: userDetails.data
        };
      }

      return { authenticated: false };
    } catch (error) {
      console.error('Session check failed:', error);
      safeLocalStorage.removeItem('frappe_user');
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
      safeLocalStorage.removeItem('frappe_user');
      return { success: true };
    } catch (error) {
      safeLocalStorage.removeItem('frappe_user');
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed but local session cleared' };
    }
  },

  // SMTP Configuration methods
  getUserSMTPSettings: async (username: string) => {
    try {
      // Get SMTP email from User doctype
      const userResponse = await frappeClient.get(
        `/resource/User/${encodeURIComponent(username)}?fields=["custom_smtp_email","full_name"]`
      );
      
      // Get encrypted password from User Setting
      const userSettingResponse = await frappeClient.get(
        `/resource/User Setting/${encodeURIComponent(username)}?fields=["custom_mailp"]`
      );

      return {
        success: true,
        data: {
          custom_smtp_email: userResponse.data.data?.custom_smtp_email,
          custom_mailp: userSettingResponse.data.data?.custom_mailp,
          full_name: userResponse.data.data?.full_name
        }
      };
    } catch (error) {
      console.error('Error fetching user SMTP settings:', error);
      return {
        success: false,
        error: axios.isAxiosError(error) ?
          (error.response?.data?.message || error.message) :
          'Failed to fetch SMTP settings'
      };
    }
  },

  updateUserSMTPSettings: async (username: string, smtpEmail: string, encryptedPassword: string) => {
    try {
      // Update User doctype with SMTP email
      await frappeClient.put(
        `/resource/User/${encodeURIComponent(username)}`,
        {
          custom_smtp_email: smtpEmail
        }
      );

      // Update User Setting with encrypted password
      await frappeClient.put(
        `/resource/User Setting/${encodeURIComponent(username)}`,
        {
          custom_mailp: encryptedPassword
        }
      );

      return {
        success: true,
        message: 'SMTP settings updated successfully'
      };
    } catch (error) {
      console.error('Error updating user SMTP settings:', error);
      return {
        success: false,
        error: axios.isAxiosError(error) ?
          (error.response?.data?.message || error.message) :
          'Failed to update SMTP settings'
      };
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
        safeLocalStorage.removeItem('frappe_user');
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
        safeLocalStorage.removeItem('frappe_user');
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  },

  getAllLeads: async (email: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Lead?filters=[["lead_owner", "=", "${email}"]]&order_by=creation%20desc`);
  },

  getAllLeadsDetailed: async (email: string) => {
    return await frappeAPI.makeAuthenticatedRequest(
      'GET',
      `/resource/Lead?fields=["name","custom_full_name","custom_phone_number","custom_email_address","status","company_name","custom_expected_hiring_volume","industry","city","custom_budgetinr","website","state","country","creation","lead_name","email_id","custom_stage","custom_offerings","custom_estimated_hiring_","custom_average_salary","custom_fee","custom_deal_value","custom_expected_close_date","custom_fixed_charges","owner","lead_owner","custom_lead_owner_name","mobile_no" , "custom_currency"]&filters=[["owner","=","${email}"],["custom_stage","in",["Prospecting","Lead Qualification","Needs Analysis / Discovery","Presentation / Proposal"]]]&limit_page_length=0&limit_start=0&order_by=modified desc`
    );
  },

  getContractReadyLeads: async (email: string) => {
    return await frappeAPI.makeAuthenticatedRequest(
      'GET',
      `/resource/Lead?fields=["name","custom_full_name","custom_phone_number","custom_email_address","status","company_name","custom_expected_hiring_volume","industry","city","custom_budgetinr","website","state","country","creation","lead_name","email_id","custom_stage","custom_offerings","custom_estimated_hiring_","custom_average_salary","custom_fee","custom_deal_value","custom_expected_close_date","custom_fixed_charges","owner","lead_owner","custom_lead_owner_name","mobile_no","custom_currency"]&filters=[["owner","=","${email}"],["custom_stage","in",["Contract","Onboarded"]]]&limit_page_length=0&limit_start=0&order_by=modified desc`
    );
  },

  getContractReadyLeadsRecuiter: async (email: string) => {
    return await frappeAPI.makeAuthenticatedRequest(
      'GET',
      `/resource/Lead?fields=["name","custom_full_name","custom_phone_number","custom_email_address","status","company_name","custom_expected_hiring_volume","industry","city","custom_budgetinr","website","state","country","creation","lead_name","email_id","custom_stage","custom_offerings","custom_estimated_hiring_","custom_average_salary","custom_fee","custom_deal_value","custom_expected_close_date","custom_fixed_charges","owner","lead_owner","custom_lead_owner_name","mobile_no","custom_currency"]&filters=[["custom_stage","in",["Contract","Onboarded"]]]&limit_page_length=0&limit_start=0&order_by=modified desc`
    );
  },

  getContractReadyLeadsOptimized: async (email: string) => {
    const fields = [
      "name",
      "custom_full_name",
      "custom_phone_number",
      "custom_email_address",
      "status",
      "company_name",
      "custom_expected_hiring_volume",
      "industry",
      "city",
      "custom_budgetinr",
      "website",
      "state",
      "country",
      "creation",
      "custom_stage",
      "custom_offerings",
      "custom_estimated_hiring_",
      "custom_average_salary",
      "custom_fee",
      "custom_deal_value",
      "custom_expected_close_date",
      "custom_fixed_charges",
      "owner",
      "lead_owner",
      "custom_lead_owner_name",
      "mobile_no"
    ];

    return await frappeAPI.makeAuthenticatedRequest(
      'GET',
      `/resource/Lead?fields=${JSON.stringify(fields)}&filters=[["lead_owner", "=", "${email}"],["custom_stage", "=", "onboarded"]]&order_by=creation desc&limit_page_length=0`
    );
  },

  getLeadById: async (leadId: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Lead/${leadId}`);
  },

  getAllInsdustryType: async () => {
    return await frappeAPI.makeAuthenticatedRequest('GET', '/resource/Industry Type')
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
    return await frappeAPI.makeAuthenticatedRequest('PUT', `/resource/Contact/${contactId}`, contactData);
  },

  createCompany: async (companyData: Record<string, unknown>) => {
    return await frappeAPI.makeAuthenticatedRequest('POST', '/resource/Company', companyData);
  },

  updateCompany: async (companyId: string, companyData: Record<string, unknown>) => {
    return await frappeAPI.makeAuthenticatedRequest('PUT', `/resource/Company/${companyId}`, companyData);
  },

  getAllLeadsbyContract: async (email: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Lead?filters=[["custom_stage", "=", "onboarded"] , ["lead_owner", "=", "${email}"]]`);
  },

  getAllOpportunity: async (email: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Opportunity?filters= [["custom_assigned_to_" ,"=","${email}"]]`);
  },

  getOpportunityBYId: async (TodoId: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Opportunity/${TodoId}`);
  },

  createStaffingPlan: async (StaffingData: Record<string, unknown>) => {
    return await frappeAPI.makeAuthenticatedRequest('POST', '/resource/Staffing Plan', StaffingData);
  },

  updateStaffingPLan: async (StaffingId: string, StaffingData: Record<string, unknown>) => {
    return await frappeAPI.makeAuthenticatedRequest('PUT', `/resource/Company/${StaffingId}`, StaffingData);
  },

  getAllTodos: async (email: string) => {
    const fields = [
      "name",
      "description",
      "status",
      "priority",
      "date",
      "custom_job_id",
      "allocated_to",
      "assigned_by",
      "reference_type",
      "reference_name",
      "role",
      "sender",
      "assignment_rule",
      "custom_date_assigned", 
      "custom_job_title", 
      "custom_department"
    ];

    const filters = JSON.stringify([["allocated_to", "=", email]]);

    return await frappeAPI.makeAuthenticatedRequest(
      'GET',
      `/resource/ToDo?fields=${JSON.stringify(fields)}&filters=${filters}&limit_page_length=0&limit_start=0&order_by=creation desc`
    );
  },
  searchApplicants:async (email:string)=>{
    const fields =  ["name", "job_title", "designation", "custom_company_name", "status", "email_id", "phone_number", "applicant_name", "country", "resume_attachment"];
    const filters= JSON.stringify([["email_id","=",email]]);
    
    return await frappeAPI.makeAuthenticatedRequest(
      'GET', 
      `/resource/Job Applicant?fields=${JSON.stringify(fields)}&filters=${filters}&limit_page_length=0&order_by=creation desc`
    );
  },
getlatestCVTimestamp:async(email:string)=>{
const fields=["custom_latest_cv_timestamp"]
const filters= JSON.stringify([["email_id","=",email]]);
 return await frappeAPI.makeAuthenticatedRequest(
      'GET', 
      `/resource/Job Applicant?fields=${JSON.stringify(fields)}&filters=${filters}&order_by=custom_latest_cv_timestamp desc&limit=1`
    );
},
  getTodoBYId: async (TodoId: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/ToDo/${TodoId}`);
  },

  getStaffingPlanById: async (PlanId: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Staffing Plan/${PlanId}`);
  },

  getAllCustomers: async (email: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Customer?filters=[["owner" ,"=","${email}"]]&order_by=creation desc`);
  },

  getCustomerBYId: async (CustomerId: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Customer/${CustomerId}`);
  },

  createBulkApplicants: async (applicantsData: Array<Record<string, unknown>>) => {
    return await frappeAPI.makeAuthenticatedRequest(
      'POST',
      '/method/recruitment_app.create_bulk_applicants.create_bulk_applicants',
      applicantsData
    );
  },



  createApplicants: async (ApplicantData: Record<string, unknown>) => {
    return await frappeAPI.makeAuthenticatedRequest('POST', '/resource/Job Applicant', ApplicantData);
  },
  

  // getAllApplicants: async (email: string, limitStart = 0, limitPageLength = 10) => {
  //   const url = `/method/recruitment_app.get_all_applicants.get_all_applicants?limit_start=${limitStart}&limit_page_length=${limitPageLength}&owner=${email}`;
  //   return await frappeAPI.makeAuthenticatedRequest('GET', url);
  // },

  getAllApplicants: async (email: string, limitStart = 0, limitPageLength = 10) => {
  const url = `/method/recruitment_app.get_all_applicants.get_unique_candidates?limit_start=${limitStart}&limit_page_length=${limitPageLength}&owner=${email}`;
  return await frappeAPI.makeAuthenticatedRequest('GET', url);
},


  getApplicantBYId: async (name: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Job Applicant/${name}`);
  },

  createbulkAssessment: async (assessment: Record<string, unknown>) => {
    return await frappeAPI.makeAuthenticatedRequest('POST', '/method/recruitment_app.bulk_create_assessment.bulk_create_assessments', assessment);
  },

  getAllShortlistedCandidates: async (email: string, status: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Job Applicant?filters=[["owner","=","${email}"],["status","=","${status}"]]&order_by=creation desc`);
  },

  getJobOpeningById: async (jobopeningId: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Job Opening/${jobopeningId}`);
  },

  getTaggedApplicantsByJobId: async (jobId: string, email: string) => {
    return await frappeAPI.makeAuthenticatedRequest(
      'GET',
      `/resource/Job Applicant?filters=[["owner","=","${email}"],["job_title","=","${jobId}"]]&order_by=creation desc`
    );
  },
getApplicantById: async (applicantId: string) => {
  return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Job Applicant/${applicantId}`);
},
  deleteApplicant: async (applicantName: string) => {
    return await frappeAPI.makeAuthenticatedRequest('DELETE', `/resource/Job Applicant/${applicantName}`);
  },

  updateApplicantStatus: async (name: string, data: { status: string }) => {
    return await frappeAPI.makeAuthenticatedRequest('PUT', `/resource/Job Applicant/${encodeURIComponent(name)}`, data);
  },

  createFeedback: async (feedbackData: Record<string, unknown>) => {
    return await frappeAPI.makeAuthenticatedRequest('POST', '/resource/Issue', feedbackData);
  },

  editFeedback: async (feedbackId: string, feedbackData: Record<string, unknown>) => {
    return await frappeAPI.makeAuthenticatedRequest('PUT', `/resource/Issue/${feedbackId}`, feedbackData);
  },

  getFeedbackByUserId: async (userId: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Issue?filters=[["raised_by","=","${userId}"]]&order_by=modified desc`);
  },

  getFeedbackById: async (feedbackId: string) => {
    return await frappeAPI.makeAuthenticatedRequest('GET', `/resource/Issue/${feedbackId}`);
  },

  getStaffingPlans: async (email: string, limitStart: number = 0, limitPageLength: number = 10) => {
    return await frappeAPI.makeAuthenticatedRequest(
      'GET',
      `/method/recruitment_app.get_staffing_plan.get_staffing_plans_with_children?limit_start=${limitStart}&limit_page_length=${limitPageLength}`
    );
  },
createInterview: async (interviewData: Record<string, unknown>) => {
  return await frappeAPI.makeAuthenticatedRequest('POST', '/resource/Interview', interviewData);
},

getInterviewsByApplicant: async (applicantId: string) => {
  return await frappeAPI.makeAuthenticatedRequest(
    'GET',
    `/resource/Interview?fields=${encodeURIComponent(JSON.stringify(["name","interview_round","job_applicant","job_opening","designation","resume_link","custom_resume","status","scheduled_on","from_time","to_time","custom_mode_","custom_link","custom_remarks","custom_interviewers"]))}&filters=${encodeURIComponent(JSON.stringify([["job_applicant", "=", applicantId]]))}`
  );
},

updateInterviewStatus: async (interviewName: string, updateData: Record<string, unknown>) => {
  return await frappeAPI.makeAuthenticatedRequest('PUT', `/resource/Interview/${interviewName}`, updateData);
},


getInterviewRounds: async () => {
  return await frappeAPI.makeAuthenticatedRequest(
    'GET',
    '/resource/Interview Round?fields=["name"]'
  );
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