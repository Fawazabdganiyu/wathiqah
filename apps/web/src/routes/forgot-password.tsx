import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { isAuthenticated } from "@/utils/auth";

export const Route = createFileRoute("/forgot-password")({
  beforeLoad: () => {
    if (isAuthenticated()) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const id = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await forgotPassword({ email });
      setIsSubmitted(true);
      toast.success("Instructions sent to your email");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || "Failed to process request");
      } else {
        toast.error("Failed to process request");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg shadow-lg border border-border text-center">
          <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
          <p className="text-muted-foreground">
            If an account exists for <strong>{email}</strong>, we've sent instructions to reset your
            password.
          </p>
          <Button
            asChild
            className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Link to="/login">Return to Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg shadow-lg border border-border">
        <div>
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sign In
          </Link>
          <h2 className="text-2xl font-bold text-foreground">Reset your password</h2>
          <p className="mt-2 text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor={`${id}-email`}>Email address</Label>
            <Input
              id={`${id}-email`}
              type="email"
              placeholder="ahmad.sulaiman@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            isLoading={isLoading}
          >
            Send Reset Instructions
          </Button>
        </form>
      </div>
    </div>
  );
}
