---
name: dev
description: Execute a small change (styles, refactor, fix, etc.), ask for confirmation, then open a PR
disable-model-invocation: true
---

# /dev — Do, Confirm, Ship

## Step 1 — Understand the Task

The user's change description is provided as the argument to this skill. If no argument was given, ask the user what change they want made before proceeding.

## Step 2 — Execute the Change

Implement the described change. Keep the scope tight — only touch what is necessary to complete the described change.

## Step 3 — Confirm with the User

Once the change is done, use the `AskUserQuestion` tool to ask:

> "Changes are ready. Does everything look good to open a PR?"

Wait for the user's response before proceeding.

- If the user says **yes / looks good / ship it** (or similar): proceed to Step 4.
- If the user requests adjustments: apply them and ask again.
- If the user says **no / cancel**: stop and do not open a PR.

## Step 4 — Open the PR

Invoke the `/pr` skill to create the pull request.
