import { formatCurrency } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface BalanceIndicatorProps {
  amount: number;
  className?: string;
  withLabel?: boolean;
}

export function BalanceIndicator({ amount, className, withLabel = false }: BalanceIndicatorProps) {
  const isDebt = amount < 0;
  const isCredit = amount > 0;
  const isSettled = amount === 0;

  // Format currency with explicit sign for positive numbers
  // formatCurrency handles negative numbers with a minus sign automatically
  const formattedAmount = formatCurrency(Math.abs(amount));
  const signedAmount = isSettled
    ? formattedAmount
    : isDebt
      ? `-${formattedAmount}`
      : `+${formattedAmount}`;

  // User Requirements:
  // Debt (Red) = User owes money (Negative Balance)
  // Credit (Blue/Orange) = Contact owes user money (Positive Balance)
  // Neutral (Green) = Settled (Zero Balance)

  const styles = isDebt
    ? "text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
    : isCredit
      ? "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30"
      : "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30";

  const label = isSettled ? "Settled" : isDebt ? "You owe" : "Owes you";

  return (
    <Badge
      variant="outline"
      className={cn("font-mono font-medium whitespace-nowrap gap-2", styles, className)}
    >
      {withLabel && (
        <span className="text-[10px] uppercase tracking-wider opacity-80 font-sans">{label}</span>
      )}
      <span className="font-bold tracking-tight">{signedAmount}</span>
    </Badge>
  );
}
