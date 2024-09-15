# Use an official Node.js runtime as a parent image
FROM oven/bun:1 AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json ./
COPY bunfig.toml ./

# Install app dependencies
RUN bun install

COPY ./ ./

RUN bun build src/start-server.ts --outdir ./out --target node

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/out/start-server.js /app/start-server.mjs
ENTRYPOINT [ "node" ]
# Define the command to run your app
CMD ["start-server.mjs"]