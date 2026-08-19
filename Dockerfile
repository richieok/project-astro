# Pin Bun to a recent patched image (matching local Bun, whose bun.lock format it must read) instead of the floating `1-alpine` tag to reduce OS-level CVEs.
FROM oven/bun:1.3.14-alpine AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1.3.14-alpine AS production
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/package.json /app/bun.lock ./
RUN bun install --production --frozen-lockfile
ENV PORT=3000
EXPOSE 3000
CMD ["bun", "build/index.js"]
