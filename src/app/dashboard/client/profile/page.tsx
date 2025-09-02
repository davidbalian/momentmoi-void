"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ClientDashboardLayout } from "@/components/layout";
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
  Save,
  Upload,
  X,
  User,
  MapPin,
  Bell,
  Shield,
  Heart,
  Mail,
  Phone,
} from "lucide-react";
import { createClientComponentClient } from "@/lib/supabase";
import {
  uploadFile,
  deleteFile,
  generateUniqueFilename,
  extractPathFromUrl,
} from "@/lib/storage";

const cyprusLocations = [
  { value: "nicosia", label: "Nicosia" },
  { value: "limassol", label: "Limassol" },
  { value: "larnaca", label: "Larnaca" },
  { value: "paphos", label: "Paphos" },
  { value: "platres", label: "Platres" },
  { value: "paralimni_ayia_napa", label: "Paralimni/Ayia Napa" },
  { value: "whole_cyprus", label: "Whole Cyprus" },
];

interface ProfileData {
  full_name: string;
  email: string;
  location_preference: string;
  avatar_url: string | null;
}

interface CoupleProfileData {
  partner_name: string;
  partner_email: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  vendor_updates: boolean;
  event_reminders: boolean;
  partner_notifications: boolean;
}

export default function ClientProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();

  // State management
  const [userType, setUserType] = useState<"planner" | "viewer" | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  // Profile data
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    email: "",
    location_preference: "",
    avatar_url: null,
  });

  // Couple profile data (for planners)
  const [coupleProfileData, setCoupleProfileData] = useState<CoupleProfileData>(
    {
      partner_name: "",
      partner_email: "",
    }
  );

  // Notification settings
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      email_notifications: true,
      vendor_updates: true,
      event_reminders: true,
      partner_notifications: true,
    });

  // File upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Form validation errors
  const [validationErrors, setValidationErrors] = useState<{
    full_name?: string;
    partner_name?: string;
    partner_email?: string;
  }>({});

  // Track original data for change detection
  const [originalProfileData, setOriginalProfileData] = useState<ProfileData>({
    full_name: "",
    email: "",
    location_preference: "",
    avatar_url: null,
  });

  const [originalCoupleData, setOriginalCoupleData] =
    useState<CoupleProfileData>({
      partner_name: "",
      partner_email: "",
    });

  // Form validation
  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    // Validate full name
    if (!profileData.full_name.trim()) {
      errors.full_name = "Full name is required";
    } else if (profileData.full_name.trim().length < 2) {
      errors.full_name = "Full name must be at least 2 characters";
    }

    // Validate partner email if provided
    if (userType === "planner" && coupleProfileData.partner_email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(coupleProfileData.partner_email)) {
        errors.partner_email = "Please enter a valid email address";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Check if form has changes
  const hasChanges = () => {
    const profileChanged =
      JSON.stringify(profileData) !== JSON.stringify(originalProfileData);
    const coupleChanged =
      userType === "planner" &&
      JSON.stringify(coupleProfileData) !== JSON.stringify(originalCoupleData);
    return profileChanged || coupleChanged;
  };

  // Load user data
  const loadUserData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      setUserType(profile.user_type as "planner" | "viewer");

      // Set profile data
      const newProfileData = {
        full_name: profile.full_name || "",
        email: profile.email,
        location_preference: profile.location_preference || "",
        avatar_url: profile.avatar_url,
      };

      setProfileData(newProfileData);
      setOriginalProfileData(newProfileData);

      // Get couple profile if user is a planner
      if (profile.user_type === "planner") {
        const { data: coupleProfile, error: coupleError } = await supabase
          .from("couple_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (!coupleError && coupleProfile) {
          const newCoupleData = {
            partner_name: coupleProfile.partner_name || "",
            partner_email: coupleProfile.partner_email || "",
          };

          setCoupleProfileData(newCoupleData);
          setOriginalCoupleData(newCoupleData);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setToast({
        message: "Error loading profile data. Please try again.",
        type: "error",
        isVisible: true,
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, supabase]);

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  // Avatar upload handler
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setAvatarUploading(true);

    try {
      const filename = generateUniqueFilename(file.name, user.id);
      const result = await uploadFile(file, "avatars", filename);

      if (result.success && result.url) {
        setAvatarFile(file);
        setProfileData((prev) => ({
          ...prev,
          avatar_url: result.url || null,
        }));
      } else {
        setToast({
          message: result.error || "Upload failed",
          type: "error",
          isVisible: true,
        });
      }
    } catch (error) {
      setToast({
        message: "An unexpected error occurred",
        type: "error",
        isVisible: true,
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const removeAvatar = async () => {
    if (!user) return;

    try {
      if (
        profileData.avatar_url &&
        profileData.avatar_url.includes("supabase.co")
      ) {
        const path = extractPathFromUrl(profileData.avatar_url);
        if (path) {
          await deleteFile("avatars", path);
        }
      }
      setAvatarFile(null);
      setProfileData((prev) => ({
        ...prev,
        avatar_url: null,
      }));
    } catch (error) {
      console.error("Error removing avatar:", error);
    }
  };

  // Save profile data
  const handleSave = async () => {
    if (!user) return;

    // Validate form before saving
    if (!validateForm()) {
      setToast({
        message: "Please fix the validation errors before saving.",
        type: "error",
        isVisible: true,
      });
      return;
    }

    setSaving(true);
    try {
      // Update main profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          location_preference: profileData.location_preference,
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update couple profile if user is a planner
      if (userType === "planner") {
        const { error: coupleError } = await supabase
          .from("couple_profiles")
          .upsert({
            user_id: user.id,
            partner_name: coupleProfileData.partner_name || null,
            partner_email: coupleProfileData.partner_email || null,
            updated_at: new Date().toISOString(),
          });

        if (coupleError) throw coupleError;
      }

      // Update original data to reflect changes
      setOriginalProfileData(profileData);
      if (userType === "planner") {
        setOriginalCoupleData(coupleProfileData);
      }

      setToast({
        message: "Profile saved successfully!",
        type: "success",
        isVisible: true,
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      setToast({
        message: "Error saving profile. Please try again.",
        type: "error",
        isVisible: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
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
    <ClientDashboardLayout>
      <div className="space-y-6 max-w-8xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-light text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-600">
              Manage your account information and preferences
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges()}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Profile Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    {profileData.avatar_url ? (
                      <div className="flex items-center gap-4">
                        <img
                          src={profileData.avatar_url}
                          alt="Profile picture"
                          className="w-16 h-16 object-cover rounded-full"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeAvatar}
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <Upload className="w-4 h-4" />
                          Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            disabled={avatarUploading}
                          />
                        </label>
                        {avatarUploading && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                            Uploading...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    value={profileData.full_name}
                    onChange={(e) => {
                      setProfileData((prev) => ({
                        ...prev,
                        full_name: e.target.value,
                      }));
                      // Clear validation error when user starts typing
                      if (validationErrors.full_name) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          full_name: undefined,
                        }));
                      }
                    }}
                    placeholder="Enter your full name"
                    className={
                      validationErrors.full_name ? "border-red-500" : ""
                    }
                  />
                  {validationErrors.full_name && (
                    <p className="text-sm text-red-600 mt-1">
                      {validationErrors.full_name}
                    </p>
                  )}
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    value={profileData.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Partner Information Card (Planners only) */}
            {userType === "planner" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Partner Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Partner's Full Name
                    </label>
                    <Input
                      value={coupleProfileData.partner_name}
                      onChange={(e) =>
                        setCoupleProfileData((prev) => ({
                          ...prev,
                          partner_name: e.target.value,
                        }))
                      }
                      placeholder="Enter your partner's name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Partner's Email
                    </label>
                    <Input
                      type="email"
                      value={coupleProfileData.partner_email}
                      onChange={(e) => {
                        setCoupleProfileData((prev) => ({
                          ...prev,
                          partner_email: e.target.value,
                        }));
                        // Clear validation error when user starts typing
                        if (validationErrors.partner_email) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            partner_email: undefined,
                          }));
                        }
                      }}
                      placeholder="partner@email.com"
                      className={
                        validationErrors.partner_email ? "border-red-500" : ""
                      }
                    />
                    {validationErrors.partner_email && (
                      <p className="text-sm text-red-600 mt-1">
                        {validationErrors.partner_email}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Location Preferences Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Preferences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Location
                  </label>
                  <Select
                    value={profileData.location_preference}
                    onValueChange={(value) =>
                      setProfileData((prev) => ({
                        ...prev,
                        location_preference: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preferred location" />
                    </SelectTrigger>
                    <SelectContent>
                      {cyprusLocations.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-2">
                    This helps us show you relevant vendors and events in your
                    area.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email Notifications
                    </label>
                    <p className="text-xs text-gray-500">
                      Receive email updates about your account and events
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.email_notifications}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        email_notifications: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Vendor Updates
                    </label>
                    <p className="text-xs text-gray-500">
                      Get notified when vendors respond to your inquiries
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.vendor_updates}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        vendor_updates: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>

                {userType === "planner" && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Event Reminders
                        </label>
                        <p className="text-xs text-gray-500">
                          Receive reminders about upcoming event deadlines
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.event_reminders}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            event_reminders: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Partner Notifications
                        </label>
                        <p className="text-xs text-gray-500">
                          Get notified about partner activity and collaboration
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.partner_notifications}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            partner_notifications: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Account Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p>
                    Account Type:{" "}
                    <span className="font-medium capitalize">{userType}</span>
                  </p>
                  <p>
                    Member since:{" "}
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-gray-500 mb-3">
                    Need to change your password or delete your account?
                  </p>
                  <Button variant="outline" size="sm">
                    Account Management
                  </Button>
                </div>
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
    </ClientDashboardLayout>
  );
}
