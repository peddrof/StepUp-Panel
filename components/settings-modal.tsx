"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { LogOut, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSection?: "settings" | "profile";
}

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
}

export function SettingsModal({ open, onOpenChange, defaultSection = "settings" }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<"settings" | "profile">(defaultSection);
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || user.email?.split("@")[0] || "");
      } else {
        const defaultName = user.email?.split("@")[0] || "";
        setDisplayName(defaultName);

        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email!,
          display_name: defaultName,
        });

        setProfile({ display_name: defaultName, avatar_url: null });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    if (open) {
      setActiveSection(defaultSection);
      loadProfile();
    }
  }, [open, defaultSection, loadProfile]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 2MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, avatar_url: publicUrl } : null);

      toast({
        title: "Photo updated",
        description: "Your profile photo has been updated successfully",
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, display_name: displayName } : null);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] md:h-[600px] p-0 gap-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-48 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 p-4 md:rounded-tl-lg">
            <DialogHeader className="mb-4 md:mb-6">
              <DialogTitle className="text-lg">Menu</DialogTitle>
            </DialogHeader>
            <nav className="flex md:flex-col gap-1">
              
              <button
                onClick={() => setActiveSection("profile")}
                className={`flex-1 md:w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  activeSection === "profile"
                    ? "bg-gray-200 text-black font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveSection("settings")}
                className={`flex-1 md:w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  activeSection === "settings"
                    ? "bg-gray-200 text-black font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Settings
              </button>
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto">

            {activeSection === "profile" && (
              <div className="p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-semibold mb-6">Profile</h2>

                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Avatar className="h-20 w-20">
                      {profile?.avatar_url && (
                        <AvatarImage src={profile.avatar_url} alt="Profile" />
                      )}
                      <AvatarFallback className="bg-gray-300 text-gray-700 text-xl font-medium">
                        {user?.email ? getInitials(user.email) : "AD"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePhotoClick}
                        disabled={uploading}
                        className="gap-2"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Change Photo
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-500">
                        JPG, PNG or GIF (Max 2MB)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="mt-1.5"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="mt-1.5"
                        placeholder="Enter your display name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        type="text"
                        value="Administrator"
                        disabled
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {activeSection === "settings" && (
              <div className="p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-semibold mb-6">Settings</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-base md:text-lg font-medium mb-4">Account</h3>
                    <Button
                      variant="outline"
                      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={signOut}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
