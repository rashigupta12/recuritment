/*eslint-disable @typescript-eslint/no-explicit-any  */
'use client';
import { frappeAPI } from "@/lib/api/frappeClient";
import { Loader2, Plus } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { capitalizeWords } from "../helper";

interface Props {
  value: string;
  onChange: (designation: string) => void;
}

const DesignationDropdown: React.FC<Props> = ({ value, onChange }) => {
  const triggerRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const [searchQuery, setSearchQuery] = useState(value || "");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDesignation, setNewDesignation] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Synchronize dialog open/close with showAddDialog state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (showAddDialog) {
      if (!dialog.open) dialog.showModal();
      dialog.querySelector("input")?.focus();
    } else {
      if (dialog.open) dialog.close();
    }
    // Clean up: ensure dialog closed on unmount
    return () => { if (dialog.open) dialog.close(); };
  }, [showAddDialog]);

  // Listen for dialog's close to update React state as well
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleDialogClose = () => setShowAddDialog(false);
    dialog.addEventListener("close", handleDialogClose);
    return () => dialog.removeEventListener("close", handleDialogClose);
  }, []);

  const fetchDesignations = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await frappeAPI.makeAuthenticatedRequest(
        "GET",
        `/method/recruitment_app.search_designation.search_designation?search_term=${encodeURIComponent(query)}`
      );
      if (res.message?.status === "success") {
        setResults(res.message.data.map((d: any) => d.designation_name));
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Designation search error", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

const addNewDesignation = async () => {
    if (!newDesignation.trim()) return;
    try {
      setLoading(true);
      const finalDesignation = newDesignation.trim();
      const res = await frappeAPI.makeAuthenticatedRequest(
        "POST",
        "/resource/Designation",
        { designation_name: finalDesignation }
      );
      if (res.data) {
        // Update value
        setSearchQuery(finalDesignation);
        onChange(finalDesignation);
        setNewDesignation("");
        // Close dialog and clear results
        setShowAddDialog(false);
        setResults([]);
        setIsOpen(false);
      }
    } catch (err) {
      console.error("Failed to add designation", err);
      alert("Failed to add designation. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // Dropdown position calculation
  const calculateDropdownPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const inputRect = triggerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    setDropdownPosition({
      top: inputRect.bottom + scrollTop,
      left: inputRect.left + scrollLeft,
      width: inputRect.width,
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      calculateDropdownPosition();
      const handleResize = () => calculateDropdownPosition();
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleResize);
      };
    }
  }, [isOpen, calculateDropdownPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query === "") {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setTimeout(() => {
      fetchDesignations(query);
      setIsOpen(true);
    }, 300);
  };

  const handleDesignationSelect = (designation: string) => {
    setSearchQuery(designation);
    onChange(designation);
    setIsOpen(false);
  };

  // const handleClearDesignation = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   setSearchQuery("");
  //   onChange("");
  //   setResults([]);
  //   setIsOpen(false);
  // };

  const handleOpenAddDialog = () => {
    setShowAddDialog(true);
    setNewDesignation(searchQuery);
    setIsOpen(false);
  };

  // Dropdown as portal
  const DropdownContent = () => (
    <div
      ref={dropdownRef}
      className="fixed bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto z-[9999]"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
      }}
    >
      {loading ? (
        <div className="px-4 py-2 text-md text-gray-500 flex items-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Searching designations...
        </div>
      ) : results.length > 0 ? (
        <div className="overflow-y-auto max-h-60">
          {results.map((designation, index) => (
            <div
              key={`designation-${index}`}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleDesignationSelect(designation)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {designation}
                  </p>
                </div>
                {designation === value && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2 flex-shrink-0">
                    Selected
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : searchQuery ? (
        <div
          className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
          onClick={handleOpenAddDialog}
        >
          <div>
            <p className="font-medium">
              No designations found for &quot;{searchQuery}&quot;
            </p>
            <p className="text-md text-blue-500">Click to add a new designation</p>
          </div>
        </div>
      ) : (
        <div className="px-4 py-2 text-md text-gray-500">
          Start typing to search designations
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      <div className="relative">
        <div className="flex items-center">
          <input
            ref={triggerRef}
            type="text"
            placeholder="Search designation..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 text-md border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 capitalize"
            onFocus={() => {
              if (searchQuery && !isOpen) {
                fetchDesignations(searchQuery);
                setIsOpen(true);
              }
            }}
          />
        </div>
      </div>
      {isOpen && typeof document !== "undefined" && createPortal(<DropdownContent />, document.body)}
      {typeof document !== "undefined" && createPortal(
        <dialog
          ref={dialogRef}
          className="rounded-lg shadow-xl w-full max-w-md p-6"
          onClose={() => setShowAddDialog(false)}
        >
          <div>
            <label className="block text-md font-medium text-gray-700 mb-1">Designation Name</label>
            <input
              type="text"
              value={newDesignation}
              onChange={(e) => setNewDesignation(capitalizeWords(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addNewDesignation();
                } else if (e.key === 'Escape') {
                  setShowAddDialog(false);
                  dialogRef.current?.close();
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 capitalize"
              placeholder="Enter designation name"
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddDialog(false);
                  dialogRef.current?.close();
                }}
                className="flex-1 px-4 py-2 text-md text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addNewDesignation}
                disabled={!newDesignation.trim() || loading}
                className="flex-1 px-4 py-2 text-md text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Designation
                  </>
                )}
              </button>
            </div>
          </div>
        </dialog>,
        document.body
      )}
    </div>
  );
};

export default DesignationDropdown;
