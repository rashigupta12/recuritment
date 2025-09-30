/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Upload, User, Mail, Phone, FileText, Briefcase, CheckCircle, GraduationCap, Building, MapPin, Plus, Trash2, RotateCcw, RefreshCw } from 'lucide-react';
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

interface ApplicantData {
  file?: File;
  applicant_name: string;
  email_id: string;
  phone_number: string;
  country: string;
  job_title: string;
  resume_attachment: string;
  custom_experience: ExperienceData[];
  custom_education: EducationData[];
}

interface FormErrors {
  [key: string]: string;
}

export default function MultipleApplicantsForm() {
  const searchParams = useSearchParams();
  const initialApplicantState: ApplicantData = {
    applicant_name: '',
    email_id: '',
    phone_number: '',
    country: 'India',
    job_title: searchParams.get('jobTitle') || '',
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
  };
  const [currentApplicant, setCurrentApplicant] = useState<ApplicantData>(initialApplicantState);
  const [previousApplicants, setPreviousApplicants] = useState<ApplicantData[]>([]);
  const [failedApplicants, setFailedApplicants] = useState<ApplicantData[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAutofilling, setIsAutofilling] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const countries: string[] = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Singapore', 'UAE', 'Other'];

  // Update job_title from query parameter on mount
  useEffect(() => {
    const jobTitleFromUrl = searchParams.get('jobTitle');
    if (jobTitleFromUrl) {
      setCurrentApplicant(prev => ({ ...prev, job_title: jobTitleFromUrl }));
    }
  }, [searchParams]);

  // Handle file upload and autofill (adopted from ApplicantForm.tsx)
  const handleFileChange = async (file: File) => {
    setIsAutofilling(true);
    setUploadErrors([]);
    setErrors({});

    try {
      console.log('Starting resume upload for:', file.name, { size: file.size, type: file.type });

      // Step 1: Upload file to Frappe server
      console.log('Uploading file to Frappe server...');
      const uploadResponse = await frappeAPI.upload(file, {
        is_private: false,
        folder: 'Home',
      });

      if (!uploadResponse.success || !uploadResponse.file_url) {
        throw new Error(uploadResponse.error || `Failed to upload ${file.name}`);
      }

      const fileUrl = uploadResponse.file_url;
      console.log('File uploaded successfully, URL:', fileUrl);

      // Step 2: Call autofill API
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('fileName', file.name);
      uploadFormData.append('jobTitle', currentApplicant.job_title);

      console.log('Sending autofill request to /api/jobapplicant', { jobTitle: currentApplicant.job_title });
      const response = await fetch('/api/jobapplicant', {
        method: 'POST',
        body: uploadFormData
      });

      console.log('Autofill response:', { status: response.status, statusText: response.statusText });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error for ${file.name}, status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Autofill response parsed:', result);

      if (!result.success || !result.data) {
        throw new Error(`Invalid response format for ${file.name}`);
      }

      const { data } = result;

      // Update current applicant with autofilled data
      setCurrentApplicant(prev => ({
        ...prev,
        file,
        applicant_name: data.applicant_name || '',
        email_id: data.email_id || '',
        phone_number: data.phone_number || '',
        country: data.country || 'India',
        job_title: data.job_title || prev.job_title,
        resume_attachment: fileUrl,
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
      console.log(`Form updated with autofill data for ${file.name}`);
    } catch (error: any) {
      console.error('Autofill error:', { message: error.message, stack: error.stack });
      setUploadErrors([`Failed to process ${file.name}: ${error.message}`]);
    } finally {
      setIsAutofilling(false);
    }
  };

  // Handle changes to current applicant fields
  const handleApplicantChange = (field: keyof ApplicantData, value: string | File) => {
    if (value instanceof File) {
      handleFileChange(value);
    } else {
      setCurrentApplicant({ ...currentApplicant, [field]: value });
      if (errors[field]) {
        setErrors({ ...errors, [field]: '' });
      }
    }
  };

  // Handle experience field changes
  const handleExperienceChange = (expIndex: number, field: keyof ExperienceData, value: string | boolean) => {
    const newExperience = [...currentApplicant.custom_experience];
    if (field === 'current_company') {
      newExperience[expIndex][field] = value ? 1 : 0;
      if (value) {
        newExperience[expIndex]['end_date'] = '';
      }
    } else {
      (newExperience[expIndex][field] as string) = value as string;
    }
    setCurrentApplicant({ ...currentApplicant, custom_experience: newExperience });
    const errorKey = `experience_${expIndex}_${field}`;
    if (errors[errorKey]) {
      setErrors({ ...errors, [errorKey]: '' });
    }
  };

  // Handle education field changes
  const handleEducationChange = (eduIndex: number, field: keyof EducationData, value: string) => {
    const newEducation = [...currentApplicant.custom_education];
    newEducation[eduIndex][field] = value;
    setCurrentApplicant({ ...currentApplicant, custom_education: newEducation });
    const errorKey = `education_${eduIndex}_${field}`;
    if (errors[errorKey]) {
      setErrors({ ...errors, [errorKey]: '' });
    }
  };

  // Add new experience entry
  const addExperience = () => {
    const newExperience = [...currentApplicant.custom_experience, {
      company_name: '',
      designation: '',
      start_date: '',
      end_date: '',
      current_company: 0
    }];
    setCurrentApplicant({ ...currentApplicant, custom_experience: newExperience });
  };

  // Remove experience entry
  const removeExperience = (expIndex: number) => {
    if (currentApplicant.custom_experience.length <= 1) return;
    const newExperience = currentApplicant.custom_experience.filter((_, i) => i !== expIndex);
    setCurrentApplicant({ ...currentApplicant, custom_experience: newExperience });
  };

  // Add new education entry
  const addEducation = () => {
    const newEducation = [...currentApplicant.custom_education, {
      degree: '',
      specialization: '',
      institution: '',
      year_of_passing: '',
      percentagecgpa: ''
    }];
    setCurrentApplicant({ ...currentApplicant, custom_education: newEducation });
  };

  // Remove education entry
  const removeEducation = (eduIndex: number) => {
    if (currentApplicant.custom_education.length <= 1) return;
    const newEducation = currentApplicant.custom_education.filter((_, i) => i !== eduIndex);
    setCurrentApplicant({ ...currentApplicant, custom_education: newEducation });
  };

  // Reset form to initial state
  const handleReset = () => {
    setCurrentApplicant(initialApplicantState);
    setErrors({});
    setUploadErrors([]);
  };

  // Validate current applicant
  const validateCurrent = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!currentApplicant.applicant_name.trim()) newErrors.applicant_name = 'Full name is required';
    if (!currentApplicant.email_id.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email_id = 'Valid email is required';
    if (!currentApplicant.phone_number.match(/^\+?[\d\s-]{10,}$/)) newErrors.phone_number = 'Valid phone number is required';
    if (!currentApplicant.job_title.trim()) newErrors.job_title = 'Job title/ID is required';

    currentApplicant.custom_experience.forEach((exp, index) => {
      if (!exp.company_name.trim()) newErrors[`experience_${index}_company`] = 'Company name is required';
      if (!exp.designation.trim()) newErrors[`experience_${index}_designation`] = 'Designation is required';
      if (!exp.start_date) newErrors[`experience_${index}_start_date`] = 'Start date is required';
      if (!exp.current_company && !exp.end_date) newErrors[`experience_${index}_end_date`] = 'End date is required';
    });

    currentApplicant.custom_education.forEach((edu, index) => {
      if (!edu.degree.trim()) newErrors[`education_${index}_degree`] = 'Degree is required';
      if (!edu.institution.trim()) newErrors[`education_${index}_institution`] = 'Institution is required';
      if (!edu.year_of_passing) newErrors[`education_${index}_year`] = 'Year of passing is required';
    });

    return newErrors;
  };

  // Handle add another
  const handleAddAnother = () => {
    const validationErrors = validateCurrent();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setPreviousApplicants([...previousApplicants, currentApplicant]);
    setCurrentApplicant(initialApplicantState);
    setErrors({});
    setUploadErrors([]);
  };

  // Remove a previous applicant
  const removePrevious = (index: number) => {
    const newPrevious = previousApplicants.filter((_, i) => i !== index);
    setPreviousApplicants(newPrevious);
  };

  // Handle form submission
  const handleSubmit = async (applicantsToSubmit: ApplicantData[] = []) => {
    let allApplicants = applicantsToSubmit.length > 0 ? applicantsToSubmit : [...previousApplicants];

    // Validate current applicant only if not retrying failed applicants
    if (applicantsToSubmit.length === 0) {
      const validationErrors = validateCurrent();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      allApplicants = [...allApplicants, currentApplicant];
    }

    setIsSubmitting(true);
    setUploadErrors([]);
    const processErrors: string[] = [];
    const newFailedApplicants: ApplicantData[] = [];

    for (const applicant of allApplicants) {
      try {
        const payload = {
          data: {
            applicant_name: applicant.applicant_name,
            email_id: applicant.email_id,
            phone_number: applicant.phone_number,
            country: applicant.country,
            job_title: applicant.job_title,
            resume_attachment: applicant.resume_attachment,
            custom_experience: applicant.custom_experience,
            custom_education: applicant.custom_education
          }
        };

        console.log(`Submitting applicant data for ${applicant.file?.name || applicant.applicant_name}:`, JSON.stringify(payload, null, 2));
        const response = await frappeAPI.createApplicants(payload.data);

        console.log(`Frappe API response for ${applicant.file?.name || applicant.applicant_name}:`, response);

        if (!response.success) {
          throw new Error(response.error || `Failed to create applicant record for ${applicant.file?.name || applicant.applicant_name}`);
        }
      } catch (error: any) {
        console.error(`Submission error for ${applicant.file?.name || applicant.applicant_name}:`, {
          message: error.message,
          stack: error.stack,
          response: error.response || 'No response data'
        });
        processErrors.push(`Error submitting ${applicant.file?.name || applicant.applicant_name}: ${error.message}`);
        newFailedApplicants.push(applicant);
      }
    }

    setIsSubmitting(false);
    setFailedApplicants(newFailedApplicants);

    if (processErrors.length > 0) {
      setUploadErrors(processErrors);
    } else {
      setSubmitted(true);
      setPreviousApplicants([]);
      setCurrentApplicant(initialApplicantState);
      setErrors({});
      setFailedApplicants([]);
    }
  };

  // Retry failed applicants
  const handleRetryFailed = () => {
    if (failedApplicants.length === 0) return;
    handleSubmit(failedApplicants);
  };

  // Close modal
  const closeModal = () => {
    setSubmitted(false);
    setUploadErrors([]);
    setFailedApplicants([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="w-full mx-auto max-w-7xl">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2 text-center">Job Applicant</h1>
        <p className="text-gray-600 mb-8 text-center">Please provide accurate information to help us process your application</p>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Current Applicant Form */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" /> Current Applicant Details
            </h2>
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Job Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title/ID *</label>
                  <input
                    type="text"
                    value={currentApplicant.job_title}
                    onChange={(e) => handleApplicantChange('job_title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${errors.job_title ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="e.g., HR-OPN-2025-0010"
                    disabled={isSubmitting || isAutofilling}
                  />
                  {errors.job_title && <p className="text-red-600 text-sm mt-1">{errors.job_title}</p>}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={currentApplicant.applicant_name}
                    onChange={(e) => handleApplicantChange('applicant_name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md ${errors.applicant_name ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Enter full name"
                    disabled={isSubmitting || isAutofilling}
                  />
                  {errors.applicant_name && <p className="text-red-600 text-sm mt-1">{errors.applicant_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={currentApplicant.email_id}
                      onChange={(e) => handleApplicantChange('email_id', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md ${errors.email_id ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="your.email@example.com"
                      disabled={isSubmitting || isAutofilling}
                    />
                  </div>
                  {errors.email_id && <p className="text-red-600 text-sm mt-1">{errors.email_id}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={currentApplicant.phone_number}
                      onChange={(e) => handleApplicantChange('phone_number', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md ${errors.phone_number ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="+1234567890"
                      disabled={isSubmitting || isAutofilling}
                    />
                  </div>
                  {errors.phone_number && <p className="text-red-600 text-sm mt-1">{errors.phone_number}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={currentApplicant.country}
                      onChange={(e) => handleApplicantChange('country', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting || isAutofilling}
                    >
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Upload Resume (Optional)</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">Upload a Resume</label>
                  <div className={`relative border-2 border-dashed rounded-md p-4 border-gray-300`}>
                    <input
                      type="file"
                      id="resume"
                      name="resume"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => e.target.files && handleApplicantChange('file', e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isAutofilling || isSubmitting}
                    />
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, DOCX, or TXT up to 16MB</p>
                      {isAutofilling && (
                        <p className="text-sm text-blue-600 mt-2 flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          Processing resume...
                        </p>
                      )}
                      {currentApplicant.resume_attachment && (
                        <p className="text-sm text-green-600 mt-2">✓ Resume uploaded: {currentApplicant.file?.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-gray-600" /> Work Experience
                </h4>
                <button
                  type="button"
                  onClick={addExperience}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  disabled={isSubmitting || isAutofilling}
                >
                  <Plus className="w-4 h-4" /> Add Experience
                </button>
              </div>
              {currentApplicant.custom_experience.map((exp, eIndex) => (
                <div key={eIndex} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between mb-3">
                    <h5 className="text-sm font-medium text-gray-800">Experience {eIndex + 1}</h5>
                    {currentApplicant.custom_experience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExperience(eIndex)}
                        className="text-red-600 hover:text-red-700"
                        disabled={isSubmitting || isAutofilling}
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
                        onChange={(e) => handleExperienceChange(eIndex, 'company_name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${errors[`experience_${eIndex}_company`] ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Company name"
                        disabled={isSubmitting || isAutofilling}
                      />
                      {errors[`experience_${eIndex}_company`] && <p className="text-red-600 text-sm mt-1">{errors[`experience_${eIndex}_company`]}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                      <input
                        type="text"
                        value={exp.designation}
                        onChange={(e) => handleExperienceChange(eIndex, 'designation', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${errors[`experience_${eIndex}_designation`] ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="Your role/position"
                        disabled={isSubmitting || isAutofilling}
                      />
                      {errors[`experience_${eIndex}_designation`] && <p className="text-red-600 text-sm mt-1">{errors[`experience_${eIndex}_designation`]}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                      <input
                        type="date"
                        value={exp.start_date}
                        onChange={(e) => handleExperienceChange(eIndex, 'start_date', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${errors[`experience_${eIndex}_start_date`] ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        disabled={isSubmitting || isAutofilling}
                      />
                      {errors[`experience_${eIndex}_start_date`] && <p className="text-red-600 text-sm mt-1">{errors[`experience_${eIndex}_start_date`]}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={exp.end_date}
                        onChange={(e) => handleExperienceChange(eIndex, 'end_date', e.target.value)}
                        disabled={exp.current_company === 1 || isSubmitting || isAutofilling}
                        className={`w-full px-3 py-2 border rounded-md ${exp.current_company === 1 ? 'bg-gray-100 cursor-not-allowed' : errors[`experience_${eIndex}_end_date`] ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors[`experience_${eIndex}_end_date`] && <p className="text-red-600 text-sm mt-1">{errors[`experience_${eIndex}_end_date`]}</p>}
                    </div>
                    <div className="md:col-span-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={exp.current_company === 1}
                          onChange={(e) => handleExperienceChange(eIndex, 'current_company', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          disabled={isSubmitting || isAutofilling}
                        />
                        <span className="text-sm text-gray-700">Current company</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-gray-600" /> Education
                </h4>
                <button
                  type="button"
                  onClick={addEducation}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  disabled={isSubmitting || isAutofilling}
                >
                  <Plus className="w-4 h-4" /> Add Education
                </button>
              </div>
              {currentApplicant.custom_education.map((edu, eIndex) => (
                <div key={eIndex} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between mb-3">
                    <h5 className="text-sm font-medium text-gray-800">Education {eIndex + 1}</h5>
                    {currentApplicant.custom_education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEducation(eIndex)}
                        className="text-red-600 hover:text-red-700"
                        disabled={isSubmitting || isAutofilling}
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
                        onChange={(e) => handleEducationChange(eIndex, 'degree', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${errors[`education_${eIndex}_degree`] ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="e.g., Bachelor of Technology"
                        disabled={isSubmitting || isAutofilling}
                      />
                      {errors[`education_${eIndex}_degree`] && <p className="text-red-600 text-sm mt-1">{errors[`education_${eIndex}_degree`]}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                      <input
                        type="text"
                        value={edu.specialization}
                        onChange={(e) => handleEducationChange(eIndex, 'specialization', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Computer Science"
                        disabled={isSubmitting || isAutofilling}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(eIndex, 'institution', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${errors[`education_${eIndex}_institution`] ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="University/College name"
                        disabled={isSubmitting || isAutofilling}
                      />
                      {errors[`education_${eIndex}_institution`] && <p className="text-red-600 text-sm mt-1">{errors[`education_${eIndex}_institution`]}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year of Passing *</label>
                      <input
                        type="number"
                        value={edu.year_of_passing}
                        onChange={(e) => handleEducationChange(eIndex, 'year_of_passing', e.target.value)}
                        min="1950"
                        max="2030"
                        className={`w-full px-3 py-2 border rounded-md ${errors[`education_${eIndex}_year`] ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        placeholder="e.g., 2025"
                        disabled={isSubmitting || isAutofilling}
                      />
                      {errors[`education_${eIndex}_year`] && <p className="text-red-600 text-sm mt-1">{errors[`education_${eIndex}_year`]}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Percentage/CGPA</label>
                      <input
                        type="text"
                        value={edu.percentagecgpa}
                        onChange={(e) => handleEducationChange(eIndex, 'percentagecgpa', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 8.5 CGPA or 85%"
                        disabled={isSubmitting || isAutofilling}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
           
          </div>

          {/* Previously Added Applicants */}
          {previousApplicants.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" /> Previously Added Applicants
              </h2>
              {previousApplicants.map((applicant, index) => (
                <div key={index} className="mb-6 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between mb-3">
                    <h3 className="text-md font-medium text-gray-800">Applicant {index + 1} - {applicant.file?.name || applicant.applicant_name}</h3>
                    <button
                      type="button"
                      onClick={() => removePrevious(index)}
                      className="text-red-600 hover:text-red-700"
                      disabled={isSubmitting || isAutofilling}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p><strong>Job Title/ID:</strong> {applicant.job_title}</p>
                  <p><strong>Full Name:</strong> {applicant.applicant_name}</p>
                  <p><strong>Email:</strong> {applicant.email_id}</p>
                  <p><strong>Phone:</strong> {applicant.phone_number}</p>
                  <p><strong>Country:</strong> {applicant.country}</p>
                  {applicant.resume_attachment && <p><strong>Resume:</strong> {applicant.file?.name}</p>}
                  <h4 className="font-medium mt-4 mb-2">Work Experience</h4>
                  <ul className="list-disc pl-5">
                    {applicant.custom_experience.map((exp, eIndex) => (
                      <li key={eIndex}>
                        {exp.company_name} - {exp.designation} (from {exp.start_date} to {exp.end_date || 'Present'})
                      </li>
                    ))}
                  </ul>
                  <h4 className="font-medium mt-4 mb-2">Education</h4>
                  <ul className="list-disc pl-5">
                    {applicant.custom_education.map((edu, eIndex) => (
                      <li key={eIndex}>
                        {edu.degree} {edu.specialization ? `in ${edu.specialization}` : ''}, {edu.institution}, {edu.year_of_passing}{edu.percentagecgpa ? `, ${edu.percentagecgpa}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
           <div className="flex justify-end gap-4 mt-6 flex-wrap">
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting || isAutofilling}
                className={`py-3 px-4 rounded-md text-white font-medium ${isSubmitting || isAutofilling ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'} transition-colors flex items-center gap-2`}
              >
                <RotateCcw className="w-4 h-4" /> Reset Form
              </button>
              <button
                type="button"
                onClick={handleAddAnother}
                disabled={isSubmitting || isAutofilling}
                className={`py-3 px-4 rounded-md text-white font-medium ${isSubmitting || isAutofilling ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} transition-colors flex items-center gap-2`}
              >
                <Plus className="w-4 h-4" /> Confirm and Add
              </button>
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting || isAutofilling}
                className={`py-3 px-4 rounded-md text-white font-medium ${isSubmitting || isAutofilling ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition-colors flex items-center gap-2`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Submit All Applications
                  </>
                )}
              </button>
              {failedApplicants.length > 0 && (
                <button
                  type="button"
                  onClick={handleRetryFailed}
                  disabled={isSubmitting || isAutofilling}
                  className={`py-3 px-4 rounded-md text-white font-medium ${isSubmitting || isAutofilling ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'} transition-colors flex items-center gap-2`}
                >
                  <RefreshCw className="w-4 h-4" /> Retry Failed ({failedApplicants.length})
                </button>
              )}
            </div>

          {/* Upload Errors */}
          {uploadErrors.length > 0 && (
            <div className="mb-8 p-4 bg-red-100 rounded-md">
              <h3 className="text-sm font-medium text-red-800 mb-2">Errors:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {uploadErrors.map((err, i) => (
                  <li key={i} className="text-sm text-red-700">{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Success Modal */}
        {submitted && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <div className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">All Applications Submitted Successfully</h2>
                <button
                  onClick={closeModal}
                  className="w-full max-w-xs bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Add More Applicants
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
