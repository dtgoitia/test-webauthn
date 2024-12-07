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


domain="${DOMAIN}"
auth_api_key="${CLOUDFLARE_API_KEY}"
txt_record_id_file_path="${TXT_RECORD_ID_FILE_PATH}"
certbot_validation_string="${CERTBOT_VALIDATION}"


log "reading Zone ID from Cloudflare API..."
zone_id="$( \
    curl -X GET "https://api.cloudflare.com/client/v4/zones" \
        -H "Authorization: Bearer ${auth_api_key}" \
        -H "Content-Type: application/json" \
        --silent \
    | jq '.result[0].id' --raw-output
)"
log "done, zone_id='${zone_id}'"


log "creating a TXT record in CloudFlare with the cerbot validation string ('${certbot_validation_string}') as content"

name="_acme-challenge.${domain}"
content="\\\"${certbot_validation_string}\\\"" #  must be a quoted string (on top of the JSON quotes)
ttl_secs=60
txt_record_id="$( \
    curl -X POST "https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records" \
        -H "Authorization: Bearer ${auth_api_key}" \
        -H "Content-Type: application/json" \
        --data '{"type":"TXT","name":"'"${name}"'","content":"'"${content}"'","ttl":'"${ttl_secs}"'}' \
        --silent \
    | jq '.result.id' --raw-output \
)"

log "TXT record created (id=${txt_record_id})"
log "storing TXT record ID to ${txt_record_id_file_path}"
echo -n "${txt_record_id}" > "${txt_record_id_file_path}"

wait_secs=60
log "waiting ${wait_secs}s..."

sleep "${wait_secs}"
log "wait completed"
