"use client";

import { useState } from "react";
import { useAuth } from "@/store/auth-context";
import { Button, Input } from "@/components/ui";
import { getInitials, formatDate } from "@/lib/utils";
import { PageLoader } from "@/components/ui/Loader";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");

  if (isLoading) return <PageLoader />;

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="text-text-secondary">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text-primary">Profile</h1>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
            {getInitials(user.name)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{user.name}</h2>
            <p className="text-sm text-text-secondary">{user.email}</p>
            <p className="text-xs text-text-muted">
              Member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="mt-8 border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">Account Details</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>

          {isEditing ? (
            <div className="mt-4 space-y-4">
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input label="Email" value={user.email} disabled helperText="Email cannot be changed" />
              <Button size="sm" onClick={() => setIsEditing(false)}>
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm text-text-muted">Name</p>
                <p className="text-text-primary">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Email</p>
                <p className="text-text-primary">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Verified</p>
                <p className={user.isVerified ? "text-success" : "text-error"}>
                  {user.isVerified ? "Yes" : "Not verified"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
