import { gql, Observable } from "@apollo/client";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { print } from "graphql";

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshTokenInput: RefreshTokenInput!) {
    refreshToken(refreshTokenInput: $refreshTokenInput) {
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

const isClient = typeof window !== "undefined";

export const authLink = new SetContextLink(({ headers }, _) => {
  // Tokens are now handled via httpOnly cookies by the browser.
  // We don't need to manually set the Authorization header anymore.
  return {
    headers: {
      ...headers,
    },
  };
});

export const errorLink = (uri: string) =>
  new ErrorLink(({ error, operation, forward }) => {
    if (CombinedGraphQLErrors.is(error)) {
      for (const err of error.errors) {
        if (err.extensions?.code === "UNAUTHENTICATED") {
          // If unauthenticated, try to refresh.
          // The refreshToken is in a httpOnly cookie, so the browser will send it.
          return new Observable((observer) => {
            fetch(uri, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include", // Crucial for cookies
              body: JSON.stringify({
                query: print(REFRESH_TOKEN_MUTATION),
                variables: { refreshTokenInput: { refreshToken: "" } }, // Server will check cookie if empty
              }),
            })
              .then((res) => res.json())
              .then((res) => {
                const data = res.data?.refreshToken;
                if (data) {
                  // Server has already set new cookies via the response headers.
                  const subscriber = {
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer),
                  };

                  forward(operation).subscribe(subscriber);
                } else {
                  if (isClient) window.location.href = "/login";
                }
              })
              .catch((error) => {
                observer.error(error);
              });
          });
        }
      }
    }
  });
