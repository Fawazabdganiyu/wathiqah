import { useMutation, useQuery } from "@apollo/client/react";
import { DELETE_CONTACT, GET_CONTACTS } from "@/lib/apollo/queries/contacts";

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
