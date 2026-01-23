import type {
	LoginInput,
	LoginMutation,
	LoginMutationVariables,
	MeQuery,
	MeQueryVariables,
	SignupInput,
	SignupMutation,
	SignupMutationVariables,
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

// --- Hook ---

export function useAuth() {
	const client = useApolloClient();
	const navigate = useNavigate();

	const { data, loading, error } = useQuery(ME_QUERY, {
		errorPolicy: "all",
	});

	const [loginMutation] = useMutation(LOGIN_MUTATION);
	const [signupMutation] = useMutation(SIGNUP_MUTATION);

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

	return {
		user: data?.me,
		loading,
		error,
		login,
		signup,
		logout,
	};
}
