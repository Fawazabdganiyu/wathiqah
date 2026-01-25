import { useQuery, useMutation } from "@apollo/client/react";
import { GET_CONTACTS, DELETE_CONTACT } from "@/lib/apollo/queries/contacts";

export function useContacts() {
	const { data, loading, error } = useQuery(GET_CONTACTS);

	const [deleteContactMutation] = useMutation(DELETE_CONTACT, {
		refetchQueries: [{ query: GET_CONTACTS }],
	});

	const deleteContact = async (id: string) => {
		await deleteContactMutation({ variables: { id } });
	};

	return {
		contacts: data?.contacts ?? [],
		loading,
		error,
		deleteContact,
	};
}
