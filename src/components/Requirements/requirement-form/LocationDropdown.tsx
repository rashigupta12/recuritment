/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { frappeAPI } from "@/lib/api/frappeClient";
import { Loader2, Plus } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { capitalizeWords } from "../helper";

interface LocationDropdownProps {
  value: string;
  onChange: (location: string) => void;
}

const LocationDropdown: React.FC<LocationDropdownProps> = ({
  value,
  onChange,
}) => {
  const triggerRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const [searchQuery, setSearchQuery] = useState(value || "");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [pos, setPos] = useState({ top: 0, left: 0, width: 200 });

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
    return () => { if (dialog.open) dialog.close(); };
  }, [showAddDialog]);

  // Listen for dialog's close to update React state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleDialogClose = () => setShowAddDialog(false);
    dialog.addEventListener("close", handleDialogClose);
    return () => dialog.removeEventListener("close", handleDialogClose);
  }, []);

  const fetchLocations = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await frappeAPI.makeAuthenticatedRequest(
        "GET",
        `/method/recruitment_app.search_cities.search_cities?search_term=${encodeURIComponent(
          query
        )}`
      );
      if (res.message?.status === "success") {
        setResults(res.message.data.map((c: any) => c.city_name));
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Location search error", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addNewCity = async () => {
    if (!newCity.trim()) return;
    try {
      setLoading(true);
      const finalCity = newCity.trim();
      const res = await frappeAPI.makeAuthenticatedRequest(
        "POST",
        "/resource/Cities",
        { city_name: finalCity }
      );
      if (res.data) {
        // Update value
        setSearchQuery(finalCity);
        onChange(finalCity);
        setNewCity("");
        // Close dialog and clear results
        setShowAddDialog(false);
        setResults([]);
        setIsOpen(false);
      }
    } catch (err) {
      console.error("Failed to add city", err);
      alert("Failed to add city. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced position calculation using viewport coordinates
  const calculatePos = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 4, // Use viewport coordinates with small offset
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      calculatePos();
      
      const handleClick = (e: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node) &&
          !triggerRef.current?.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      const handleUpdate = () => {
        requestAnimationFrame(calculatePos);
      };

      document.addEventListener("mousedown", handleClick);
      // Listen to all scroll events using capture phase
      window.addEventListener("scroll", handleUpdate, true);
      window.addEventListener("resize", handleUpdate);
      
      return () => {
        document.removeEventListener("mousedown", handleClick);
        window.removeEventListener("scroll", handleUpdate, true);
        window.removeEventListener("resize", handleUpdate);
      };
    }
  }, [isOpen, calculatePos]);

  const handleOpenAddDialog = () => {
    setShowAddDialog(true);
    setNewCity(searchQuery);
    setIsOpen(false);
  };

  const DropdownContent = () => (
    <div
      ref={dropdownRef}
      className="fixed bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto z-[9999]"
      style={{ 
        top: `${pos.top}px`, 
        left: `${pos.left}px`, 
        width: '250px'
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center p-2 text-md text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...
        </div>
      ) : results.length > 0 ? (
        results.map((loc) => (
          <div
            key={loc}
            onMouseDown={() => {
              setSearchQuery(loc);
              onChange(loc);
              setIsOpen(false);
            }}
            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
              loc === value ? "bg-blue-50" : ""
            }`}
          >
            {loc}
          </div>
        ))
      ) : searchQuery ? (
        <div
          className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
          onMouseDown={handleOpenAddDialog}
        >
          <div>
            <p className="font-medium">
              No cities found for &quot;{searchQuery}&quot;
            </p>
            <p className="text-md text-blue-500">Click to add a new city</p>
          </div>
        </div>
      ) : (
        <div className="p-2 text-md text-gray-500">No locations found</div>
      )}
    </div>
  );

  return (
    <>
      <input
        ref={triggerRef}
        type="text"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          fetchLocations(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (searchQuery) {
            fetchLocations(searchQuery);
            setIsOpen(true);
          }
        }}
        className="w-full px-2 py-1.5 text-md border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 h-9"
        placeholder="Search Location"
      />

      {isOpen && typeof document !== "undefined" && createPortal(<DropdownContent />, document.body)}
      
      {typeof document !== "undefined" && createPortal(
        <dialog
          ref={dialogRef}
          className="rounded-lg shadow-xl w-full max-w-md p-6"
          onClose={() => setShowAddDialog(false)}
        >
          <div>
            <label className="block text-md font-medium text-gray-700 mb-1">
              City Name
            </label>
            <input
              type="text"
              value={newCity}
              onChange={(e) => setNewCity(capitalizeWords(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addNewCity();
                } else if (e.key === 'Escape') {
                  setShowAddDialog(false);
                  dialogRef.current?.close();
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 capitalize"
              placeholder="Enter city name"
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
                onClick={addNewCity}
                disabled={!newCity.trim() || loading}
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
                    Add City
                  </>
                )}
              </button>
            </div>
          </div>
        </dialog>,
        document.body
      )}
    </>
  );
};

export default LocationDropdown;