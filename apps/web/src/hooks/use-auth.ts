import type {
	LoginInput,
	LoginMutation,
	LoginMutationVariables,
	MeQuery,
	MeQueryVariables,
	SignupInput,
	SignupMutation,
	SignupMutationVariables,
	AcceptInvitationInput,
	AcceptInvitationMutation,
	AcceptInvitationMutationVariables,
} from "@/types/__generated__/graphql";
import { gql, type TypedDocumentNode } from "@apollo/client";
import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { useNavigate } from "@tanstack/react-router";

/**
 * --- GraphQL Operations ---
 */

const ME_QUERY: TypedDocumentNode<MeQuery, MeQueryVariables> = gql`
  query Me {
    me {
      id
      email
      name
    }
  }
`;

const LOGIN_MUTATION: TypedDocumentNode<LoginMutation, LoginMutationVariables> =
	gql`
    mutation Login($loginInput: LoginInput!) {
      login(loginInput: $loginInput) {
        accessToken
        refreshToken
        user {
          id
          email
          name
        }
      }
    }
  `;

const SIGNUP_MUTATION: TypedDocumentNode<
	SignupMutation,
	SignupMutationVariables
> = gql`
  mutation Signup($signupInput: SignupInput!) {
    signup(signupInput: $signupInput) {
      accessToken
      refreshToken
      user {
        id
        email
        name
      }
    }
  }
`;

const ACCEPT_INVITATION_MUTATION: TypedDocumentNode<
	AcceptInvitationMutation,
	AcceptInvitationMutationVariables
> = gql`
  mutation AcceptInvitation($acceptInvitationInput: AcceptInvitationInput!) {
    acceptInvitation(acceptInvitationInput: $acceptInvitationInput) {
      accessToken
      refreshToken
      user {
        id
        email
        name
      }
    }
  }
`;

// --- Hook ---

export function useAuth() {
	const client = useApolloClient();
	const navigate = useNavigate();

	const { data, loading, error } = useQuery(ME_QUERY, {
		errorPolicy: "all",
	});

	const [loginMutation] = useMutation(LOGIN_MUTATION);
	const [signupMutation] = useMutation(SIGNUP_MUTATION);
	const [acceptInvitationMutation] = useMutation(ACCEPT_INVITATION_MUTATION);

	const login = async (input: LoginInput) => {
		const { data } = await loginMutation({
			variables: { loginInput: input },
		});

		if (data?.login) {
			localStorage.setItem("accessToken", data.login.accessToken);
			localStorage.setItem("refreshToken", data.login.refreshToken);
			await client.resetStore();
		}
		return data?.login;
	};

	const signup = async (input: SignupInput) => {
		const { data } = await signupMutation({
			variables: { signupInput: input },
		});

		if (data?.signup) {
			localStorage.setItem("accessToken", data.signup.accessToken);
			localStorage.setItem("refreshToken", data.signup.refreshToken);
			await client.resetStore();
		}
		return data?.signup;
	};

	const logout = async () => {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		await client.resetStore();
		navigate({ to: "/" });
	};

	const acceptInvitation = async (input: AcceptInvitationInput) => {
		const { data } = await acceptInvitationMutation({
			variables: { acceptInvitationInput: input },
		});

		if (data?.acceptInvitation) {
			localStorage.setItem("accessToken", data.acceptInvitation.accessToken);
			localStorage.setItem("refreshToken", data.acceptInvitation.refreshToken);
			await client.resetStore();
		}
		return data?.acceptInvitation;
	};

	return {
		user: data?.me,
		loading,
		error,
		login,
		signup,
		logout,
		acceptInvitation,
	};
}
