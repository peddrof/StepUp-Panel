"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { LogOut } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSection?: "settings" | "profile";
}

export function SettingsModal({ open, onOpenChange, defaultSection = "settings" }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<"settings" | "profile">(defaultSection);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (open) {
      setActiveSection(defaultSection);
    }
  }, [open, defaultSection]);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[600px] p-0 gap-0">
        <div className="flex h-full">
          <div className="w-48 bg-gray-50 border-r border-gray-200 p-4">
            <DialogHeader className="mb-6">
              <DialogTitle>Menu</DialogTitle>
            </DialogHeader>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveSection("settings")}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  activeSection === "settings"
                    ? "bg-gray-200 text-black font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Settings
              </button>
              <button
                onClick={() => setActiveSection("profile")}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  activeSection === "profile"
                    ? "bg-gray-200 text-black font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Profile
              </button>
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeSection === "settings" && (
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Settings</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Appearance</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="theme">Theme</Label>
                        <select
                          id="theme"
                          className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option>Light</option>
                          <option>Dark</option>
                          <option>System</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium mb-4">Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Email notifications</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Class updates</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Weekly reports</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium mb-4">Account</h3>
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

            {activeSection === "profile" && (
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Profile</h2>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-gray-300 text-gray-700 text-xl font-medium">
                        {user?.email ? getInitials(user.email) : "AD"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm">Change Photo</Button>
                    </div>
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
                        defaultValue={user?.email?.split("@")[0] || ""}
                        className="mt-1.5"
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

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          className="mt-1.5"
                        />
                      </div>
                      <Button>Update Password</Button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline">Save Changes</Button>
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
