#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset

# https://dev.to/ietxaniz/how-to-implement-https-in-local-networks-using-lets-encrypt-4eh

mkdir -p certbot/{config,logs}

LETS_ENCRYPT_BIN_DIR="$( realpath ./bin/lets-encrypt )"

CERTBOT_DOMAIN="${DOMAIN}"                                               \
PATH="${PATH}:${LETS_ENCRYPT_BIN_DIR}"                                   \
certbot                                                                  \
    certonly                                                             \
    --work-dir   .                                                       \
    --config-dir certbot/config/                                         \
    --logs-dir   certbot/config/                                         \
    --verbose                                                            \
    --force-renewal                                                      \
    --manual                                                             \
    --preferred-challenges dns                                           \
    --manual-auth-hook    "add-txt-record-in-cloudflare.sh    ${DOMAIN}" \
    --manual-cleanup-hook "remove-txt-record-in-cloudflare.sh ${DOMAIN}" \
    -d "${DOMAIN}"                                                       \
    --non-interactive                                                    \
    --agree-tos                                                          \
    --email me@inner-private.dtgoitia.dev
