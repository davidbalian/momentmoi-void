"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Toast,
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  Building2,
  Save,
  Eye,
  Upload,
  X,
  Plus,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";
import { useVendorProfile } from "@/hooks/useVendorProfile";
import { createClientComponentClient } from "@/lib/supabase";
import {
  uploadFile,
  deleteFile,
  generateUniqueFilename,
  extractPathFromUrl,
} from "@/lib/storage";

const businessCategories = [
  { value: "photographer", label: "Photographer" },
  { value: "videographer", label: "Videographer" },
  { value: "florist", label: "Florist" },
  { value: "venue", label: "Venue" },
  { value: "music", label: "Music" },
  { value: "cake", label: "Cake" },
  { value: "dress", label: "Dress" },
  { value: "jeweller", label: "Jeweller" },
  { value: "transportation", label: "Transportation" },
];

const eventTypes = [
  { value: "wedding", label: "Wedding" },
  { value: "christening", label: "Christening" },
  { value: "party", label: "Party" },
  { value: "kids_party", label: "Kids Party" },
];

const cyprusLocations = [
  { value: "nicosia", label: "Nicosia" },
  { value: "limassol", label: "Limassol" },
  { value: "larnaca", label: "Larnaca" },
  { value: "paphos", label: "Paphos" },
  { value: "platres", label: "Platres" },
  { value: "paralimni_ayia_napa", label: "Paralimni/Ayia Napa" },
  { value: "whole_cyprus", label: "Whole Cyprus" },
];

interface ContactMethod {
  id: string;
  type: "email" | "phone";
  value: string;
  isPrimary: boolean;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const {
    profile,
    contacts,
    locations,
    loading: profileLoading,
    error,
    saveProfile,
  } = useVendorProfile();
  const router = useRouter();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  // Form data state
  const [formData, setFormData] = useState({
    business_name: "",
    description: "",
    business_category: "",
    event_types: [] as string[],
    logo_url: null as string | null,
    contacts: [] as Array<{
      contact_type: "email" | "phone";
      contact_value: string;
      is_primary: boolean;
    }>,
    locations: [] as string[],
  });

  // Track original data to detect changes
  const [originalData, setOriginalData] = useState({
    business_name: "",
    description: "",
    business_category: "",
    event_types: [] as string[],
    logo_url: null as string | null,
    contacts: [] as Array<{
      contact_type: "email" | "phone";
      contact_value: string;
      is_primary: boolean;
    }>,
    locations: [] as string[],
  });

  // Local form state for better UX
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [additionalContacts, setAdditionalContacts] = useState<ContactMethod[]>(
    []
  );

  // Check if form has changes
  const hasChanges = () => {
    return (
      formData.business_name !== originalData.business_name ||
      formData.description !== originalData.description ||
      formData.business_category !== originalData.business_category ||
      JSON.stringify(formData.event_types) !==
        JSON.stringify(originalData.event_types) ||
      formData.logo_url !== originalData.logo_url ||
      JSON.stringify(formData.contacts) !==
        JSON.stringify(originalData.contacts) ||
      JSON.stringify(formData.locations) !==
        JSON.stringify(originalData.locations)
    );
  };

