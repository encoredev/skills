---
name: encore-install
description: Install the Encore CLI, check whether it's installed, put it on the PATH, update it, and set up what local development needs (Docker, plus Node.js for Encore.ts). The same steps work for Encore.ts and Encore.go.
when_to_use: >-
  The `encore` command isn't installed or isn't found, the user wants to install, set up, update, or upgrade the Encore CLI, or a task needs the CLI before any other Encore step (creating, running, testing, or deploying an app). Also use when `encore run` or `encore test` fails because Docker isn't installed or isn't running. Trigger phrases: "install Encore", "set up Encore", "encore: command not found", "brew install encoredev/tap/encore", "install.sh", "update Encore", "upgrade the Encore CLI", "encore version update", "docker daemon is not running".
---

# Installing the Encore CLI

Every Encore task goes through the `encore` CLI. In a new environment, check for it before running any other Encore command.

## Instructions

### Check whether it's installed

```bash
encore version
```

This prints `encore version v1.x.y`, plus an update notice when a newer version exists. If the command isn't found, check the default install location before installing:

```bash
~/.encore/bin/encore version
```

If that works, Encore is installed but not on the PATH. See [Add it to the PATH](#add-it-to-the-path).

### Install

Installing software changes the user's machine. Ask first, unless the user asked you to install Encore.

```bash
# macOS
brew install encoredev/tap/encore

# Linux, WSL, or macOS without Homebrew
curl -L https://encore.dev/install.sh | bash

# Windows (PowerShell)
iwr https://encore.dev/install.ps1 | iex
```

None of these prompt for input. Then run `encore version` to confirm.

- **`install.sh`:** installs to `~/.encore/bin` (or `$ENCORE_INSTALL/bin`). To install a specific version, pass it as an argument: `curl -L https://encore.dev/install.sh | bash -s -- 1.58.8`.
- **`install.ps1`:** installs to `%USERPROFILE%\.encore\bin` and adds it to the user's PATH. Shells that were already open don't see the change, so open a new one.

### Add it to the PATH

`install.sh` doesn't edit shell profiles. When `encore` isn't on the PATH afterwards, it prints the lines to add:

```bash
export ENCORE_INSTALL="$HOME/.encore"
export PATH="$ENCORE_INSTALL/bin:$PATH"
```

Agent shells often don't keep environment variables between commands. Either prefix each command with these exports, or call `~/.encore/bin/encore` by its full path. To make it permanent, add the two lines to the user's shell profile (`~/.zshrc` for zsh, `~/.bashrc` or `~/.bash_profile` for bash). Ask before editing the profile.

### Set up what local development needs

- **Docker:** `encore run` and `encore test` run the app's SQL databases in Docker, so Docker must be installed and running for any app with a database. Without it, they fail with `docker not found: is it installed and in your PATH?` or `The docker daemon is not running. Start it first.` On macOS, start Docker Desktop with `open -a Docker`, and wait until `docker info` succeeds. Other local infrastructure (Pub/Sub, caches, buckets, cron) runs without Docker.
- **Node.js and npm (Encore.ts):** Encore.ts apps run on Node.js, and `encore app create` runs `npm install`. Check with `node --version`.
- **Go (Encore.go):** the Encore CLI comes with the Go toolchain it builds apps with, so `encore run` works without a separate Go install. Editors and plain `go` commands need Go from https://go.dev/dl/.
- **git:** `encore app create` makes a git repository, and deploying is a `git push`.

### Update

```bash
encore version update
```

This upgrades with Homebrew when Encore was installed with Homebrew, and reruns the install script otherwise. Each app also depends on the `encore.dev` package. After a CLI update, update it to match:

```bash
npm install encore.dev@latest   # Encore.ts
go get encore.dev@latest        # Encore.go
```

## Guidelines

- Run `encore version` before other Encore commands in a new environment.
- Ask before installing software or editing shell profiles, unless the user asked you to.
- When `encore` isn't found right after installing, it's on disk but not on the PATH. Don't install it again.
- Next steps: log in (`encore-login`), create an app (`encore-create-app`), and run it (`encore-run`).
- Docs: https://encore.dev/docs/quick-start
