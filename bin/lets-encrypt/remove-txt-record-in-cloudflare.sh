#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset

function log () {
    GREEN='32'
    RESET='0'
    now="$(date --iso-8601=seconds --utc)"
    echo -e >&2 "${now} \033[${GREEN}m[INFO] ${1}\033[${RESET}m"
}


txt_record_id_file_path="${TXT_RECORD_ID_FILE_PATH}"
auth_api_key="${CLOUDFLARE_API_KEY}"

txt_record_id="$( cat "${txt_record_id_file_path}" )"


log "reading Zone ID from Cloudflare API..."
zone_id="$( \
    curl -X GET "https://api.cloudflare.com/client/v4/zones" \
        -H "Authorization: Bearer ${auth_api_key}" \
        -H "Content-Type: application/json" \
        --silent \
    | jq '.result[0].id' --raw-output
)"
log "done, zone_id='${zone_id}'"


log "deleting DNS record (id=${txt_record_id}) from Cloudflare API..."
response="$(
    curl -s -X DELETE "https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records/${txt_record_id}" \
        -H "Authorization: Bearer ${auth_api_key}" \
        -H "Content-Type: application/json" \
        --silent \
)"
success="$( echo -n "${response}" | jq '.success' --raw-output )"
if [[ "${success}" != 'true' ]]; then
    log "ERROR: failed to delete DNS record"
    echo -n "${response}" | jq
fi
log "done"

rm "${txt_record_id_file_path}"

wait_secs=5
log "waiting ${wait_secs}s..."

sleep "${wait_secs}"
log "wait completed"
