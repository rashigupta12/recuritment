'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { frappeAPI } from '@/lib/api/frappeClient'

// Types
type NameOnly = { name: string }

interface ToDo {
  name: string
  owner?: string
  creation?: string
  modified?: string
  modified_by?: string
  docstatus?: number
  idx?: number
  status?: string
  priority?: string
  date?: string
  allocated_to?: string
  description?: string
  reference_type?: string
  reference_name?: string
  assigned_by?: string
  assigned_by_full_name?: string
  doctype?: string
  staffing_plan: StaffingPlan | null   // ✅ not optional anymore
}


interface StaffingDetail {
  name: string
  designation?: string
  vacancies?: number
  estimated_cost_per_position?: number
  total_estimated_cost?: number
  currency?: string
  current_count?: number
  current_openings?: number
  number_of_positions?: number
  min_experience_reqyrs?: number
  attachmentsoptional?: string
  assign_to?: string
  job_description?: string
}

interface StaffingPlan {
  name: string
  company?: string
  department?: string
  from_date?: string
  to_date?: string
  custom_contact_name?: string
  custom_organization_name?: string
  custom_contact_phone?: string
  custom_contact_email?: string
  total_estimated_budget?: number
  staffing_details?: StaffingDetail[]
}

const TodosWithPlans = () => {
  const { user } = useAuth()
  const [todos, setTodos] = useState<ToDo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchTodosAndPlans = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Step 1: fetch name-only todos
        const resp = await frappeAPI.getAllTodos(user.email)
        const raw: NameOnly[] = resp?.data || []

        // Step 2: fetch details + staffing plan for each todo
        const enriched = await Promise.all(
          raw.map(async (r) => {
            try {
              // fetch todo details
              const todoResp = await frappeAPI.getTodoBYId(r.name)
              const todo: ToDo = todoResp?.data ?? null

              if (!todo) return null

              // fetch staffing plan if reference_name exists
              let plan: StaffingPlan | null = null
              if (todo.reference_name) {
                try {
                  const planResp = await frappeAPI.getStaffingPlanById(todo.reference_name)
                  plan = planResp?.data ?? null
                } catch (err) {
                  console.error(`Failed to fetch plan for ${todo.reference_name}`, err)
                }
              }

              return {
                ...todo,
                staffing_plan: plan,
              }
            } catch (err) {
              console.error(`Error fetching todo ${r.name}:`, err)
              return null
            }
          })
        )

        const valid = enriched.filter((t): t is ToDo => t !== null)
        setTodos(valid)
      } catch (err) {
        console.error('Failed to fetch todos list:', err)
        setError('Failed to fetch todos.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTodosAndPlans()
  }, [user])

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Todos with Staffing Plans</h2>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {todos.map((todo) => (
        <div key={todo.name} className="mb-8 border rounded-lg p-4 shadow-sm bg-white">
          <h3 className="text-lg font-bold mb-2">
            {todo.description?.split('\n')[0] || todo.reference_name || todo.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            <strong>Status:</strong> {todo.status} | <strong>Priority:</strong> {todo.priority}
          </p>

          {todo.staffing_plan ? (
            <div>
              <div className="mb-4">
                <p><strong>Company:</strong> {todo.staffing_plan.company}</p>
                <p><strong>Department:</strong> {todo.staffing_plan.department}</p>
                <p><strong>Duration:</strong> {todo.staffing_plan.from_date} → {todo.staffing_plan.to_date}</p>
                <p><strong>Contact:</strong> {todo.staffing_plan.custom_contact_name} ({todo.staffing_plan.custom_contact_email}, {todo.staffing_plan.custom_contact_phone})</p>
                <p><strong>Organization:</strong> {todo.staffing_plan.custom_organization_name}</p>
                <p><strong>Total Budget:</strong> {todo.staffing_plan.total_estimated_budget}</p>
              </div>

              <h4 className="text-md font-semibold mt-4 mb-2">Position Details</h4>
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Designation</th>
                    <th className="border p-2">Vacancies</th>
                    <th className="border p-2">Positions</th>
                    <th className="border p-2">Experience (yrs)</th>
                    <th className="border p-2">Cost / Position</th>
                    <th className="border p-2">Total Cost</th>
                    <th className="border p-2">Currency</th>
                    <th className="border p-2">Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {todo.staffing_plan.staffing_details?.map((d) => (
                    <tr key={d.name}>
                      <td className="border p-2">{d.designation}</td>
                      <td className="border p-2">{d.vacancies}</td>
                      <td className="border p-2">{d.number_of_positions}</td>
                      <td className="border p-2">{d.min_experience_reqyrs}</td>
                      <td className="border p-2">{d.estimated_cost_per_position}</td>
                      <td className="border p-2">{d.total_estimated_cost}</td>
                      <td className="border p-2">{d.currency}</td>
                      <td className="border p-2">{d.assign_to}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No staffing plan linked.</p>
          )}
        </div>
      ))}

      <div className="mt-6">
        <h3 className="text-md font-semibold">Full JSON Output</h3>
        <pre className="text-sm max-h-64 overflow-auto bg-gray-50 p-2 border rounded">
          {JSON.stringify(todos, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default TodosWithPlans
