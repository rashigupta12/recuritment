/*eslint-disable @typescript-eslint/no-explicit-any*/
"use client";
import { frappeAPI } from "@/lib/api/frappeClient";
import { Building, Edit, Loader2, Mail, Phone, Plus, User, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ConfirmationDialog from "./ConfirmationDialogcontact";


// -------- Type Definitions --------
type Email = { email_id: string; is_primary: number };
type Phone = { phone: string; is_primary_phone: number };

type ContactType = {
  name: string;
  first_name: string | null;
  last_name: string | null;
  designation?: string | null;
  gender?: string | null;
  organization?: string | null;
  email_ids: Email[];
  phone_nos: Phone[];
};

type SimplifiedContact = {
  name: string;
  email: string;
  phone: string;
  contactId?: string;
  designation?: string;
  gender?: string;
  organization?: string;
  first_name?: string;
  last_name?: string;
};

type ContactMeta = {
  uniqueDesignations: string[];
  uniqueGenders: string[];
  uniqueOrganizations: string[];
};

type ContactSearchSectionProps = {
  onContactSelect: (contact: SimplifiedContact) => void;
  selectedContact: SimplifiedContact | null;
  onEdit: () => void;
  onRemove: () => void;
  onOrganizationAutoFetch?: (organizationName: string) => void;
};

type ContactFormState = {
  first_name: string;
  last_name: string;
  designation: string;
  gender: string;
  email: string;
  phone: string;
  organization: string;
};

const initialContactFormState: ContactFormState = {
  first_name: "",
  last_name: "",
  designation: "",
  gender: "",
  email: "",
  phone: "",
  organization: "",
};

// -------- Designation Dropdown Component --------
const DesignationDropdown: React.FC<{
  value: string;
  onChange: (designation: string) => void;
}> = ({ value, onChange }) => {
  const triggerRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState(value || "");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 200 });

  const fetchDesignations = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await frappeAPI.makeAuthenticatedRequest(
        "GET",
        `/method/recruitment_app.search_designation.search_designation?search_term=${encodeURIComponent(
          query
        )}`
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
    setSearchQuery(value || "");
  }, [value]);

  useEffect(() => {
    if (isOpen) {
      calculatePos();
      const handle = (e: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node) &&
          !triggerRef.current?.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handle);
      window.addEventListener("scroll", calculatePos, true);
      window.addEventListener("resize", calculatePos);
      return () => {
        document.removeEventListener("mousedown", handle);
        window.removeEventListener("scroll", calculatePos, true);
        window.removeEventListener("resize", calculatePos);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchDesignations(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchDesignations]);

  return (
    <>
      <input
        ref={triggerRef}
        type="text"
        value={searchQuery}
        onChange={(e) => {
          const value = e.target.value;
          const formattedValue =
            value.charAt(0).toUpperCase() + value.slice(1);
          setSearchQuery(formattedValue);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (searchQuery) {
            setIsOpen(true);
          }
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        placeholder="e.g., HR Manager"
      />

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-[9999]"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            {loading ? (
              <div className="flex items-center justify-center p-3 text-md text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...
              </div>
            ) : results.length > 0 ? (
              results.map((d) => (
                <div
                  key={d}
                  onMouseDown={() => {
                    setSearchQuery(d);
                    onChange(d);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                    d === value ? "bg-blue-50" : ""
                  }`}
                >
                  {d}
                </div>
              ))
            ) : searchQuery ? (
              <div className="p-3 text-md text-gray-500">
                No designations found
              </div>
            ) : null}
          </div>,
          document.body
        )}
    </>
  );
};

// -------- Meta Extraction Utility --------
function extractContactMeta(contacts: ContactType[]): ContactMeta {
  const designations = new Set<string>();
  const genders = new Set<string>();
  const organizations = new Set<string>();

  contacts.forEach((contact) => {
    if (contact.designation && contact.designation.trim())
      designations.add(contact.designation.trim());
    if (contact.gender && contact.gender.trim())
      genders.add(contact.gender.trim());
    if (contact.organization && contact.organization.trim())
      organizations.add(contact.organization.trim());
  });

  return {
    uniqueDesignations: Array.from(designations),
    uniqueGenders: Array.from(genders),
    uniqueOrganizations: Array.from(organizations),
  };
}

// -------- Main Component --------
const ContactSearchSection: React.FC<ContactSearchSectionProps> = ({
  onContactSelect,
  selectedContact,
  onRemove,
  onOrganizationAutoFetch,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ContactType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [pendingContactData, setPendingContactData] = useState<any>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const [contactForm, setContactForm] = useState<ContactFormState>(
    initialContactFormState
  );

  const [contactMeta, setContactMeta] = useState<ContactMeta>({
    uniqueDesignations: [],
    uniqueGenders: [],
    uniqueOrganizations: [],
  });

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

  useEffect(() => {
    if (showDropdown) {
      calculateDropdownPosition();
      const handleResize = () => calculateDropdownPosition();
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleResize);
      };
    }
  }, [showDropdown, calculateDropdownPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const getPrimaryEmail = (contact: ContactType): string => {
    const primaryEmail = contact.email_ids.find(
      (email) => email.is_primary === 1
    );
    return (
      primaryEmail?.email_id ||
      (contact.email_ids.length > 0 ? contact.email_ids[0].email_id : "")
    );
  };

  const getPrimaryPhone = (contact: ContactType): string => {
    const primaryPhone = contact.phone_nos.find(
      (phone) => phone.is_primary_phone === 1
    );
    return (
      primaryPhone?.phone ||
      (contact.phone_nos.length > 0 ? contact.phone_nos[0].phone : "")
    );
  };

  const getFullName = (contact: ContactType): string => {
    return contact.name && contact.name.trim()
      ? contact.name
      : `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim();
  };

  const searchContacts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      setContactMeta({
        uniqueDesignations: [],
        uniqueGenders: [],
        uniqueOrganizations: [],
      });
      return;
    }
    setIsSearching(true);
    setShowDropdown(true);
    try {
      const response = await frappeAPI.makeAuthenticatedRequest(
        "GET",
        `/method/recruitment_app.contact_search.search_contacts?search_term=${encodeURIComponent(
          query
        )}`
      );
      if (response.message?.status === "success") {
        const data: ContactType[] = response.message.data || [];
        setSearchResults(data);
        setContactMeta(extractContactMeta(data));
      } else {
        setSearchResults([]);
        setContactMeta({
          uniqueDesignations: [],
          uniqueGenders: [],
          uniqueOrganizations: [],
        });
      }
    } catch (error) {
      setSearchResults([]);
      setContactMeta({
        uniqueDesignations: [],
        uniqueGenders: [],
        uniqueOrganizations: [],
      });
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      searchContacts(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, searchContacts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleContactSelect = (contact: ContactType) => {
    const simplifiedContact: SimplifiedContact = {
      name: getFullName(contact),
      email: getPrimaryEmail(contact),
      phone: getPrimaryPhone(contact),
      contactId: contact.name,
      designation: contact.designation || "",
      gender: contact.gender || "",
      organization: contact.organization || "",
      first_name: contact.first_name || "",
      last_name: contact.last_name || "",
    };

    onContactSelect(simplifiedContact);
    setSearchQuery(getFullName(contact));
    setShowDropdown(false);
    setSearchResults([]);

    if (
      contact.organization &&
      contact.organization.trim() &&
      onOrganizationAutoFetch
    ) {
      onOrganizationAutoFetch(contact.organization.trim());
    }
  };

  const handleInputFocus = () => {
    if (searchQuery.trim() && !isSearching) {
      setShowDropdown(true);
    } else if (searchQuery.trim()) {
      searchContacts(searchQuery);
    }
  };

  const handleClearContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    onRemove();
  };

  const handleEditContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedContact) {
      const firstName =
        selectedContact.first_name || selectedContact.name.split(" ")[0] || "";
      const lastName =
        selectedContact.last_name ||
        selectedContact.name.split(" ").slice(1).join(" ") ||
        "";

      setContactForm({
        first_name: firstName,
        last_name: lastName,
        designation: selectedContact.designation || "",
        gender: selectedContact.gender || "",
        email: selectedContact.email,
        phone: selectedContact.phone,
        organization: selectedContact.organization || "",
      });
    }
    setShowContactDialog(true);
    setShowDropdown(false);
  };

  const handleCreateContact = () => {
    const [firstName, ...lastNameParts] = searchQuery.split(" ");
    setContactForm({
      first_name: firstName || searchQuery,
      last_name: lastNameParts.join(" ") || "",
      designation: "",
      gender: "",
      email: "",
      phone: "",
      organization: "",
    });
    setShowContactDialog(true);
    setShowDropdown(false);
  };

  const handleSaveContact = async () => {
    if (!contactForm.first_name.trim()) return;

    const contactData: any = {
      first_name: contactForm.first_name.trim(),
      last_name: contactForm.last_name.trim(),
      designation: contactForm.designation.trim() || null,
      gender: contactForm.gender || null,
      organization: contactForm.organization.trim() || null,
      email_ids: contactForm.email
        ? [
            {
              email_id: contactForm.email.trim(),
              is_primary: 1,
              parenttype: "Contact",
              parentfield: "email_ids",
            },
          ]
        : [],
      phone_nos: contactForm.phone
        ? [
            {
              phone: contactForm.phone.trim(),
              is_primary_phone: 1,
              parenttype: "Contact",
              parentfield: "phone_nos",
            },
          ]
        : [],
    };

    // Show confirmation dialog only for UPDATE
    if (selectedContact?.contactId) {
      setPendingContactData(contactData);
      setConfirmMessage("Are you sure you want to update this contact?");
      setShowConfirmDialog(true);
    } else {
      // For CREATE, directly call the save function
      await handleDirectSave(contactData);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!pendingContactData) return;

    try {
      setIsSaving(true);

      // let contactId: string;
      // let contactName: string;

      // This function is only called for UPDATE now
      await frappeAPI.updateContact(selectedContact!.contactId!, pendingContactData);
      const contactId = selectedContact!.contactId!;
      const contactName = `${contactForm.first_name} ${contactForm.last_name}`.trim();

      const simplifiedContact: SimplifiedContact = {
        name: contactName,
        email: contactForm.email,
        phone: contactForm.phone,
        contactId,
        designation: contactForm.designation,
        gender: contactForm.gender,
        organization: contactForm.organization,
        first_name: contactForm.first_name,
        last_name: contactForm.last_name,
      };

      onContactSelect(simplifiedContact);
      setSearchQuery(contactName);

      if (contactForm.organization.trim() && onOrganizationAutoFetch) {
        onOrganizationAutoFetch(contactForm.organization.trim());
      }

      // Close dialogs and reset
      setShowConfirmDialog(false);
      setShowContactDialog(false);
      setContactForm(initialContactFormState);
      setPendingContactData(null);
      

      
    } catch (error) {
      console.error(error);
      alert("Failed to update contact. Please try again.");
      setShowConfirmDialog(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDirectSave = async (contactData: any) => {
    try {
      setIsSaving(true);

      // let contactId: string;
      // let contactName: string;

      // This function is only for CREATE
      const response = await frappeAPI.createContact(contactData);
      const contactId = response.data.name;
      const contactName = `${contactForm.first_name} ${contactForm.last_name}`.trim();

      const simplifiedContact: SimplifiedContact = {
        name: contactName,
        email: contactForm.email,
        phone: contactForm.phone,
        contactId,
        designation: contactForm.designation,
        gender: contactForm.gender,
        organization: contactForm.organization,
        first_name: contactForm.first_name,
        last_name: contactForm.last_name,
      };

      onContactSelect(simplifiedContact);
      setSearchQuery(contactName);

      if (contactForm.organization.trim() && onOrganizationAutoFetch) {
        onOrganizationAutoFetch(contactForm.organization.trim());
      }

      // Close dialog and reset
      setShowContactDialog(false);
      setContactForm(initialContactFormState);
      
     
      
    } catch (error) {
      console.error(error);
      alert("Failed to create contact. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseContactDialog = () => {
    setShowContactDialog(false);
    setContactForm(initialContactFormState);
  };

  const hasValidContact = Boolean(selectedContact);

  const DropdownContent = () => (
    <div
      ref={dropdownRef}
      className={`fixed bg-white shadow-lg rounded-md max-h-60 overflow-y-auto ${
        selectedContact ? '' : 'border border-gray-200'
      }`}
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 9999,
      }}
    >
      {isSearching ? (
        <div className="px-4 py-2 text-md text-gray-500 flex items-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Searching contacts...
        </div>
      ) : searchResults.length > 0 ? (
        <div className="overflow-y-auto max-h-[calc(60vh-100px)]">
          {searchResults.map((contact, index) => (
            <div
              key={contact.name || index}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleContactSelect(contact)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {getFullName(contact)}
                  </p>
                  <div className="text-sm text-gray-500 mt-1 space-y-1">
                    {contact.designation && (
                      <div className="text-md text-gray-600">
                        {contact.designation}
                      </div>
                    )}
                    {contact.organization && (
                      <div className="text-md text-gray-600 font-medium">
                        📍 {contact.organization}
                      </div>
                    )}
                    {contact.gender && (
                      <div className="flex items-center">
                        <span className="mr-2">{contact.gender}</span>
                      </div>
                    )}
                    {getPrimaryEmail(contact) && (
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {getPrimaryEmail(contact)}
                        </span>
                      </div>
                    )}
                    {getPrimaryPhone(contact) && (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>{getPrimaryPhone(contact)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!selectedContact && (
            <div
              className="px-4 py-3 hover:bg-primary/5 cursor-pointer border-t bg-gray-50 text-primary font-medium"
              onClick={handleCreateContact}
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Add New Contact
            </div>
          )}
        </div>
      ) : searchQuery && !selectedContact ? (
        <div
          className="px-4 py-3 hover:bg-primary/5 cursor-pointer text-primary font-medium"
          onClick={handleCreateContact}
        >
          <Plus className="h-4 w-4 inline mr-2" />
          Create contact for &quot;{searchQuery}&quot;
        </div>
      ) : !selectedContact ? (
        <div className="px-4 py-2 text-md text-gray-500">
          Start typing to search contacts...
        </div>
      ) : null}
      {/* {(contactMeta.uniqueDesignations.length > 0 ||
        contactMeta.uniqueGenders.length > 0 ||
        contactMeta.uniqueOrganizations.length > 0) && (
        <div className="px-4 py-2 border-t text-sm text-gray-400 bg-gray-50">
          <div>
            <span className="font-medium">Designations:</span>{" "}
            {contactMeta.uniqueDesignations.join(", ")}
          </div>
          <div>
            <span className="font-medium">Genders:</span>{" "}
            {contactMeta.uniqueGenders.join(", ")}
          </div>
          <div>
            <span className="font-medium">Organizations:</span>{" "}
            {contactMeta.uniqueOrganizations.join(", ")}
          </div>
        </div>
      )} */}
    </div>
  );

  const renderConfirmDialog = () => {
    if (showConfirmDialog && typeof document !== "undefined") {
      return createPortal(
        <ConfirmationDialog
          isOpen={showConfirmDialog}
          onConfirm={handleConfirmUpdate}
          onCancel={() => {
            setShowConfirmDialog(false);
            setPendingContactData(null);
          }}
          title={selectedContact ? "Update Contact" : "Create Contact"}
          message={confirmMessage}
          confirmText={selectedContact ? "Update" : "Create"}
          cancelText="Cancel"
          type="warning"
          isLoading={isSaving}
        />,
        document.body
      );
    }
    return null;
  };

  const renderContactDialog = () => {
    if (showContactDialog) {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedContact ? "Edit Contact" : "Add New Contact"}
              </h2>
              <button
                onClick={handleCloseContactDialog}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={contactForm.first_name}
                    onChange={(e) => {
                      const value = e.target.value;
                      const formattedValue =
                        value.charAt(0).toUpperCase() + value.slice(1);
                      setContactForm((prev) => ({
                        ...prev,
                        first_name: formattedValue,
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={contactForm.last_name}
                    onChange={(e) => {
                      const value = e.target.value;
                      const formattedValue =
                        value.charAt(0).toUpperCase() + value.slice(1);
                      setContactForm((prev) => ({
                        ...prev,
                        last_name: formattedValue,
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Designation
                  </label>
                  <DesignationDropdown
                    value={contactForm.designation}
                    onChange={(designation) =>
                      setContactForm((prev) => ({ ...prev, designation }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={contactForm.gender}
                    onChange={(e) =>
                      setContactForm((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => {
                    setContactForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }));
                  }}
                  onBlur={() => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (
                      contactForm.email &&
                      !emailRegex.test(contactForm.email)
                    ) {
                      alert("Please enter a valid email address");
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    const phoneRegex = /^\d{0,10}$/;
                    if (phoneRegex.test(value)) {
                      setContactForm((prev) => ({ ...prev, phone: value }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              
              {/* <div>
                <label className="block text-md font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  value={contactForm.organization}
                  onChange={(e) => {
                    setContactForm((prev) => ({
                      ...prev,
                      organization: e.target.value,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="e.g., ABC Company"
                />
              </div> */}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3 sticky bottom-0 bg-white">
              <button
                onClick={handleCloseContactDialog}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContact}
                disabled={isSaving || !contactForm.first_name.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {selectedContact ? "Update Contact" : "Create Contact"}
                </span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {renderConfirmDialog()}
      <div className="w-full">
        <div className="relative">
          <div className="flex items-center">
            <User className="absolute left-3 h-4 w-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search contacts by name, email, or phone..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
              className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors capitalize"
            />

            <div className="absolute right-2 flex items-center space-x-1 z-10">
              {isSearching && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              )}
              {!isSearching && (hasValidContact || searchQuery.trim()) && (
                <>
                  {hasValidContact && (
                    <button
                      type="button"
                      onClick={handleEditContact}
                      className="p-1 rounded-full text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors flex-shrink-0"
                      title="Edit contact"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClearContact}
                    className="p-1 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                    title="Clear contact"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        {showDropdown &&
          typeof document !== "undefined" &&
          createPortal(<DropdownContent />, document.body)}
      </div>

      {selectedContact && (
        <div className="border  rounded-lg p-4 py-2  animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="font-medium text-gray-900">
                  {selectedContact.name}
                </h3>
                <div className="text-md text-gray-600 space-y-1">
                  {selectedContact.designation && (
                    <div className="text-md text-gray-600">
                      {selectedContact.designation}
                    </div>
                  )}
                  {selectedContact.organization && (
                    <div className="flex items-center gap-2 text-md text-gray-600 font-medium">
                      <Building className="h-4 w-4" />
                      <span>{selectedContact.organization}</span>
                    </div>
                  )}
                  {selectedContact.email && (
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-2" />
                      {selectedContact.email}
                    </div>
                  )}
                  {selectedContact.phone && (
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-2" />
                      {selectedContact.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {renderContactDialog()}
    </div>
  );
};

export default ContactSearchSection;