import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useSharedAccess } from "@/hooks/useSharedAccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoader } from "@/components/ui/page-loader";
import { useState, useId } from "react";
import { Trash2, Plus, UserPlus, Key } from "lucide-react";
import { Eye, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) return <PageLoader />;
  if (!user) return <div className="p-8">Please log in to view settings.</div>;

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <div className="grid gap-8">
        <SharedAccessSection />

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Security
          </h2>
          <p className="text-muted-foreground mb-4">Manage your password and account security.</p>
          <Button asChild variant="outline">
            <Link to="/change-password">Change Password</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function SharedAccessSection() {
  const {
    accessGrants,
    receivedGrants,
    loading,
    loadingReceived,
    error,
    grantAccess,
    granting,
    revokeAccess,
  } = useSharedAccess();

  const [email, setEmail] = useState("");
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const grantEmailId = useId();

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await grantAccess({ email });
      setEmail("");
      setSuccessMessage(`Access granted to ${email}`);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setErrorMessage(err.message || "Failed to grant access");
      } else {
        setErrorMessage("Failed to grant access");
      }
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke access?")) return;
    setSuccessMessage("");
    setErrorMessage("");
    try {
      setRevokingId(id);
      await revokeAccess(id);
      setSuccessMessage("Access revoked successfully");
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setErrorMessage(err.message || "Failed to revoke access");
      } else {
        setErrorMessage("Failed to revoke access");
      }
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Shared With Me Section */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Shared With Me
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Profiles you have been granted read-only access to.
            </p>
          </div>
        </div>

        {loadingReceived ? (
          <PageLoader className="h-24" />
        ) : (
          <div className="space-y-4">
            {receivedGrants.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No profiles shared with you yet.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {receivedGrants.map((grant) => (
                  <div
                    key={grant.id}
                    className="border rounded-lg p-4 flex items-center justify-between bg-muted/20"
                  >
                    <div>
                      <p className="font-semibold">
                        {grant.granter?.firstName} {grant.granter?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{grant.granter?.email}</p>
                      <div className="mt-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ${
                            grant.status === "ACCEPTED"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {grant.status}
                        </span>
                      </div>
                    </div>
                    {grant.status === "ACCEPTED" && (
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/shared-access/view/$grantId" params={{ grantId: grant.id }}>
                          View
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Link>
                      </Button>
                    )}
                    {grant.status === "PENDING" && (
                      <span className="text-xs text-muted-foreground italic">
                        Check your email to accept
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grant Access Section */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Share My Profile
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Grant read-only access to your transactions and promises.
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleGrant} className="flex gap-4 mb-8 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor={grantEmailId}>Grant access to email</Label>
            <Input
              id={grantEmailId}
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" isLoading={granting}>
            <Plus className="w-4 h-4 mr-2" />
            Grant Access
          </Button>
        </form>

        {loading ? (
          <PageLoader className="h-32" />
        ) : error ? (
          <div className="text-destructive">Error loading viewers</div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
              Active Viewers ({accessGrants.filter((g) => g.status !== "REVOKED").length || 0})
            </h3>

            {accessGrants.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No access granted yet.</p>
            )}

            <div className="divide-y divide-border">
              {accessGrants.map((grant) => (
                <div key={grant.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{grant.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          grant.status === "ACCEPTED"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : grant.status === "REVOKED"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {grant.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Invited on {new Date(grant.createdAt as string).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {grant.status !== "REVOKED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRevoke(grant.id)}
                      isLoading={revokingId === grant.id}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Revoke</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
