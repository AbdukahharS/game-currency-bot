FROM oven/bun:1
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY tsconfig.json biome.json ./
COPY src ./src

CMD ["bun", "src/index.ts"]
