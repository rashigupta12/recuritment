/*eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Search, Mail, Briefcase, AlertTriangle, CheckCircle } from 'lucide-react';
import { frappeAPI } from '@/lib/api/frappeClient';
import BulkApplicantForm from './MultipleApplicantsForm';

interface ExistingApplicant {
  name: string;
  job_title: string;
  designation: string;
  custom_company_name: string;
  status: string;
  email_id: string;
  phone_number: string;
  applicant_name: string;
  country: string;
  resume_attachment: string;
    custom_latest_cv_timestamp?: string; // Add this line

}

interface ApplicantSearchAndTagProps {
  initialJobId?: string;
  initialJobTitle?: string;
  onFormSubmitSuccess?: () => void;
}

export default function ApplicantSearchAndTag({
  initialJobId,
  initialJobTitle,
  onFormSubmitSuccess
}: ApplicantSearchAndTagProps) {
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [existingApplicants, setExistingApplicants] = useState<ExistingApplicant[]>([]);
  const [alreadyTaggedJob, setAlreadyTaggedJob] = useState<string | null>(null);
  const [prefilledApplicantData, setPrefilledApplicantData] = useState<any[]>([]);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [latestCVTimestamp, setLatestCVTimestamp] = useState<string | null>(null);

  const currentJobTitle = initialJobTitle || initialJobId || '';

  const handleSubmit = async (overrideWarning = false) => {
    if (!prefilledApplicantData || prefilledApplicantData.length === 0) return;

    setIsSubmitting(true);

    try {
      const payload = {
        applicant_name: prefilledApplicantData[0].applicant_name,
        email_id: prefilledApplicantData[0].email_id,
        phone_number: prefilledApplicantData[0].phone_number,
        country: prefilledApplicantData[0].country,
        job_title: currentJobTitle,
        designation: prefilledApplicantData[0].designation,
        status: 'Tagged',
        resume_attachment: prefilledApplicantData[0].resume_attachment,
        custom_experience: prefilledApplicantData[0].custom_experience,
        custom_education: prefilledApplicantData[0].custom_education
      };

      console.log('Submitting applicant data:', payload);

      const response = await frappeAPI.createApplicants(payload);

      if (response.data) {
        alert('Applicant tagged successfully!');
        setShowWarning(false);
        setShowBulkForm(false);
        setPrefilledApplicantData([]);
        setSearchEmail('');
        setExistingApplicants([]);
        if (onFormSubmitSuccess) {
          onFormSubmitSuccess();
        }
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      alert(`Failed to tag applicant: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const searchApplicant = async () => {
    if (!searchEmail) {
      setSearchError('Please enter email address');
      return;
    }

    if (!searchEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setSearchError('Please enter a valid email address');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setExistingApplicants([]);
    setPrefilledApplicantData([]);
    setAlreadyTaggedJob(null);
    setShowBulkForm(false);
    setShowWarning(false);
      setLatestCVTimestamp(null); // Reset timestamp


    try {
      console.log('Searching for email:', searchEmail);

      const response = await frappeAPI.searchApplicants(searchEmail);
      console.log('Search response:', response);

      if (response && response.data) {
        const applicants: ExistingApplicant[] = response.data.map((item: any) => ({
          name: item.name,
          job_title: item.job_title,
          designation: item.designation,
          custom_company_name: item.custom_company_name,
          status: item.status,
          email_id: item.email_id,
          phone_number: item.phone_number,
          applicant_name: item.applicant_name,
          country: item.country,
          resume_attachment: item.resume_attachment,
                  custom_latest_cv_timestamp: item.custom_latest_cv_timestamp // Add this

        }));

        setExistingApplicants(applicants);
        try {
        const timestampResponse = await frappeAPI.getlatestCVTimestamp(searchEmail);
        if (timestampResponse?.data && timestampResponse.data.length > 0) {
          setLatestCVTimestamp(timestampResponse.data[0].custom_latest_cv_timestamp);
        }
      } catch (error) {
        console.error('Error fetching latest CV timestamp:', error);
      }
        if (currentJobTitle) {
          const alreadyTagged = applicants.find(app => app.job_title === currentJobTitle);
          if (alreadyTagged) {
            setAlreadyTaggedJob(currentJobTitle);
            setIsSearching(false);
            return;
          }
        }

        if (applicants.length > 0) {
          setShowWarning(true);
        }

        if (applicants.length > 0) {
          const firstApplicant = applicants[0];
          const prefilledData = [{
            applicant_name: firstApplicant.applicant_name || '',
            email_id: firstApplicant.email_id || searchEmail,
            phone_number: firstApplicant.phone_number || '',
            country: firstApplicant.country || 'India',
            job_title: currentJobTitle,
            designation: firstApplicant.designation || '',
            resume_attachment: firstApplicant.resume_attachment || '',
            custom_experience: [],
            custom_education: []
          }];

          setPrefilledApplicantData(prefilledData);
        } else {
          const emptyData = [{
            applicant_name: '',
            email_id: searchEmail,
            phone_number: '',
            country: 'India',
            job_title: currentJobTitle,
            designation: '',
            resume_attachment: '',
            custom_experience: [],
            custom_education: []
          }];

          setPrefilledApplicantData(emptyData);
        }

        setShowBulkForm(true);

      } else {
        const emptyData = [{
          applicant_name: '',
          email_id: searchEmail,
          phone_number: '',
          country: 'India',
          job_title: currentJobTitle,
          designation: '',
          resume_attachment: '',
          custom_experience: [],
          custom_education: []
        }];

        setPrefilledApplicantData(emptyData);
        setShowBulkForm(true);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setSearchError(`Failed to search applicant: ${error.message}`);

      const emptyData = [{
        applicant_name: '',
        email_id: searchEmail,
        phone_number: '',
        country: 'India',
        job_title: currentJobTitle,
        designation: '',
        resume_attachment: '',
        custom_experience: [],
        custom_education: []
      }];

      setPrefilledApplicantData(emptyData);
      setShowBulkForm(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBulkFormSuccess = () => {
    setShowBulkForm(false);
    setPrefilledApplicantData([]);
    setSearchEmail('');
    setExistingApplicants([]);

    if (onFormSubmitSuccess) {
      onFormSubmitSuccess();
    }
  };

  return (
    <div className="space-y-6 p-2">
      <div className="bg-white rounded-lg shadow-md px-6 pb-2">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Search Applicant
        </h2>

        {/* {currentJobTitle && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2 text-blue-800">
              <Briefcase className="w-4 h-4" />
              <span className="font-medium">Tagging to: {currentJobTitle}</span>
            </div>
          </div>
        )} */}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <div className="flex items-center gap-2">
            <div className="flex relative w-[90%]">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                placeholder="email@example.com"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') searchApplicant();
                }}
              />
            </div>
            <button
              onClick={searchApplicant}
              disabled={isSearching}
              className={`w-[10%] min-w-[40px] py-2 px-2 rounded-md text-white font-medium flex items-center justify-center ${isSearching
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-6 h-6" />
              )}
            </button>
          </div>
          {searchError && (
            <p className="text-red-600 text-sm mt-2">{searchError}</p>
          )}
        </div>

        {alreadyTaggedJob && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Already Tagged</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              This applicant is already tagged to the current job opening.
            </p>
          </div>
        )}

        {!existingApplicants.length && showBulkForm && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2 text-blue-800">
              <Search className="w-4 h-4" />
              <span className="font-medium">New Applicant</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              No existing applicant found with this email. Please fill the form below to create a new application.
            </p>
          </div>
        )}
      </div>

      {existingApplicants.length > 0 && (
        <div >
          {latestCVTimestamp && (
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">Latest CV Uploaded:</span>
          <span className="text-sm">
            {new Date(latestCVTimestamp).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </span>
        </div>
      </div>
    )}
  {!alreadyTaggedJob && (
    <div className="flex justify-end mb-2">
          <button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className={`px-4 py-2 text-white items-end justify-end rounded-md flex gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 items-end justify-end hover:bg-green-700'
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Tagging...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Tag This.
              </>
            )}
          </button>
          </div>
  )}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Existing Applications ({existingApplicants.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {existingApplicants.map((applicant, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{applicant.job_title}</p>
                      <p className="text-xs text-gray-600">{applicant.designation}</p>
                      <p className="text-xs text-gray-500">{applicant.custom_company_name}</p>
                      <p className="text-xs text-gray-400 mt-1">{applicant.email_id}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${applicant.status === 'Tagged' ? 'bg-blue-100 text-blue-800' :
                      applicant.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        applicant.status === 'Joined' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {applicant.status}
                    </span>
                  </div>
                </div>
              ))}
            </div></div>
        </div>
      )}

      {showBulkForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            {existingApplicants.length > 0 ? 'Update Applicant Details' : 'Create New Applicant'}
          </h3>
          <BulkApplicantForm
            initialJobId={currentJobTitle}
            prefilledData={prefilledApplicantData}
            isExistingApplicant={existingApplicants.length > 0} // Pass isExistingApplicant prop
            onFormSubmitSuccess={handleBulkFormSuccess}
          />
        </div>
      )}

      {/* {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Applicant Already Tagged</h3>
            </div>
            <p className="text-gray-600 mb-4">
              This applicant is already tagged to {existingApplicants.length} other job opening(s). 
              Are you sure you want to tag them to this job opening as well?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowWarning(false);
                  setShowBulkForm(true); // Ensure form is shown
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Wait
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className={`px-4 py-2 text-white rounded-md flex items-center gap-2 ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Tagging...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Yes, Tag Anyway
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}