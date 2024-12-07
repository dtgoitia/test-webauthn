#!/usr/bin/env bash

set -o errexit
set -o pipefail

ip addr              \
| rg inet            \
| rg wlp             \
| awk '{ print $2 }' \
| cut -d '/' -f 1
