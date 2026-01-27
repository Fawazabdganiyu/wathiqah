import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/hooks/use-auth";

import { authGuard } from "@/utils/auth";

export const Route = createFileRoute("/change-password")({
  component: ChangePasswordPage,
  beforeLoad: (ctx) => authGuard({ location: ctx.location }),
});

function ChangePasswordPage() {
  const { changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const id = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await changePassword({ currentPassword, newPassword });
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || "Failed to update password");
      } else {
        toast.error("Failed to update password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl py-12">
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-full text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Change Password</h1>
              <p className="text-sm text-muted-foreground">
                Update your account password to keep your account secure.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
            <div className="space-y-2">
              <Label htmlFor={`${id}-current-password`}>Current Password</Label>
              <PasswordInput
                id={`${id}-current-password`}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${id}-new-password`}>New Password</Label>
              <PasswordInput
                id={`${id}-new-password`}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">Must be at least 8 characters long.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${id}-confirm-password`}>Confirm New Password</Label>
              <PasswordInput
                id={`${id}-confirm-password`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-background"
              />
            </div>

            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              isLoading={isLoading}
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