  // Initialize form data when profile loads or when no profile exists
  useEffect(() => {
    if (profile) {
      // Profile exists, load data from it
      const newFormData = {
        business_name: profile.business_name || "",
        description: profile.description || "",
        business_category: profile.business_category || "",
        event_types: profile.event_types || [],
        logo_url: profile.logo_url,
        contacts: contacts.map((contact) => ({
          contact_type: contact.contact_type,
          contact_value: contact.contact_value,
          is_primary: contact.is_primary,
        })),
        locations: locations.map((location) => location.location),
      };

      setFormData(newFormData);
      setOriginalData(newFormData);

      // Set up additional contacts
      const additionalContactsData = contacts.filter((c) => !c.is_primary);
      setAdditionalContacts(
        additionalContactsData.map((c) => ({
          id: c.id,
          type: c.contact_type,
          value: c.contact_value,
          isPrimary: c.is_primary,
        }))
      );
    } else if (!profileLoading && !error) {
      // No profile exists yet (new vendor), initialize with defaults
      console.log("No vendor profile found, initializing with defaults");
      const defaultFormData = {
        business_name: "",
        description: "",
        business_category: "",
        event_types: [] as string[],
        logo_url: null as string | null,
        contacts: [
          {
            contact_type: "email" as const,
            contact_value: user?.email || "",
            is_primary: true,
          },
        ],
        locations: [] as string[],
      };

      setFormData(defaultFormData);
      setOriginalData(defaultFormData);
      setAdditionalContacts([]);
    }
  }, [profile, contacts, locations, profileLoading, error, user?.email]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  // Logo upload handler
  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setLogoError(null);
    setLogoUploading(true);

    try {
      const filename = generateUniqueFilename(file.name, user.id);
      const result = await uploadFile(file, "vendor-logos", filename);

      if (result.success && result.url) {
        setLogoFile(file);
        setFormData((prev) => ({
          ...prev,
          logo_url: result.url || null,
        }));
      } else {
        setLogoError(result.error || "Upload failed");
      }
    } catch (error) {
      setLogoError("An unexpected error occurred");
    } finally {
      setLogoUploading(false);
    }
  };

  const removeLogo = async () => {
    if (!user) return;

    try {
      if (formData.logo_url && formData.logo_url.includes("supabase.co")) {
        const path = extractPathFromUrl(formData.logo_url);
        if (path) {
          await deleteFile("vendor-logos", path);
        }
      }
      setLogoFile(null);
      setFormData((prev) => ({
        ...prev,
        logo_url: null,
      }));
    } catch (error) {
      console.error("Error removing logo:", error);
    }
  };

  // Contact management
  const addContact = () => {
    const newContact: ContactMethod = {
      id: Date.now().toString(),
      type: "email",
      value: "",
      isPrimary: false,
    };
    setAdditionalContacts((prev) => [...prev, newContact]);
  };

  const removeContact = (id: string) => {
    setAdditionalContacts((prev) =>
      prev.filter((contact) => contact.id !== id)
    );
  };

