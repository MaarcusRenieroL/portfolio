FROM node:22-alpine

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* package-lock.json* yarn.lock* ./
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile --config.dangerouslyAllowAllBuilds=true; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else pnpm install --config.dangerouslyAllowAllBuilds=true; fi

COPY . .

ENV HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["sh", "-c", "pnpm install --config.dangerouslyAllowAllBuilds=true && pnpm dev --hostname 0.0.0.0"]
