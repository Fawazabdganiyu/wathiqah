import { useMutation, useQuery } from "@apollo/client/react";
import { CREATE_TRANSACTION, GET_TRANSACTIONS } from "@/lib/apollo/queries/transactions";
import type { CreateTransactionInput, FilterTransactionInput } from "@/types/__generated__/graphql";

export function useTransactions(filter?: FilterTransactionInput) {
  const { data, loading, error, refetch } = useQuery(GET_TRANSACTIONS, {
    variables: { filter },
    fetchPolicy: "cache-and-network",
  });

  const [createTransactionMutation, { loading: creating }] = useMutation(CREATE_TRANSACTION, {
    onCompleted: () => refetch(),
  });

  const createTransaction = async (input: CreateTransactionInput) => {
    return createTransactionMutation({ variables: { input } });
  };

  return {
    transactions: data?.transactions.items || [],
    summary: data?.transactions.summary,
    loading,
    error,
    createTransaction,
    creating,
    refetch,
  };
}
