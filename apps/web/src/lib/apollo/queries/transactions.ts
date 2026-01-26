import type {
  TransactionQuery,
  TransactionQueryVariables,
  TransactionsQuery,
  TransactionsQueryVariables,
  CreateTransactionMutation,
  CreateTransactionMutationVariables,
  AddWitnessMutation,
  AddWitnessMutationVariables,
} from "@/types/__generated__/graphql";
import { gql, type TypedDocumentNode } from "@apollo/client";

export const GET_TRANSACTION: TypedDocumentNode<TransactionQuery, TransactionQueryVariables> = gql`
  query Transaction($id: ID!) {
    transaction(id: $id) {
      id
      amount
      category
      type
      date
      description
      itemName
      quantity
      createdAt
      contact {
        id
        name
      }
      witnesses {
        id
        status
        invitedAt
        acknowledgedAt
        user {
          id
          name
          email
        }
      }
      history {
        id
        changeType
        previousState
        newState
        createdAt
        user {
          id
          name
          email
        }
      }
    }
  }
`;

export const GET_TRANSACTIONS: TypedDocumentNode<TransactionsQuery, TransactionsQueryVariables> =
  gql`
  query Transactions($filter: FilterTransactionInput) {
    transactions(filter: $filter) {
      items {
        id
        amount
        category
        type
        date
        description
        itemName
        quantity
        createdAt
        contact {
          id
          name
        }
        witnesses {
          id
          status
        }
      }
      summary {
        totalGiven
        totalReceived
        totalCollected
        netBalance
      }
    }
  }
`;

export const CREATE_TRANSACTION: TypedDocumentNode<
  CreateTransactionMutation,
  CreateTransactionMutationVariables
> = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      amount
      type
      description
      date
    }
  }
`;

export const ADD_WITNESS: TypedDocumentNode<AddWitnessMutation, AddWitnessMutationVariables> = gql`
  mutation AddWitness($input: AddWitnessInput!) {
    addWitness(input: $input) {
      id
      witnesses {
        id
        status
        invitedAt
        user {
          id
          name
          email
        }
      }
    }
  }
`;
