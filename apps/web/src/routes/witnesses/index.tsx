import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMyWitnessRequests, useAcknowledgeWitness } from "@/hooks/useWitnesses";
import { PageLoader } from "@/components/ui/page-loader";
import { WitnessList } from "@/components/witnesses/WitnessList";
import { authGuard } from "@/utils/auth";

export const Route = createFileRoute("/witnesses/")({
  component: WitnessRequestsPage,
  beforeLoad: authGuard,
});

function WitnessRequestsPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  // Note: We're fetching all and filtering client-side for now to match the UI behavior
  // Ideally, we'd pass the status to the hook based on the tab
  const { requests, loading, error, refetch } = useMyWitnessRequests();

  const { acknowledge, loading: mutationLoading } = useAcknowledgeWitness(() => refetch());

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        Error loading requests: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Witness Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage transactions you've been asked to verify.
          </p>
        </div>

        <div className="flex space-x-2 bg-muted p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "pending"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "history"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            History
          </button>
        </div>
      </div>

      <WitnessList
        requests={requests}
        activeTab={activeTab}
        onAction={acknowledge}
        isLoading={mutationLoading}
      />
    </div>
  );
}
