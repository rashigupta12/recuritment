/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { frappeAPI } from "@/lib/api/frappeClient";
import { Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

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

  const [searchQuery, setSearchQuery] = useState(value || "");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 200 });

  const fetchLocations = useCallback(async (query: string) => {
    if (!query.trim()) return;
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

  const calculatePos = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

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
      document.addEventListener("mousedown", handleClick);
      window.addEventListener("scroll", calculatePos, true);
      window.addEventListener("resize", calculatePos);
      return () => {
        document.removeEventListener("mousedown", handleClick);
        window.removeEventListener("scroll", calculatePos, true);
        window.removeEventListener("resize", calculatePos);
      };
    }
  }, [isOpen]);

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
        className="w-full px-2 py-1.5 text-md border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
        placeholder="Search Location"
      />

      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto z-[9999]"
          style={{ top: pos.top, left: pos.left, width: 250 }} // width increased here
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
          ) : (
            <div className="p-2 text-md text-gray-500">No locations found</div>
          )}
        </div>
      )}
    </>
  );
};

export default LocationDropdown;
