In this folder you will find scripts and prompts for updating the SKILL.md files and keeping them in sync with the Encore documentation.

## Files

- **fetch-docs-links.js** - script that fetches the links from the `sitemap.xml` file and creates `ts.txt`, `go.txt`, and `platform.txt` files (the .txt files are ignored by git).
- **ts-docs-summary.md** - summary of the Encore TS documentation.
- **go-docs-summary.md** - summary of the Encore Go documentation.
- **platform-docs-summary.md** - summary of the Encore Platform documentation.
- **update-docs-summaries-prompt.md** - prompt for updating the `ts-docs-summary.md`, `go-docs-summary.md`, and `platform-docs-summary.md` files.
- **update-skills-prompt.md** - prompt for updating the SKILL.md files.

## How to use

1. Run the `update-docs-summaries-prompt.md` using Claude Code prompt to update the `ts-docs-summary.md`, `go-docs-summary.md`, and `platform-docs-summary.md` files.
2. Run the `update-skills-prompt.md` prompt to figure out if the SKILL.md files need to be updated. This will create a new file called `update-skills.md` that contains the recommendations for updating the SKILL.md files (this file is ignored by git).
3. Review the `update-skills.md` file and decide which updates you want to apply.
4. Feed the `update-skills.md` file to Claude Code to apply the updates to the SKILL.md files.