  const updateContact = (
    id: string,
    field: keyof ContactMethod,
    value: any
  ) => {
    setAdditionalContacts((prev) =>
      prev.map((contact) =>
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    );
  };

  const setPrimaryContact = (id: string) => {
    setAdditionalContacts((prev) =>
      prev.map((contact) => ({
        ...contact,
        isPrimary: contact.id === id,
      }))
    );
  };

  // Update form data when local state changes
  useEffect(() => {
    const allContacts = [
      // Primary email
      ...(formData.contacts.find(
        (c) => c.contact_type === "email" && c.is_primary
      )
        ? [
            {
              contact_type: "email" as const,
              contact_value:
                formData.contacts.find(
                  (c) => c.contact_type === "email" && c.is_primary
                )?.contact_value || "",
              is_primary: true,
            },
          ]
        : []),
      // Primary phone
      ...(formData.contacts.find(
        (c) => c.contact_type === "phone" && c.is_primary
      )
        ? [
            {
              contact_type: "phone" as const,
              contact_value:
                formData.contacts.find(
                  (c) => c.contact_type === "phone" && c.is_primary
                )?.contact_value || "",
              is_primary: true,
            },
          ]
        : []),
      // Additional contacts
      ...additionalContacts.map((contact) => ({
        contact_type: contact.type,
        contact_value: contact.value,
        is_primary: contact.isPrimary,
      })),
    ];

    setFormData((prev) => ({
      ...prev,
      contacts: allContacts,
    }));
  }, [additionalContacts]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const result = await saveProfile(formData);

      if (result.success) {
        setToast({
          message: "Profile saved successfully!",
          type: "success",
          isVisible: true,
        });
        setOriginalData(formData);
      } else {
        setToast({
          message: `Error saving profile: ${result.error}`,
          type: "error",
          isVisible: true,
        });
      }
    } catch (error) {
      setToast({
        message: "Error saving profile. Please try again.",
        type: "error",
        isVisible: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-8xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-light text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-600">
              Manage your business profile and contact information
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" />
              {isPreviewMode ? "Edit Mode" : "Preview"}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges()}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                hasChanges() && !isSaving
                  ? "text-white bg-primary-600 hover:bg-primary-700"
                  : "text-gray-400 bg-gray-100"
              } disabled:opacity-50`}
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Profile Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <p className="text-sm text-red-800">
                    Error loading profile: {error}
                  </p>
                </CardContent>
              </Card>
            )}

            {!profile && !profileLoading && !error && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <p className="text-sm text-blue-800">
                    Welcome! Please fill out your business profile information
                    below. This will be used to display your services to
                    potential clients.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Business Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isPreviewMode ? (
                  <div className="space-y-4">
                    {formData.business_name && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Business Name
                        </span>
                        <p className="text-gray-900">
                          {formData.business_name}
                        </p>
                      </div>
                    )}
                    {formData.description && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Description
                        </span>
                        <p className="text-gray-900">{formData.description}</p>
                      </div>
                    )}
                    {formData.business_category && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Category
                        </span>
                        <p className="text-gray-900">
                          {
                            businessCategories.find(
                              (c) => c.value === formData.business_category
                            )?.label
                          }
                        </p>
                      </div>
                    )}
                    {formData.event_types.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Event Types
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {formData.event_types.map((type) => (
                            <span
                              key={type}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                            >
                              {eventTypes.find((t) => t.value === type)?.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {formData.logo_url && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Logo
                        </span>
                        <img
                          src={formData.logo_url}
                          alt="Business logo"
                          className="w-16 h-16 object-cover rounded-lg mt-1"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Business Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name *
                      </label>
                      <Input
                        value={formData.business_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            business_name: e.target.value,
                          }))
                        }
                        placeholder="Enter your business name"
                      />
                    </div>

                    {/* Business Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Describe your business and services"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    {/* Business Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Category *
                      </label>
                      <Select
                        value={formData.business_category}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            business_category: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessCategories.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                            >
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Event Types */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Event Types *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {eventTypes.map((type) => (
                          <label
                            key={type.value}
                            className="flex items-center space-x-2 cursor-pointer p-3 border border-border rounded-lg hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={formData.event_types.includes(
                                type.value
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    event_types: [
                                      ...prev.event_types,
                                      type.value,
                                    ],
                                  }));
                                } else {
                                  setFormData((prev) => ({
                                    ...prev,
                                    event_types: prev.event_types.filter(
                                      (t) => t !== type.value
                                    ),
                                  }));
                                }
                              }}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">
                              {type.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Logo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Logo
                      </label>
                      <div className="flex items-center gap-4">
                        {formData.logo_url ? (
                          <div className="flex items-center gap-4">
                            <img
                              src={formData.logo_url}
                              alt="Business logo"
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={removeLogo}
                              className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-border rounded-lg hover:bg-gray-50 cursor-pointer">
                              <Upload className="w-4 h-4" />
                              Upload Logo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                                disabled={logoUploading}
                              />
                            </label>
                            {logoUploading && (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                                Uploading...
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {logoError && (
                        <p className="text-sm text-red-600 mt-1">{logoError}</p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isPreviewMode ? (
                  <div className="space-y-4">
                    {formData.contacts.find(
                      (c) => c.contact_type === "email" && c.is_primary
                    ) && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {
                            formData.contacts.find(
                              (c) => c.contact_type === "email" && c.is_primary
                            )?.contact_value
                          }
                        </span>
                      </div>
                    )}
                    {formData.contacts.find(
                      (c) => c.contact_type === "phone" && c.is_primary
                    ) && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {
                            formData.contacts.find(
                              (c) => c.contact_type === "phone" && c.is_primary
                            )?.contact_value
                          }
                        </span>
                      </div>
                    )}
                    {additionalContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center gap-3">
                        {contact.type === "email" ? (
                          <Mail className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Phone className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-gray-700">{contact.value}</span>
                        {contact.isPrimary && (
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Primary Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Email *
                      </label>
                      <Input
                        type="email"
                        value={
                          formData.contacts.find(
                            (c) => c.contact_type === "email" && c.is_primary
                          )?.contact_value || ""
                        }
                        onChange={(e) => {
                          const primaryEmail = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            contacts: [
                              ...prev.contacts.filter(
                                (c) =>
                                  !(c.contact_type === "email" && c.is_primary)
                              ),
                              ...(primaryEmail
                                ? [
                                    {
                                      contact_type: "email" as const,
                                      contact_value: primaryEmail,
                                      is_primary: true,
                                    },
                                  ]
                                : []),
                              ...prev.contacts.filter(
                                (c) =>
                                  c.contact_type === "phone" && c.is_primary
                              ),
                              ...additionalContacts.map((contact) => ({
                                contact_type: contact.type,
                                contact_value: contact.value,
                                is_primary: contact.isPrimary,
                              })),
                            ],
                          }));
                        }}
                        placeholder="your@email.com"
                      />
                    </div>

                    {/* Primary Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Phone *
                      </label>
                      <Input
                        type="tel"
                        value={
                          formData.contacts.find(
                            (c) => c.contact_type === "phone" && c.is_primary
                          )?.contact_value || ""
                        }
                        onChange={(e) => {
                          const primaryPhone = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            contacts: [
                              ...prev.contacts.filter(
                                (c) =>
                                  c.contact_type === "email" && c.is_primary
                              ),
                              ...(primaryPhone
                                ? [
                                    {
                                      contact_type: "phone" as const,
                                      contact_value: primaryPhone,
                                      is_primary: true,
                                    },
                                  ]
                                : []),
                              ...prev.contacts.filter(
                                (c) =>
                                  !(c.contact_type === "phone" && c.is_primary)
                              ),
                              ...additionalContacts.map((contact) => ({
                                contact_type: contact.type,
                                contact_value: contact.value,
                                is_primary: contact.isPrimary,
                              })),
                            ],
                          }));
                        }}
                        placeholder="+357 99 123 456"
                      />
                    </div>

                    {/* Additional Contacts */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Additional Contacts
                        </label>
                        <button
                          type="button"
                          onClick={addContact}
                          className="flex items-center gap-1 px-3 py-1 text-sm text-primary-600 hover:text-primary-700"
                        >
                          <Plus className="w-3 h-3" />
                          Add Contact
                        </button>
                      </div>
                      <div className="space-y-3">
                        {additionalContacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="flex items-center gap-3 p-3 border border-border rounded-lg"
                          >
                            <Select
                              value={contact.type}
                              onValueChange={(value: "email" | "phone") =>
                                updateContact(contact.id, "type", value)
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type={contact.type === "email" ? "email" : "tel"}
                              value={contact.value}
                              onChange={(e) =>
                                updateContact(
                                  contact.id,
                                  "value",
                                  e.target.value
                                )
                              }
                              placeholder={
                                contact.type === "email"
                                  ? "contact@email.com"
                                  : "+357 99 123 456"
                              }
                              className="flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => setPrimaryContact(contact.id)}
                              className={`px-3 py-1 text-xs rounded-full ${
                                contact.isPrimary
                                  ? "bg-primary-100 text-primary-700"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              Primary
                            </button>
                            <button
                              type="button"
                              onClick={() => removeContact(contact.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Service Locations Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Locations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isPreviewMode ? (
                  <div className="space-y-4">
                    {formData.locations.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.locations.map((location) => (
                          <span
                            key={location}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full"
                          >
                            <MapPin className="w-3 h-3" />
                            {
                              cyprusLocations.find(
                                (loc) => loc.value === location
                              )?.label
                            }
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No locations selected
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Service Locations */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Where do you provide services? *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {cyprusLocations.map((location) => (
                          <label
                            key={location.value}
                            className="flex items-center space-x-2 cursor-pointer p-3 border border-border rounded-lg transition-[background-color] duration-150 ease-out hover:bg-gray-50 hover:transition-none"
                          >
                            <input
                              type="checkbox"
                              checked={formData.locations.includes(
                                location.value
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    locations: [
                                      ...prev.locations,
                                      location.value,
                                    ],
                                  }));
                                } else {
                                  setFormData((prev) => ({
                                    ...prev,
                                    locations: prev.locations.filter(
                                      (loc) => loc !== location.value
                                    ),
                                  }));
                                }
                              }}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">
                              {location.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </DashboardLayout>
  );
}
