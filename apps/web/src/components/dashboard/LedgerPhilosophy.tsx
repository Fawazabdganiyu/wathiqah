import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, Gift, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LedgerPhilosophy() {
  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-background border-primary/20 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          The Wathȋqah Ledger Philosophy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Wathȋqah is built on{" "}
          <span className="font-semibold text-foreground">Accountability First</span>. Our color
          system helps you instantly identify your financial standing in every relationship.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-2 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                Asset (Given)
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Resources you've lent out. This is your{" "}
                <span className="text-blue-600/80 font-medium">Credit</span>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2 rounded-xl bg-red-500/5 border border-red-500/10">
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-600">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                Liability (Received)
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Resources you've obtained. This is your{" "}
                <span className="text-red-600/80 font-medium">Debt</span>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                Settlement (Returned)
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Repayments that clear your standing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2 rounded-xl bg-purple-500/5 border border-purple-500/10">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
              <Gift className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                Goodwill (Gift)
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Contributions that don't affect net debt.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
