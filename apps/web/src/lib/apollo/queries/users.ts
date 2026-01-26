import type {
  UpdateUserMutationVariables,
  UpdateUserMutation,
} from "@/types/__generated__/graphql";
import { gql, type TypedDocumentNode } from "@apollo/client";

export const UPDATE_USER_MUTATION: TypedDocumentNode<
  UpdateUserMutation,
  UpdateUserMutationVariables
> = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(updateUserInput: $input) {
      id
      firstName
      lastName
      phoneNumber
      email
    }
  }
`;
