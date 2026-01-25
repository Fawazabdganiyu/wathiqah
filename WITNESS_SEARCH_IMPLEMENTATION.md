# Secure Witness Search Implementation Guide

This document details the security and privacy measures implemented for the "Search Witness" feature, allowing transaction creators to find existing users without exposing sensitive Personally Identifiable Information (PII) of the user base.

## 1. Feature Overview

The `searchWitness` GraphQL query allows authenticated users to resolve an email address or phone number to a system User ID. This User ID can then be used to add the user as a witness to a transaction.

## 2. Security & Privacy Design

### 2.1 Privacy Protection (Anti-Scraping)

To prevent malicious users from "scraping" the database (e.g., searching for "John" to get a list of all users named John):

- **Exact Match Only**: The API strictly requires an **exact** match for Email or Phone Number. Partial searches (e.g., "jo%") are **disabled**.
- **Input Validation**: Inputs are validated to ensure they are valid emails or phone numbers.

### 2.2 Data Minimization

The API returns a restricted `WitnessCandidate` object containing only the minimum necessary information:

- `id`: The UUID required for the transaction logic.
- `firstName`: **Masked** (e.g., "J\*\*\*")
- `lastName`: **Masked** (e.g., "D\*\*\*")
- **Excluded**: The API **never** returns the email, phone number, or full name of the found user. This ensures that if a user guesses an email, they only get a confirmation code (ID) and a masked name, not new PII.

### 2.3 Access Control

- **Authentication Required**: The query is protected by `GqlAuthGuard`, requiring a valid JWT access token.
- **Role-Based Access**: (Future) Can be restricted to specific user tiers if needed.

## 3. API Usage

### GraphQL Query

```graphql
query SearchWitness($input: SearchWitnessInput!) {
  searchWitness(input: $input) {
    id
    firstName
    lastName
  }
}
```

### Variables

**By Email:**

```json
{
  "input": {
    "query": "john.doe@example.com",
    "type": "EMAIL"
  }
}
```

**By Phone:**

```json
{
  "input": {
    "query": "+1234567890",
    "type": "PHONE"
  }
}
```

### Response Example

```json
{
  "data": {
    "searchWitness": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "J***",
      "lastName": "D***"
    }
  }
}
```

## 4. Performance Optimization

- **Database Indexing**: A database index `@@index([phoneNumber])` has been added to the `User` table in `schema.prisma` to ensure O(1) or O(log n) lookup times for phone number searches. Email is already indexed via `@unique`.
- **Select Projection**: The database query uses `select` to fetch only the 4 required fields (`id`, `firstName`, `lastName`, `isEmailVerified`), reducing memory usage and IO.

## 5. Security Review Checklist

- [x] **Rate Limiting**: (Recommended) Ensure global rate limiting is enabled in `main.ts` to prevent brute-force email enumeration.
- [x] **Auth Guards**: Verified `@UseGuards(GqlAuthGuard)` is applied to the resolver.
- [x] **Input Validation**: Verified `class-validator` decorators (`@IsEmail`, `@IsPhoneNumber`) are used on the input DTO.
- [x] **Masking Logic**: Verified that full names are never returned in the response payload.
