# ================ #
#    Base Stage    #
# ================ #

FROM oven/bun:latest AS base

WORKDIR /usr/src/app

ENV BUN_INSTALL=/usr/local/bun
ENV PATH=$BUN_INSTALL/bin:$PATH
ENV CI=true
ENV LOG_LEVEL=info

RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*

COPY --chown=bun:bun bun.lock .
COPY --chown=bun:bun package.json .
COPY --chown=bun:bun src/.env src/.env

ENTRYPOINT ["dumb-init", "--"]

# ================ #
#   Builder Stage  #
# ================ #

FROM base AS builder

ENV NODE_ENV="development"

COPY --chown=bun:bun tsconfig.json .
COPY --chown=bun:bun src/ src/

RUN bun install --frozen-lockfile
RUN bun run build

# ================ #
#   Runner Stage   #
# ================ #

FROM base AS runner

ENV NODE_ENV="production"

WORKDIR /usr/src/app

COPY --chown=bun:bun --from=builder /usr/src/app/dist dist
COPY --chown=bun:bun --from=builder /usr/src/app/node_modules node_modules

RUN chown bun:bun /usr/src/app/

USER bun

CMD ["bun", "run", "dist/index.js"]