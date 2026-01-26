import { useQuery } from "@apollo/client/react";
import { GET_TRANSACTION } from "@/lib/apollo/queries/transactions";

export function useTransaction(id: string) {
  const { data, loading, error } = useQuery(GET_TRANSACTION, {
    variables: { id },
  });

  return {
    transaction: data?.transaction,
    loading,
    error,
  };
}
