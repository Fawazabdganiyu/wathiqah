import type {
  CreatePromiseMutation,
  CreatePromiseMutationVariables,
  MyPromisesQuery,
  MyPromisesQueryVariables,
  RemovePromiseMutation,
  RemovePromiseMutationVariables,
  UpdatePromiseMutation,
  UpdatePromiseMutationVariables,
} from "@/types/__generated__/graphql";
import { gql, type TypedDocumentNode } from "@apollo/client";

export const GET_PROMISES: TypedDocumentNode<MyPromisesQuery, MyPromisesQueryVariables> = gql`
  query MyPromises {
    myPromises {
      id
      description
      promiseTo
      dueDate
      priority
      status
      category
      notes
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_PROMISE: TypedDocumentNode<
  CreatePromiseMutation,
  CreatePromiseMutationVariables
> = gql`
  mutation CreatePromise($input: CreatePromiseInput!) {
    createPromise(createPromiseInput: $input) {
      id
      description
      promiseTo
      dueDate
      priority
      status
    }
  }
`;

export const UPDATE_PROMISE: TypedDocumentNode<
  UpdatePromiseMutation,
  UpdatePromiseMutationVariables
> = gql`
  mutation UpdatePromise($input: UpdatePromiseInput!) {
    updatePromise(updatePromiseInput: $input) {
      id
      description
      priority
      status
    }
  }
`;

export const DELETE_PROMISE: TypedDocumentNode<
  RemovePromiseMutation,
  RemovePromiseMutationVariables
> = gql`
  mutation RemovePromise($id: String!) {
    removePromise(id: $id) {
      id
    }
  }
`;
