/*eslint-disable @typescript-eslint/no-explicit-any*/
'use client'
import { useAuth } from '@/contexts/AuthContext'
import { frappeAPI } from '@/lib/api/frappeClient'
import React, { useEffect, useState } from 'react'

const STATUS_OPTIONS = [
  "Shortlisted",
  "Assessment Stage",
  "Interview Stage",
  "Hired",
  "Rejected",
]

const ShortlistedCandidates = () => {
  const { user } = useAuth()
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState("Shortlisted")
  const [search, setSearch] = useState("")

  const fetchApplicants = async (email: string, status: string) => {
    try {
      setLoading(true)
      const response = await frappeAPI.getAllShortlistedCandidates(email, status)
      const candidatesList = response.data || []

      const detailedcandidates = await Promise.all(
        candidatesList.map(async (candidate: { name: string }) => {
          try {
            // Applicant details
            const leadDetails = await frappeAPI.getApplicantBYId(candidate.name)
            const applicantData = leadDetails.data

            // Job opening details
            let jobOpeningData = null
            if (applicantData?.job_title) {
              try {
                const jobRes = await frappeAPI.getJobOpeningById(applicantData.job_title)
                jobOpeningData = jobRes.data
              } catch (err) {
                console.error(`Error fetching job opening for ${applicantData.job_title}:`, err)
              }
            }

            return {
              ...applicantData,
              job_opening: jobOpeningData,
            }
          } catch (err) {
            console.error(`Error fetching details for ${candidate.name}:`, err)
            return null
          }
        })
      )

      setCandidates(detailedcandidates.filter(Boolean))
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    fetchApplicants(user.email, statusFilter)
  }, [user, statusFilter])

  const filteredCandidates = candidates.filter(c =>
    c.applicant_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email_id?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Candidates</h2>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Phone</th>
                <th className="px-4 py-2 border">Designation</th>
                <th className="px-4 py-2 border">Job Opening</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((c, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border font-medium">{c.applicant_name}</td>
                  <td className="px-4 py-2 border">{c.email_id}</td>
                  <td className="px-4 py-2 border">{c.phone_number}</td>
                  <td className="px-4 py-2 border">{c.designation}</td>
                  <td className="px-4 py-2 border">
                    {c.job_opening ? (
                      <>
                        {c.job_opening.job_title} <br />
                        <span className="text-sm text-gray-500">
                          {c.job_opening.designation}
                        </span>
                      </>
                    ) : "N/A"}
                  </td>
                  <td className="px-4 py-2 border">{c.status}</td>
                  <td className="px-4 py-2 border">
                    {c.status === "Shortlisted" && (
                      <button className="px-3 py-1 bg-blue-500 text-white rounded">
                        Create Assessment
                      </button>
                    )}
                    {c.status === "Assessment Stage" && (
                      <span className="text-blue-600">Assessment Details</span>
                    )}
                    {c.status === "Interview Stage" && (
                      <button className="px-3 py-1 bg-green-500 text-white rounded">
                        Create Interview
                      </button>
                    )}
                    {c.status === "Hired" && (
                      <span className="text-green-600 font-semibold">Hired</span>
                    )}
                    {c.status === "Rejected" && (
                      <span className="text-red-600 font-semibold">Rejected</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    No candidates found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ShortlistedCandidates
