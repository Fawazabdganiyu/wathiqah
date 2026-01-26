import { useMutation, useQuery } from "@apollo/client/react";
import {
  CREATE_PROMISE,
  DELETE_PROMISE,
  GET_PROMISES,
  UPDATE_PROMISE,
} from "@/lib/apollo/queries/promises";
import type { CreatePromiseInput, UpdatePromiseInput } from "@/types/__generated__/graphql";

export function usePromises() {
  const { data, loading, error, refetch } = useQuery(GET_PROMISES);

  const [createPromiseMutation, { loading: creating }] = useMutation(CREATE_PROMISE, {
    onCompleted: () => refetch(),
  });

  const [updatePromiseMutation, { loading: updating }] = useMutation(UPDATE_PROMISE, {
    onCompleted: () => refetch(),
  });

  const [deletePromiseMutation, { loading: deleting }] = useMutation(DELETE_PROMISE, {
    onCompleted: () => refetch(),
  });

  const createPromise = async (input: CreatePromiseInput) => {
    return createPromiseMutation({ variables: { input } });
  };

  const updatePromise = async (input: UpdatePromiseInput) => {
    return updatePromiseMutation({ variables: { input } });
  };

  const deletePromise = async (id: string) => {
    return deletePromiseMutation({ variables: { id } });
  };

  return {
    promises: data?.myPromises || [],
    loading,
    error,
    createPromise,
    creating,
    updatePromise,
    updating,
    deletePromise,
    deleting,
    refetch,
  };
}
