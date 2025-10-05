'use client'

import { frappeAPI } from "@/lib/api/frappeClient";
import {
  AlertCircle,
  Check,
  Loader2,
  Search,
  Trash2,
  UserPlus,
  X
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Assignment, formatAssignTo, MultiUserAssignmentProps, parseAssignTo, UserInfo } from "../helper";

export const MultiUserAssignment: React.FC<MultiUserAssignmentProps> = ({
  assignTo,
  totalVacancies,
  onAssignToChange,
  disabled = false,
  // itemIndex
}) => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number, width: number}>({top: 0, left: 0, width: 0});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Initialize assignments from assignTo prop
  useEffect(() => {
    const parsedAssignments = parseAssignTo(assignTo);
    setAssignments(parsedAssignments);
  }, [assignTo]);

  // Update user names when users are loaded
  useEffect(() => {
    if (users.length > 0 && assignments.length > 0) {
      const updatedAssignments = assignments.map(assignment => {
        const user = users.find(u => u.email === assignment.userEmail);
        return {
          ...assignment,
          userName: user ? user.full_name : assignment.userEmail.split('@')[0]
        };
      });
      setAssignments(updatedAssignments);
    }
  }, [users]);

  // Calculate dropdown position
  const calculateDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      setDropdownPosition({
        top: rect.bottom + scrollY + 4,
        left: rect.left + scrollX,
        width: Math.max(280, rect.width)
      });
    }
  };

  // Calculate totals
  const totalAllocated = assignments.reduce((sum, assignment) => sum + assignment.allocation, 0);
  const remainingVacancies = totalVacancies - totalAllocated;
  // const isValid = totalAllocated === totalVacancies && totalVacancies > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    const handleScroll = () => {
      if (showDropdown) {
        calculateDropdownPosition();
      }
    };

    const handleResize = () => {
      if (showDropdown) {
        calculateDropdownPosition();
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      loadUsers();
      calculateDropdownPosition();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [showDropdown]);

  const loadUsers = async () => {
    if (users.length > 0) return; // Don't refetch if already loaded
    
    setIsLoading(true);
    try {
      const response = await frappeAPI.makeAuthenticatedRequest(
        "GET",
        "/resource/User?fields=[\"name\",\"full_name\",\"email\",\"user_image\"]&limit_page_length=50"
      );
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const notAlreadyAssigned = !assignments.some(assignment => assignment.userEmail === user.email);
    return matchesSearch && notAlreadyAssigned;
  });

  const updateAssignments = (newAssignments: Assignment[]) => {
    setAssignments(newAssignments);
    onAssignToChange(formatAssignTo(newAssignments));
  };

  const addAssignment = (userEmail: string, userName: string) => {
    const defaultAllocation = Math.min(remainingVacancies, Math.max(1, Math.floor(remainingVacancies / 2)));
    const newAssignment: Assignment = {
      userEmail,
      userName,
      allocation: defaultAllocation
    };
    
    updateAssignments([...assignments, newAssignment]);
    setShowDropdown(false);
    setSearchTerm("");
  };

  const removeAssignment = (index: number) => {
    const updated = assignments.filter((_, i) => i !== index);
    updateAssignments(updated);
  };

  const updateAllocation = (index: number, allocation: number) => {
    const updated = assignments.map((assignment, i) => 
      i === index ? { ...assignment, allocation: Math.max(0, allocation) } : assignment
    );
    updateAssignments(updated);
  };

  const clearAllAssignments = () => {
    updateAssignments([]);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getValidationColor = () => {
    if (totalVacancies === 0) return 'text-gray-500';
    if (totalAllocated === totalVacancies) return 'text-green-600';
    if (totalAllocated > totalVacancies) return 'text-red-600';
    return 'text-orange-600';
  };

  const getStatusIcon = () => {
    if (totalVacancies === 0) return null;
    if (totalAllocated === totalVacancies) return <Check className="h-3 w-3 text-green-600" />;
    if (totalAllocated > totalVacancies) return <AlertCircle className="h-3 w-3 text-red-600" />;
    return <AlertCircle className="h-3 w-3 text-orange-600" />;
  };

  const handleDropdownToggle = () => {
    if (!disabled) {
      setShowDropdown(!showDropdown);
    }
  };

  if (totalVacancies === 0) {
    return (
      <div className="text-xs text-gray-400 text-center py-2">
        Set vacancies first
      </div>
    );
  }

  return (
    <>
      <div ref={triggerRef} className="w-full">
        {/* Compact Assignment Display */}
        <div className="space-y-1">
          {assignments.length === 0 ? (
            <div className="text-center py-2">
              <button
                type="button"
                onClick={handleDropdownToggle}
                disabled={disabled}
                className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 transition-colors disabled:opacity-50"
              >
                <UserPlus className="h-3 w-3" />
                <span>Assign</span>
              </button>
            </div>
          ) : (
            <>
              {/* Assignment List */}
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {assignments.map((assignment, index) => (
                  <div key={assignment.userEmail} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-700">
                        {getInitials(assignment.userName)}
                      </div>
                      <span className="text-xs font-medium text-gray-700 truncate">
                        {assignment.userName}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={assignment.allocation}
                        onChange={(e) => updateAllocation(index, parseInt(e.target.value) || 0)}
                        className="w-12 px-1 py-0.5 text-xs border border-gray-300 rounded text-center focus:ring-1 focus:ring-blue-500"
                        min="0"
                        max={assignment.allocation + remainingVacancies}
                        disabled={disabled}
                      />
                      <button
                        type="button"
                        onClick={() => removeAssignment(index)}
                        className="p-0.5 text-gray-400 hover:text-red-600 transition-colors"
                        disabled={disabled}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status and Actions Row */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <div className={`text-xs font-medium ${getValidationColor()}`}>
                    {totalAllocated}/{totalVacancies}
                  </div>
                  {getStatusIcon()}
                  {remainingVacancies > 0 && (
                    <span className="text-xs text-orange-600">
                      {remainingVacancies} left
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  {remainingVacancies > 0 && (
                    <button
                      type="button"
                      onClick={handleDropdownToggle}
                      disabled={disabled}
                      className="p-0.5 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                      title="Add more assignees"
                    >
                      <UserPlus className="h-3 w-3" />
                    </button>
                  )}
                  {assignments.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllAssignments}
                      className="p-0.5 text-gray-400 hover:text-red-600 transition-colors"
                      disabled={disabled}
                      title="Clear all assignments"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* User Selection Dropdown - Portal to body with fixed positioning */}
      {showDropdown && (
        <div 
          ref={dropdownRef} 
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl"
          style={{ 
            top: `${dropdownPosition.top}px`, 
            left: `${dropdownPosition.left}px`, 
            width: `${dropdownPosition.width}px`,
            zIndex: 9999,
            maxHeight: '320px'
          }}
        >
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-800">Add Assignee</h4>
              <button 
                onClick={() => setShowDropdown(false)} 
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
            {remainingVacancies > 0 && (
              <div className="text-xs text-orange-600 mt-2 bg-orange-50 px-2 py-1 rounded">
                {remainingVacancies} positions remaining
              </div>
            )}
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-blue-500 mb-2" />
                <div className="text-sm text-gray-500">Loading users...</div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="py-1">
                {filteredUsers.map((user) => (
                  <button
                    key={user.email}
                    onClick={() => addAssignment(user.email, user.full_name || user.email)}
                    className="w-full p-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
                      {getInitials(user.full_name || user.email)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.full_name || user.email}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user.email}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                {searchTerm ? `No users found for "${searchTerm}"` : 'No available users'}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};