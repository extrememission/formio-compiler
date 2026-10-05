# Claude instructions

## Scratch files
- All scratch/temporary files (test scripts, intermediate output) go in `.scratch/` inside this repo. Create it if it doesn't exist.
- Never write to system temp, the session scratchpad, `/tmp`, or any path above or outside this repo.
- `.scratch/` ignores itself via its own `.gitignore` (containing `*`), so it never shows up in `git status`.
