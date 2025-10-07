'use client'
import { frappeAPI } from '@/lib/api/frappeClient';
import {
  Loader2,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

type Assignment = {
  userEmail: string;
  userName: string;
  allocation: number;
};

type User = {
  full_name: string;
  email: string;
};

interface MultiUserAssignmentProps {
  assignTo: string;
  totalVacancies: number;
  onAssignToChange: (assignTo: string) => void;
  disabled?: boolean;
}

const parseAssignTo = (assignTo: string): Assignment[] => {
  if (!assignTo) return [];
  try {
    return assignTo.split(',').map(item => {
      const [userEmail, allocation] = item.trim().split('-');
      return {
        userEmail: userEmail.trim(),
        userName: userEmail.split('@')[0],
        allocation: parseInt(allocation) || 1
      };
    });
  } catch {
    return [];
  }
};

const formatAssignTo = (assignments: Assignment[]): string =>
  assignments
    .filter(a => a.userEmail && a.allocation > 0)
    .map(a => `${a.userEmail}-${a.allocation}`)
    .join(', ');

export const MultiUserAssignment: React.FC<MultiUserAssignmentProps> = ({
  assignTo,
  totalVacancies,
  onAssignToChange,
  disabled = false
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setAssignments(parseAssignTo(assignTo));
  }, [assignTo]);

  useEffect(() => {
    if (users.length > 0) {
      setAssignments(prev =>
        prev.map(a => {
          const u = users.find(u => u.email === a.userEmail);
          return u ? { ...a, userName: u.full_name } : a;
        })
      );
    }
  }, [users]);

 const totalAllocated = assignments.reduce((sum, a) => sum + a.allocation, 0);
  const remaining = totalVacancies - totalAllocated;
  // const isOverAllocated = totalAllocated > totalVacancies;
const loadUsers = async () => {
  if (users.length > 0) return;
  setIsLoading(true);
  try {
    const response = await frappeAPI.makeAuthenticatedRequest(
      "GET",
      '/resource/User?fields=["full_name","email","roles.role"]&limit_page_length=0'
    );

    const allUsers = response.data || [];

    // Keep only users who have "Recruiter" role
    const recruiters = allUsers.filter((user: any) => user.role === "Recruiter");

    // Group by email to remove duplicates
    const uniqueRecruitersMap: Record<string, any> = {};
    recruiters.forEach((user: { email: string | number; full_name: any; }) => {
      if (!uniqueRecruitersMap[user.email]) {
        uniqueRecruitersMap[user.email] = {
          full_name: user.full_name,
          email: user.email
        };
      }
    });

    const uniqueRecruiters = Object.values(uniqueRecruitersMap);

    setUsers(uniqueRecruiters);
  } finally {
    setIsLoading(false);
  }
};







  // const updateAssignments = useCallback((newA: Assignment[]) => {
  //   setAssignments(newA);
  //   const validAssignments = newA.filter(a => a.allocation > 0);
  //   onAssignToChange(formatAssignTo(validAssignments));
  // }, [onAssignToChange]);

  const addAssignment = (user: User) => {
    const newAssignments = [...assignments, { userEmail: user.email, userName: user.full_name, allocation: 1 }];
    setAssignments(newAssignments);
    onAssignToChange(formatAssignTo(newAssignments));
    setShowDropdown(false);
    setSearchTerm('');
  };

  const removeAssignment = (i: number) => {
    const newAssignments = assignments.filter((_, idx) => idx !== i);
    setAssignments(newAssignments);
    onAssignToChange(formatAssignTo(newAssignments));
  };

  const handleAllocationChange = (i: number, newAlloc: number) => {
    const newAssignments = assignments.map((x, j) => 
      j === i ? { ...x, allocation: newAlloc } : x
    );
    setAssignments(newAssignments);
    
    if (newAlloc > 0) {
      onAssignToChange(formatAssignTo(newAssignments));
    }
  };

  // Handle input change with proper number parsing
  const handleInputChange = (i: number, value: string) => {
    // If empty, set to 0 temporarily
    if (value === '') {
      handleAllocationChange(i, 0);
      return;
    }

    // Remove leading zeros and parse
    const cleanValue = value.replace(/^0+/, '') || '0';
    const newAlloc = parseInt(cleanValue, 10);
    
    if (!isNaN(newAlloc) && newAlloc >= 0) {
      handleAllocationChange(i, newAlloc);
    }
  };

  if (totalVacancies === 0) {
    return <div className="text-md text-gray-400 text-center py-2">Set vacancies first</div>;
  }

  return (
    <div className="space-y-2">
      <div className="border rounded p-2 space-y-1 bg-gray-50">
        {assignments.map((a, i) => (
          <div key={a.userEmail} className="flex items-center justify-between text-md bg-white rounded p-1">
            <span className="truncate capitalize">{a.userName}</span>
            <div className="flex items-center gap-1">
              <input
                type="text" // Changed to text to have more control
                inputMode="numeric" // Shows numeric keyboard on mobile
                pattern="[0-9]*" // Ensures numeric input
                value={a.allocation === 0 ? '' : a.allocation.toString()} // Show empty string for 0
                onChange={(e) => {
                  // Only allow numeric characters
                  const numericValue = e.target.value.replace(/[^0-9]/g, '');
                  handleInputChange(i, numericValue);
                }}
                onBlur={(e) => {
                  // When input loses focus and is empty or 0, remove the assignment
                  if (a.allocation === 0 || e.target.value === '') {
                    removeAssignment(i);
                  }
                }}
                className="w-12 px-1 py-0.5 border rounded text-center"
                disabled={disabled}
                placeholder="0"
              />
              <button onClick={() => removeAssignment(i)} disabled={disabled} className="text-gray-400 hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between text-md pt-1">
          <span className="text-gray-600">Allocated {totalAllocated}/{totalVacancies}</span>
          {remaining > 0 && (
            <button
              onClick={() => { setShowDropdown(!showDropdown); if (!showDropdown) loadUsers(); }}
              className="text-blue-600 hover:underline"
              disabled={disabled}
            >
              + Assign
            </button>
          )}
        </div>
      </div>
      {showDropdown && (
        <div className="border rounded p-2 bg-white shadow max-h-48 overflow-y-auto">
          <input
            type="text"
            value={searchTerm}
            placeholder="Search users"
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-2 border px-2 py-1 text-md rounded"
          />
          {isLoading ? (
            <div className="text-center py-4">
              <Loader2 className="h-4 w-4 animate-spin inline text-blue-500" /> Loading...
            </div>
          ) : (
            users.filter(u => 
              (u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
              u.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
              !assignments.some(a => a.userEmail === u.email)
            ).map(u => (
              <button
                key={u.email}
                onClick={() => addAssignment(u)}
                className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-md"
              >
                {u.full_name} ({u.email})
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};