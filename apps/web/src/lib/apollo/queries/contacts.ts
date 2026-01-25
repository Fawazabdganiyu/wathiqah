import type {
	CreateContactMutation,
	CreateContactMutationVariables,
	DeleteContactMutation,
	DeleteContactMutationVariables,
	GetContactsQuery,
	GetContactsQueryVariables,
	UpdateContactMutation,
	UpdateContactMutationVariables,
} from "@/types/__generated__/graphql";
import { gql, type TypedDocumentNode } from "@apollo/client";

export const GET_CONTACTS: TypedDocumentNode<
	GetContactsQuery,
	GetContactsQueryVariables
> = gql`
  query GetContacts {
    contacts {
      id
      name
      email
      phoneNumber
      balance
      createdAt
    }
  }
`;

export const CREATE_CONTACT: TypedDocumentNode<
	CreateContactMutation,
	CreateContactMutationVariables
> = gql`
  mutation CreateContact($createContactInput: CreateContactInput!) {
    createContact(createContactInput: $createContactInput) {
      id
      name
      email
      phoneNumber
      balance
    }
  }
`;

export const UPDATE_CONTACT: TypedDocumentNode<
	UpdateContactMutation,
	UpdateContactMutationVariables
> = gql`
  mutation UpdateContact($updateContactInput: UpdateContactInput!) {
    updateContact(updateContactInput: $updateContactInput) {
      id
      name
      email
      phoneNumber
    }
  }
`;

export const DELETE_CONTACT: TypedDocumentNode<
	DeleteContactMutation,
	DeleteContactMutationVariables
> = gql`
  mutation DeleteContact($id: ID!) {
    removeContact(id: $id) {
      id
    }
  }
`;
