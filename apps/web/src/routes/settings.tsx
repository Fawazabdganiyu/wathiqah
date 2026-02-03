import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, ExternalLink, Eye, Key, Plus, Trash2, UserPlus } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLoader, PageLoader } from "@/components/ui/page-loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/useProfile";
import { useSharedAccess } from "@/hooks/useSharedAccess";
import { authGuard } from "@/utils/auth";

const SUPPORTED_CURRENCIES = [
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
];

export const Route = createFileRoute("/settings")({
  beforeLoad: (ctx) => authGuard({ location: ctx.location }),
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
        <PreferencesSection />
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

function PreferencesSection() {
  const { user } = useAuth();
  const { updateUser, updating } = useProfile();
  const [preferredCurrency, setPreferredCurrency] = useState("NGN");
  const currencyId = useId();

  useEffect(() => {
    if (user?.preferredCurrency) {
      setPreferredCurrency(user.preferredCurrency);
    }
  }, [user?.preferredCurrency]);

  const handleUpdateCurrency = async (currency: string) => {
    try {
      setPreferredCurrency(currency);
      await updateUser({
        preferredCurrency: currency,
      });
      toast.success("Preferred currency updated");
    } catch (error) {
      console.error("Error updating currency:", error);
      toast.error("Failed to update currency");
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Coins className="w-5 h-5" />
        Preferences
      </h2>
      <p className="text-muted-foreground mb-6">
        Customize how the application behaves for your account.
      </p>

      <div className="max-w-md space-y-4">
        <div className="space-y-2">
          <Label htmlFor={currencyId}>Preferred Currency</Label>
          <div className="relative">
            <Coins className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
            <Select
              value={preferredCurrency}
              onValueChange={handleUpdateCurrency}
              disabled={updating}
            >
              <SelectTrigger id={currencyId} className="w-full pl-9">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <span className="flex items-center gap-2">
                      <span className="font-mono font-medium">{currency.symbol}</span>
                      <span>
                        {currency.name} ({currency.code})
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            This currency will be used for your total balance calculation and dashboard overview.
          </p>
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

  const grantEmailId = useId();

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await grantAccess({ email });
      setEmail("");
      toast.success(`Access granted to ${email}`);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        toast.error(err.message || "Failed to grant access");
      } else {
        toast.error("Failed to grant access");
      }
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke access?")) return;
    try {
      setRevokingId(id);
      await revokeAccess(id);
      toast.success("Access revoked successfully");
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        toast.error(err.message || "Failed to revoke access");
      } else {
        toast.error("Failed to revoke access");
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
          <div className="h-24 flex items-center justify-center">
            <BrandLoader size="md" />
          </div>
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

        <form onSubmit={handleGrant} className="flex gap-4 mb-8 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor={grantEmailId}>Grant access to email</Label>
            <Input
              id={grantEmailId}
              type="email"
              placeholder="ahmad.sulaiman@example.com"
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
          <div className="h-32 flex items-center justify-center">
            <BrandLoader size="lg" />
          </div>
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
