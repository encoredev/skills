---
name: encore-install
description: Install the Encore CLI, check whether it's installed, put it on the PATH, update it, and check what local development needs (Docker, plus Node.js for Encore.ts). The same steps work for Encore.ts and Encore.go.
when_to_use: >-
  The `encore` command isn't installed or isn't found, the user wants to install, set up, update, or upgrade the Encore CLI, or a task needs the CLI before any other Encore step (creating, running, testing, or deploying an app). Also use when `encore run` or `encore test` fails because Docker isn't installed or isn't running. Trigger phrases: "install Encore", "set up Encore", "encore: command not found", "brew install encoredev/tap/encore", "install.sh", "update Encore", "upgrade the Encore CLI", "encore version update", "docker daemon is not running".
---

# Installing the Encore CLI

## Instructions

Do the steps in order.

### 1. Check whether it's installed

```bash
encore version
```

- **Prints `encore version v...`:** installed. Go to step 4.
- **Command not found:** run `~/.encore/bin/encore version`. If that prints a version, Encore is installed but not on the PATH: go to step 3. Otherwise go to step 2.

### 2. Install

Ask the user first, unless they asked you to install Encore. Run the command for the OS. None of them prompt for input.

```bash
# macOS
brew install encoredev/tap/encore

# Linux, WSL, or macOS without Homebrew
curl -L https://encore.dev/install.sh | bash

# Windows (PowerShell)
iwr https://encore.dev/install.ps1 | iex
```

Run `encore version` again. If it's still not found, go to step 3. On Windows, open a new shell instead: the installer adds `%USERPROFILE%\.encore\bin` to the PATH, but shells that were already open don't see it.

### 3. Put it on the PATH

`install.sh` installs to `~/.encore/bin` and doesn't edit shell profiles. Add it to the PATH:

```bash
export ENCORE_INSTALL="$HOME/.encore"
export PATH="$ENCORE_INSTALL/bin:$PATH"
```

Agent shells often drop environment variables between commands. Prefix each `encore` command with these exports, or call `~/.encore/bin/encore` by its full path. To make it permanent, ask the user, then add the two lines to their shell profile (`~/.zshrc` for zsh, `~/.bashrc` for bash).

### 4. Check what the app needs

| Tool | Needed for | Check | If it fails |
|------|------------|-------|-------------|
| Docker | Apps with SQL databases (`encore run`, `encore test`) | `docker info` | Not installed: ask the user to install Docker. Not running: start it (macOS: `open -a Docker`) and wait until `docker info` succeeds |
| Node.js and npm | Encore.ts apps | `node --version` | Ask the user to install Node.js |
| git | Creating apps and deploying | `git --version` | Ask the user to install git |

Encore.go needs no separate Go install: the CLI includes the Go toolchain it builds with. Other local infrastructure (Pub/Sub, caches, buckets, cron) runs without Docker.

## Updating

```bash
encore version update
```

This uses Homebrew if Encore was installed with it, and the install script otherwise. Then update the app's `encore.dev` package to match: `npm install encore.dev@latest` (Encore.ts) or `go get encore.dev@latest` (Encore.go).

## Guidelines

- When `encore` isn't found right after installing, fix the PATH (step 3). Don't install again.
- Ask before installing software or editing shell profiles, unless the user asked you to.
- Next: log in (`encore-login`), create an app (`encore-create-app`), and run it (`encore-run`).
- Docs: https://encore.dev/docs/quick-start
