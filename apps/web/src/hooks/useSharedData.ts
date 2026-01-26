import { useQuery } from "@apollo/client/react";
import { SHARED_DATA_QUERY } from "@/lib/apollo/queries/shared-access";

export function useSharedData(grantId: string) {
  const { data, loading, error } = useQuery(SHARED_DATA_QUERY, {
    variables: { grantId },
    skip: !grantId,
  });

  return {
    data: data?.sharedData,
    loading,
    error,
  };
}
