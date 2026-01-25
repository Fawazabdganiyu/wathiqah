import { useState, useId } from "react";
import { useMutation } from "@apollo/client/react";
import {
	ADD_WITNESS,
	GET_TRANSACTION,
} from "@/lib/apollo/queries/transactions";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddWitnessDialogProps {
	isOpen: boolean;
	onClose: () => void;
	transactionId: string;
}

export function AddWitnessDialog({
	isOpen,
	onClose,
	transactionId,
}: AddWitnessDialogProps) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [error, setError] = useState("");
	const nameId = useId();
	const emailId = useId();
	const phoneId = useId();

	const [addWitness, { loading }] = useMutation(ADD_WITNESS, {
		refetchQueries: [
			{ query: GET_TRANSACTION, variables: { id: transactionId } },
		],
		onCompleted: () => {
			onClose();
			setName("");
			setEmail("");
			setPhoneNumber("");
			setError("");
		},
		onError: (err) => setError(err.message),
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !email.trim()) {
			setError("Name and Email are required");
			return;
		}

		try {
			await addWitness({
				variables: {
					input: {
						transactionId,
						witnessInvites: [
							{
								name,
								email,
								phoneNumber: phoneNumber || null,
							},
						],
					},
				},
			});
		} catch (_err) {
			// Error handled in onError
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Invite Witness</DialogTitle>
					<DialogDescription>
						Enter the details of the person you want to invite as a witness.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="grid gap-4 py-4">
					{error && (
						<div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 p-2 rounded border border-red-200 dark:border-red-900">
							{error}
						</div>
					)}

					<div className="grid gap-2">
						<Label htmlFor={nameId}>
							Name <span className="text-red-500">*</span>
						</Label>
						<Input
							id={nameId}
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Jane Doe"
							required
						/>
						<p className="text-[0.8rem] text-muted-foreground">
							First name first, last name last.
						</p>
					</div>

					<div className="grid gap-2">
						<Label htmlFor={emailId}>
							Email <span className="text-red-500">*</span>
						</Label>
						<Input
							id={emailId}
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="jane@example.com"
							required
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor={phoneId}>Phone Number (Optional)</Label>
						<Input
							id={phoneId}
							type="tel"
							value={phoneNumber}
							onChange={(e) => setPhoneNumber(e.target.value)}
							placeholder="+1234567890"
						/>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={loading}
							className="bg-emerald-600 hover:bg-emerald-700 text-white"
						>
							{loading ? "Inviting..." : "Send Invitation"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
