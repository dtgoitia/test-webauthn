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

info "finding local IP"
local_ip="$( bin/find-my-ip-in-lan.sh )"
if [ -z "${local_ip}" ]; then
    error "failed to determine local IP"
    exit -1
fi
info "local IP: ${local_ip}"

