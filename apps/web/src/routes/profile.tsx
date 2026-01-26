import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoader } from "@/components/ui/page-loader";
import { useState, useEffect, useId } from "react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading } = useAuth();
  const { updateUser, updating } = useProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const phoneNumberId = useId();

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhoneNumber(user.phoneNumber || "");
    }
  }, [user]);

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <div className="p-8">Please log in to view your profile.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({
        firstName,
        lastName,
        phoneNumber,
      });
      // Optionally refetch user or update cache
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor={firstNameId}>First Name</Label>
              <Input
                id={firstNameId}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={lastNameId}>Last Name</Label>
              <Input
                id={lastNameId}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={emailId}>Email</Label>
            <Input
              id={emailId}
              value={user.email}
              disabled
              className="bg-muted text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={phoneNumberId}>Phone Number</Label>
            <Input
              id={phoneNumberId}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+234..."
            />
          </div>

          <div className="pt-4">
            <Button type="submit" isLoading={updating}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
