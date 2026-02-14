#!/usr/bin/env bash
# Waits for Vercel preview deployments and outputs BASE_URL_* for each project.
# Requires: VERCEL_TOKEN, GIT_REF, and VERCEL_PROJECT_ID_* for each app.
# Optional: VERCEL_TEAM_ID (for team projects)
#
# Usage: source this script or run with eval to export vars, e.g.:
#   . .github/scripts/wait-for-vercel-preview-urls.sh
#   # or from workflow:
#   - run: . ./.github/scripts/wait-for-vercel-preview-urls.sh

set -euo pipefail

VERCEL_TOKEN="${VERCEL_TOKEN:?VERCEL_TOKEN required}"
GIT_REF="${GIT_REF:?GIT_REF required (branch name)}"
MAX_WAIT="${MAX_WAIT:-300}"  # seconds, default 5 min
POLL_INTERVAL="${POLL_INTERVAL:-10}"  # seconds

API_BASE="https://api.vercel.com/v6"
TEAM_PARAM=""
[[ -n "${VERCEL_TEAM_ID:-}" ]] && TEAM_PARAM="teamId=${VERCEL_TEAM_ID}"

fetch_deployment_url() {
  local project_id="$1"
  local api_url="${API_BASE}/deployments?projectId=${project_id}&target=preview&branch=${GIT_REF}"
  [[ -n "$TEAM_PARAM" ]] && api_url="${api_url}&${TEAM_PARAM}"
  curl -sS -H "Authorization: Bearer ${VERCEL_TOKEN}" "$api_url" | python3 -c "
import json, sys
d = json.load(sys.stdin)
deployments = d.get('deployments', [])
if deployments:
    first = deployments[0]
    print(f\"{first.get('url', '')} {first.get('state', '')}\")
"
}

wait_for_project() {
  local project_id="$1"
  local project_name="$2"
  local waited=0
  local result

  echo "Waiting for ${project_name} preview (projectId=${project_id})..."
  while [[ $waited -lt $MAX_WAIT ]]; do
    result=$(fetch_deployment_url "$project_id" 2>/dev/null || true)
    if [[ -n "$result" ]]; then
      local deploy_url state
      deploy_url=$(echo "$result" | cut -d' ' -f1)
      state=$(echo "$result" | cut -d' ' -f2)
      if [[ "$state" == "READY" && -n "$deploy_url" ]]; then
        echo "https://${deploy_url}"
        return 0
      elif [[ "$state" == "ERROR" || "$state" == "CANCELED" ]]; then
        echo "Deployment failed (state=$state) for ${project_name}" >&2
        return 1
      fi
    fi
    sleep "$POLL_INTERVAL"
    waited=$((waited + POLL_INTERVAL))
  done
  echo "Timeout waiting for ${project_name} preview" >&2
  return 1
}

# Export BASE_URL_* for each configured project (skip on failure; Playwright falls back to webServer)
if [[ -n "${VERCEL_PROJECT_ID_LANDING_PAGE:-}" ]]; then
  url=$(wait_for_project "$VERCEL_PROJECT_ID_LANDING_PAGE" "landing-page") && echo "BASE_URL_LANDING_PAGE=${url}" >> "$GITHUB_ENV" || true
fi
if [[ -n "${VERCEL_PROJECT_ID_JOE_BOT:-}" ]]; then
  url=$(wait_for_project "$VERCEL_PROJECT_ID_JOE_BOT" "joe-bot") && echo "BASE_URL_JOE_BOT=${url}" >> "$GITHUB_ENV" || true
fi
if [[ -n "${VERCEL_PROJECT_ID_TODO_APP:-}" ]]; then
  url=$(wait_for_project "$VERCEL_PROJECT_ID_TODO_APP" "todo-app") && echo "BASE_URL_TODO_APP=${url}" >> "$GITHUB_ENV" || true
fi
