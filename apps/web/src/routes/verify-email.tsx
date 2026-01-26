import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState, useId } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLoader } from "@/components/ui/page-loader";
import { CheckCircle2, XCircle } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

const verifyEmailSearchSchema = z.object({
  token: z.string().min(1),
});

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search) => verifyEmailSearchSchema.parse(search),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token } = useSearch({ from: "/verify-email" });
  const navigate = useNavigate();
  const { verifyEmail, resendVerificationEmail } = useAuth();

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [error, setError] = useState("");

  // Resend logic
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  const resendEmailId = useId();

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      try {
        await verifyEmail(token);
        if (mounted) {
          setStatus("success");
          setTimeout(() => {
            navigate({ to: "/" });
          }, 3000);
        }
      } catch (err) {
        if (mounted) {
          setStatus("error");
          if (err instanceof Error) {
            setError(err.message || "Failed to verify email. The link may have expired.");
          } else {
            setError("Failed to verify email. The link may have expired.");
          }
        }
      }
    };

    verify();

    return () => {
      mounted = false;
    };
  }, [token, verifyEmail, navigate]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResendStatus("loading");
    try {
      await resendVerificationEmail(resendEmail);
      setResendStatus("success");
      toast.success("Verification email sent! Please check your inbox.");
    } catch (err) {
      console.error(err);
      setResendStatus("error");
      toast.error("Failed to send email. Please try again.");
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 p-8 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-800 text-center">
        {status === "verifying" && (
          <div className="space-y-4 flex justify-center h-32 items-center">
            <BrandLoader size="lg" />
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Email Verified!</h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Your account has been successfully verified. Redirecting you to the dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Verification Failed
              </h2>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-4">
                Need a new verification link?
              </h3>

              {resendStatus === "success" ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-md text-sm flex items-center gap-2 text-left">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <p>Verification email sent! Please check your inbox (and spam folder).</p>
                </div>
              ) : (
                <form onSubmit={handleResend} className="space-y-4 text-left">
                  <div className="space-y-2">
                    <Label htmlFor={resendEmailId}>Email Address</Label>
                    <Input
                      id={resendEmailId}
                      type="email"
                      placeholder="ahmad.sulaiman@example.com"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                      className="bg-neutral-50 dark:bg-neutral-800"
                    />
                  </div>
                  <Button type="submit" className="w-full" isLoading={resendStatus === "loading"}>
                    Resend Verification Email
                  </Button>
                </form>
              )}
            </div>

            <div className="pt-2">
              <Button asChild variant="link" className="text-neutral-500">
                <a href="/login">Back to Login</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
