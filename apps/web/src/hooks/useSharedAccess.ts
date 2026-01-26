import { useMutation, useQuery } from "@apollo/client/react";
import {
  ACCEPT_ACCESS_MUTATION,
  GRANT_ACCESS_MUTATION,
  MY_ACCESS_GRANTS_QUERY,
  RECEIVED_ACCESS_GRANTS_QUERY,
  REVOKE_ACCESS_MUTATION,
} from "@/lib/apollo/queries/shared-access";
import type { GrantAccessInput } from "@/types/__generated__/graphql";

export function useSharedAccess() {
  const { data, loading, error, refetch } = useQuery(MY_ACCESS_GRANTS_QUERY);

  const {
    data: receivedData,
    loading: loadingReceived,
    refetch: refetchReceived,
  } = useQuery(RECEIVED_ACCESS_GRANTS_QUERY);

  const [grantAccessMutation, { loading: granting }] = useMutation(GRANT_ACCESS_MUTATION);
  const [revokeAccessMutation, { loading: revoking }] = useMutation(REVOKE_ACCESS_MUTATION);
  const [acceptAccessMutation, { loading: accepting }] = useMutation(ACCEPT_ACCESS_MUTATION);

  const grantAccess = async (input: GrantAccessInput) => {
    const { data } = await grantAccessMutation({
      variables: { input },
    });
    refetch();
    return data?.grantAccess;
  };

  const revokeAccess = async (id: string) => {
    const { data } = await revokeAccessMutation({
      variables: { id },
    });
    refetch();
    return data?.revokeAccess;
  };

  const acceptAccess = async (token: string) => {
    const { data } = await acceptAccessMutation({
      variables: { token },
    });
    refetchReceived();
    return data?.acceptAccess;
  };

  return {
    accessGrants: data?.myAccessGrants || [],
    receivedGrants: receivedData?.receivedAccessGrants || [],
    loading,
    loadingReceived,
    error,
    refetch,
    refetchReceived,
    grantAccess,
    granting,
    revokeAccess,
    revoking,
    acceptAccess,
    accepting,
  };
}
