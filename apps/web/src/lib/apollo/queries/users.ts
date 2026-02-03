import { gql, type TypedDocumentNode } from "@apollo/client";
import type {
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from "@/types/__generated__/graphql";

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
      preferredCurrency
    }
  }
`;
