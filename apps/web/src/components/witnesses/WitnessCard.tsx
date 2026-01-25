import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
	type MyWitnessRequestsQuery,
	WitnessStatus,
} from "@/types/__generated__/graphql";
import { WitnessStatusBadge } from "./WitnessStatusBadge";

interface WitnessCardProps {
	request: MyWitnessRequestsQuery["myWitnessRequests"][0];
	onAcknowledge: (id: string) => void;
	onDecline: (id: string) => void;
	isLoading?: boolean;
}

export function WitnessCard({
	request,
	onAcknowledge,
	onDecline,
	isLoading,
}: WitnessCardProps) {
	const { transaction, status, invitedAt } = request;

	return (
		<div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
			<div className="flex flex-col md:flex-row justify-between gap-4">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<span className="font-semibold text-lg">
							{transaction.createdBy.name}
						</span>
						<span className="text-muted-foreground text-sm">
							requested your witness
						</span>
					</div>

					<div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
						<span className="text-muted-foreground">Amount:</span>
						<span className="font-medium">
							${transaction.amount?.toFixed(2)}
						</span>

						<span className="text-muted-foreground">Date:</span>
						<span>
							{format(new Date(transaction.date as string), "MMM d, yyyy")}
						</span>

						<span className="text-muted-foreground">Type:</span>
						<span className="capitalize">{transaction.type.toLowerCase()}</span>
					</div>

					{transaction.description && (
						<div className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded">
							{transaction.description}
						</div>
					)}
				</div>

				<div className="flex flex-col justify-center items-end gap-2 min-w-[140px]">
					{status === WitnessStatus.Pending ? (
						<>
							<Button
								onClick={() => onAcknowledge(request.id)}
								disabled={isLoading}
								className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
								size="sm"
							>
								Acknowledge
							</Button>
							<Button
								onClick={() => onDecline(request.id)}
								disabled={isLoading}
								variant="outline"
								className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
								size="sm"
							>
								Decline
							</Button>
						</>
					) : (
						<WitnessStatusBadge status={status} />
					)}
					<span className="text-xs text-muted-foreground">
						Invited {format(new Date(invitedAt as string), "MMM d")}
					</span>
				</div>
			</div>
		</div>
	);
}
