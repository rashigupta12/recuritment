'use client';

import { useState } from 'react';
import { Plus, Trash2, Upload, Save } from 'lucide-react';
import { frappeAPI } from '@/lib/api/frappeClient';

interface Applicant {
  id: string;
  applicant_name: string;
  email_id: string;
  phone_number: string;
  resume_attachment: string;
  job_title: string;
  isUploading: boolean;
}

export default function BulkApplicantForm() {
  const [applicants, setApplicants] = useState<Applicant[]>([
    {
      id: '1',
      applicant_name: '',
      email_id: '',
      phone_number: '',
      resume_attachment: '',
      job_title: 'HR-OPN-2025-0010',
      isUploading: false
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Add new applicant row
  const addApplicant = () => {
    const newApplicant: Applicant = {
      id: Date.now().toString(),
      applicant_name: '',
      email_id: '',
      phone_number: '',
      resume_attachment: '',
      job_title: 'HR-OPN-2025-0010',
      isUploading: false
    };
    setApplicants([...applicants, newApplicant]);
  };

  // Remove applicant row
  const removeApplicant = (id: string) => {
    if (applicants.length > 1) {
      setApplicants(applicants.filter(app => app.id !== id));
      // Remove errors for this applicant
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(id)) {
          delete newErrors[key];
        }
      });
      setErrors(newErrors);
    }
  };

  // Update applicant field
  const updateApplicant = (id: string, field: keyof Applicant, value: string) => {
    setApplicants(applicants.map(app => 
      app.id === id ? { ...app, [field]: value } : app
    ));
    // Clear error for this field
    if (errors[`${id}_${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${id}_${field}`];
      setErrors(newErrors);
    }
  };

  // Handle resume upload
  const handleResumeUpload = async (id: string, file: File) => {
    // Set uploading state
    setApplicants(applicants.map(app => 
      app.id === id ? { ...app, isUploading: true } : app
    ));

    try {
      // Upload file to Frappe
      const uploadResponse = await frappeAPI.upload(file, {
        is_private: false,
        folder: 'Home',
      });

      if (!uploadResponse.success || !uploadResponse.file_url) {
        throw new Error(uploadResponse.error || 'Failed to upload resume');
      }

      // Update applicant with file URL
      setApplicants(applicants.map(app => 
        app.id === id ? { 
          ...app, 
          resume_attachment: uploadResponse.file_url,
          isUploading: false 
        } : app
      ));

      // Try autofill
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('fileName', file.name);
        uploadFormData.append('jobTitle', 'HR-OPN-2025-0010');

        const response = await fetch('/api/jobapplicant', {
          method: 'POST',
          body: uploadFormData
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Autofill basic info
            setApplicants(applicants.map(app => 
              app.id === id ? {
                ...app,
                applicant_name: result.data.applicant_name || app.applicant_name,
                email_id: result.data.email_id || app.email_id,
                phone_number: result.data.phone_number || app.phone_number,
                isUploading: false
              } : app
            ));
          }
        }
      } catch (autofillError) {
        console.error('Autofill failed:', autofillError);
        // Continue even if autofill fails
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      setErrors({
        ...errors,
        [`${id}_resume_attachment`]: error.message
      });
      setApplicants(applicants.map(app => 
        app.id === id ? { ...app, isUploading: false } : app
      ));
    }
  };

  // Validate all applicants
  const validateApplicants = () => {
    const newErrors: {[key: string]: string} = {};
    
    applicants.forEach((app, index) => {
      if (!app.applicant_name.trim()) {
        newErrors[`${app.id}_applicant_name`] = 'Name required';
      }
      if (!app.email_id.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        newErrors[`${app.id}_email_id`] = 'Valid email required';
      }
      if (!app.phone_number.match(/^\+?[\d\s-]{10,}$/)) {
        newErrors[`${app.id}_phone_number`] = 'Valid phone required';
      }
      if (!app.resume_attachment) {
        newErrors[`${app.id}_resume_attachment`] = 'Resume required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit all applicants
  const handleSubmit = async () => {
    if (!validateApplicants()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Create all applicants
      const results = await Promise.allSettled(
        applicants.map(app => 
          frappeAPI.createApplicants({
            applicant_name: app.applicant_name,
            email_id: app.email_id,
            phone_number: app.phone_number,
            resume_attachment: app.resume_attachment,
            job_title: app.job_title,
            country: 'India'
          })
        )
      );

      // Check results
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        alert(`${results.length - failed.length} applicants created successfully. ${failed.length} failed.`);
      } else {
        alert('All applicants created successfully!');
        // Reset form
        setApplicants([{
          id: Date.now().toString(),
          applicant_name: '',
          email_id: '',
          phone_number: '',
          resume_attachment: '',
          job_title: 'HR-OPN-2025-0010',
          isUploading: false
        }]);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit applications');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-12 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Add Job Applicants</h1>
            <p className="text-sm text-gray-500">Upload multiple resumes and create applicants in bulk</p>
          </div>
          <button
            onClick={addApplicant}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add Resume
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="px-12 py-8">
        <div className="space-y-4">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 pb-3 border-b border-gray-200">
            <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              #
            </div>
            <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Name
            </div>
            <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Email
            </div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Phone
            </div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Resume
            </div>
            <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Action
            </div>
          </div>

          {/* Applicant Rows */}
          {applicants.map((applicant, index) => (
            <div key={applicant.id} className="grid grid-cols-12 gap-4 items-start py-3 border-b border-gray-100">
              {/* Index */}
              <div className="col-span-1 pt-2">
                <span className="text-sm text-gray-600">{index + 1}</span>
              </div>

              {/* Name */}
              <div className="col-span-3">
                <input
                  type="text"
                  value={applicant.applicant_name}
                  onChange={(e) => updateApplicant(applicant.id, 'applicant_name', e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`${applicant.id}_applicant_name`] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Full name"
                  disabled={applicant.isUploading}
                />
                {errors[`${applicant.id}_applicant_name`] && (
                  <p className="text-xs text-red-600 mt-1">{errors[`${applicant.id}_applicant_name`]}</p>
                )}
              </div>

              {/* Email */}
              <div className="col-span-3">
                <input
                  type="email"
                  value={applicant.email_id}
                  onChange={(e) => updateApplicant(applicant.id, 'email_id', e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`${applicant.id}_email_id`] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="email@example.com"
                  disabled={applicant.isUploading}
                />
                {errors[`${applicant.id}_email_id`] && (
                  <p className="text-xs text-red-600 mt-1">{errors[`${applicant.id}_email_id`]}</p>
                )}
              </div>

              {/* Phone */}
              <div className="col-span-2">
                <input
                  type="tel"
                  value={applicant.phone_number}
                  onChange={(e) => updateApplicant(applicant.id, 'phone_number', e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`${applicant.id}_phone_number`] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+1234567890"
                  disabled={applicant.isUploading}
                />
                {errors[`${applicant.id}_phone_number`] && (
                  <p className="text-xs text-red-600 mt-1">{errors[`${applicant.id}_phone_number`]}</p>
                )}
              </div>

              {/* Resume Upload */}
              <div className="col-span-2">
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleResumeUpload(applicant.id, file);
                    }}
                    className="hidden"
                    id={`resume-${applicant.id}`}
                    disabled={applicant.isUploading}
                  />
                  <label
                    htmlFor={`resume-${applicant.id}`}
                    className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg cursor-pointer transition-colors ${
                      applicant.resume_attachment 
                        ? 'border-green-300 bg-green-50 text-green-700' 
                        : errors[`${applicant.id}_resume_attachment`]
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    } ${applicant.isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {applicant.isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Uploading...</span>
                      </>
                    ) : applicant.resume_attachment ? (
                      <>
                        <span className="text-xs">✓ Uploaded</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span className="text-xs">Upload</span>
                      </>
                    )}
                  </label>
                  {errors[`${applicant.id}_resume_attachment`] && (
                    <p className="text-xs text-red-600 mt-1">{errors[`${applicant.id}_resume_attachment`]}</p>
                  )}
                </div>
              </div>

              {/* Delete */}
              <div className="col-span-1 pt-2">
                {applicants.length > 1 && (
                  <button
                    onClick={() => removeApplicant(applicant.id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                    disabled={applicant.isUploading}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || applicants.some(app => app.isUploading)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save All Applicants ({applicants.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}