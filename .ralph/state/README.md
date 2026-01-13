# Ralph Loop State

This directory stores checkpoint state for running loops.

Files here are created automatically by `.ralph/scripts/run_loop.sh`.

## Contents

- `[loop-name].state` — Iteration count and status for each loop

## Purpose

State files allow loops to:
- Resume after interruption
- Track how many iterations have run
- Know when to stop

## Cleanup

Safe to delete all `.state` files to reset loop progress.
