/*eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Upload, User, Mail, Phone, Briefcase, GraduationCap, Plus, Trash2, Send, CheckCircle } from 'lucide-react';
import { frappeAPI } from '@/lib/api/frappeClient';

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

interface ApplicantRow {
  id: string;
  applicant_name: string;
  email_id: string;
  phone_number: string;
  country: string;
  job_title: string;
  designation: string;
  resume_attachment: string;
  custom_experience: ExperienceData;
  custom_education: EducationData;
  isAutofilling: boolean;
  autofillError: string;
  errors: Record<string, string>;
}

interface BulkApplicantFormProps {
  initialJobId?: string;
}

export default function BulkApplicantForm({ initialJobId }: BulkApplicantFormProps) {
  const [applicantRows, setApplicantRows] = useState<ApplicantRow[]>([
    createEmptyRow(initialJobId || '')
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });

  const countries: string[] = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Singapore', 'UAE', 'Other'];

  function createEmptyRow(jobTitle: string): ApplicantRow {
    return {
      id: `row_${Date.now()}_${Math.random()}`,
      applicant_name: '',
      email_id: '',
      phone_number: '',
      country: 'India',
      job_title: jobTitle,
      designation: '',
      resume_attachment: '',
      custom_experience: {
        company_name: '',
        designation: '',
        start_date: '',
        end_date: '',
        current_company: 0
      },
      custom_education: {
        degree: '',
        specialization: '',
        institution: '',
        year_of_passing: '',
        percentagecgpa: ''
      },
      isAutofilling: false,
      autofillError: '',
      errors: {}
    };
  }

  const handleAddRow = () => {
    setApplicantRows([...applicantRows, createEmptyRow(initialJobId || '')]);
  };

  const handleRemoveRow = (rowId: string) => {
    if (applicantRows.length > 1) {
      setApplicantRows(applicantRows.filter(row => row.id !== rowId));
    }
  };

  const handleFieldChange = (rowId: string, field: keyof ApplicantRow, value: any) => {
    setApplicantRows(rows =>
      rows.map(row => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [field]: value };
          // Clear error for this field
          if (row.errors[field]) {
            updatedRow.errors = { ...row.errors, [field]: '' };
          }
          return updatedRow;
        }
        return row;
      })
    );
  };

  const handleExperienceChange = (rowId: string, field: keyof ExperienceData, value: any) => {
    setApplicantRows(rows =>
      rows.map(row => {
        if (row.id === rowId) {
          const updatedExperience = { ...row.custom_experience };
          if (field === 'current_company') {
            updatedExperience[field] = value ? 1 : 0;
            if (value) {
              updatedExperience.end_date = '';
            }
          } else {
            updatedExperience[field] = value;
          }
          return { ...row, custom_experience: updatedExperience };
        }
        return row;
      })
    );
  };

  const handleEducationChange = (rowId: string, field: keyof EducationData, value: string) => {
    setApplicantRows(rows =>
      rows.map(row => {
        if (row.id === rowId) {
          return {
            ...row,
            custom_education: { ...row.custom_education, [field]: value }
          };
        }
        return row;
      })
    );
  };

  const handleResumeUpload = async (rowId: string, file: File) => {
    setApplicantRows(rows =>
      rows.map(row =>
        row.id === rowId ? { ...row, isAutofilling: true, autofillError: '' } : row
      )
    );

    try {
      console.log('Starting resume upload for row:', rowId);

      // Step 1: Upload file to Frappe server
      const uploadResponse = await frappeAPI.upload(file, {
        is_private: false,
        folder: 'Home',
      });

      if (!uploadResponse.success || !uploadResponse.file_url) {
        throw new Error(uploadResponse.error || 'Failed to upload resume to server');
      }

      const fileUrl = uploadResponse.file_url;
      console.log('File uploaded successfully, URL:', fileUrl);

      // Step 2: Call autofill API
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('fileName', file.name);

      const currentRow = applicantRows.find(r => r.id === rowId);
      uploadFormData.append('jobTitle', currentRow?.job_title || '');

      const response = await fetch('/api/jobapplicant', {
        method: 'POST',
        body: uploadFormData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error('Invalid response format from server');
      }

      const { data } = result;

      // Update the specific row with autofilled data
      setApplicantRows(rows =>
        rows.map(row => {
          if (row.id === rowId) {
            return {
              ...row,
              applicant_name: data.applicant_name || '',
              email_id: data.email_id || '',
              phone_number: data.phone_number || '',
              country: data.country || 'India',
              job_title: data.job_title || row.job_title,
              resume_attachment: fileUrl,
              custom_experience: data.custom_experience && data.custom_experience.length > 0
                ? {
                  company_name: data.custom_experience[0].company_name || '',
                  designation: data.custom_experience[0].designation || '',
                  start_date: data.custom_experience[0].start_date || '',
                  end_date: data.custom_experience[0].end_date || '',
                  current_company: data.custom_experience[0].current_company || 0
                }
                : row.custom_experience,
              custom_education: data.custom_education && data.custom_education.length > 0
                ? {
                  degree: data.custom_education[0].degree || '',
                  specialization: data.custom_education[0].specialization || '',
                  institution: data.custom_education[0].institution || '',
                  year_of_passing: String(data.custom_education[0].year_of_passing || ''),
                  percentagecgpa: String(data.custom_education[0].percentagecgpa || '')
                }
                : row.custom_education,
              isAutofilling: false,
              autofillError: ''
            };
          }
          return row;
        })
      );

    } catch (error: any) {
      console.error('Autofill error:', error);
      setApplicantRows(rows =>
        rows.map(row =>
          row.id === rowId
            ? { ...row, isAutofilling: false, autofillError: `Failed to process resume: ${error.message}` }
            : row
        )
      );
    }
  };

  const validateRow = (row: ApplicantRow): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!row.applicant_name.trim()) errors.applicant_name = 'Name is required';
    if (!row.email_id.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email_id = 'Valid email is required';
    if (!row.phone_number.match(/^\+?[\d\s-]{10,}$/)) errors.phone_number = 'Valid phone number is required';
    if (!row.job_title.trim()) errors.job_title = 'Job title is required';

    if (!row.resume_attachment) errors.resume_attachment = 'Resume is required';

    // Experience validation
    if (!row.custom_experience.company_name.trim()) errors.exp_company = 'Company name is required';
    // if (!row.custom_experience.designation.trim()) errors.exp_designation = 'Designation is required';
    if (!row.custom_experience.start_date) errors.exp_start = 'Start date is required';
    if (!row.custom_experience.current_company && !row.custom_experience.end_date) {
      errors.exp_end = 'End date is required';
    }

    // Education validation
    if (!row.custom_education.degree.trim()) errors.edu_degree = 'Degree is required';
    if (!row.custom_education.institution.trim()) errors.edu_institution = 'Institution is required';
    if (!row.custom_education.year_of_passing) errors.edu_year = 'Year of passing is required';

    return errors;
  };

  const handleSubmit = async () => {
    // Validate all rows
    let hasErrors = false;
    const updatedRows = applicantRows.map(row => {
      const errors = validateRow(row);
      if (Object.keys(errors).length > 0) {
        hasErrors = true;
        return { ...row, errors };
      }
      return { ...row, errors: {} };
    });

    setApplicantRows(updatedRows);

    if (hasErrors) {
      alert('Please fix all validation errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare payload
      const payload = applicantRows.map(row => ({
        applicant_name: row.applicant_name,
        email_id: row.email_id,
        phone_number: row.phone_number,
        country: row.country,
        job_title: row.job_title,
        designation: row.designation,
        status: 'Tagged',
        source: '',
        resume_attachment: row.resume_attachment,
        custom_experience: [
          {
            company_name: row.custom_experience.company_name,
            designation: row.custom_experience.designation,
            start_date: row.custom_experience.start_date,
            end_date: row.custom_experience.end_date,
            current_company: row.custom_experience.current_company
          }
        ],
        custom_education: [
          {
            degree: row.custom_education.degree,
            specialization: row.custom_education.specialization,
            institution: row.custom_education.institution,
            year_of_passing: parseInt(row.custom_education.year_of_passing),
            percentagecgpa: parseFloat(row.custom_education.percentagecgpa) || 0
          }
        ]
      }));

      console.log('Submitting bulk applicants:', payload);

      const response = await frappeAPI.createBulkApplicants(payload);

      console.log('Bulk submission response:', response);

      // Calculate success/failed counts
      const successCount = response.results?.filter((r: any) => r.success).length || applicantRows.length;
      const failedCount = applicantRows.length - successCount;

      setSubmissionResult({ success: successCount, failed: failedCount });
      setSubmitted(true);

      // Reset form if all successful
      if (failedCount === 0) {
        setApplicantRows([createEmptyRow(initialJobId || '')]);
      }

    } catch (error: any) {
      console.error('Submission error:', error);
      alert(`Failed to submit applications: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setSubmitted(false);
    setSubmissionResult({ success: 0, failed: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="w-full mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2 text-center">Create Job Applications</h1>
        <p className="text-gray-600 mb-8 text-center">Upload resumes and submit the applications</p>

        <div className="space-y-6">
          {applicantRows.map((row, index) => (
            <div key={row.id} className="bg-white rounded-lg shadow-md p-6">
              {/* Row Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Applicant </h2>
                {applicantRows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.id)}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1"
                    disabled={row.isAutofilling}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Remove</span>
                  </button>
                )}
              </div>

              {/* Resume Upload */}
              {/* <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 ">Upload Resume *</label>
                <div className={`relative border-2 border-dashed rounded-md p-4 ${row.errors.resume_attachment ? 'border-red-300' : 'border-gray-300'}`}>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleResumeUpload(row.id, file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={row.isAutofilling}
                  />
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 " />
                  
                    {row.resume_attachment && (
                      <p className="text-sm text-green-600 mt-2">✓ Resume uploaded</p>
                    )}
                    {row.isAutofilling && (
                      <p className="text-sm text-blue-600 mt-2 flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </p>
                    )}
                    {row.autofillError && <p className="text-red-600 text-sm mt-2">{row.autofillError}</p>}
                  </div>
                </div>
                {row.errors.resume_attachment && <p className="text-red-600 text-sm mt-1">{row.errors.resume_attachment}</p>}
              </div>

              <div className="mb-6">
               
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={row.applicant_name}
                      onChange={(e) => handleFieldChange(row.id, 'applicant_name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${row.errors.applicant_name ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="Enter name"
                      disabled={row.isAutofilling}
                    />
                    {row.errors.applicant_name && <p className="text-red-600 text-sm mt-1">{row.errors.applicant_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={row.email_id}
                        onChange={(e) => handleFieldChange(row.id, 'email_id', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md ${row.errors.email_id ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="email@example.com"
                        disabled={row.isAutofilling}
                      />
                    </div>
                    {row.errors.email_id && <p className="text-red-600 text-sm mt-1">{row.errors.email_id}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={row.phone_number}
                        onChange={(e) => handleFieldChange(row.id, 'phone_number', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md ${row.errors.phone_number ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="+1234567890"
                        disabled={row.isAutofilling}
                      />
                    </div>
                    {row.errors.phone_number && <p className="text-red-600 text-sm mt-1">{row.errors.phone_number}</p>}
                  </div> */}
              {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <select
                      value={row.country}
                      onChange={(e) => handleFieldChange(row.id, 'country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      disabled={row.isAutofilling}
                    >
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div> */}
              {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                    <input
                      type="text"
                      value={row.job_title}
                      onChange={(e) => handleFieldChange(row.id, 'job_title', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${row.errors.job_title ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="HR-OPN-2025-0010"
                      disabled={row.isAutofilling}
                    />
                    {row.errors.job_title && <p className="text-red-600 text-sm mt-1">{row.errors.job_title}</p>}
                  </div> */}
              {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={row.designation}
                        onChange={(e) => handleFieldChange(row.id, 'designation', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md ${row.errors.designation ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="e.g., Software Engineer"
                        disabled={row.isAutofilling}
                      />
                    </div>
                    {row.errors.designation && <p className="text-red-600 text-sm mt-1">{row.errors.designation}</p>}
                  </div> */}
              {/* </div> */}
              {/* </div> */}
              <div className="mb-6 flex flex-wrap items-start gap-4">
                {/* Resume Upload */}
                <div className="flex-none">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Resume *</label>
                  <div className={`relative w-30 h-10 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer ${row.errors.resume_attachment ? 'border-red-300' : 'border-gray-300'}`}>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleResumeUpload(row.id, file);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={row.isAutofilling}
                    />
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  {row.resume_attachment && <p className="text-sm text-green-600 mt-1">✓ Resume uploaded</p>}
                  {row.errors.resume_attachment && <p className="text-red-600 text-sm mt-1">{row.errors.resume_attachment}</p>}
                </div>

                {/* Personal Information */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={row.applicant_name}
                      onChange={(e) => handleFieldChange(row.id, 'applicant_name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${row.errors.applicant_name ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="Enter name"
                      disabled={row.isAutofilling}
                    />
                    {row.errors.applicant_name && <p className="text-red-600 text-sm mt-1">{row.errors.applicant_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={row.email_id}
                        onChange={(e) => handleFieldChange(row.id, 'email_id', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md ${row.errors.email_id ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="email@example.com"
                        disabled={row.isAutofilling}
                      />
                    </div>
                    {row.errors.email_id && <p className="text-red-600 text-sm mt-1">{row.errors.email_id}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={row.phone_number}
                        onChange={(e) => handleFieldChange(row.id, 'phone_number', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md ${row.errors.phone_number ? 'border-red-300' : 'border-gray-300'}`}
                        placeholder="+1234567890"
                        disabled={row.isAutofilling}
                      />
                    </div>
                    {row.errors.phone_number && <p className="text-red-600 text-sm mt-1">{row.errors.phone_number}</p>}
                  </div>
                </div>
              </div>

              {/* Experience */}
              {/* <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Work Experience
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                    <input
                      type="text"
                      value={row.custom_experience.company_name}
                      onChange={(e) => handleExperienceChange(row.id, 'company_name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${row.errors.exp_company ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="Company name"
                      disabled={row.isAutofilling}
                    />
                    {row.errors.exp_company && <p className="text-red-600 text-sm mt-1">{row.errors.exp_company}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <input
                      type="text"
                      value={row.custom_experience.designation}
                      onChange={(e) => handleExperienceChange(row.id, 'designation', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${row.errors.exp_designation ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="Your role"
                      disabled={row.isAutofilling}
                    />
                    {row.errors.exp_designation && <p className="text-red-600 text-sm mt-1">{row.errors.exp_designation}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={row.custom_experience.start_date}
                      onChange={(e) => handleExperienceChange(row.id, 'start_date', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${row.errors.exp_start ? 'border-red-300' : 'border-gray-300'}`}
                      disabled={row.isAutofilling}
                    />
                    {row.errors.exp_start && <p className="text-red-600 text-sm mt-1">{row.errors.exp_start}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={row.custom_experience.end_date}
                      onChange={(e) => handleExperienceChange(row.id, 'end_date', e.target.value)}
                      disabled={row.custom_experience.current_company === 1 || row.isAutofilling}
                      className={`w-full px-3 py-2 border rounded-md ${row.custom_experience.current_company === 1 ? 'bg-gray-100' : row.errors.exp_end ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {row.errors.exp_end && <p className="text-red-600 text-sm mt-1">{row.errors.exp_end}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={row.custom_experience.current_company === 1}
                        onChange={(e) => handleExperienceChange(row.id, 'current_company', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        disabled={row.isAutofilling}
                      />
                      <span className="text-sm text-gray-700">Currently working here</span>
                    </label>
                  </div>
                </div>
              </div> */}

              {/* Education */}
              {/* <div>
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> Education
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
                    <input
                      type="text"
                      value={row.custom_education.degree}
                      onChange={(e) => handleEducationChange(row.id, 'degree', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${row.errors.edu_degree ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="e.g., B.Tech"
                      disabled={row.isAutofilling}
                    />
                    {row.errors.edu_degree && <p className="text-red-600 text-sm mt-1">{row.errors.edu_degree}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <input
                      type="text"
                      value={row.custom_education.specialization}
                      onChange={(e) => handleEducationChange(row.id, 'specialization', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Computer Science"
                      disabled={row.isAutofilling}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
                    <input
                      type="text"
                      value={row.custom_education.institution}
                      onChange={(e) => handleEducationChange(row.id, 'institution', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${row.errors.edu_institution ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="University name"
                      disabled={row.isAutofilling}
                    />
                    {row.errors.edu_institution && <p className="text-red-600 text-sm mt-1">{row.errors.edu_institution}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                    <input
                      type="number"
                      value={row.custom_education.year_of_passing}
                      onChange={(e) => handleEducationChange(row.id, 'year_of_passing', e.target.value)}
                      min="1950"
                      max="2030"
                      className={`w-full px-3 py-2 border rounded-md ${row.errors.edu_year ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="2025"
                      disabled={row.isAutofilling}
                    />
                    {row.errors.edu_year && <p className="text-red-600 text-sm mt-1">{row.errors.edu_year}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Percentage/CGPA</label>
                    <input
                      type="text"
                      value={row.custom_education.percentagecgpa}
                      onChange={(e) => handleEducationChange(row.id, 'percentagecgpa', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., 8.5 or 85%"
                      disabled={row.isAutofilling}
                    />
                  </div>
                </div>
              </div> */}
            </div>
          ))}

          {/* Add New Row Button */}
          {/* <div className="flex justify-center">
            <button
              type="button"
              onClick={handleAddRow}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium flex items-center gap-2 transition-colors"
              disabled={isSubmitting}
            >
              <Plus className="w-5 h-5" />
              Add Another Applicant
            </button>
          </div> */}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || applicantRows.some(row => row.isAutofilling)}
              className={`py-3 px-8 rounded-md text-white font-medium flex items-center gap-2 ${isSubmitting || applicantRows.some(row => row.isAutofilling)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
                } transition-colors`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting {applicantRows.length} Applications...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Modal */}
        {submitted && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <div className="flex flex-col items-center">
                <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Bulk Submission Complete!</h2>
                <div className="text-center mb-6">
                  <p className="text-lg text-green-600 font-medium">
                    ✓ {submissionResult.success} application{submissionResult.success !== 1 ? 's' : ''} submitted successfully
                  </p>
                  {submissionResult.failed > 0 && (
                    <p className="text-lg text-red-600 font-medium mt-2">
                      ✗ {submissionResult.failed} application{submissionResult.failed !== 1 ? 's' : ''} failed
                    </p>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  className="w-full max-w-xs bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}