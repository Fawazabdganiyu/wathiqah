import { useMutation } from "@apollo/client/react";
import { UPDATE_USER_MUTATION } from "@/lib/apollo/queries/users";
import type { UpdateUserInput } from "@/types/__generated__/graphql";

export function useProfile() {
  const [updateUserMutation, { loading: updating }] = useMutation(UPDATE_USER_MUTATION);

  const updateUser = async (input: UpdateUserInput) => {
    const { data } = await updateUserMutation({
      variables: { input },
    });
    return data?.updateUser;
  };

  return {
    updateUser,
    updating,
  };
}
