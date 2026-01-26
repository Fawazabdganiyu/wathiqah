import {
  Users,
  FileCheck,
  CalendarClock,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTransactions } from "@/hooks/useTransactions";
import { useContacts } from "@/hooks/useContacts";
import { useMyWitnessRequests } from "@/hooks/useWitnesses";
import { usePromises } from "@/hooks/usePromises";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/formatters";
import { format } from "date-fns";

export function Dashboard() {
  const { transactions, loading: loadingTx, summary } = useTransactions();
  const { contacts, loading: loadingContacts } = useContacts();
  const { requests: witnessRequests, loading: loadingWitnesses } = useMyWitnessRequests();
  const { promises, loading: loadingPromises } = usePromises();

  const loading = loadingTx || loadingContacts || loadingWitnesses || loadingPromises;

  // Calculate Stats
  const totalBalance = summary?.netBalance || 0;
  const activePromises = promises.filter((p) => p.status === "PENDING").length;
  const pendingWitnessRequests = witnessRequests.length;
  const totalContacts = contacts.length;

  const recentTransactions = transactions.slice(0, 5);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your financial activities and commitments.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/transactions/new">New Transaction</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Balance"
          value={formatCurrency(totalBalance)}
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
          description="Net balance across all contacts"
        />
        <StatsCard
          title="Active Promises"
          value={activePromises.toString()}
          icon={<CalendarClock className="h-4 w-4 text-muted-foreground" />}
          description="Pending commitments"
          link="/promises"
        />
        <StatsCard
          title="Witness Requests"
          value={pendingWitnessRequests.toString()}
          icon={<FileCheck className="h-4 w-4 text-muted-foreground" />}
          description="Awaiting your acknowledgement"
          link="/witnesses"
        />
        <StatsCard
          title="Total Contacts"
          value={totalContacts.toString()}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Active connections"
          link="/contacts"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Transactions */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent transactions found.
                </p>
              ) : (
                recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-background">
                      {tx.type === "GIVEN" ? (
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{tx.contact?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(tx.date as string), "MMM d, yyyy")} •{" "}
                        {tx.description || "No description"}
                      </p>
                    </div>
                    <div
                      className={`ml-auto font-medium ${
                        tx.type === "GIVEN" ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {tx.type === "GIVEN" ? "-" : "+"}
                      {formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Recent Promises */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Pending Promises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {promises
                .filter((p) => p.status === "PENDING")
                .slice(0, 5)
                .map((promise) => (
                  <div
                    key={promise.id}
                    className="flex items-start justify-between border-b last:border-0 pb-4 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium">To: {promise.promiseTo}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {promise.description}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {format(new Date(promise.dueDate as string), "MMM d")}
                    </div>
                  </div>
                ))}
              {promises.filter((p) => p.status === "PENDING").length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No pending promises.
                </p>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/promises">Manage Promises</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  description,
  link,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  link?: string;
}) {
  const content = (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  if (link) {
    return (
      <Link to={link} className="block transition-transform hover:scale-[1.02]">
        {content}
      </Link>
    );
  }

  return content;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="col-span-4 h-96" />
        <Skeleton className="col-span-3 h-96" />
      </div>
    </div>
  );
}
