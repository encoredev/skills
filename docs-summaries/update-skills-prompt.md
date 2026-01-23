## Task: Audit SKILL.md Files Against Documentation

### Step 1: Discover SKILL Files
Scan the `@encore` folder for all `SKILL.md` files.

### Step 2: For Each SKILL.md File

**Determine the framework:**
- Read the SKILL.md content to identify whether it describes Encore TS or Encore Go
- Use the corresponding docs summary:
  - Encore TS → `@docs-summaries/ts-docs-summary.md`
  - Encore Go → `@docs-summaries/go-docs-summary.md`

**Fetch relevant documentation:**
- From the docs summary, identify all links relevant to the SKILL file's topic
- Fetch and read the full content from each relevant link

**Compare and identify discrepancies:**
- Code examples that differ between SKILL.md and the docs
- Missing content: information in docs that should be in SKILL.md
- Outdated content: instructions in SKILL.md not supported by current docs
- Incorrect syntax or API usage

### Step 4: Read the rest of the docs

If there are links from either ts-docs-summary.md or go-docs-summary.md that that you have not yet visited, fetch the content from the link and figure out if that content is relevant to any of the existing  SKILL.md files or if there should be a new SKILL.md file for that content. 

### Step 3: Write Recommendations

Output all findings to `update-skills.md` in this format:
```
## [SKILL filename]
Framework: [TS/Go]
Sources checked: [list of doc links reviewed]

### Recommended Updates

1. **[Category: Outdated/Missing/Incorrect]**
   - Current SKILL.md: [what it says]
   - Docs say: [what docs say]
   - Recommended change: [specific fix]

2. ...
```

Make each recommendation actionable so I can review and selectively apply updates.