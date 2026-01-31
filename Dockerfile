FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm --silent

COPY pnpm-lock.yaml ./
COPY package.json ./
COPY turbo.json ./
COPY pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

# Generate Prisma Client
WORKDIR /app/apps/api
RUN DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wathiqah?schema=public" pnpm db:generate

WORKDIR /app
RUN pnpm build --filter=api --output-logs=errors-only

# # Clean up dev dependencies to reduce image size
WORKDIR /app/apps/api
RUN CI=true pnpm prune --prod

# Use the Google-maintained distroless Node.js image for production
FROM gcr.io/distroless/nodejs20-debian11 AS runner

WORKDIR /app

# Copy the built NestJS API application from the builder stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 3000

ENV NODE_ENV production

# The entry point for distroless Node.js images is typically 'node'.
CMD [ "apps/api/dist/src/main.js" ]
