#!/usr/bin/env bash


set -o errexit
set -o pipefail
set -o nounset


function log () {
    now="$(date --iso-8601=seconds --utc)"
    echo -e >&2 "${now} ${1}"
}

function info () {
    GREEN='32'
    RESET='0'
    log "\033[${GREEN}m[INFO] ${1}\033[${RESET}m"
}

function error () {
    RED='91'
    RESET='0'
    log "\033[${RED}m[ERROR] ${1}\033[${RESET}m"
}


set +o nounset
if [ ! -n "${1}" ]; then
    error "expected first argument to be a file, but no argument was passed"
    exit -1
fi
set -o nounset

cert_path="${1}"

if [ ! -f "${cert_path}" ]; then
    error "expected first argument to be a file, but file not found: ${cert_path}"
    exit -2
fi

info "inspecting certificate ${cert_path}"

openssl x509 \
    -in "${cert_path}" \
    -text \
    -noout
