#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

bucket="${GARAGE_DEFAULT_BUCKET:-avatars}"

for _ in $(seq 1 30); do
	if docker compose exec -T garage /garage bucket info "$bucket" >/dev/null 2>&1; then
		exec docker compose exec -T garage /garage bucket website --allow "$bucket"
	fi
	sleep 1
done

echo "garage: bucket '$bucket' not ready" >&2
exit 1
