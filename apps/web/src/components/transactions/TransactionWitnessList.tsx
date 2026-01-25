import type { WitnessStatus } from "@/types/__generated__/graphql";
import { format } from "date-fns";
import { User, Mail, Calendar, Users } from "lucide-react";
import { WitnessStatusBadge } from "../witnesses/WitnessStatusBadge";

interface Witness {
	id: string;
	status: WitnessStatus;
	invitedAt: string;
	acknowledgedAt?: string;
	user: {
		id: string;
		name: string;
		email: string;
	};
}

export function TransactionWitnessList({
	witnesses,
}: {
	witnesses: Witness[];
}) {
	if (witnesses.length === 0) {
		return (
			<div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
				<Users className="mx-auto h-12 w-12 text-muted mb-3" />
				<h3 className="text-sm font-medium text-foreground">
					No witnesses added
				</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					This transaction hasn't been shared with any witnesses yet.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="grid gap-3">
				{witnesses.map((witness) => (
					<div
						key={witness.id}
						className="group flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-all shadow-sm"
					>
						<div className="flex items-center gap-4">
							<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
								<User size={20} />
							</div>
							<div className="flex flex-col">
								<span className="font-medium text-foreground">
									{witness.user.name}
								</span>
								<div className="flex items-center gap-3 mt-0.5">
									<span className="text-xs text-muted-foreground flex items-center gap-1">
										<Mail size={12} /> {witness.user.email}
									</span>
									<span className="text-xs text-muted-foreground flex items-center gap-1">
										<Calendar size={12} /> Invited{" "}
										{format(new Date(witness.invitedAt), "MMM d, yyyy")}
									</span>
								</div>
							</div>
						</div>

						<div className="flex flex-col items-end gap-1.5">
							<WitnessStatusBadge status={witness.status} />
							{witness.acknowledgedAt && (
								<span className="text-[10px] text-muted-foreground">
									Actioned on{" "}
									{format(new Date(witness.acknowledgedAt), "MMM d")}
								</span>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
