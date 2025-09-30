/*eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { Upload, User, Mail, Phone, FileText, Briefcase, CheckCircle, GraduationCap, Building, MapPin, Plus, Trash2 } from 'lucide-react';
import { frappeAPI } from '@/lib/api/frappeClient';

// Define interfaces for type safety
interface ExperienceData {
  company_name: string;
  designation: string;
  start_date: string;
  end_date: string;
  current_company: number;
}

interface EducationData {
  degree: string;
  specialization: string;
  institution: string;
  year_of_passing: string;
  percentagecgpa: string;
}

interface FormData {
  applicant_name: string;
  email_id: string;
  phone_number: string;
  country: string;
  job_title: string;
  resume_attachment: string; // Changed to string for file URL
  custom_experience: ExperienceData[];
  custom_education: EducationData[];
}

interface FormErrors {
  [key: string]: string;
}
interface ApplicantFormProps {
  initialJobId?: string;
  todoData?: any; //
}
export default function ApplicantForm({ initialJobId, todoData }: ApplicantFormProps) {
  const [formData, setFormData] = useState<FormData>({
    applicant_name: '',
    email_id: '',
    phone_number: '',
    country: 'India',
    job_title: initialJobId || ' ',
    resume_attachment: '', // Initialize as empty string
    custom_experience: [{
      company_name: '',
      designation: '',
      start_date: '',
      end_date: '',
      current_company: 0
    }],
    custom_education: [{
      degree: '',
      specialization: '',
      institution: '',
      year_of_passing: '',
      percentagecgpa: ''
    }]
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isAutofilling, setIsAutofilling] = useState<boolean>(false);
  const [autofillError, setAutofillError] = useState<string>('');

  const countries: string[] = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Singapore', 'UAE', 'Other'];
  // ✅ initialJobId change होने पर formData update करें
  useEffect(() => {
    if (initialJobId) {
      setFormData(prev => ({
        ...prev,
        job_title: initialJobId
      }));
    }
  }, [initialJobId]);
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;
    const { files, checked } = target;
    
    if (files) {
      const file = files[0];
      if (file) {
        handleResumeUpload(file); // Trigger upload and autofill
      }
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked ? 1 : 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Handle resume upload and autofill
  const handleResumeUpload = async (file: File) => {
    setIsAutofilling(true);
    setAutofillError('');
    
    try {
      console.log('Starting resume upload and autofill process...');
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });

      // Step 1: Upload file to Frappe server
      console.log('Uploading file to Frappe server...');
      const uploadResponse = await frappeAPI.upload(file, {
        is_private: false,
        folder: 'Home',
      });

      if (!uploadResponse.success || !uploadResponse.file_url) {
        throw new Error(uploadResponse.error || 'Failed to upload resume to server');
      }

      const fileUrl = uploadResponse.file_url;
      console.log('File uploaded successfully, URL:', fileUrl);

      // Step 2: Call autofill API with file
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('fileName', file.name);
      uploadFormData.append('jobTitle', formData.job_title);

      console.log('Sending request to /api/jobapplicant for autofill');
      const response = await fetch('/api/jobapplicant', {
        method: 'POST',
        body: uploadFormData
      });

      console.log('Autofill response:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Autofill response parsed:', result);

      if (!result.success || !result.data) {
        throw new Error('Invalid response format from server');
      }

      const { data } = result;

      // Update form data with API response and file URL
      setFormData(prevFormData => ({
        ...prevFormData,
        applicant_name: data.applicant_name || '',
        email_id: data.email_id || '',
        phone_number: data.phone_number || '',
        country: data.country || 'India',
        job_title: data.job_title || prevFormData.job_title, // Preserve job_title from URL if autofill doesn't provide it
        resume_attachment: fileUrl, // Store file URL
        custom_experience: data.custom_experience && data.custom_experience.length > 0
          ? data.custom_experience.map((exp: any) => ({
              company_name: exp.company_name || '',
              designation: exp.designation || '',
              start_date: exp.start_date || '',
              end_date: exp.end_date || '',
              current_company: exp.current_company || 0
            }))
          : [{
              company_name: '',
              designation: '',
              start_date: '',
              end_date: '',
              current_company: 0
            }],
        custom_education: data.custom_education && data.custom_education.length > 0
          ? data.custom_education.map((edu: any) => ({
              degree: edu.degree || '',
              specialization: edu.specialization || '',
              institution: edu.institution || '',
              year_of_passing: String(edu.year_of_passing || ''),
              percentagecgpa: String(edu.percentagecgpa || '')
            }))
          : [{
              degree: '',
              specialization: '',
              institution: '',
              year_of_passing: '',
              percentagecgpa: ''
            }]
      }));

      console.log('Form data updated with file URL and autofill data');
      setErrors({});

    } catch (error: any) {
      console.error('Autofill error:', {
        message: error.message,
        stack: error.stack
      });
      setAutofillError(`Failed to process resume: ${error.message}`);
    } finally {
      setIsAutofilling(false);
    }
  };

  // Handle experience field changes
  const handleExperienceChange = (index: number, field: keyof ExperienceData, value: string | boolean) => {
    const newExperience = [...formData.custom_experience];
    if (field === 'current_company') {
      newExperience[index][field] = value ? 1 : 0;
      if (value) {
        newExperience[index]['end_date'] = '';
      }
    } else {
      (newExperience[index][field] as string) = value as string;
    }
    setFormData({ ...formData, custom_experience: newExperience });
  };

  // Handle education field changes
  const handleEducationChange = (index: number, field: keyof EducationData, value: string) => {
    const newEducation = [...formData.custom_education];
    newEducation[index][field] = value;
    setFormData({ ...formData, custom_education: newEducation });
  };

  // Add new experience entry
  const addExperience = () => {
    setFormData({
      ...formData,
      custom_experience: [...formData.custom_experience, {
        company_name: '',
        designation: '',
        start_date: '',
        end_date: '',
        current_company: 0
      }]
    });
  };

  // Remove experience entry
  const removeExperience = (index: number) => {
    if (formData.custom_experience.length > 1) {
      const newExperience = formData.custom_experience.filter((_, i) => i !== index);
      setFormData({ ...formData, custom_experience: newExperience });
    }
  };

  // Add new education entry
  const addEducation = () => {
    setFormData({
      ...formData,
      custom_education: [...formData.custom_education, {
        degree: '',
        specialization: '',
        institution: '',
        year_of_passing: '',
        percentagecgpa: ''
      }]
    });
  };

  // Remove education entry
  const removeEducation = (index: number) => {
    if (formData.custom_education.length > 1) {
      const newEducation = formData.custom_education.filter((_, i) => i !== index);
      setFormData({ ...formData, custom_education: newEducation });
    }
  };

  // Validate form before submission
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    if (!formData.applicant_name.trim()) newErrors.applicant_name = 'Full name is required';
    if (!formData.email_id.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email_id = 'Valid email is required';
    if (!formData.phone_number.match(/^\+?[\d\s-]{10,}$/)) newErrors.phone_number = 'Valid phone number is required';
    if (!formData.job_title.trim()) newErrors.job_title = 'Job title/ID is required';
    if (!formData.resume_attachment) newErrors.resume_attachment = 'Resume is required';
    
    formData.custom_experience.forEach((exp, index) => {
      if (!exp.company_name.trim()) newErrors[`experience_${index}_company`] = 'Company name is required';
      if (!exp.designation.trim()) newErrors[`experience_${index}_designation`] = 'Designation is required';
      if (!exp.start_date) newErrors[`experience_${index}_start_date`] = 'Start date is required';
      if (!exp.current_company && !exp.end_date) newErrors[`experience_${index}_end_date`] = 'End date is required';
    });
    
    formData.custom_education.forEach((edu, index) => {
      if (!edu.degree.trim()) newErrors[`education_${index}_degree`] = 'Degree is required';
      if (!edu.institution.trim()) newErrors[`education_${index}_institution`] = 'Institution is required';
      if (!edu.year_of_passing) newErrors[`education_${index}_year`] = 'Year of passing is required';
    });
    
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        data: {
          applicant_name: formData.applicant_name,
          email_id: formData.email_id,
          phone_number: formData.phone_number,
          country: formData.country,
          job_title: formData.job_title,
          resume_attachment: formData.resume_attachment, // Send file URL
          custom_experience: formData.custom_experience,
          custom_education: formData.custom_education
        }
      };

      console.log('Submitting applicant data:', payload);
      const response = await frappeAPI.createApplicants(payload.data);

      console.log('Frappe API response:', response);
      setSubmitted(true);
      
      // Reset form data
      setFormData({
        applicant_name: '',
        email_id: '',
        phone_number: '',
        country: 'India',
        job_title: searchParams.get('jobTitle') || '', // Retain job_title from URL
        resume_attachment: '',
        custom_experience: [{
          company_name: '',
          designation: '',
          start_date: '',
          end_date: '',
          current_company: 0
        }],
        custom_education: [{
          degree: '',
          specialization: '',
          institution: '',
          year_of_passing: '',
          percentagecgpa: ''
        }]
      });
      setErrors({});
      setAutofillError('');
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal and reset form
  const closeModal = () => {
    setSubmitted(false);
    setAutofillError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="w-full mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2 text-center">Job Application</h1>
        <p className="text-gray-600 mb-8 text-center">Please provide accurate information to help us process your application.</p>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="applicant_name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  id="applicant_name"
                  name="applicant_name"
                  value={formData.applicant_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.applicant_name ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter your full name"
                />
                {errors.applicant_name && <p className="text-red-600 text-sm mt-1">{errors.applicant_name}</p>}
              </div>
              <div>
                <label htmlFor="email_id" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    id="email_id"
                    name="email_id"
                    value={formData.email_id}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md ${errors.email_id ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email_id && <p className="text-red-600 text-sm mt-1">{errors.email_id}</p>}
              </div>
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md ${errors.phone_number ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="+1234567890"
                  />
                </div>
                {errors.phone_number && <p className="text-red-600 text-sm mt-1">{errors.phone_number}</p>}
              </div>
              <div>
                <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-1">Job Title/ID *</label>
                <input
                  type="text"
                  id="job_title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.job_title ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="e.g., HR-OPN-2025-0010"
                />
                {errors.job_title && <p className="text-red-600 text-sm mt-1">{errors.job_title}</p>}
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" /> Resume
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="resume_attachment" className="block text-sm font-medium text-gray-700 mb-1">Upload Resume *</label>
                <div className={`relative border-2 border-dashed rounded-md p-4 ${errors.resume_attachment ? 'border-red-300' : 'border-gray-300'}`}>
                  <input
                    type="file"
                    id="resume_attachment"
                    name="resume_attachment"
                    accept=".pdf,.docx,.txt"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isAutofilling}
                  />
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOCX, or TXT up to 16MB</p>
                    {formData.resume_attachment && (
                      <p className="text-sm text-green-600 mt-2">✓ Resume uploaded</p>
                    )}
                    {isAutofilling && (
                      <p className="text-sm text-blue-600 mt-2 flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        Processing resume...
                      </p>
                    )}
                    {autofillError && <p className="text-red-600 text-sm mt-2">{autofillError}</p>}
                  </div>
                </div>
                {errors.resume_attachment && <p className="text-red-600 text-sm mt-1">{errors.resume_attachment}</p>}
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-gray-600" /> Work Experience
              </h2>
              <button
                type="button"
                onClick={addExperience}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                disabled={isAutofilling}
              >
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            </div>
            {formData.custom_experience.map((exp, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between mb-3">
                  <h3 className="text-md font-medium text-gray-800">Experience {index + 1}</h3>
                  {formData.custom_experience.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="text-red-600 hover:text-red-700"
                      disabled={isAutofilling}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                    <input
                      type="text"
                      value={exp.company_name}
                      onChange={(e) => handleExperienceChange(index, 'company_name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${errors[`experience_${index}_company`] ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Company name"
                      disabled={isAutofilling}
                    />
                    {errors[`experience_${index}_company`] && <p className="text-red-600 text-sm mt-1">{errors[`experience_${index}_company`]}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                    <input
                      type="text"
                      value={exp.designation}
                      onChange={(e) => handleExperienceChange(index, 'designation', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${errors[`experience_${index}_designation`] ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Your role/position"
                      disabled={isAutofilling}
                    />
                    {errors[`experience_${index}_designation`] && <p className="text-red-600 text-sm mt-1">{errors[`experience_${index}_designation`]}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={exp.start_date}
                      onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${errors[`experience_${index}_start_date`] ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      disabled={isAutofilling}
                    />
                    {errors[`experience_${index}_start_date`] && <p className="text-red-600 text-sm mt-1">{errors[`experience_${index}_start_date`]}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={exp.end_date}
                      onChange={(e) => handleExperienceChange(index, 'end_date', e.target.value)}
                      disabled={exp.current_company === 1 || isAutofilling}
                      className={`w-full px-3 py-2 border rounded-md ${exp.current_company === 1 ? 'bg-gray-100 cursor-not-allowed' : errors[`experience_${index}_end_date`] ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors[`experience_${index}_end_date`] && <p className="text-red-600 text-sm mt-1">{errors[`experience_${index}_end_date`]}</p>}
                  </div>
                  <div className="md:col-span-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={exp.current_company === 1}
                        onChange={(e) => handleExperienceChange(index, 'current_company', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        disabled={isAutofilling}
                      />
                      <span className="text-sm text-gray-700">Current company</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-gray-600" /> Education
              </h2>
              <button
                type="button"
                onClick={addEducation}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                disabled={isAutofilling}
              >
                <Plus className="w-4 h-4" /> Add Education
              </button>
            </div>
            {formData.custom_education.map((edu, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between mb-3">
                  <h3 className="text-md font-medium text-gray-800">Education {index + 1}</h3>
                  {formData.custom_education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-600 hover:text-red-700"
                      disabled={isAutofilling}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${errors[`education_${index}_degree`] ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="e.g., Bachelor of Technology"
                      disabled={isAutofilling}
                    />
                    {errors[`education_${index}_degree`] && <p className="text-red-600 text-sm mt-1">{errors[`education_${index}_degree`]}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <input
                      type="text"
                      value={edu.specialization}
                      onChange={(e) => handleEducationChange(index, 'specialization', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Computer Science"
                      disabled={isAutofilling}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${errors[`education_${index}_institution`] ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="University/College name"
                      disabled={isAutofilling}
                    />
                    {errors[`education_${index}_institution`] && <p className="text-red-600 text-sm mt-1">{errors[`education_${index}_institution`]}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year of Passing *</label>
                    <input
                      type="number"
                      value={edu.year_of_passing}
                      onChange={(e) => handleEducationChange(index, 'year_of_passing', e.target.value)}
                      min="1950"
                      max="2030"
                      className={`w-full px-3 py-2 border rounded-md ${errors[`education_${index}_year`] ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="e.g., 2025"
                      disabled={isAutofilling}
                    />
                    {errors[`education_${index}_year`] && <p className="text-red-600 text-sm mt-1">{errors[`education_${index}_year`]}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Percentage/CGPA</label>
                    <input
                      type="text"
                      value={edu.percentagecgpa}
                      onChange={(e) => handleEducationChange(index, 'percentagecgpa', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 8.5 CGPA or 85%"
                      disabled={isAutofilling}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isAutofilling}
              className={`py-3 px-4 rounded-md text-white font-medium ${isSubmitting || isAutofilling ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Submit Application</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Success Modal */}
        {submitted && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <div className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted Successfully</h2>
                
                <button
                  onClick={closeModal}
                  className="w-full max-w-xs bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Submit Another Application
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// function useEffect(arg0: () => void, arg1: any[]) {
//   throw new Error('Function not implemented.');
// }
