export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
	[K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
	[SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
	T extends { [key: string]: unknown },
	K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
	| T
	| {
			[P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
	  };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
	ID: { input: string; output: string };
	String: { input: string; output: string };
	Boolean: { input: boolean; output: boolean };
	Int: { input: number; output: number };
	Float: { input: number; output: number };
	/** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
	DateTime: { input: unknown; output: unknown };
};

export enum AssetCategory {
	Funds = "FUNDS",
	Item = "ITEM",
}

export type AuthPayload = {
	__typename: "AuthPayload";
	accessToken: Scalars["String"]["output"];
	refreshToken: Scalars["String"]["output"];
	user: User;
};

export type CreateTransactionInput = {
	amount?: InputMaybe<Scalars["Float"]["input"]>;
	category: AssetCategory;
	contactId: Scalars["ID"]["input"];
	date: Scalars["DateTime"]["input"];
	description?: InputMaybe<Scalars["String"]["input"]>;
	itemName?: InputMaybe<Scalars["String"]["input"]>;
	quantity?: InputMaybe<Scalars["Int"]["input"]>;
	type: TransactionType;
};

export type LoginInput = {
	email: Scalars["String"]["input"];
	password: Scalars["String"]["input"];
};

export type Mutation = {
	__typename: "Mutation";
	createTransaction: Transaction;
	login: AuthPayload;
	refreshToken: AuthPayload;
	signup: AuthPayload;
};

export type MutationCreateTransactionArgs = {
	input: CreateTransactionInput;
};

export type MutationLoginArgs = {
	loginInput: LoginInput;
};

export type MutationRefreshTokenArgs = {
	refreshToken: Scalars["String"]["input"];
};

export type MutationSignupArgs = {
	signupInput: SignupInput;
};

export type Query = {
	__typename: "Query";
	me: User;
	transactions: Array<Transaction>;
	user: Maybe<User>;
};

export type QueryUserArgs = {
	id: Scalars["String"]["input"];
};

export type SignupInput = {
	email: Scalars["String"]["input"];
	name: Scalars["String"]["input"];
	password: Scalars["String"]["input"];
};

export type Transaction = {
	__typename: "Transaction";
	amount: Maybe<Scalars["Float"]["output"]>;
	category: AssetCategory;
	contactId: Scalars["String"]["output"];
	createdAt: Scalars["DateTime"]["output"];
	createdById: Scalars["String"]["output"];
	date: Scalars["DateTime"]["output"];
	description: Maybe<Scalars["String"]["output"]>;
	id: Scalars["ID"]["output"];
	itemName: Maybe<Scalars["String"]["output"]>;
	quantity: Scalars["Int"]["output"];
	type: TransactionType;
};

export enum TransactionType {
	Collected = "COLLECTED",
	Given = "GIVEN",
	Received = "RECEIVED",
}

export type User = {
	__typename: "User";
	createdAt: Scalars["DateTime"]["output"];
	email: Scalars["String"]["output"];
	id: Scalars["ID"]["output"];
	name: Scalars["String"]["output"];
	passwordHash: Maybe<Scalars["String"]["output"]>;
};

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
	me: { __typename: "User"; id: string; email: string; name: string };
};

export type LoginMutationVariables = Exact<{
	loginInput: LoginInput;
}>;

export type LoginMutation = {
	login: {
		__typename: "AuthPayload";
		accessToken: string;
		refreshToken: string;
		user: { __typename: "User"; id: string; email: string; name: string };
	};
};

export type SignupMutationVariables = Exact<{
	signupInput: SignupInput;
}>;

export type SignupMutation = {
	signup: {
		__typename: "AuthPayload";
		accessToken: string;
		refreshToken: string;
		user: { __typename: "User"; id: string; email: string; name: string };
	};
};
