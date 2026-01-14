#!/bin/bash
cd /home/kavia/workspace/code-generation/secure-notes-collaborative-platform-304926-304935/notes_backend_api
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

