/* eslint-disable @typescript-eslint/no-explicit-any */
import { Edit, Home, Loader2, MapPin, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { frappeAPI } from "@/lib/api/frappeClient";
import { createPortal } from "react-dom";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";


interface PropertyAddressSectionProps {
  formData: any;
  handleSelectChange: (name: string, value: string) => void;
  fieldNames?: {
    emirate?: string;
    area?: string;
    community?: string;
    streetName?: string;
    propertyNumber?: string;
    propertyArea?: string;
    propertyCategory?: string;
    propertyType?: string;
  };
}

interface AddressSearchResult {
  custom_property_category?: string;
  custom_emirate?: string;
  custom_area?: string;
  custom_community?: string;
  custom_street_name?: string;
  custom_property_number?: string;
  custom_property_type?: string;
  name?: string;
  custom_combined_address?: string;
  search_type?: string;
  found_via?: string;
  customer_name?: string;
  mobile_no?: string;
  email_id?: string;
  lead_name?: string;
  address_details?: any;
  site_name?: string;
}

const PropertyAddressSection: React.FC<PropertyAddressSectionProps> = ({
  formData,
  handleSelectChange,
  fieldNames = {},
}) => {
  // Destructure field names with defaults
  const {
    emirate: emirateField = "custom_emirate",
    area: areaField = "custom_area",
    community: communityField = "custom_community",
    streetName: streetNameField = "custom_street_name",
    propertyNumber: propertyNumberField = "custom_property_number",
    propertyArea: propertyAreaField = "custom_property_area",
    propertyCategory: propertyCategoryField = "custom_property_category",
    propertyType: propertyTypeField = "custom_property_type",
  } = fieldNames;


  // Refs for dropdown positioning
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State for address search
  const [addressSearchQuery, setAddressSearchQuery] = useState("");
  const [addressSearchResults, setAddressSearchResults] = useState<
    AddressSearchResult[]
  >([]);
  const [isAddressSearching, setIsAddressSearching] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // Address form state
  const [addressForm, setAddressForm] = useState<AddressSearchResult>({
    custom_property_category: formData[propertyCategoryField] || "",
    custom_property_type: formData[propertyTypeField] || "",
    custom_emirate: formData[emirateField] || "",
    custom_area: formData[areaField] || "",
    custom_community: formData[communityField] || "",
    custom_street_name: formData[streetNameField] || "",
    custom_property_number: formData[propertyNumberField] || "",
  });


  // Calculate dropdown position when it should be shown
  const calculateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return;

    const inputRect = inputRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    setDropdownPosition({
      top: inputRect.bottom + scrollTop,
      left: inputRect.left + scrollLeft,
      width: inputRect.width,
    });
  }, []);

  // Update dropdown position when showing
  useEffect(() => {
    if (showAddressDropdown) {
      calculateDropdownPosition();
      // Recalculate on scroll or resize
      const handleResize = () => calculateDropdownPosition();
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleResize);
      };
    }
  }, [showAddressDropdown, calculateDropdownPosition]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowAddressDropdown(false);
      }
    };

    if (showAddressDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showAddressDropdown]);



  // Update address form when formData changes
  useEffect(() => {
    setAddressForm({
      custom_property_category: formData[propertyCategoryField] || "",
      custom_property_type: formData[propertyTypeField] || "",
      custom_emirate: formData[emirateField] || "",
      custom_area: formData[areaField] || "",
      custom_community: formData[communityField] || "",
      custom_street_name: formData[streetNameField] || "",
      custom_property_number: formData[propertyNumberField] || "",
    });

    // Set the search query to the combined address if it exists
    if (formData[propertyAreaField]) {
      setAddressSearchQuery(formData[propertyAreaField]);
    }
  }, [
    formData,
    propertyCategoryField,
    propertyTypeField,
    emirateField,
    areaField,
    communityField,
    streetNameField,
    propertyNumberField,
    propertyAreaField,
  ]);



  // Function to generate combined address from available fields
  const generateCombinedAddress = useCallback(
    (address: AddressSearchResult) => {
      const addressParts = [
        address.custom_emirate,
        address.custom_area,
        address.custom_community,
        address.custom_street_name,
        address.custom_property_number,
      ].filter((part) => part && part.trim() !== "");

      return addressParts.join(", ");
    },
    []
  );



  // Enhanced address search function
  const searchAddresses = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setAddressSearchResults([]);
        setIsAddressSearching(false);
        setShowAddressDropdown(false);
        return;
      }

      setIsAddressSearching(true);
      setShowAddressDropdown(true);

      try {
        const response = await frappeAPI.makeAuthenticatedRequest(
          "GET",
          `/api/method/eits_app.site_address_search.search_site_addresses?search_term=${encodeURIComponent(
            query
          )}`
        );

        if (response.message?.status === "success") {
          // Filter unique addresses based on combined address
          const uniqueResults = response.message.data.reduce(
            (acc: AddressSearchResult[], current: AddressSearchResult) => {
              const combined =
                current.custom_combined_address ||
                generateCombinedAddress(current);
              const isDuplicate = acc.some(
                (item) =>
                  (item.custom_combined_address ||
                    generateCombinedAddress(item)) === combined
              );
              if (!isDuplicate) {
                acc.push({
                  ...current,
                  search_type: "address",
                  found_via: "combined",
                  address_details: {
                    emirate: current.custom_emirate,
                    area: current.custom_area,
                    community: current.custom_community,
                    street_name: current.custom_street_name,
                    property_number: current.custom_property_number,
                    combined_address: combined,
                    custom_combined_address: current.custom_combined_address,
                    propertycategory: current.custom_property_category,
                    propertytype: current.custom_property_type,
                  },
                });
              }
              return acc;
            },
            []
          );

          setAddressSearchResults(uniqueResults);
        } else {
          setAddressSearchResults([]);
        }
      } catch (error) {
        console.error("Address search error:", error);
        setAddressSearchResults([]);
        
      } finally {
        setIsAddressSearching(false);
      }
    },
    [generateCombinedAddress]
  );

  const handleAddressSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = e.target.value;
    setAddressSearchQuery(query);

    if (query === "") {
      setAddressSearchResults([]);
      setShowAddressDropdown(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchAddresses(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleAddressSelect = (address: AddressSearchResult) => {
    const combinedAddress =
      address.custom_combined_address || generateCombinedAddress(address);

    const updates = {
      [propertyCategoryField]: address.custom_property_category || "",
      [propertyTypeField]: address.custom_property_type || "",
      [emirateField]: address.custom_emirate || "",
      [areaField]: address.custom_area || "",
      [communityField]: address.custom_community || "",
      [streetNameField]: address.custom_street_name || "",
      [propertyNumberField]: address.custom_property_number || "",
      [propertyAreaField]: combinedAddress,
    };

    Object.entries(updates).forEach(([field, value]) => {
      handleSelectChange(field, value);
    });

    setAddressForm({
      custom_property_category: address.custom_property_category || "",
      custom_property_type: address.custom_property_type || "",
      custom_emirate: address.custom_emirate || "",
      custom_area: address.custom_area || "",
      custom_community: address.custom_community || "",
      custom_street_name: address.custom_street_name || "",
      custom_property_number: address.custom_property_number || "",
    });

    setAddressSearchQuery(combinedAddress);
    setAddressSearchResults([]);
    setShowAddressDropdown(false);
  };

  const handleOpenAddressDialog = () => {
    setShowAddressDialog(true);
    setShowAddressDropdown(false);
  };

  // Update the handleSaveAddress function to use this:
  const handleSaveAddress = () => {
    const combinedAddress = generateCombinedAddress(addressForm);

    const updates = {
      [propertyCategoryField]: addressForm.custom_property_category || "",
      [propertyTypeField]: addressForm.custom_property_type || "",
      [emirateField]: addressForm.custom_emirate || "",
      [areaField]: addressForm.custom_area || "",
      [communityField]: addressForm.custom_community || "",
      [streetNameField]: addressForm.custom_street_name || "",
      [propertyNumberField]: addressForm.custom_property_number || "",
      [propertyAreaField]: combinedAddress,
    };

    Object.entries(updates).forEach(([field, value]) => {
      handleSelectChange(field, value);
    });

    setAddressSearchQuery(combinedAddress);
    setShowAddressDialog(false);
   
  };


  // Fixed handlers for clear and edit buttons
  const handleClearAddress = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddressSearchQuery("");
    setAddressSearchResults([]);
    setShowAddressDropdown(false);

    // Clear all address-related fields
    const clearUpdates = {
      [propertyCategoryField]: "",
      [propertyTypeField]: "",
      [emirateField]: "",
      [areaField]: "",
      [communityField]: "",
      [streetNameField]: "",
      [propertyNumberField]: "",
      [propertyAreaField]: "",
    };

    Object.entries(clearUpdates).forEach(([field, value]) => {
      handleSelectChange(field, value);
    });

    // Also clear the address form state
    setAddressForm({
      custom_property_category: "",
      custom_property_type: "",
      custom_emirate: "",
      custom_area: "",
      custom_community: "",
      custom_street_name: "",
      custom_property_number: "",
    });
  };

  const handleEditAddress = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleOpenAddressDialog();
  };

  // Check if we have a valid address - improved logic
  const hasValidAddress = Boolean(
    (formData[propertyAreaField] && formData[propertyAreaField].trim()) ||
      (addressSearchQuery && addressSearchQuery.trim())
  );

  // Dropdown component that will be rendered as portal
  const DropdownContent = () => (
    <div
      ref={dropdownRef}
      className="fixed bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 9999,
      }}
    >
      {isAddressSearching ? (
        <div className="px-4 py-2 text-sm text-gray-500 flex items-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Searching addresses...
        </div>
      ) : addressSearchResults.length > 0 ? (
        <div className="overflow-y-auto max-h-[calc(60vh-100px)]">
          {addressSearchResults.map((address, index) => (
            <div
              key={`address-${index}`}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleAddressSelect(address)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {address.custom_combined_address ||
                      generateCombinedAddress(address)}
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    <div className="flex items-start">
                      <Home className="h-3 w-3 mr-1 flex-shrink-0 mt-0.5" />
                      <span className="break-all">
                        {address.custom_combined_address ||
                          generateCombinedAddress(address)}
                      </span>
                    </div>

                    {/* Property info below address */}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {address.custom_property_category && (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {address.custom_property_category}
                        </span>
                      )}
                      {address.custom_property_type && (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {address.custom_property_type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2 flex-shrink-0">
                  {address.found_via}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : addressSearchQuery ? (
        <div
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
          onClick={handleOpenAddressDialog}
        >
          <div>
            <p className="font-medium">
              No addresses found for &quot;{addressSearchQuery}&quot;
            </p>
            <p className="text-xs text-gray-500">Click to add a new address</p>
          </div>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex-shrink-0">
            Add New
          </span>
        </div>
      ) : null}
    </div>
  );

  return (
   <div className="space-y-4">
      {/* Address Search - Single Field */}
      <div className="w-full">
      
        <div className="relative">
          <div className="flex items-center">
            <MapPin className="absolute left-3 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search by emirate, area, community, street name, or property number..."
              value={addressSearchQuery}
              onChange={handleAddressSearchChange}
              className="w-full pl-9 pr-20 capitalize border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-md shadow-sm transition-colors"
              onFocus={() => {
                if (addressSearchQuery && !showAddressDropdown) {
                  searchAddresses(addressSearchQuery);
                }
              }}
            />

            {/* Action buttons container */}
            <div className="absolute right-2 flex items-center space-x-1 z-10">
              {isAddressSearching && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              )}

              {/* Always show buttons when we have any address data or search query */}
              {!isAddressSearching &&
                (hasValidAddress || addressSearchQuery.trim()) && (
                  <>
                    <button
                      type="button"
                      onClick={handleEditAddress}
                      className="p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors flex-shrink-0"
                      title="Edit address"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAddress}
                      className="p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors flex-shrink-0"
                      title="Clear address"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
            </div>
          </div>
        </div>

        {/* Render dropdown as portal to avoid clipping */}
        {showAddressDropdown &&
          typeof document !== "undefined" &&
          createPortal(<DropdownContent />, document.body)}
      </div>

      {/* Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="sm:max-w-[600px] bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <DialogHeader className="">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              {addressSearchQuery ? "Add New Address" : "Edit Address"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {addressSearchQuery
                ? "Fill in the details to add a new address"
                : "Update the address details below"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto">
           


      


          

            {/* Street Name */}
            <div className="space-y-2">
              <Label className="text-gray-700">Street Name</Label>
              <Input
                type="text"
                value={addressForm.custom_street_name || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const hasAlphaNumeric = /[a-zA-Z0-9]/.test(value);
                  if (value === "" || hasAlphaNumeric) {
                    setAddressForm((prev) => ({
                      ...prev,
                      custom_street_name: (value),
                    }));
                  }
                }}
                placeholder="Enter street name"
                className="text-sm capitalize border-gray-300"
              />
            </div>

            {/* Property Number */}
            <div className="space-y-2">
              <Label className="text-gray-700">Property Number</Label>
              <Input
                type="text"
                value={addressForm.custom_property_number || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const hasAlphaNumeric = /[a-zA-Z0-9]/.test(value);
                  if (value === "" || hasAlphaNumeric) {
                    setAddressForm((prev) => ({
                      ...prev,
                      custom_property_number: (value),
                    }));
                  }
                }}
                placeholder="Enter property number"
                className="text-sm capitalize border-gray-300"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-row gap-2 mt-2">
            <Button
              variant="outline"
              className="w-1/2 text-gray-700 border-gray-300 hover:bg-gray-100 transition-colors"
              onClick={() => setShowAddressDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAddress}
              className="bg-emerald-600 text-white w-1/2 hover:bg-emerald-700 transition-colors"
            >
              Save Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyAddressSection;
