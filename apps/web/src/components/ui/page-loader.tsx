import { Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-[50vh] w-full items-center justify-center", className)}>
      <div className="relative flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary/50" />
        <ShieldCheck className="absolute h-6 w-6 text-primary animate-pulse" strokeWidth={2.5} />
      </div>
    </div>
  );
}
